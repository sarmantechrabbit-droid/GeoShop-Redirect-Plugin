import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { DEFAULT_SETTINGS } from '../constants/defaultSettings.js'

const DATA_DIR = process.env.GEOSHOP_DATA_DIR || path.join(process.cwd(), 'app', 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

function normalizeShop(shop) {
  return String(shop || '')
    .trim()
    .toLowerCase()
}

function withDefaultMessages(settings) {
  return {
    ...settings,
    indiaMessage: settings.indiaMessage.trim() || DEFAULT_SETTINGS.indiaMessage,
    uaeMessage: settings.uaeMessage.trim() || DEFAULT_SETTINGS.uaeMessage,
    otherCountryMessage:
      settings.otherCountryMessage.trim() ||
      DEFAULT_SETTINGS.otherCountryMessage,
    indiaButtonText:
      settings.indiaButtonText.trim() || DEFAULT_SETTINGS.indiaButtonText,
    uaeButtonText: settings.uaeButtonText.trim() || DEFAULT_SETTINGS.uaeButtonText,
    shopNowButtonText:
      settings.shopNowButtonText.trim() ||
      DEFAULT_SETTINGS.shopNowButtonText,
  }
}

function assertValidUrl(value, label) {
  try {
    const url = new URL(value)

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error()
    }
  } catch {
    throw new Error(`${label} must be a valid http or https URL.`)
  }
}

function sanitizeSettings(input = {}) {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...input,
    popupEnabled: Boolean(input.popupEnabled),
    rememberSelection: Boolean(input.rememberSelection),
    indiaUrl: String(input.indiaUrl || DEFAULT_SETTINGS.indiaUrl).trim(),
    uaeUrl: String(input.uaeUrl || DEFAULT_SETTINGS.uaeUrl).trim(),
    indiaMessage: String(input.indiaMessage || ''),
    uaeMessage: String(input.uaeMessage || ''),
    otherCountryMessage: String(input.otherCountryMessage || ''),
    indiaButtonText: String(input.indiaButtonText || ''),
    uaeButtonText: String(input.uaeButtonText || ''),
    shopNowButtonText: String(input.shopNowButtonText || ''),
  }

  assertValidUrl(settings.indiaUrl, 'India URL')
  assertValidUrl(settings.uaeUrl, 'UAE URL')

  return withDefaultMessages(settings)
}

async function readStore() {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeStore(store) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(SETTINGS_FILE, JSON.stringify(store, null, 2))
}

export async function getSettingsForShop(shop) {
  const normalizedShop = normalizeShop(shop)
  const store = await readStore()

  return {
    ...DEFAULT_SETTINGS,
    ...(store[normalizedShop] || {}),
  }
}

export async function saveSettingsForShop(shop, input) {
  const normalizedShop = normalizeShop(shop)

  if (!normalizedShop) {
    throw new Error('Shop domain is required.')
  }

  const settings = sanitizeSettings(input)
  const store = await readStore()
  store[normalizedShop] = settings
  await writeStore(store)

  return settings
}

export async function resetSettingsForShop(shop) {
  return saveSettingsForShop(shop, DEFAULT_SETTINGS)
}

export async function getPublicSettingsForShop(shop) {
  return getSettingsForShop(shop)
}

export function parseSettingsForm(formData) {
  return {
    popupEnabled: formData.get('popupEnabled') === 'true',
    indiaUrl: formData.get('indiaUrl'),
    uaeUrl: formData.get('uaeUrl'),
    indiaMessage: formData.get('indiaMessage'),
    uaeMessage: formData.get('uaeMessage'),
    otherCountryMessage: formData.get('otherCountryMessage'),
    indiaButtonText: formData.get('indiaButtonText'),
    uaeButtonText: formData.get('uaeButtonText'),
    shopNowButtonText: formData.get('shopNowButtonText'),
    rememberSelection: formData.get('rememberSelection') === 'true',
  }
}
