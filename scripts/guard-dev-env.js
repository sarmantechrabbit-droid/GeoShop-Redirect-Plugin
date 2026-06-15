import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env')

function readOptionalFile(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

const envFile = readOptionalFile(envPath)
const appConfigPaths = readdirSync(process.cwd())
  .filter((fileName) => /^shopify\.app.*\.toml$/.test(fileName))
  .map((fileName) => resolve(process.cwd(), fileName))

if (envFile.includes('https://example.com')) {
  console.error(
    'SHOPIFY_APP_URL is set to https://example.com in .env. Clear it or set it to your real Shopify tunnel URL before running dev.',
  )
  process.exit(1)
}

for (const appConfigPath of appConfigPaths) {
  const appConfig = readOptionalFile(appConfigPath)

  if (appConfig.includes('https://example.com')) {
    console.error(
      `${appConfigPath} still contains https://example.com. Replace it with https://localhost:3000 or a real tunnel URL before running dev.`,
    )
    process.exit(1)
  }
}
