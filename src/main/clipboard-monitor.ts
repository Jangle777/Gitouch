import { clipboard } from 'electron'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { saveClipboardItem, getClipboardItems, getSettings } from './database'
import { mainWindow } from './index'

let lastHash = ''

function generateHash(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

function saveImageToFile(imageBuffer: Buffer): string {
  const settings = getSettings()
  const imagesDir = path.join(settings.storage_path, 'images')
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }
  
  const fileName = `${Date.now()}.png`
  const filePath = path.join(imagesDir, fileName)
  fs.writeFileSync(filePath, imageBuffer)
  
  return filePath
}

function monitorClipboard(): void {
  try {
    const image = clipboard.readImage()
    
    if (!image.isEmpty()) {
      const pngBuffer = image.toPNG()
      const hash = generateHash(pngBuffer)
      
      if (hash !== lastHash) {
        lastHash = hash
        
        const existingItems = getClipboardItems()
        const exists = existingItems.some(item => item.content_hash === hash)
        
        if (!exists) {
          const imagePath = saveImageToFile(pngBuffer)
          
          saveClipboardItem({
            id: `clipboard_${Date.now()}`,
            type: 'image',
            content: null,
            image_path: imagePath,
            content_hash: hash,
            created_at: Date.now(),
            is_pinned: 0,
            is_deleted: 0
          })
          
          mainWindow?.webContents.send('clipboard:new-item')
        }
        return
      }
    }
    
    const text = clipboard.readText()
    
    if (text && text.length > 0 && text.length < 50 * 1024) {
      const hash = generateHash(text)
      
      if (hash !== lastHash) {
        lastHash = hash
        
        const existingItems = getClipboardItems()
        const exists = existingItems.some(item => item.content_hash === hash)
        
        if (!exists) {
          saveClipboardItem({
            id: `clipboard_${Date.now()}`,
            type: 'text',
            content: text,
            image_path: null,
            content_hash: hash,
            created_at: Date.now(),
            is_pinned: 0,
            is_deleted: 0
          })
          
          mainWindow?.webContents.send('clipboard:new-item')
        }
      }
    }
  } catch (error) {
    console.error('Clipboard monitor error:', error)
  }
}

export function startClipboardMonitor(): void {
  setInterval(monitorClipboard, 800)
}
