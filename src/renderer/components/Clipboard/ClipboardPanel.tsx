import { useState, useEffect } from 'react'
import ClipboardCard from './ClipboardCard'
import ClipboardDetailView from './ClipboardDetailView'
import { electronAPI } from '../../utils/electron-api'

interface ClipboardPanelProps {
  openConfirm: (title: string, message: string, onConfirm?: () => void) => void
}

export default function ClipboardPanel({ openConfirm }: ClipboardPanelProps) {
  const [items, setItems] = useState<Array<{
    id: string
    type: 'text' | 'image'
    content: string | null
    image_path: string | null
    created_at: number
    is_pinned: number
  }>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadItems = async () => {
    const data = await electronAPI.clipboard.list({ search: searchTerm || undefined })
    setItems(data)
  }

  useEffect(() => {
    loadItems()

    const unsubscribe = electronAPI.clipboard.onNewItem(loadItems)
    return () => unsubscribe()
  }, [searchTerm])

  const handlePin = async (id: string) => {
    await electronAPI.clipboard.pin(id)
    loadItems()
  }

  const handleDelete = (id: string) => {
    openConfirm('删除记录', '确定删除此剪贴板记录吗？', async () => {
      await electronAPI.clipboard.delete(id)
      loadItems()
    })
  }

  const handleCopy = async (item: { type: 'text' | 'image'; content: string | null; image_path: string | null }) => {
    if (item.type === 'text' && item.content) {
      await navigator.clipboard.writeText(item.content)
    } else if (item.type === 'image' && item.image_path) {
      await electronAPI.clipboard.copyImage(item.image_path)
    }
  }

  return (
    <div className="panel">
      <div className="clipboard-search-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索剪贴板内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="clipboard-list">
        {items.length === 0 ? (
          <div className="panel-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d1d1" strokeWidth="1.5">
              <rect x="8" y="2" width="12" height="20" rx="2"/>
              <path d="M16 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/>
            </svg>
            <p className="placeholder-text">暂无剪贴板记录</p>
            <p className="placeholder-hint">复制一些内容后自动在此显示</p>
          </div>
        ) : (
          items.map(item => (
            <ClipboardCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onPin={() => handlePin(item.id)}
              onDelete={() => handleDelete(item.id)}
              onCopy={() => handleCopy(item)}
            />
          ))
        )}
      </div>

      {selectedId && (
        <ClipboardDetailView
          item={items.find(i => i.id === selectedId)!}
          onClose={() => setSelectedId(null)}
          onPin={() => handlePin(selectedId)}
          onDelete={() => handleDelete(selectedId)}
          onCopy={() => {
            const item = items.find(i => i.id === selectedId)
            if (item) handleCopy(item)
          }}
        />
      )}
    </div>
  )
}
