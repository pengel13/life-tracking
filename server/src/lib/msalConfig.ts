import { ConfidentialClientApplication, Configuration } from '@azure/msal-node'

let msalClient: ConfidentialClientApplication | null = null

export function getMsalClient(): ConfidentialClientApplication {
  if (msalClient) return msalClient

  const config: Configuration = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_CLIENT_SECRET ?? '',
      authority: 'https://login.microsoftonline.com/common',
    },
  }

  msalClient = new ConfidentialClientApplication(config)
  return msalClient
}
