import { useEffect, useState } from 'react'
import './index.css'
import TitleBar from './components/TitleBar'
import SmallTabs from './components/SmallTabs'
import AppHeader from './components/AppHeader'
import ClipboardPanel from './components/Clipboard/ClipboardPanel'
import NotesPanel from './components/Notes/NotesPanel'
import SettingsPanel from './components/Settings/SettingsPanel'
import SummaryModal from './components/AI/SummaryModal'
import AIChatWindow from './components/AI/AIChatWindow'
import ConfirmDialog from './components/common/ConfirmDialog'
import { electronAPI } from './utils/electron-api'

function App() {
  const [activeTab, setActiveTab] = useState<'clipboard' | 'notes'>('clipboard')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [windowMode, setWindowMode] = useState<'large' | 'small'>('large')
  const [confirmConfig, setConfirmConfig] = useState<{ show: boolean; title: string; message: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    message: ''
  })

  useEffect(() => {
    const fetchMode = async () => {
      const mode = await electronAPI.window.getMode()
      setWindowMode(mode)
    }
    fetchMode()

    electronAPI.clipboard.onNewItem(() => {
    })
  }, [])

  const handleToggleMode = async () => {
    const mode = await electronAPI.window.toggleMode()
    setWindowMode(mode)
  }

  const openConfirm = (title: string, message: string, onConfirm?: () => void) => {
    setConfirmConfig({ show: true, title, message, onConfirm })
  }

  const closeConfirm = () => {
    setConfirmConfig({ show: false, title: '', message: '' })
  }

  const handleConfirm = () => {
    confirmConfig.onConfirm?.()
    closeConfirm()
  }

  return (
    <div className={`app-container ${windowMode}`}>
      <TitleBar onToggleMode={handleToggleMode} />
      <SmallTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
      />

      <div className="app-content">
        {activeTab === 'clipboard' && <ClipboardPanel openConfirm={openConfirm} />}
        {activeTab === 'notes' && <NotesPanel openConfirm={openConfirm} />}
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onOpenChat={() => {
          setIsSummaryOpen(false)
          setIsChatOpen(true)
        }}
      />

      <AIChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmConfig.show}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}

export default App
