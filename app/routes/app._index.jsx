import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
} from '@shopify/polaris'
import { useLoaderData } from 'react-router'
import { authenticateAdmin } from '../services/shopifyAuth.server.js'
import { getSettingsForShop } from '../services/settings.server.js'

export const loader = async ({ request }) => {
  const { session } = await authenticateAdmin(request)
  const settings = await getSettingsForShop(session.shop)

  return { shop: session.shop, settings }
}

export default function Dashboard() {
  const { shop, settings } = useLoaderData()

  return (
    <Page title="GeoFlow Redirect">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    Storefront popup status
                  </Text>
                  <Text as="p" tone="subdued">
                    Settings are saved for {shop}.
                  </Text>
                </BlockStack>
                <Badge tone={settings.popupEnabled ? 'success' : 'critical'}>
                  {settings.popupEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </InlineStack>

              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                <Card background="bg-surface-secondary">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      India redirect
                    </Text>
                    <Text as="p" tone="subdued">
                      {settings.indiaUrl}
                    </Text>
                  </BlockStack>
                </Card>
                <Card background="bg-surface-secondary">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      UAE redirect
                    </Text>
                    <Text as="p" tone="subdued">
                      {settings.uaeUrl}
                    </Text>
                  </BlockStack>
                </Card>
              </InlineGrid>

              <InlineStack gap="300">
                <Button url="/app/settings" variant="primary">
                  Manage settings
                </Button>
                <Button url="/app/preview">
                  Preview popup
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
