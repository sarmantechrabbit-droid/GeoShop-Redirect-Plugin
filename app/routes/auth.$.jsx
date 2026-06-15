import { authenticateAdmin } from '../services/shopifyAuth.server.js'

export const loader = async ({ request }) => {
  await authenticateAdmin(request)
  return null
}
