// Copyright (c) 2025 Probo Inc <hello@getprobo.com>.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
// OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.

package probod

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/getprobo/probo/pkg/agents"
	"github.com/getprobo/probo/pkg/awsconfig"
	"github.com/getprobo/probo/pkg/connector"
	"github.com/getprobo/probo/pkg/coredata"
	"github.com/getprobo/probo/pkg/crypto/cipher"
	"github.com/getprobo/probo/pkg/crypto/passwdhash"
	"github.com/getprobo/probo/pkg/html2pdf"
	"github.com/getprobo/probo/pkg/mailer"
	"github.com/getprobo/probo/pkg/probo"
	"github.com/getprobo/probo/pkg/saferedirect"
	"github.com/getprobo/probo/pkg/server"
	"github.com/getprobo/probo/pkg/server/api"
	"github.com/getprobo/probo/pkg/trust"
	"github.com/getprobo/probo/pkg/usrmgr"
	"github.com/prometheus/client_golang/prometheus"
	"go.gearno.de/kit/httpclient"
	"go.gearno.de/kit/httpserver"
	"go.gearno.de/kit/log"
	"go.gearno.de/kit/migrator"
	"go.gearno.de/kit/pg"
	"go.gearno.de/kit/unit"
	"go.opentelemetry.io/otel/trace"
)

type (
	Implm struct {
		cfg config
	}

	config struct {
		Hostname      string               `json:"hostname"`
		EncryptionKey cipher.EncryptionKey `json:"encryption-key"`
		Pg            pgConfig             `json:"pg"`
		Api           apiConfig            `json:"api"`
		Auth          authConfig           `json:"auth"`
		TrustAuth     trustAuthConfig      `json:"trust-auth"`
		AWS           awsConfig            `json:"aws"`
		Mailer        mailerConfig         `json:"mailer"`
		Connectors    []connectorConfig    `json:"connectors"`
		OpenAI        openaiConfig         `json:"openai"`
		ChromeDPAddr  string               `json:"chrome-dp-addr"`
	}
)

var (
	_ unit.Configurable = (*Implm)(nil)
	_ unit.Runnable     = (*Implm)(nil)
)

// parseDatabaseURL parses Railway's DATABASE_URL environment variable
func parseDatabaseURL() pgConfig {
	// Default configuration for local development
	cfg := pgConfig{
		Addr:     "localhost:5432",
		Username: "probod",
		Password: "probod",
		Database: "probod",
		PoolSize: 100,
	}

	// Use Railway's DATABASE_URL (primary method)
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		if u, err := url.Parse(dbURL); err == nil {
			if u.Host != "" {
				cfg.Addr = u.Host
			}
			if u.User != nil {
				cfg.Username = u.User.Username()
				if password, ok := u.User.Password(); ok {
					cfg.Password = password
				}
			}
			if u.Path != "" && len(u.Path) > 1 {
				cfg.Database = u.Path[1:] // Remove leading '/'
			}

			// Railway uses SSL by default
			query := u.Query()
			if query.Get("sslmode") == "require" || query.Get("sslmode") == "prefer" {
				cfg.CACertBundle = "" // Railway handles SSL internally
			}
		}
	}

	// Fallback to Railway's individual PostgreSQL variables if DATABASE_URL parsing fails
	if pgDatabase := os.Getenv("PGDATABASE"); pgDatabase != "" {
		cfg.Database = pgDatabase
	}

	return cfg
}

// getMailpitAddress returns the appropriate mailpit address for local development vs Railway
func getMailpitAddress() string {
	// Check if we're running on Railway (Railway sets RAILWAY_ENVIRONMENT)
	if railwayEnv := os.Getenv("RAILWAY_ENVIRONMENT"); railwayEnv != "" {
		// Use Railway's internal service address
		return "mailpit.railway.internal:1025"
	}

	// Check if MAILPIT_HOST is explicitly set
	if mailpitHost := os.Getenv("MAILPIT_HOST"); mailpitHost != "" {
		return mailpitHost
	}

	// Default to localhost for local development
	return "localhost:1025"
}

