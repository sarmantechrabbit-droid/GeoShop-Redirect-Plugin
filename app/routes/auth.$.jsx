import { authenticateAdmin } from '../services/shopifyAuth.server.js'

export const loader = async ({ request }) => {
  const auth = await authenticateAdmin(request)

  if (auth instanceof Response) {
    return auth
  }

  return null
}
