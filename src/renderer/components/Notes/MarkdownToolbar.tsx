import { useState, useEffect, useRef } from 'react'

interface MarkdownToolbarProps {
  onHeading: (level: number) => void
  onBold: () => void
  onItalic: () => void
  onStrikethrough: () => void
  onBulletList: () => void
  onNumberedList: () => void
}

export default function MarkdownToolbar({ onHeading, onBold, onItalic, onStrikethrough, onBulletList, onNumberedList }: MarkdownToolbarProps) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowHeadingMenu(false)
        setShowListMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleHeadingSelect = (level: number) => {
    if (level === 0) {
      document.execCommand('formatBlock', false, '<p>')
    } else {
      onHeading(level)
    }
    setShowHeadingMenu(false)
  }

  return (
    <div className="markdown-toolbar" ref={toolbarRef}>
      <div className="toolbar-group">
        <div className="toolbar-dropdown">
          <button className="toolbar-btn toolbar-dropdown-toggle" onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowListMenu(false); }}>
            <span>H1</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showHeadingMenu && (
            <div className="toolbar-dropdown-menu heading-menu">
              <button onClick={() => handleHeadingSelect(1)}>H1 标题</button>
              <button onClick={() => handleHeadingSelect(2)}>H2 标题</button>
              <button onClick={() => handleHeadingSelect(3)}>H3 标题</button>
              <button onClick={() => handleHeadingSelect(4)}>H4 标题</button>
              <button onClick={() => handleHeadingSelect(0)}>正文</button>
            </div>
          )}
        </div>
      </div>
      <div className="toolbar-group">
        <div className="toolbar-dropdown">
          <button className="toolbar-btn toolbar-dropdown-toggle" onClick={() => { setShowListMenu(!showListMenu); setShowHeadingMenu(false); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showListMenu && (
            <div className="toolbar-dropdown-menu list-menu">
              <button onClick={() => { onBulletList(); setShowListMenu(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span>无序列表</span>
              </button>
              <button onClick={() => { onNumberedList(); setShowListMenu(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 6V4a2 2 0 1 0-4 0v2"/>
                  <path d="M4 10h16"/>
                  <path d="M4 14h16"/>
                  <path d="M4 18h16"/>
                  <path d="M14 6V4a2 2 0 1 0-4 0v2"/>
                  <path d="M18 6V4a2 2 0 1 0-4 0v2"/>
                </svg>
                <span>有序列表</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="toolbar-group">
        <button className="toolbar-btn" title="加粗" onClick={onBold}>
          <span className="toolbar-btn-text">B</span>
        </button>
        <button className="toolbar-btn" title="斜体" onClick={onItalic}>
          <span className="toolbar-btn-text italic">I</span>
        </button>
        <button className="toolbar-btn" title="删除线" onClick={onStrikethrough}>
          <span className="toolbar-btn-text strikethrough">S</span>
        </button>
      </div>
    </div>
  )
}
