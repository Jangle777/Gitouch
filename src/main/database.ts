import Database from 'better-sqlite3'
import path from 'path'
import { ClipboardItem, Folder, Note, AIConversation, AIMessage, Settings } from '@/shared/types'

let db: Database.Database | null = null

export function initDatabase(storagePath: string): void {
  const dbPath = path.join(storagePath, 'data.db')
  db = new Database(dbPath)
  createTables()
  initSettings(storagePath)
}

function createTables(): void {
  if (!db) return

  db.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT,
      image_path TEXT,
      content_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      created_at INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      folder_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      source_type TEXT NOT NULL,
      source_range TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_clipboard_created_at ON clipboard_items(created_at);
    CREATE INDEX IF NOT EXISTS idx_clipboard_hash ON clipboard_items(content_hash);
    CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
    CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at);
    CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
  `)
}

function initSettings(storagePath: string): void {
  if (!db) return

  const settings = [
    ['clipboard_retention_days', '3'],
    ['auto_launch', 'true'],
    ['close_to_tray', 'true'],
    ['storage_path', storagePath],
    ['ai_api_url', 'https://api.openai.com/v1/chat/completions'],
    ['ai_model_name', 'gpt-3.5-turbo']
  ]

  const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
  settings.forEach(([key, value]) => stmt.run(key, value))
}

export function saveClipboardItem(item: ClipboardItem): void {
  if (!db) return
  db.prepare(`
    INSERT OR REPLACE INTO clipboard_items (id, type, content, image_path, content_hash, created_at, is_pinned, is_deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(item.id, item.type, item.content, item.image_path, item.content_hash, item.created_at, item.is_pinned, item.is_deleted)
}

