import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { authenticate, login } from '../shopify.server.js'

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
  const developmentShop = getDevelopmentShop()
  const url = new URL(request.url)

  if (
    process.env.NODE_ENV !== 'production' &&
    developmentShop &&
    !url.searchParams.get('shop')
  ) {
    return {
      session: {
        shop: developmentShop,
      },
    }
  }

  return authenticate.admin(request)
}

export async function loginTopLevel(request) {
  return login(request)
}