func New() *Implm {
	// Get API address from environment (Railway sets PORT)
	apiAddr := "localhost:8080"
	hostname := "localhost:8080"
	cookieDomain := "localhost"

	if port := os.Getenv("PORT"); port != "" {
		apiAddr = "0.0.0.0:" + port
	}

	// Use Railway's APP_URL for hostname and cookie domain if available
	if appURL := os.Getenv("APP_URL"); appURL != "" {
		if u, err := url.Parse(appURL); err == nil && u.Host != "" {
			hostname = u.Host
			cookieDomain = u.Host
		}
	}

	// Configure session secret from Railway
	sessionSecret := "this-is-a-secure-secret-for-cookie-signing-at-least-32-bytes"
	if railwaySecret := os.Getenv("SESSION_SECRET"); railwaySecret != "" {
		sessionSecret = railwaySecret
	}

	// Configure S3 bucket from Railway
	s3Bucket := "probod"
	if bucket := os.Getenv("S3_BUCKET"); bucket != "" {
		s3Bucket = bucket
	}

	return &Implm{
		cfg: config{
			Hostname: hostname,
			Api: apiConfig{
				Addr: apiAddr,
			},
			Pg:           parseDatabaseURL(),
			ChromeDPAddr: "localhost:9222",
			Auth: authConfig{
				Password: passwordConfig{
					Pepper:     "this-is-a-secure-pepper-for-password-hashing-at-least-32-bytes",
					Iterations: 1000000,
				},
				Cookie: cookieConfig{
					Name:     "SSID",
					Secret:   sessionSecret,
					Duration: 24,
					Domain:   cookieDomain,
				},
				DisableSignup:                       false,
				InvitationConfirmationTokenValidity: 3600,
			},
			TrustAuth: trustAuthConfig{
				CookieName:        "TCT",
				CookieDomain:      cookieDomain,
				CookieDuration:    24,
				TokenDuration:     168,
				ReportURLDuration: 15,
				TokenSecret:       "this-is-a-secure-secret-for-trust-token-signing-at-least-32-bytes",
				Scope:             "trust_center_readonly",
				TokenType:         "trust_center_access",
			},
			AWS: awsConfig{
				Region: "us-east-1",
				Bucket: s3Bucket,
			},
			OpenAI: openaiConfig{
				APIKey:      os.Getenv("OPENAI_API_KEY"),
				Temperature: 0.1,
				ModelName:   "gpt-4o",
			},
			Mailer: mailerConfig{
				SenderEmail: "no-reply@notification.getprobo.com",
				SenderName:  "Probo",
				SMTP: smtpConfig{
					Addr: getMailpitAddress(),
				},
			},
		},
	}
}

func (impl *Implm) GetConfiguration() any {
	return &impl.cfg
}

