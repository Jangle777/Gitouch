import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  clipboard: {
    list: (args?: { search?: string }) => ipcRenderer.invoke('clipboard:list', args),
    save: (item: unknown) => ipcRenderer.invoke('clipboard:save', item),
    pin: (id: string) => ipcRenderer.invoke('clipboard:pin', id),
    delete: (id: string) => ipcRenderer.invoke('clipboard:delete', id),
    stats: (args: { start_time: number; end_time: number }) => ipcRenderer.invoke('clipboard:stats', args),
    clean: (days: number) => ipcRenderer.invoke('clipboard:clean', days),
    copyImage: (imagePath: string) => ipcRenderer.invoke('clipboard:copyImage', imagePath),
    onNewItem: (callback: () => void) => {
      ipcRenderer.on('clipboard:new-item', callback)
      return () => ipcRenderer.removeListener('clipboard:new-item', callback)
    }
  },
  notes: {
    list: (args?: { folder_id?: string | null; search?: string }) => ipcRenderer.invoke('notes:list', args),
    get: (id: string) => ipcRenderer.invoke('notes:get', id),
    save: (note: unknown) => ipcRenderer.invoke('notes:save', note),
    pin: (id: string) => ipcRenderer.invoke('notes:pin', id),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    stats: (args?: { folder_id?: string | null }) => ipcRenderer.invoke('notes:stats', args)
  },
  folders: {
    list: () => ipcRenderer.invoke('folders:list'),
    save: (folder: unknown) => ipcRenderer.invoke('folders:save', folder),
    update: (args: { id: string; name: string }) => ipcRenderer.invoke('folders:update', args),
    delete: (id: string) => ipcRenderer.invoke('folders:delete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (args: { key: string; value: string }) => ipcRenderer.invoke('settings:set', args)
  },
  ai: {
    chat: (args: unknown) => ipcRenderer.invoke('ai:chat', args),
    summarize: (args: unknown) => ipcRenderer.invoke('ai:summarize', args),
    conversations: {
      list: () => ipcRenderer.invoke('ai:conversations:list'),
      save: (conv: unknown) => ipcRenderer.invoke('ai:conversations:save', conv),
      delete: (id: string) => ipcRenderer.invoke('ai:conversations:delete', id)
    },
    messages: {
      list: (conversationId: string) => ipcRenderer.invoke('ai:messages:list', conversationId),
      save: (msg: unknown) => ipcRenderer.invoke('ai:messages:save', msg)
    }
  },
  window: {
    toggleMode: () => ipcRenderer.invoke('window:toggleMode'),
    getMode: () => ipcRenderer.invoke('window:getMode'),
    show: () => ipcRenderer.invoke('window:show'),
    hide: () => ipcRenderer.invoke('window:hide'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    dragMove: (args: { deltaX: number; deltaY: number }) => ipcRenderer.invoke('window:dragMove', args)
  },
  image: {
    openDialog: () => ipcRenderer.invoke('image:openDialog')
  },
  folder: {
    selectDialog: () => ipcRenderer.invoke('folder:selectDialog')
  },
  app: {
    getIconPath: () => ipcRenderer.invoke('app:getIconPath')
  }
})
