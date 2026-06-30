interface NoteListProps {
  notes: Array<{
    id: string
    title: string
    content: string
    created_at: number
    updated_at: number
    is_pinned: number
  }>
  selectedId: string | null
  searchTerm: string
  onSearchChange: (term: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onTogglePin?: (id: string) => void
  onBack: () => void
}

export default function NoteList({ notes, selectedId, searchTerm, onSearchChange, onSelect, onCreate, onDelete, onTogglePin }: NoteListProps) {
  const formatTime = (timestamp: number) => {
    const now = new Date()
    const diff = now.getTime() - timestamp
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) return '刚刚'
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
    if (diff < day) return `${Math.floor(diff / hour)}小时前`
    if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
    
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getPreview = (content: string) => {
    const text = content.replace(/[#*`~\[\]<>]/g, '').trim()
    if (!text) return '空笔记'
    return text.substring(0, 80) + (text.length > 80 ? '...' : '')
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return b.is_pinned - a.is_pinned
    }
    return b.updated_at - a.updated_at
  })

  return (
    <div className="note-list-panel">
      <div className="note-list-header">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <button onClick={onCreate} className="note-list-new-btn" title="新建笔记">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <div className="note-list-items">
        {sortedNotes.length === 0 ? (
          <div className="panel-placeholder">
            <p className="placeholder-text">暂无笔记</p>
          </div>
        ) : (
          sortedNotes.map(note => (
            <div
              key={note.id}
              className={`note-list-item ${selectedId === note.id ? 'note-list-item--active' : ''} ${note.is_pinned ? 'note-list-item--pinned' : ''}`}
              onClick={() => onSelect(note.id)}
            >
              <div className="note-list-item-title">
                {note.title || '无标题'}
              </div>
              <div className="note-list-item-preview">
                {getPreview(note.content)}
              </div>
              <div className="note-list-item-meta">
                <span>{formatTime(note.updated_at)}</span>
              </div>
              <button className="note-list-item-pin-btn" onClick={(e) => { e.stopPropagation(); onTogglePin?.(note.id); }} title={note.is_pinned ? '取消置顶' : '置顶'}>
                {note.is_pinned ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                  </svg>
                )}
              </button>
              <button className="note-list-item-delete" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
