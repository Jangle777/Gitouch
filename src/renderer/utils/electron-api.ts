export const electronAPI = (window as any).electronAPI as {
  clipboard: {
    list: (args?: { search?: string }) => Promise<Array<{
      id: string
      type: 'text' | 'image'
      content: string | null
      image_path: string | null
      content_hash: string
      created_at: number
      is_pinned: number
      is_deleted: number
    }>>
    save: (item: unknown) => Promise<boolean>
    pin: (id: string) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    stats: (args: { start_time: number; end_time: number }) => Promise<{ total: number; text_count: number; image_count: number }>
    clean: (days: number) => Promise<boolean>
    copyImage: (imagePath: string) => Promise<boolean>
    onNewItem: (callback: () => void) => () => void
  }
  notes: {
    list: (args?: { folder_id?: string | null; search?: string }) => Promise<Array<{
      id: string
      title: string
      content: string
      folder_id: string | null
      created_at: number
      updated_at: number
      is_pinned: number
      is_deleted: number
    }>>
    get: (id: string) => Promise<{
      id: string
      title: string
      content: string
      folder_id: string | null
      created_at: number
      updated_at: number
      is_pinned: number
      is_deleted: number
    } | null>
    save: (note: unknown) => Promise<boolean>
    pin: (id: string) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
    stats: (args?: { folder_id?: string | null }) => Promise<{ total: number; total_words: number }>
  }
  folders: {
    list: () => Promise<Array<{ id: string; name: string; parent_id: string | null; created_at: number; sort_order: number }>>
    save: (folder: unknown) => Promise<boolean>
    update: (args: { id: string; name: string }) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
  }
  settings: {
    get: () => Promise<{
      clipboard_retention_days: number
      auto_launch: boolean
      close_to_tray: boolean
      storage_path: string
      ai_api_url: string
      ai_api_key: string
      ai_model_name: string
    }>
    set: (args: { key: string; value: string }) => Promise<boolean>
  }
  ai: {
    chat: (args: unknown) => Promise<{ success: boolean; content?: string; error?: string }>
    summarize: (args: unknown) => Promise<{ success: boolean; content?: string; error?: string }>
    conversations: {
      list: () => Promise<Array<{ id: string; title: string; source_type: string; source_range: string; created_at: number; updated_at: number }>>
      save: (conv: unknown) => Promise<boolean>
      delete: (id: string) => Promise<boolean>
    }
    messages: {
      list: (conversationId: string) => Promise<Array<{ id: string; conversation_id: string; role: 'user' | 'assistant'; content: string; created_at: number }>>
      save: (msg: unknown) => Promise<boolean>
    }
  }
  window: {
    toggleMode: () => Promise<'large' | 'small'>
    getMode: () => Promise<'large' | 'small'>
    show: () => Promise<void>
    hide: () => Promise<void>
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    dragMove: (args: { deltaX: number; deltaY: number }) => Promise<void>
  },
  app: {
    getIconPath: () => Promise<string | null>
  }
}