func (impl *Implm) Run(
	parentCtx context.Context,
	l *log.Logger,
	r prometheus.Registerer,
	tp trace.TracerProvider,
) error {
	tracer := tp.Tracer("probod")
	ctx, rootSpan := tracer.Start(parentCtx, "probod.Run")
	defer rootSpan.End()

	wg := sync.WaitGroup{}
	ctx, cancel := context.WithCancelCause(ctx)
	defer cancel(context.Canceled)

	pgClient, err := pg.NewClient(
		impl.cfg.Pg.Options(
			pg.WithLogger(l),
			pg.WithRegisterer(r),
			pg.WithTracerProvider(tp),
		)...,
	)
	if err != nil {
		rootSpan.RecordError(err)
		return fmt.Errorf("cannot create pg client: %w", err)
	}

	pepper, err := impl.cfg.Auth.GetPepperBytes()
	if err != nil {
		rootSpan.RecordError(err)
		return fmt.Errorf("cannot get pepper bytes: %w", err)
	}

	_, err = impl.cfg.Auth.GetCookieSecretBytes()
	if err != nil {
		rootSpan.RecordError(err)
		return fmt.Errorf("cannot get cookie secret bytes: %w", err)
	}

	_, err = impl.cfg.TrustAuth.GetTokenSecretBytes()
	if err != nil {
		rootSpan.RecordError(err)
		return fmt.Errorf("cannot get trust auth token secret bytes: %w", err)
	}

	awsConfig := awsconfig.NewConfig(
		l,
		httpclient.DefaultPooledClient(
			httpclient.WithLogger(l),
			httpclient.WithTracerProvider(tp),
			httpclient.WithRegisterer(r),
		),
		awsconfig.Options{
			Region:          impl.cfg.AWS.Region,
			AccessKeyID:     impl.cfg.AWS.AccessKeyID,
			SecretAccessKey: impl.cfg.AWS.SecretAccessKey,
			Endpoint:        impl.cfg.AWS.Endpoint,
		},
	)

	html2pdfConverter := html2pdf.NewConverter(
		impl.cfg.ChromeDPAddr,
		html2pdf.WithLogger(l),
		html2pdf.WithTracerProvider(tp),
	)

	s3Client := s3.NewFromConfig(awsConfig)

	err = migrator.NewMigrator(pgClient, coredata.Migrations, l.Named("migrations")).Run(ctx, "migrations")
	if err != nil {
		return fmt.Errorf("cannot migrate database schema: %w", err)
	}

	hp, err := passwdhash.NewProfile(pepper, uint32(impl.cfg.Auth.Password.Iterations))
	if err != nil {
		return fmt.Errorf("cannot create hashing profile: %w", err)
	}

	defaultConnectorRegistry := connector.NewConnectorRegistry()
	for _, connector := range impl.cfg.Connectors {
		if err := defaultConnectorRegistry.Register(connector.Name, connector.Config); err != nil {
			return fmt.Errorf("cannot register connector: %w", err)
		}
	}

	agentConfig := agents.Config{
		OpenAIAPIKey: impl.cfg.OpenAI.APIKey,
		Temperature:  impl.cfg.OpenAI.Temperature,
		ModelName:    impl.cfg.OpenAI.ModelName,
	}

	trustConfig := probo.TrustConfig{
		TokenSecret:   impl.cfg.TrustAuth.TokenSecret,
		TokenDuration: time.Duration(impl.cfg.TrustAuth.TokenDuration) * time.Hour,
		TokenType:     impl.cfg.TrustAuth.TokenType,
	}

	agent := agents.NewAgent(l.Named("agent"), agentConfig)

	usrmgrService, err := usrmgr.NewService(
		ctx,
		pgClient,
		hp,
		impl.cfg.Auth.Cookie.Secret,
		impl.cfg.Hostname,
		impl.cfg.Auth.DisableSignup,
		time.Duration(impl.cfg.Auth.InvitationConfirmationTokenValidity)*time.Second,
	)
	if err != nil {
		return fmt.Errorf("cannot create usrmgr service: %w", err)
	}

	proboService, err := probo.NewService(
		ctx,
		impl.cfg.EncryptionKey,
		pgClient,
		s3Client,
		impl.cfg.AWS.Bucket,
		impl.cfg.Hostname,
		impl.cfg.Auth.Cookie.Secret,
		trustConfig,
		agentConfig,
		html2pdfConverter,
		usrmgrService,
	)
	if err != nil {
		return fmt.Errorf("cannot create probo service: %w", err)
	}

	trustService := trust.NewService(
		pgClient,
		s3Client,
		impl.cfg.AWS.Bucket,
		impl.cfg.EncryptionKey,
		impl.cfg.TrustAuth.TokenSecret,
		usrmgrService,
		html2pdfConverter,
	)

	serverHandler, err := server.NewServer(
		server.Config{
			AllowedOrigins:    impl.cfg.Api.Cors.AllowedOrigins,
			ExtraHeaderFields: impl.cfg.Api.ExtraHeaderFields,
			Probo:             proboService,
			Usrmgr:            usrmgrService,
			Trust:             trustService,
			ConnectorRegistry: defaultConnectorRegistry,
			Agent:             agent,
			SafeRedirect:      &saferedirect.SafeRedirect{AllowedHost: impl.cfg.Hostname},
			Logger:            l.Named("http.server"),
			Auth: api.ConsoleAuthConfig{
				CookieName:      impl.cfg.Auth.Cookie.Name,
				CookieDomain:    impl.cfg.Auth.Cookie.Domain,
				SessionDuration: time.Duration(impl.cfg.Auth.Cookie.Duration) * time.Hour,
				CookieSecret:    impl.cfg.Auth.Cookie.Secret,
			},
			TrustAuth: api.TrustAuthConfig{
				CookieName:        impl.cfg.TrustAuth.CookieName,
				CookieDomain:      impl.cfg.TrustAuth.CookieDomain,
				CookieDuration:    time.Duration(impl.cfg.TrustAuth.CookieDuration) * time.Hour,
				TokenDuration:     time.Duration(impl.cfg.TrustAuth.TokenDuration) * time.Hour,
				ReportURLDuration: time.Duration(impl.cfg.TrustAuth.ReportURLDuration) * time.Minute,
				TokenSecret:       impl.cfg.TrustAuth.TokenSecret,
				Scope:             impl.cfg.TrustAuth.Scope,
				TokenType:         impl.cfg.TrustAuth.TokenType,
			},
		},
	)
	if err != nil {
		return fmt.Errorf("cannot create server: %w", err)
	}

	apiServerCtx, stopApiServer := context.WithCancel(context.Background())
	defer stopApiServer()
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := impl.runApiServer(apiServerCtx, l, r, tp, serverHandler); err != nil {
			cancel(fmt.Errorf("api server crashed: %w", err))
		}
	}()

	mailerCtx, stopMailer := context.WithCancel(context.Background())
	mailer := mailer.NewMailer(pgClient, l, mailer.Config{
		SenderEmail: impl.cfg.Mailer.SenderEmail,
		SenderName:  impl.cfg.Mailer.SenderName,
		Addr:        impl.cfg.Mailer.SMTP.Addr,
		User:        impl.cfg.Mailer.SMTP.User,
		Password:    impl.cfg.Mailer.SMTP.Password,
		TLSRequired: impl.cfg.Mailer.SMTP.TLSRequired,
		Timeout:     time.Second * 10,
	})
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := mailer.Run(mailerCtx); err != nil {
			cancel(fmt.Errorf("mailer crashed: %w", err))
		}
	}()

	<-ctx.Done()

	stopMailer()
	stopApiServer()

	wg.Wait()

	pgClient.Close()

	return context.Cause(ctx)
}

