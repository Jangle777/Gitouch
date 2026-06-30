import { Tray, Menu, app, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import { mainWindow } from './index'

let tray: Tray | null = null

export function createTray(): void {
  let iconPath = path.join(__dirname, '../../resources/icon.png')
  
  if (!fs.existsSync(iconPath)) {
    const image = nativeImage.createEmpty()
    tray = new Tray(image)
  } else {
    tray = new Tray(iconPath)
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
      }
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => {
        app.exit(0)
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('Gitouch')
  
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}
