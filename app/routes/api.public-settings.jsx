import { getPublicSettingsForShop } from '../services/settings.server.js'

function publicHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  }
}

export const loader = async ({ request }) => {
  const url = new URL(request.url)
  const shop = url.searchParams.get('shop')

  if (!shop) {
    return Response.json(
      { error: 'Shop query parameter is required.' },
      { status: 400, headers: publicHeaders(request.headers.get('origin')) },
    )
  }

  const settings = await getPublicSettingsForShop(shop)

  return Response.json(
    { shop, settings },
    { headers: publicHeaders(request.headers.get('origin')) },
  )
}

export const action = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: publicHeaders(request.headers.get('origin')),
    })
  }

  return Response.json({ error: 'Method not allowed.' }, { status: 405 })
}
