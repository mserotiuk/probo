#!/bin/sh

# Database migration script for Railway deployment
# This script runs database migrations during the deployment process

set -e

echo "🚀 Starting database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Check if migrations directory exists
MIGRATIONS_DIR="/app/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ ERROR: Migrations directory not found at $MIGRATIONS_DIR"
    exit 1
fi

# Count migration files
MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.sql" | wc -l)
echo "📁 Found $MIGRATION_COUNT migration files"

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo "✅ No migrations to run"
    exit 0
fi

# Install psql client if not available (Railway environments)
if ! command -v psql >/dev/null 2>&1; then
    echo "📦 Installing PostgreSQL client..."
    apk add --no-cache postgresql-client
fi

# Test database connection
echo "🔗 Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT version();" >/dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to database"
    echo "Please check your DATABASE_URL: ${DATABASE_URL%%@*}@[HIDDEN]"
    exit 1
fi

echo "✅ Database connection successful"

# Create migrations table if it doesn't exist
echo "📋 Creating migrations tracking table..."
psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
" || {
    echo "❌ ERROR: Failed to create migrations table"
    exit 1
}

# Function to check if migration has been applied
is_migration_applied() {
    local version="$1"
    local count
    count=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version';")
    [ "$count" -gt 0 ]
}

# Function to apply a single migration
apply_migration() {
    local migration_file="$1"
    local version
    version=$(basename "$migration_file" .sql)
    
    echo "⏳ Applying migration: $version"
    
    # Start transaction and apply migration
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
        BEGIN;
        $(cat "$migration_file")
        INSERT INTO schema_migrations (version) VALUES ('$version');
        COMMIT;
    " || {
        echo "❌ ERROR: Failed to apply migration $version"
        echo "Rolling back transaction..."
        psql "$DATABASE_URL" -c "ROLLBACK;" 2>/dev/null || true
        exit 1
    }
    
    echo "✅ Successfully applied migration: $version"
}

# Apply migrations in order
APPLIED_COUNT=0
SKIPPED_COUNT=0

echo "🔄 Processing migrations..."

for migration_file in $(find "$MIGRATIONS_DIR" -name "*.sql" | sort); do
    version=$(basename "$migration_file" .sql)
    
    if is_migration_applied "$version"; then
        echo "⏭️  Skipping already applied migration: $version"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    else
        apply_migration "$migration_file"
        APPLIED_COUNT=$((APPLIED_COUNT + 1))
    fi
done

# Summary
echo ""
echo "📊 Migration Summary:"
echo "   • Applied: $APPLIED_COUNT"
echo "   • Skipped: $SKIPPED_COUNT"
echo "   • Total: $MIGRATION_COUNT"

if [ "$APPLIED_COUNT" -gt 0 ]; then
    echo "✅ Database migrations completed successfully!"
else
    echo "ℹ️  Database is already up to date"
fi

echo ""
echo "🎉 Migration script finished"