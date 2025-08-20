// Manual query definition for trust API (not processed by relay compiler)
export const publicTrustCenterQuery = {
  params: {
    name: "PublicTrustCenterGraphQuery",
    operationKind: "query",
    text: `
      query PublicTrustCenterGraphQuery($slug: String!) {
        trustCenterBySlug(slug: $slug) {
          id
          active
          slug
          organization {
            id
            name
            logoUrl
          }
          documents(first: 100) {
            edges {
              node {
                id
                title
                documentType
              }
            }
          }
          audits(first: 100) {
            edges {
              node {
                id
                framework {
                  name
                }
                report {
                  id
                  filename
                  downloadUrl
                }
              }
            }
          }
          vendors(first: 100) {
            edges {
              node {
                id
                name
                category
                websiteUrl
                privacyPolicyUrl
              }
            }
          }
        }
      }
    `
  }
};
