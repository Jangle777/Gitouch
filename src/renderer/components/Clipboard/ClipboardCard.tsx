import { useState } from 'react'

interface ClipboardCardProps {
  item: {
    id: string
    type: 'text' | 'image'
    content: string | null
    image_path: string | null
    created_at: number
    is_pinned: number
    source_type: string | null
    source_title: string | null
    source_url: string | null
  }
  isSelected: boolean
  onSelect: () => void
  onPin: () => void
  onDelete: () => void
  onCopy: () => void
}

export default function ClipboardCard({ item, isSelected, onSelect, onPin, onDelete, onCopy }: ClipboardCardProps) {
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (date.getDate() === now.getDate()) return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const handleCopy = () => {
    onCopy()
    setShowCopySuccess(true)
    setTimeout(() => setShowCopySuccess(false), 5000)
  }

  return (
    <div className={`clipboard-card ${isSelected ? 'clipboard-card--selected' : ''} ${item.is_pinned ? 'clipboard-card--pinned' : ''}`} onClick={onSelect}>
      <div className="clipboard-card-header">
        <div className="clipboard-card-meta">
          <div className="clipboard-card-type-icon">
            {item.type === 'text' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
          </div>
          <span className="clipboard-card-time">{formatTime(item.created_at)}</span>
          {item.source_type === 'website' && item.source_title && (
            <span className="clipboard-card-source">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                <path d="M22 12a15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4 15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4z"/>
              </svg>
              {item.source_title}
            </span>
          )}
        </div>
        <div className="clipboard-card-actions">
          {showCopySuccess && <span className="copy-success-hint">复制成功</span>}
          <button onClick={(e) => { e.stopPropagation(); onPin(); }} title={item.is_pinned ? '取消置顶' : '置顶'}>
            {item.is_pinned ? (
              // 已置顶：实心填充图钉
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="17" x2="12" y2="22"/>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
            ) : (
              // 未置顶：空心虚线图钉
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="17" x2="12" y2="22"/>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
            )}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} title="复制">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="删除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="clipboard-card-preview">
        {item.type === 'text' ? (
          <span>{item.content || ''}</span>
        ) : (
          <div className="clipboard-card-image-preview">
            {item.image_path ? (
              <img 
                src={`file://${item.image_path}`} 
                alt="图片预览" 
                className="clipboard-card-thumbnail"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const placeholder = target.parentElement?.querySelector('.clipboard-card-image-placeholder')
                  if (placeholder) placeholder.classList.remove('hide')
                }}
              />
            ) : null}
            <span className={item.image_path ? 'hide clipboard-card-image-placeholder' : 'clipboard-card-image-placeholder'}>[图片]</span>
          </div>
        )}
      </div>
    </div>
  )
}
