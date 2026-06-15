import { Form, redirect, useActionData } from 'react-router'
import { login } from '../shopify.server.js'
import { getDevelopmentShop } from '../services/shopifyAuth.server.js'

export const loader = async ({ request }) => {
  const url = new URL(request.url)

  if (!url.searchParams.get('shop') && getDevelopmentShop()) {
    throw redirect('/app')
  }

  return login(request)
}

export const action = async ({ request }) => {
  return login(request)
}

export default function Login() {
  const errors = useActionData()

  return (
    <main className="geoflow-login">
      <section className="geoflow-login-card">
        <h1>Login to GeoFlow Redirect</h1>
        <p>Enter your Shopify store domain to continue installing the app.</p>
        <Form method="post" className="geoflow-login-form">
          <label htmlFor="shop">Shop domain</label>
          <input
            id="shop"
            name="shop"
            type="text"
            placeholder="your-store.myshopify.com"
            autoComplete="on"
            aria-invalid={Boolean(errors?.shop)}
          />
          {errors?.shop ? (
            <p className="geoflow-login-error">Enter a valid Shopify store domain.</p>
          ) : null}
          <button type="submit">Continue</button>
        </Form>
      </section>
    </main>
  )
}
