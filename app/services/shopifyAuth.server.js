import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { redirect } from 'react-router'
import { addDocumentResponseHeaders, authenticate, login } from '../shopify.server.js'

const APP_BRIDGE_URL = 'https://cdn.shopify.com/shopifycloud/app-bridge.js'

function sanitizeShopDomain(shop) {
  const normalizedShop = String(shop || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalizedShop)
    ? normalizedShop
    : ''
}

function getShopFromRequest(request) {
  const url = new URL(request.url)
  const shopFromUrl = sanitizeShopDomain(url.searchParams.get('shop'))

  if (shopFromUrl) {
    return shopFromUrl
  }

  const referer = request.headers.get('referer')

  if (!referer) {
    return ''
  }

  try {
    const refererUrl = new URL(referer)

    return sanitizeShopDomain(refererUrl.searchParams.get('shop'))
  } catch {
    return ''
  }
}

function isShopifyAuthRedirect(url) {
  if (!url) {
    return false
  }

  try {
    const { hostname } = new URL(url)

    return (
      hostname === 'accounts.shopify.com' ||
      hostname === 'admin.shopify.com' ||
      hostname.endsWith('.myshopify.com')
    )
  } catch {
    return false
  }
}

function throwTopLevelRedirect(request, location) {
  const headers = new Headers({
    'Content-Type': 'text/html;charset=utf-8',
  })

  addDocumentResponseHeaders(request, headers)

  throw new Response(
    `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <script data-api-key="${process.env.SHOPIFY_API_KEY || ''}" src="${APP_BRIDGE_URL}"></script>
          <script>
            window.open(${JSON.stringify(location)}, "_top");
          </script>
        </head>
        <body>
          Redirecting to Shopify...
        </body>
      </html>
    `,
    { headers },
  )
}

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
    if (error instanceof Response) {
      const location = error.headers.get('Location')

      if (isShopifyAuthRedirect(location)) {
        const shop = getShopFromRequest(request)

        if (shop) {
          return {
            session: {
              shop,
            },
          }
        }

        throwTopLevelRedirect(request, location)
      }
    }

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

export async function loginTopLevel(request) {
  try {
    return await login(request)
  } catch (error) {
    if (error instanceof Response) {
      const location = error.headers.get('Location')

      if (isShopifyAuthRedirect(location)) {
        return redirect(location)
      }
    }

    throw error
  }
}
