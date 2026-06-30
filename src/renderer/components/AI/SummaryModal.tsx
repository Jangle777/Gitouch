import { useState } from 'react'
import { electronAPI } from '../../utils/electron-api'

interface SummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenChat: () => void
}

export default function SummaryModal({ isOpen, onClose, onOpenChat }: SummaryModalProps) {
  const [selectedTime, setSelectedTime] = useState('today')
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false)

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSummarize = async () => {
    const result = await electronAPI.ai.summarize({
      knowledge_base: '剪贴板内容摘要',
      source_type: 'clipboard'
    })
    if (result.success) {
      console.log('AI Summary:', result.content)
    } else {
      alert(result.error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay show">
      <div className="summary-modal">
        <div className="summary-modal-header">
          <button className="summary-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2 className="summary-modal-title">总结分析</h2>
          <button className="summary-modal-config" onClick={() => setIsAIConfigOpen(!isAIConfigOpen)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

        {isAIConfigOpen && (
          <div className="ai-config-form">
            <div className="ai-config-item">
              <label>API URL</label>
              <input type="text" placeholder="https://api.openai.com/v1/chat/completions"/>
            </div>
            <div className="ai-config-item">
              <label>API Key</label>
              <input type="password" placeholder="sk-..."/>
            </div>
            <div className="ai-config-item">
              <label>模型名称</label>
              <input type="text" placeholder="gpt-3.5-turbo"/>
            </div>
            <button className="ai-config-save" onClick={() => setIsAIConfigOpen(false)}>保存</button>
          </div>
        )}

        <div className="summary-modal-body">
          <div className="summary-time-select">
            <button className={`time-opt ${selectedTime === 'today' ? 'time-opt--active' : ''}`} onClick={() => handleTimeSelect('today')}>今天</button>
            <button className={`time-opt ${selectedTime === 'week' ? 'time-opt--active' : ''}`} onClick={() => handleTimeSelect('week')}>本周</button>
            <button className={`time-opt ${selectedTime === 'month' ? 'time-opt--active' : ''}`} onClick={() => handleTimeSelect('month')}>本月</button>
          </div>

          <div className="summary-stats">
            <div className="summary-stat-item">
              <span className="summary-stat-value">128</span>
              <span className="summary-stat-label">剪贴板记录</span>
            </div>
            <div className="summary-stat-item">
              <span className="summary-stat-value">96</span>
              <span className="summary-stat-label">文本</span>
            </div>
            <div className="summary-stat-item">
              <span className="summary-stat-value">32</span>
              <span className="summary-stat-label">图片</span>
            </div>
          </div>

          <div className="summary-ai-preview">
            <div className="summary-ai-avatar">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="summary-ai-content">
              <div className="summary-ai-label">AI 分析结果</div>
              <div className="summary-ai-text">
                根据您今天的剪贴板记录，您似乎正在进行前端开发工作，涉及 React、TypeScript 和 Electron 技术栈。继续加油！
              </div>
            </div>
          </div>
        </div>

        <div className="summary-modal-footer">
          <button className="summary-modal-btn summary-modal-btn--secondary" onClick={onOpenChat}>开始对话</button>
          <button className="summary-modal-btn summary-modal-btn--primary" onClick={handleSummarize}>重新分析</button>
        </div>
      </div>
    </div>
  )
}
