import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Session } from '@shopify/shopify-api'

const DATA_DIR = process.env.GEOSHOP_DATA_DIR || path.join(process.cwd(), 'app', 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'shopify-sessions.json')

async function readSessions() {
  try {
    return JSON.parse(await readFile(SESSIONS_FILE, 'utf8'))
  } catch {
    return {}
  }
}

async function writeSessions(sessions) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

function serializeSession(session) {
  return session.toPropertyArray(true)
}

function deserializeSession(entries) {
  return Session.fromPropertyArray(entries, true)
}

export class FileSessionStorage {
  async storeSession(session) {
    const sessions = await readSessions()
    sessions[session.id] = serializeSession(session)
    await writeSessions(sessions)
    return true
  }

  async loadSession(id) {
    const sessions = await readSessions()
    const session = sessions[id]

    return session ? deserializeSession(session) : undefined
  }

  async deleteSession(id) {
    const sessions = await readSessions()
    delete sessions[id]
    await writeSessions(sessions)
    return true
  }

  async deleteSessions(ids) {
    const sessions = await readSessions()

    for (const id of ids) {
      delete sessions[id]
    }

    await writeSessions(sessions)
    return true
  }

  async findSessionsByShop(shop) {
    const sessions = await readSessions()

    return Object.values(sessions)
      .map(deserializeSession)
      .filter((session) => session.shop === shop)
  }
}
