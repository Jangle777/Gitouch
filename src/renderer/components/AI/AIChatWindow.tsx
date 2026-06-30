import { useState, useEffect, useRef } from 'react'
import { electronAPI } from '../../utils/electron-api'

interface AIChatWindowProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const [conversations, setConversations] = useState<Array<{
    id: string
    title: string
    updated_at: number
  }>>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: number
  }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadConversations = async () => {
      const data = await electronAPI.ai.conversations.list()
      setConversations(data)
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id)
      }
    }
    loadConversations()
  }, [])

  useEffect(() => {
    const loadMessages = async () => {
      if (activeConvId) {
        const data = await electronAPI.ai.messages.list(activeConvId)
        setMessages(data)
      }
    }
    loadMessages()
  }, [activeConvId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewConversation = async () => {
    const newConv = {
      id: `conv_${Date.now()}`,
      title: '新对话',
      source_type: 'clipboard',
      source_range: '',
      created_at: Date.now(),
      updated_at: Date.now()
    }
    await electronAPI.ai.conversations.save(newConv)
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(newConv.id)
    setMessages([])
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !activeConvId) return

    setIsLoading(true)
    const userMsg = {
      id: `msg_${Date.now()}`,
      conversation_id: activeConvId,
      role: 'user' as const,
      content: inputValue,
      created_at: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    await electronAPI.ai.messages.save(userMsg)
    setInputValue('')

    const result = await electronAPI.ai.chat({
      conversation_id: activeConvId,
      message: inputValue,
      knowledge_base: '',
      source_type: 'clipboard'
    })

    if (result.success && result.content) {
      const aiMsg = {
        id: `msg_${Date.now()}`,
        conversation_id: activeConvId,
        role: 'assistant' as const,
        content: result.content,
        created_at: Date.now()
      }
      setMessages(prev => [...prev, aiMsg])
      await electronAPI.ai.messages.save(aiMsg)
    }

    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay show">
      <div className="chat-window">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>AI 对话</h3>
            <button className="chat-new-btn" onClick={handleNewConversation}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          <div className="chat-conv-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`chat-conv-item ${activeConvId === conv.id ? 'chat-conv-item--active' : ''}`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <span>{conv.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-main-header">
            <button className="chat-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span>{conversations.find(c => c.id === activeConvId)?.title || '新对话'}</span>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>选择或新建一个对话开始</span>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`msg ${msg.role}`}>
                  <div className="msg-label">{msg.role === 'user' ? '你' : 'AI'}</div>
                  <div className="msg-bubble">{msg.content.replace(/\n/g, '<br>')}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="msg assistant">
                <div className="msg-label">AI</div>
                <div className="msg-bubble">正在思考...</div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="输入消息..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
