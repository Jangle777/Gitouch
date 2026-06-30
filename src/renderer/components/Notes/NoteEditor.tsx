import { useState, useEffect, useRef, useCallback } from 'react'
import MarkdownToolbar from './MarkdownToolbar'

interface NoteEditorProps {
  note: {
    id: string
    title: string
    content: string
    updated_at: number
  } | undefined
  onBack: () => void
  onSave: (noteId: string, title: string, content: string) => void
  onDelete: () => void
}

export default function NoteEditor({ note, onBack, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const currentNoteIdRef = useRef<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 切换笔记时保存旧笔记内容
  useEffect(() => {
    const prevNoteId = currentNoteIdRef.current
    
    // 切换前保存旧笔记（如果有内容变更）
    if (prevNoteId && editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent && currentContent !== content) {
        onSave(prevNoteId, title, currentContent)
      }
    }
    
    // 清除保存超时
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    // 加载新笔记
    if (note) {
      currentNoteIdRef.current = note.id
      setTitle(note.title)
      setContent(note.content)
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || ''
      }
    } else {
      currentNoteIdRef.current = null
      setTitle('')
      setContent('')
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
      }
    }
  }, [note?.id])

  const handleInput = useCallback(() => {
    if (!editorRef.current || !currentNoteIdRef.current) return
    
    const html = editorRef.current.innerHTML
    setContent(html)
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (currentNoteIdRef.current && editorRef.current) {
        onSave(currentNoteIdRef.current, title, editorRef.current.innerHTML)
      }
      saveTimeoutRef.current = null
    }, 300)
  }, [title, onSave])

  const handleInsertHeading = useCallback((level: number) => {
    document.execCommand('formatBlock', false, `<h${level}>`)
    handleInput()
  }, [handleInput])

  const handleInsertBold = useCallback(() => {
    document.execCommand('bold', false)
    handleInput()
  }, [handleInput])

  const handleInsertItalic = useCallback(() => {
    document.execCommand('italic', false)
    handleInput()
  }, [handleInput])

  const handleInsertStrikethrough = useCallback(() => {
    document.execCommand('strikeThrough', false)
    handleInput()
  }, [handleInput])

  const handleInsertBulletList = useCallback(() => {
    document.execCommand('insertUnorderedList', false)
    handleInput()
  }, [handleInput])

  const handleInsertNumberedList = useCallback(() => {
    document.execCommand('insertOrderedList', false)
    handleInput()
  }, [handleInput])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="note-editor-panel">
      <div className="note-editor-header">
        <button onClick={onBack} className="note-editor-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <input
          type="text"
          className="note-editor-title-input"
          placeholder="输入标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="note-editor-actions">
          <button onClick={onDelete} className="note-editor-action-btn" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="note-editor-toolbar">
        <MarkdownToolbar
          onHeading={handleInsertHeading}
          onBold={handleInsertBold}
          onItalic={handleInsertItalic}
          onStrikethrough={handleInsertStrikethrough}
          onBulletList={handleInsertBulletList}
          onNumberedList={handleInsertNumberedList}
        />
      </div>

      <div className="note-editor-content">
        <div
          ref={editorRef}
          className="note-editor-contenteditable"
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder="开始编写笔记..."
        />
      </div>

      <div className="note-editor-footer">
        {note && <span>最后编辑：{formatTime(note.updated_at)}</span>}
      </div>
    </div>
  )
}