func (impl *Implm) runApiServer(
	ctx context.Context,
	l *log.Logger,
	r prometheus.Registerer,
	tp trace.TracerProvider,
	handler http.Handler,
) error {
	tracer := tp.Tracer("github.com/getprobo/probo/pkg/probod")
	ctx, span := tracer.Start(ctx, "probod.runApiServer")
	defer span.End()

	apiServer := httpserver.NewServer(
		impl.cfg.Api.Addr,
		handler,
		httpserver.WithLogger(l),
		httpserver.WithRegisterer(r),
		httpserver.WithTracerProvider(tp),
	)

	l.Info("starting api server", log.String("addr", apiServer.Addr))
	span.AddEvent("API server starting")

	listener, err := net.Listen("tcp", apiServer.Addr)
	if err != nil {
		span.RecordError(err)
		return fmt.Errorf("cannot listen on %q: %w", apiServer.Addr, err)
	}
	defer listener.Close()

	serverErrCh := make(chan error, 1)
	go func() {
		err := apiServer.Serve(listener)
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrCh <- fmt.Errorf("cannot server http request: %w", err)
		}
		close(serverErrCh)
	}()

	l.Info("api server started")
	span.AddEvent("API server started")

	select {
	case err := <-serverErrCh:
		if err != nil {
			span.RecordError(err)
		}
		return err
	case <-ctx.Done():
	}

	l.InfoCtx(ctx, "shutting down api server")
	span.AddEvent("API server shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if err := apiServer.Shutdown(shutdownCtx); err != nil {
		span.RecordError(err)
		return fmt.Errorf("cannot shutdown api server: %w", err)
	}

	span.AddEvent("API server shutdown complete")
	return ctx.Err()
}
