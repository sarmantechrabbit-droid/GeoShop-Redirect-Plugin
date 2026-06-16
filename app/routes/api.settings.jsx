import { authenticateAdmin } from '../services/shopifyAuth.server.js'
import {
  getSettingsForShop,
  saveSettingsForShop,
} from '../services/settings.server.js'

export const loader = async ({ request }) => {
  const auth = await authenticateAdmin(request)

  if (auth instanceof Response) {
    return auth
  }

  const { session } = auth
  const settings = await getSettingsForShop(session.shop)

  return Response.json({ shop: session.shop, settings })
}

export const action = async ({ request }) => {
  const auth = await authenticateAdmin(request)

  if (auth instanceof Response) {
    return auth
  }

  const { session } = auth
  const input = await request.json()
  const settings = await saveSettingsForShop(session.shop, input)

  return Response.json({ shop: session.shop, settings })
}
