import '@shopify/shopify-app-react-router/adapters/node'
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from '@shopify/shopify-app-react-router/server'
import { FileSessionStorage } from './services/fileSessionStorage.server.js'

function getAppUrl() {
  const configuredUrl =
    process.env.SHOPIFY_APP_URL ||
    process.env.HOST ||
    process.env.APPLICATION_URL ||
    ''

  return configuredUrl === 'https://example.com' ? '' : configuredUrl
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(','),
  appUrl: getAppUrl(),
  authPathPrefix: '/auth',
  sessionStorage: new FileSessionStorage(),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session })
    },
  },
})

export default shopify
export const apiVersion = ApiVersion.January25
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders
export const authenticate = shopify.authenticate
export const unauthenticated = shopify.unauthenticated
export const login = shopify.login
export const registerWebhooks = shopify.registerWebhooks
export const sessionStorage = shopify.sessionStorage
