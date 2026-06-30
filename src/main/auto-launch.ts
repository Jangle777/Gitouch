import { app, shell } from 'electron'
import path from 'path'
import fs from 'fs'

export function setupAutoLaunch(enable: boolean): void {
  const startupPath = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'Gitouch.lnk')
  
  if (enable) {
    createShortcut(startupPath)
  } else {
    deleteShortcut(startupPath)
  }
}

function createShortcut(shortcutPath: string): void {
  try {
    shell.writeShortcutLink(shortcutPath, 'create', {
      target: process.execPath,
      args: '--hidden',
      icon: process.execPath,
      iconIndex: 0,
      description: 'Gitouch'
    })
  } catch (error) {
    console.error('Failed to create shortcut:', error)
  }
}

function deleteShortcut(shortcutPath: string): void {
  try {
    if (fs.existsSync(shortcutPath)) {
      fs.unlinkSync(shortcutPath)
    }
  } catch (error) {
    console.error('Failed to delete shortcut:', error)
  }
}