export function getClipboardItems(search?: string): ClipboardItem[] {
  if (!db) return []

  let query = 'SELECT * FROM clipboard_items WHERE is_deleted = 0'
  const params: unknown[] = []

  if (search) {
    query += " AND (type = 'text' AND content LIKE ? OR type = 'image' AND image_path LIKE ?)"
    params.push(`%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY is_pinned DESC, created_at DESC'

  return db.prepare(query).all(params) as ClipboardItem[]
}

export function getClipboardStats(startTime: number, endTime: number): { total: number; text_count: number; image_count: number } {
  if (!db) return { total: 0, text_count: 0, image_count: 0 }

  const results = db.prepare(`
    SELECT type, COUNT(*) as count FROM clipboard_items
    WHERE is_deleted = 0 AND created_at >= ? AND created_at <= ?
    GROUP BY type
  `).all(startTime, endTime) as { type: string; count: number }[]

  const counts: Record<string, number> = {}
  results.forEach(row => {
    counts[row.type] = row.count
  })

  return {
    total: (counts.text || 0) + (counts.image || 0),
    text_count: counts.text || 0,
    image_count: counts.image || 0
  }
}

export function toggleClipboardPin(id: string): void {
  if (!db) return
  db.prepare('UPDATE clipboard_items SET is_pinned = 1 - is_pinned WHERE id = ?').run(id)
}

export function deleteClipboardItem(id: string): void {
  if (!db) return
  db.prepare('UPDATE clipboard_items SET is_deleted = 1 WHERE id = ?').run(id)
}

export function cleanExpiredClipboardItems(days: number): void {
  if (!db) return
  const expireTime = Date.now() - days * 24 * 60 * 60 * 1000
  db.prepare('UPDATE clipboard_items SET is_deleted = 1 WHERE is_deleted = 0 AND is_pinned = 0 AND created_at < ?').run(expireTime)
}

export function saveFolder(folder: Folder): void {
  if (!db) return
  db.prepare(`
    INSERT OR REPLACE INTO folders (id, name, parent_id, created_at, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(folder.id, folder.name, folder.parent_id, folder.created_at, folder.sort_order)
}

export function getFolders(): Folder[] {
  if (!db) return []
  return db.prepare('SELECT * FROM folders ORDER BY sort_order').all() as Folder[]
}

export function updateFolderName(id: string, name: string): void {
  if (!db) return
  db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(name, id)
}

export function deleteFolder(id: string): void {
  if (!db) return
  db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?').run(id)
  db.prepare('DELETE FROM folders WHERE id = ?').run(id)
}

export function saveNote(note: Note): void {
  if (!db) return
  db.prepare(`
    INSERT OR REPLACE INTO notes (id, title, content, folder_id, created_at, updated_at, is_pinned, is_deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(note.id, note.title, note.content, note.folder_id, note.created_at, note.updated_at, note.is_pinned, note.is_deleted)
}

export function getNotes(folderId?: string | null, search?: string): Note[] {
  if (!db) return []

  let query = 'SELECT * FROM notes WHERE is_deleted = 0'
  const params: unknown[] = []

  if (folderId !== undefined && folderId !== null) {
    query += ' AND folder_id = ?'
    params.push(folderId)
  } else if (folderId === null) {
    query += ' AND (folder_id IS NULL OR folder_id = \'\')'
  }

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY is_pinned DESC, updated_at DESC'

  return db.prepare(query).all(params) as Note[]
}

export function getNoteById(id: string): Note | null {
  if (!db) return null
  return db.prepare('SELECT * FROM notes WHERE id = ? AND is_deleted = 0').get(id) as Note | null
}

export function getNotesStats(folderId?: string | null): { total: number; total_words: number } {
  if (!db) return { total: 0, total_words: 0 }

  let query = 'SELECT COUNT(*) as total, COALESCE(SUM(LENGTH(content)), 0) as total_words FROM notes WHERE is_deleted = 0'
  const params: unknown[] = []

  if (folderId !== undefined && folderId !== null) {
    query += ' AND folder_id = ?'
    params.push(folderId)
  } else if (folderId === null) {
    query += ' AND (folder_id IS NULL OR folder_id = \'\')'
  }

  const result = db.prepare(query).get(params) as { total: number; total_words: number } | undefined
  return result || { total: 0, total_words: 0 }
}

export function toggleNotePin(id: string): void {
  if (!db) return
  db.prepare('UPDATE notes SET is_pinned = 1 - is_pinned WHERE id = ?').run(id)
}

export function deleteNote(id: string): void {
  if (!db) return
  db.prepare('UPDATE notes SET is_deleted = 1 WHERE id = ?').run(id)
}

export function saveAIConversation(conv: AIConversation): void {
  if (!db) return
  db.prepare(`
    INSERT OR REPLACE INTO ai_conversations (id, title, source_type, source_range, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(conv.id, conv.title, conv.source_type, conv.source_range, conv.created_at, conv.updated_at)
}

export function getAIConversations(): AIConversation[] {
  if (!db) return []
  return db.prepare('SELECT * FROM ai_conversations ORDER BY updated_at DESC').all() as AIConversation[]
}

export function deleteAIConversation(id: string): void {
  if (!db) return
  db.prepare('DELETE FROM ai_conversations WHERE id = ?').run(id)
  db.prepare('DELETE FROM ai_messages WHERE conversation_id = ?').run(id)
}

export function saveAIMessage(msg: AIMessage): void {
  if (!db) return
  db.prepare(`
    INSERT INTO ai_messages (id, conversation_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(msg.id, msg.conversation_id, msg.role, msg.content, msg.created_at)
}

export function getAIMessages(conversationId: string): AIMessage[] {
  if (!db) return []
  return db.prepare('SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at').all(conversationId) as AIMessage[]
}

export function getSettings(): Settings {
  if (!db) return {} as Settings

  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const settings: Record<string, string> = {}
  rows.forEach(row => {
    settings[row.key] = row.value
  })

  return {
    clipboard_retention_days: parseInt(settings.clipboard_retention_days || '3'),
    auto_launch: settings.auto_launch === 'true',
    close_to_tray: settings.close_to_tray === 'true',
    storage_path: settings.storage_path || '',
    ai_api_url: settings.ai_api_url || '',
    ai_api_key: settings.ai_api_key || '',
    ai_model_name: settings.ai_model_name || ''
  }
}

export function setSetting(key: string, value: string): void {
  if (!db) return
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}
