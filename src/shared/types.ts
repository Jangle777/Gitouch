export interface ClipboardItem {
  id: string
  type: 'text' | 'image'
  content: string | null
  image_path: string | null
  content_hash: string
  created_at: number
  is_pinned: number
  is_deleted: number
}

export interface Folder {
  id: string
  name: string
  parent_id: string | null
  created_at: number
  sort_order: number
}

export interface Note {
  id: string
  title: string
  content: string
  folder_id: string | null
  created_at: number
  updated_at: number
  is_pinned: number
  is_deleted: number
}

export interface AIConversation {
  id: string
  title: string
  source_type: 'clipboard' | 'notes'
  source_range: string
  created_at: number
  updated_at: number
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: number
}

export interface Settings {
  clipboard_retention_days: number
  auto_launch: boolean
  close_to_tray: boolean
  storage_path: string
  ai_api_url: string
  ai_api_key: string
  ai_model_name: string
}

export interface ClipboardListRequest {
  page?: number
  limit?: number
  search?: string
}

export interface ClipboardListResponse {
  items: ClipboardItem[]
  total: number
}

export interface ClipboardStatsRequest {
  start_time: number
  end_time: number
}

export interface ClipboardStatsResponse {
  total: number
  text_count: number
  image_count: number
}

export interface NotesListRequest {
  folder_id?: string | null
  page?: number
  limit?: number
  search?: string
}

export interface NotesListResponse {
  items: Note[]
  total: number
}

export interface NotesStatsRequest {
  folder_id?: string | null
}

export interface NotesStatsResponse {
  total: number
  total_words: number
}

export interface AIChatRequest {
  conversation_id: string | null
  message: string
  knowledge_base: string
  source_type: 'clipboard' | 'notes'
}

export interface AIChatResponse {
  conversation_id: string
  message: AIMessage
}
