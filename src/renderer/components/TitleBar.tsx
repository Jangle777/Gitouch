import { useCallback, useRef, useEffect, useState } from 'react'
import { electronAPI } from '../utils/electron-api'

interface TitleBarProps {
  onToggleMode: () => void
}

export default function TitleBar({ onToggleMode }: TitleBarProps) {
  const isDragging = useRef(false)
  const lastScreenPos = useRef({ x: 0, y: 0 })
  const [iconPath, setIconPath] = useState<string | null>(null)

  useEffect(() => {
    electronAPI.app.getIconPath().then(path => {
      setIconPath(path)
    })
  }, [])

  const handleMinimize = () => {
    electronAPI.window.minimize()
  }

  const handleMaximize = () => {
    electronAPI.window.maximize()
  }

  const handleClose = () => {
    electronAPI.window.hide()
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    
    isDragging.current = true
    lastScreenPos.current = { x: e.screenX, y: e.screenY }
    e.preventDefault()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      
      const deltaX = e.screenX - lastScreenPos.current.x
      const deltaY = e.screenY - lastScreenPos.current.y
      
      if (deltaX !== 0 || deltaY !== 0) {
        electronAPI.window.dragMove({ deltaX, deltaY })
        lastScreenPos.current = { x: e.screenX, y: e.screenY }
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className="title-bar" onMouseDown={handleMouseDown}>
      <div className="title-bar-icon">
        {iconPath ? (
          <img src={'file://' + iconPath} alt="Gitouch" style={{ width: 16, height: 16 }} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="2" width="12" height="20" rx="2"/>
            <path d="M16 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/>
          </svg>
        )}
        <span>Gitouch</span>
      </div>
      <div className="title-bar-controls">
        <button onClick={handleMinimize} title="最小化">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button onClick={handleMaximize} title="最大化">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </button>
        <button onClick={onToggleMode} title="切换窗口模式">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="10" height="10" rx="2"/>
            <rect x="10" y="10" width="10" height="10" rx="2"/>
          </svg>
        </button>
        <button onClick={handleClose} className="btn-close" title="关闭">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
