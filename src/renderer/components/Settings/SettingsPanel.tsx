import { useState, useEffect } from 'react'
import { electronAPI } from '../../utils/electron-api'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<{
    clipboard_retention_days: number
    auto_launch: boolean
    close_to_tray: boolean
    ai_api_url: string
    ai_api_key: string
    ai_model_name: string
  }>({
    clipboard_retention_days: 3,
    auto_launch: true,
    close_to_tray: true,
    ai_api_url: '',
    ai_api_key: '',
    ai_model_name: 'gpt-3.5-turbo'
  })

  useEffect(() => {
    const loadSettings = async () => {
      const data = await electronAPI.settings.get()
      setSettings(data)
    }
    loadSettings()
  }, [])

  const handleChange = async (key: string, value: string | boolean | number) => {
    const stringValue = typeof value === 'boolean' ? value.toString() : String(value)
    await electronAPI.settings.set({ key, value: stringValue })
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay show">
      <div className="settings-panel">
        <div className="settings-header">
          <button className="settings-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2 className="settings-title">设置</h2>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3 className="settings-section-title">剪贴板</h3>
            <div className="settings-item">
              <label className="settings-label">保留天数</label>
              <select
                className="settings-select"
                value={settings.clipboard_retention_days}
                onChange={(e) => handleChange('clipboard_retention_days', parseInt(e.target.value))}
              >
                <option value="1">1天</option>
                <option value="3">3天</option>
                <option value="7">7天</option>
                <option value="14">14天</option>
                <option value="30">30天</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">系统</h3>
            <div className="settings-item">
              <label className="settings-label">开机自启动</label>
              <button
                className={`toggle ${settings.auto_launch ? 'toggle--on' : ''}`}
                onClick={() => handleChange('auto_launch', !settings.auto_launch)}
              >
                <span className="toggle-knob"/>
              </button>
            </div>
            <div className="settings-item">
              <label className="settings-label">关闭到托盘</label>
              <button
                className={`toggle ${settings.close_to_tray ? 'toggle--on' : ''}`}
                onClick={() => handleChange('close_to_tray', !settings.close_to_tray)}
              >
                <span className="toggle-knob"/>
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">AI 配置</h3>
            <div className="settings-item">
              <label className="settings-label">API URL</label>
              <input
                type="text"
                className="settings-input"
                value={settings.ai_api_url}
                onChange={(e) => handleChange('ai_api_url', e.target.value)}
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </div>
            <div className="settings-item">
              <label className="settings-label">API Key</label>
              <input
                type="password"
                className="settings-input"
                value={settings.ai_api_key}
                onChange={(e) => handleChange('ai_api_key', e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="settings-item">
              <label className="settings-label">模型名称</label>
              <input
                type="text"
                className="settings-input"
                value={settings.ai_model_name}
                onChange={(e) => handleChange('ai_model_name', e.target.value)}
                placeholder="gpt-3.5-turbo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
