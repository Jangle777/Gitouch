import { app, BrowserWindow, screen, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { initDatabase, getSettings, cleanExpiredClipboardItems } from './database'
import { registerClipboardHandlers, registerNoteHandlers, registerFolderHandlers, registerSettingsHandlers, registerAIHandlers, registerAppHandlers } from './ipc-handlers'
import { startClipboardMonitor } from './clipboard-monitor'
import { createTray } from './tray'
import { setupAutoLaunch } from './auto-launch'

let mainWindow: BrowserWindow | null = null
let isSmallMode = false
let lastLargeWindowBounds: Electron.Rectangle | null = null
let storagePath: string = ''

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const windowWidth = Math.min(1100, width - 40)
  const windowHeight = Math.min(750, height - 40)
  
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 550,
    frame: false,
    resizable: true,
    show: false,
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadURL(
    process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../../dist/renderer/index.html')}`
  )

  mainWindow.on('ready-to-show', () => {
    if (!process.argv.includes('--hidden')) {
      mainWindow?.show()
    }
  })

  mainWindow.on('close', (event) => {
    const settings = getSettings()
    if (settings.close_to_tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('resize', () => {
    if (!isSmallMode) {
      lastLargeWindowBounds = mainWindow?.getBounds() || null
    }
  })

  mainWindow.on('move', () => {
    if (!isSmallMode) {
      lastLargeWindowBounds = mainWindow?.getBounds() || null
    }
  })
}

function toggleWindowMode(): void {
  if (!mainWindow) return

  isSmallMode = !isSmallMode

  if (isSmallMode) {
    lastLargeWindowBounds = mainWindow.getBounds()
    
    mainWindow.setSize(336, 480)
    mainWindow.setResizable(false)
    mainWindow.setAlwaysOnTop(true)
    
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    mainWindow.setPosition(width - 356, height - 500)
  } else {
    mainWindow.setResizable(true)
    mainWindow.setAlwaysOnTop(false)
    
    if (lastLargeWindowBounds) {
      mainWindow.setBounds(lastLargeWindowBounds)
    } else {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      const windowWidth = Math.min(1100, width - 40)
      const windowHeight = Math.min(750, height - 40)
      mainWindow.setSize(windowWidth, windowHeight)
      mainWindow.center()
    }
  }
}

function getWindowMode(): 'large' | 'small' {
  return isSmallMode ? 'small' : 'large'
}

function initApp(): void {
  const appDataPath = app.getPath('appData')
  storagePath = path.join(appDataPath, 'Gitouch')
  
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true })
  }
  
  initDatabase(storagePath)
  
  const settings = getSettings()
  cleanExpiredClipboardItems(settings.clipboard_retention_days)
  
  setupAutoLaunch(settings.auto_launch)
  
  registerClipboardHandlers()
  registerNoteHandlers()
  registerFolderHandlers()
  registerSettingsHandlers()
  registerAIHandlers()
  registerAppHandlers()
  
  ipcMain.handle('window:toggleMode', () => {
    toggleWindowMode()
    return getWindowMode()
  })
  
  ipcMain.handle('window:getMode', () => getWindowMode())
  
  ipcMain.handle('window:show', () => {
    mainWindow?.show()
  })
  
  ipcMain.handle('window:hide', () => {
    mainWindow?.hide()
  })
  
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })
  
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  
  ipcMain.handle('window:dragMove', (_event, args: { deltaX: number; deltaY: number }) => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds()
      mainWindow.setBounds({
        x: bounds.x + args.deltaX,
        y: bounds.y + args.deltaY,
        width: bounds.width,
        height: bounds.height
      })
    }
  })
  
  createTray()
  
  createWindow()
  
  startClipboardMonitor()
}

app.whenReady().then(() => initApp())

// 防止重复启动
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

export { mainWindow, storagePath }
