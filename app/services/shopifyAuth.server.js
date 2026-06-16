import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { addDocumentResponseHeaders, authenticate, login } from '../shopify.server.js'

const APP_BRIDGE_URL = 'https://cdn.shopify.com/shopifycloud/app-bridge.js'

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
            window.top.location.href = ${JSON.stringify(location)};
          </script>
        </head>
        <body>
          <a href="${location}" target="_top" rel="noreferrer">Redirecting to Shopify...</a>
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
        throwTopLevelRedirect(request, location)
      }
    }

    throw error
  }
}
