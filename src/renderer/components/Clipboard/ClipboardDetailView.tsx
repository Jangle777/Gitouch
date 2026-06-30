interface ClipboardDetailViewProps {
  item: {
    id: string
    type: 'text' | 'image'
    content: string | null
    image_path: string | null
    created_at: number
    is_pinned: number
  }
  onClose: () => void
  onPin: () => void
  onDelete: () => void
  onCopy: () => void
}

export default function ClipboardDetailView({ item, onClose, onPin, onDelete, onCopy }: ClipboardDetailViewProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  }

  return (
    <div className="clipboard-detail-view">
      <div className="detail-header">
        <button className="detail-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="detail-title">
          {item.type === 'text' ? '文本内容' : '图片内容'}
        </div>
        <div className="detail-actions">
          <button onClick={onPin} className="detail-action-btn" title={item.is_pinned ? '取消置顶' : '置顶'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="17" x2="12" y2="22"/>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
          </button>
          <button onClick={onCopy} className="detail-action-btn" title="复制">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button onClick={onDelete} className="detail-action-btn" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="detail-content">
        {item.type === 'text' ? (
          <textarea readOnly value={item.content || ''} className="detail-textarea"/>
        ) : (
          <div className="detail-image-container">
            {item.image_path ? (
              <img src={`file://${item.image_path}`} alt="剪贴板图片" className="detail-image"/>
            ) : (
              <div className="panel-placeholder">
                <p>图片路径不存在</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="detail-footer">
        <span>{formatTime(item.created_at)}</span>
        {item.is_pinned && <span className="detail-pin-tag">已置顶</span>}
      </div>
    </div>
  )
}
