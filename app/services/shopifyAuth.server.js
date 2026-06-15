import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { authenticate } from '../shopify.server.js'

export function getDevelopmentShop() {
  if (process.env.SHOPIFY_DEV_STORE_URL) {
    return process.env.SHOPIFY_DEV_STORE_URL
  }

  if (process.env.SHOPIFY_SHOP) {
    return process.env.SHOPIFY_SHOP
  }

  if (process.env.NODE_ENV === 'production') {
    return ''
  }

  try {
    const projectConfig = JSON.parse(
      readFileSync(resolve(process.cwd(), '.shopify/project.json'), 'utf8'),
    )
    const appConfig = projectConfig[process.env.SHOPIFY_API_KEY] || {}

    return appConfig.dev_store_url || ''
  } catch {
    return ''
  }
}

export async function authenticateAdmin(request) {
  try {
    return await authenticate.admin(request)
  } catch (error) {
    const developmentShop = getDevelopmentShop()

    if (process.env.NODE_ENV !== 'production' && developmentShop) {
      return {
        session: {
          shop: developmentShop,
        },
      }
    }

    throw error
  }
}
