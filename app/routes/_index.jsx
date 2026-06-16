import { redirect } from 'react-router'

export const loader = ({ request }) => {
  const url = new URL(request.url)

  if (!url.search) {
    return redirect('/auth/login')
  }

  return redirect(`/app${url.search}`)
}
