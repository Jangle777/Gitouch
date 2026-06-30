import { ipcMain, clipboard, nativeImage, app } from 'electron'
import path from 'path'
import fs from 'fs'
import { getClipboardItems, saveClipboardItem, toggleClipboardPin, deleteClipboardItem, getClipboardStats, cleanExpiredClipboardItems } from './database'

export function registerClipboardHandlers(): void {
  ipcMain.handle('clipboard:list', (_event, args?: { search?: string }) => {
    return getClipboardItems(args?.search)
  })

  ipcMain.handle('clipboard:save', (_event, item) => {
    saveClipboardItem(item)
    return true
  })

  ipcMain.handle('clipboard:pin', (_event, id: string) => {
    toggleClipboardPin(id)
    return true
  })

  ipcMain.handle('clipboard:delete', (_event, id: string) => {
    deleteClipboardItem(id)
    return true
  })

  ipcMain.handle('clipboard:copyImage', (_event, imagePath: string) => {
    if (imagePath) {
      const image = nativeImage.createFromPath(imagePath)
      if (!image.isEmpty()) {
        clipboard.writeImage(image)
        return true
      }
    }
    return false
  })

  ipcMain.handle('clipboard:stats', (_event, args: { start_time: number; end_time: number }) => {
    return getClipboardStats(args.start_time, args.end_time)
  })

  ipcMain.handle('clipboard:clean', (_event, days: number) => {
    cleanExpiredClipboardItems(days)
    return true
  })
}

import { getNotes, saveNote, getNoteById, toggleNotePin, deleteNote, getNotesStats } from './database'

export function registerNoteHandlers(): void {
  ipcMain.handle('notes:list', (_event, args?: { folder_id?: string | null; search?: string }) => {
    return getNotes(args?.folder_id, args?.search)
  })

  ipcMain.handle('notes:get', (_event, id: string) => {
    return getNoteById(id)
  })

  ipcMain.handle('notes:save', (_event, note) => {
    saveNote(note)
    return true
  })

  ipcMain.handle('notes:pin', (_event, id: string) => {
    toggleNotePin(id)
    return true
  })

  ipcMain.handle('notes:delete', (_event, id: string) => {
    deleteNote(id)
    return true
  })

  ipcMain.handle('notes:stats', (_event, args?: { folder_id?: string | null }) => {
    return getNotesStats(args?.folder_id)
  })
}

import { getFolders, saveFolder, updateFolderName, deleteFolder } from './database'

export function registerFolderHandlers(): void {
  ipcMain.handle('folders:list', () => {
    return getFolders()
  })

  ipcMain.handle('folders:save', (_event, folder) => {
    saveFolder(folder)
    return true
  })

  ipcMain.handle('folders:update', (_event, args: { id: string; name: string }) => {
    updateFolderName(args.id, args.name)
    return true
  })

  ipcMain.handle('folders:delete', (_event, id: string) => {
    deleteFolder(id)
    return true
  })
}

import { getSettings, setSetting } from './database'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:set', (_event, args: { key: string; value: string }) => {
    setSetting(args.key, args.value)
    return true
  })
}

import { saveAIConversation, getAIConversations, deleteAIConversation, saveAIMessage, getAIMessages } from './database'
import { handleAIChat, handleAISummarize } from './ai-handler'

export function registerAIHandlers(): void {
  ipcMain.handle('ai:chat', async (_event, args) => {
    return handleAIChat(args)
  })

  ipcMain.handle('ai:summarize', async (_event, args) => {
    return handleAISummarize(args)
  })

  ipcMain.handle('ai:conversations:list', () => {
    return getAIConversations()
  })

  ipcMain.handle('ai:conversations:save', (_event, conv) => {
    saveAIConversation(conv)
    return true
  })

  ipcMain.handle('ai:conversations:delete', (_event, id: string) => {
    deleteAIConversation(id)
    return true
  })

  ipcMain.handle('ai:messages:list', (_event, conversationId: string) => {
    return getAIMessages(conversationId)
  })

  ipcMain.handle('ai:messages:save', (_event, msg) => {
    saveAIMessage(msg)
    return true
  })
}

export function registerAppHandlers(): void {
  ipcMain.handle('app:getIconPath', () => {
    const iconPath = path.join(app.getAppPath(), 'resources/icon.png')
    if (fs.existsSync(iconPath)) {
      return iconPath
    }
    const devPath = path.join(__dirname, '../../resources/icon.png')
    if (fs.existsSync(devPath)) {
      return devPath
    }
    return null
  })
}
