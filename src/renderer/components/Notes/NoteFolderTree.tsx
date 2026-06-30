import { useState, useRef, useEffect } from 'react'

interface NoteFolderTreeProps {
  folders: Array<{
    id: string
    name: string
    parent_id: string | null
  }>
  selectedId: string | null
  onSelect: (id: string | null) => void
  onCreate: () => void
  onUpdate: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export default function NoteFolderTree({ folders, selectedId, onSelect, onCreate, onUpdate, onDelete }: NoteFolderTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const getChildren = (parentId: string | null) => {
    return folders.filter(f => f.parent_id === parentId)
  }

  const handleDoubleClick = (folder: { id: string; name: string }) => {
    setEditingId(folder.id)
    setEditName(folder.name)
  }

  const handleBlur = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditName('')
    }
  }

  const renderTree = (parentId: string | null, level: number = 0) => {
    const children = getChildren(parentId)
    if (children.length === 0) return null

    return (
      <ul className="folder-tree-list" style={{ paddingLeft: level > 0 ? '16px' : '0' }}>
        {children.map(folder => (
          <li key={folder.id}>
            <div className="folder-tree-item-wrapper">
              <button
                className={`folder-tree-item ${selectedId === folder.id ? 'folder-tree-item--active' : ''}`}
                onClick={() => onSelect(folder.id)}
                onDoubleClick={() => handleDoubleClick(folder)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                {editingId === folder.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="folder-tree-item-edit-input"
                  />
                ) : (
                  <span>{folder.name}</span>
                )}
              </button>
              {editingId !== folder.id && (
                <button
                  className="folder-tree-item-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(folder.id)
                  }}
                  title="删除文件夹"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              )}
            </div>
            {renderTree(folder.id, level + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="folder-tree-panel">
      <div className="folder-tree-header">
        <span>文件夹</span>
        <button className="folder-tree-add-btn" onClick={onCreate} title="新建文件夹">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <div className="folder-tree-content">
        <button
          className={`folder-tree-item ${selectedId === null ? 'folder-tree-item--active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
          <span>全部笔记</span>
        </button>
        {renderTree(null)}
      </div>
    </div>
  )
}
