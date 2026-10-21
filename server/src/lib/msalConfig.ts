import { ConfidentialClientApplication, Configuration } from '@azure/msal-node'

let msalClient: ConfidentialClientApplication | null = null

function buildConfig(): Configuration {
  return {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_CLIENT_SECRET ?? '',
      authority: 'https://login.microsoftonline.com/common',
    },
  }
}

// Singleton for OAuth flow — shared across auth-code requests in a session
export function getMsalClient(): ConfidentialClientApplication {
  if (msalClient) return msalClient
  msalClient = new ConfidentialClientApplication(buildConfig())
  return msalClient
}

// Fresh instance for per-account token refresh (load isolated token cache)
export function createMsalClient(): ConfidentialClientApplication {
  return new ConfidentialClientApplication(buildConfig())
}
