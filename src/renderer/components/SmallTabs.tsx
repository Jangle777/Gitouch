interface SmallTabsProps {
  activeTab: 'clipboard' | 'notes'
  onTabChange: (tab: 'clipboard' | 'notes') => void
}

export default function SmallTabs({ activeTab, onTabChange }: SmallTabsProps) {
  return (
    <div className="small-tabs">
      <button
        className={`tab ${activeTab === 'clipboard' ? 'tab--active' : ''}`}
        onClick={() => onTabChange('clipboard')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="8" y="2" width="12" height="20" rx="2"/>
          <path d="M16 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/>
        </svg>
        <span style={{ marginLeft: '6px' }}>剪贴板</span>
      </button>
      <button
        className={`tab ${activeTab === 'notes' ? 'tab--active' : ''}`}
        onClick={() => onTabChange('notes')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span style={{ marginLeft: '6px' }}>笔记</span>
      </button>
    </div>
  )
}
