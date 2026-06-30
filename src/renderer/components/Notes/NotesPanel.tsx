import { useState, useEffect } from 'react'
import NoteFolderTree from './NoteFolderTree'
import NoteList from './NoteList'
import NoteEditor from './NoteEditor'
import { electronAPI } from '../../utils/electron-api'

interface NotesPanelProps {
  openConfirm: (title: string, message: string, onConfirm?: () => void) => void
}

export default function NotesPanel({ openConfirm }: NotesPanelProps) {
  const [folders, setFolders] = useState<Array<{
    id: string
    name: string
    parent_id: string | null
  }>>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Array<{
    id: string
    title: string
    content: string
    folder_id: string | null
    created_at: number
    updated_at: number
    is_pinned: number
  }>>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSmallView, setIsSmallView] = useState(false)
  const [smallViewMode, setSmallViewMode] = useState<'list' | 'editor'>('list')

  useEffect(() => {
    const checkWindowMode = async () => {
      const mode = await electronAPI.window.getMode()
      setIsSmallView(mode === 'small')
    }
    checkWindowMode()
  }, [])

  const loadFolders = async () => {
    const data = await electronAPI.folders.list()
    setFolders(data)
  }

  const loadNotes = async () => {
    const data = await electronAPI.notes.list({ folder_id: selectedFolderId, search: searchTerm || undefined })
    setNotes(data)
  }

  useEffect(() => {
    loadFolders()
    loadNotes()
  }, [selectedFolderId, searchTerm])

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id)
    if (isSmallView) {
      setSmallViewMode('editor')
    }
  }

  const handleCreateNote = async () => {
    const newNote = {
      id: `note_${Date.now()}`,
      title: '',
      content: '',
      folder_id: selectedFolderId,
      created_at: Date.now(),
      updated_at: Date.now(),
      is_pinned: 0,
      is_deleted: 0
    }
    await electronAPI.notes.save(newNote)
    await loadNotes()
    setSelectedNoteId(newNote.id)
    if (isSmallView) {
      setSmallViewMode('editor')
    }
  }

  const handleDeleteNote = (id: string) => {
    openConfirm('删除笔记', '确定删除此笔记吗？', async () => {
      await electronAPI.notes.delete(id)
      await loadNotes()
      if (selectedNoteId === id) {
        setSelectedNoteId(null)
      }
    })
  }

  const handleTogglePinNote = async (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      await electronAPI.notes.save({
        ...note,
        is_pinned: note.is_pinned === 1 ? 0 : 1,
        updated_at: Date.now()
      })
      await loadNotes()
    }
  }

  const handleSaveNote = async (id: string, title: string, content: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      await electronAPI.notes.save({
        ...note,
        title,
        content,
        updated_at: Date.now()
      })
      await loadNotes()
    }
  }

  const handleCreateFolder = async () => {
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: '新建文件夹',
      parent_id: null,
      created_at: Date.now(),
      sort_order: folders.length
    }
    await electronAPI.folders.save(newFolder)
    await loadFolders()
    setSelectedFolderId(newFolder.id)
  }

  const handleUpdateFolder = async (id: string, name: string) => {
    const folder = folders.find(f => f.id === id)
    if (folder) {
      await electronAPI.folders.save({
        ...folder,
        name,
        updated_at: Date.now()
      })
      await loadFolders()
    }
  }

  const handleDeleteFolder = async (id: string) => {
    openConfirm('删除文件夹', '确定删除此文件夹吗？文件夹中的笔记将移到根目录。', async () => {
      await electronAPI.folders.delete(id)
      await loadFolders()
      await loadNotes()
      if (selectedFolderId === id) {
        setSelectedFolderId(null)
      }
    })
  }

  const handleBackToList = () => {
    setSmallViewMode('list')
  }

  if (isSmallView) {
    return (
      <div className="panel">
        {smallViewMode === 'list' ? (
          <NoteList
            notes={notes}
            selectedId={selectedNoteId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelect={handleSelectNote}
            onCreate={handleCreateNote}
            onDelete={handleDeleteNote}
            onTogglePin={handleTogglePinNote}
            onBack={() => {}}
          />
        ) : (
          <NoteEditor
            note={notes.find(n => n.id === selectedNoteId)}
            onBack={handleBackToList}
            onSave={(noteId, title, content) => handleSaveNote(noteId, title, content)}
            onDelete={() => selectedNoteId && handleDeleteNote(selectedNoteId)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="notes-panel-large">
      <div className="notes-left-panel">
        <NoteFolderTree
          folders={folders}
          selectedId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onCreate={handleCreateFolder}
          onUpdate={handleUpdateFolder}
          onDelete={handleDeleteFolder}
        />
      </div>
      <div className="notes-middle-panel">
        <NoteList
          notes={notes}
          selectedId={selectedNoteId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelect={handleSelectNote}
          onCreate={handleCreateNote}
          onDelete={handleDeleteNote}
          onTogglePin={handleTogglePinNote}
          onBack={() => {}}
        />
      </div>
      <div className="notes-right-panel">
        {selectedNoteId ? (
          <NoteEditor
            note={notes.find(n => n.id === selectedNoteId)}
            onBack={() => {}}
            onSave={(noteId, title, content) => handleSaveNote(noteId, title, content)}
            onDelete={() => selectedNoteId && handleDeleteNote(selectedNoteId)}
          />
        ) : (
          <div className="panel-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d1d1" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <p className="placeholder-text">暂无笔记</p>
            <p className="placeholder-hint">点击上方 + 按钮新建笔记</p>
          </div>
        )}
      </div>
    </div>
  )
}
