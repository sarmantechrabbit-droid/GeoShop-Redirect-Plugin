import { BlockStack, Card, Layout, Page, Text } from '@shopify/polaris'
import { useLoaderData } from 'react-router'
import { authenticateAdmin } from '../services/shopifyAuth.server.js'
import { getSettingsForShop } from '../services/settings.server.js'

export const loader = async ({ request }) => {
  const auth = await authenticateAdmin(request)

  if (auth instanceof Response) {
    return auth
  }

  const { session } = auth
  const settings = await getSettingsForShop(session.shop)

  return { settings }
}

export default function Preview() {
  const { settings } = useLoaderData()

  return (
    <Page
      title="Popup preview"
      subtitle="A storefront-style preview using your current saved settings."
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <div className="geoflow-preview-shell">
              <div className="geoflow-preview-store">
                <div className="geoflow-preview-bar" />
                <div className="geoflow-preview-grid">
                  <div className="geoflow-preview-card" />
                  <div className="geoflow-preview-card" />
                  <div className="geoflow-preview-card" />
                </div>
              </div>
              <div className="geoflow-preview-overlay">
                <div className="geoflow-preview-modal">
                  <div className="geoflow-preview-close">x</div>
                  <p className="geoflow-preview-kicker">GeoFlow Redirect</p>
                  <h2 className="geoflow-preview-title">
                    {settings.otherCountryMessage}
                  </h2>
                  <p className="geoflow-preview-message">
                    Customers outside India and UAE can pick their preferred
                    storefront manually.
                  </p>
                  <div className="geoflow-preview-options">
                    <div className="geoflow-preview-option">
                      <BlockStack gap="100">
                        <Text as="span" variant="headingMd">
                          India
                        </Text>
                        <Text as="span" tone="subdued">
                          {settings.indiaUrl}
                        </Text>
                      </BlockStack>
                      <span
                        className="geoflow-preview-flag geoflow-preview-flag-in"
                        aria-label="India flag"
                      />
                    </div>
                    <div className="geoflow-preview-option">
                      <BlockStack gap="100">
                        <Text as="span" variant="headingMd">
                          UAE
                        </Text>
                        <Text as="span" tone="subdued">
                          {settings.uaeUrl}
                        </Text>
                      </BlockStack>
                      <span
                        className="geoflow-preview-flag geoflow-preview-flag-ae"
                        aria-label="UAE flag"
                      />
                    </div>
                  </div>
                  <button type="button" className="geoflow-preview-button">
                    {settings.shopNowButtonText}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
