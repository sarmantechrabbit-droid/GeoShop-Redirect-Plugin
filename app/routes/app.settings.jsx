import {
  Banner,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
} from '@shopify/polaris'
import { useEffect, useState } from 'react'
import { Form as RouterForm, useActionData, useLoaderData, useNavigation } from 'react-router'
import { authenticateAdmin } from '../services/shopifyAuth.server.js'
import {
  getSettingsForShop,
  parseSettingsForm,
  resetSettingsForShop,
  saveSettingsForShop,
} from '../services/settings.server.js'

export const loader = async ({ request }) => {
  const { session } = await authenticateAdmin(request)
  const settings = await getSettingsForShop(session.shop)

  return { settings }
}

export const action = async ({ request }) => {
  const { session } = await authenticateAdmin(request)
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    const settings =
      intent === 'reset'
        ? await resetSettingsForShop(session.shop)
        : await saveSettingsForShop(session.shop, parseSettingsForm(formData))

    return { settings, success: intent === 'reset' ? 'Defaults restored.' : 'Settings saved.' }
  } catch (error) {
    return { error: error.message }
  }
}

export default function Settings() {
  const loaderData = useLoaderData()
  const actionData = useActionData()
  const navigation = useNavigation()
  const settings = actionData?.settings || loaderData.settings
  const [formState, setFormState] = useState(settings)
  const isSubmitting = navigation.state === 'submitting'

  useEffect(() => {
    setFormState(settings)
  }, [settings])

  function updateField(field) {
    return (value) => {
      setFormState((current) => ({
        ...current,
        [field]: value,
      }))
    }
  }

  function updateCheckbox(field) {
    return (checked) => {
      setFormState((current) => ({
        ...current,
        [field]: checked,
      }))
    }
  }

  return (
    <Page
      title="Settings"
      subtitle="Configure the country redirect popup for your storefront app embed."
    >
      <RouterForm method="post">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {actionData?.success && (
                <Banner tone="success" title={actionData.success} />
              )}
              {actionData?.error && (
                <Banner tone="critical" title={actionData.error} />
              )}

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Popup controls
                  </Text>
                  <input type="hidden" name="popupEnabled" value={formState.popupEnabled ? 'true' : 'false'} />
                  <Checkbox
                    label="Enable popup"
                    checked={formState.popupEnabled}
                    onChange={updateCheckbox('popupEnabled')}
                  />
                  <input type="hidden" name="rememberSelection" value={formState.rememberSelection ? 'true' : 'false'} />
                  <Checkbox
                    label="Remember customer selection in localStorage"
                    checked={formState.rememberSelection}
                    onChange={updateCheckbox('rememberSelection')}
                    helpText="When enabled, returning customers will not see the popup again until they click Change Country."
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Redirect URLs
                  </Text>
                  <FormLayout>
                    <TextField
                      label="India redirect URL"
                      name="indiaUrl"
                      type="url"
                      value={formState.indiaUrl}
                      onChange={updateField('indiaUrl')}
                      autoComplete="off"
                    />
                    <TextField
                      label="UAE redirect URL"
                      name="uaeUrl"
                      type="url"
                      value={formState.uaeUrl}
                      onChange={updateField('uaeUrl')}
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Popup messages
                  </Text>
                  <FormLayout>
                    <TextField
                      label="India popup message"
                      name="indiaMessage"
                      value={formState.indiaMessage}
                      onChange={updateField('indiaMessage')}
                      multiline={3}
                      autoComplete="off"
                    />
                    <TextField
                      label="UAE popup message"
                      name="uaeMessage"
                      value={formState.uaeMessage}
                      onChange={updateField('uaeMessage')}
                      multiline={3}
                      autoComplete="off"
                    />
                    <TextField
                      label="Other country popup message"
                      name="otherCountryMessage"
                      value={formState.otherCountryMessage}
                      onChange={updateField('otherCountryMessage')}
                      multiline={2}
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Button text
                  </Text>
                  <FormLayout>
                    <TextField
                      label="India button text"
                      name="indiaButtonText"
                      value={formState.indiaButtonText}
                      onChange={updateField('indiaButtonText')}
                      autoComplete="off"
                    />
                    <TextField
                      label="UAE button text"
                      name="uaeButtonText"
                      value={formState.uaeButtonText}
                      onChange={updateField('uaeButtonText')}
                      autoComplete="off"
                    />
                    <TextField
                      label="Manual selection button text"
                      name="shopNowButtonText"
                      value={formState.shopNowButtonText}
                      onChange={updateField('shopNowButtonText')}
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <ButtonGroup>
                <Button
                  submit
                  variant="primary"
                  name="intent"
                  value="save"
                  loading={isSubmitting}
                >
                  Save settings
                </Button>
                <Button submit name="intent" value="reset" disabled={isSubmitting}>
                  Reset to default
                </Button>
              </ButtonGroup>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </RouterForm>
    </Page>
  )
}
