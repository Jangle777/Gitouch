import { getSettings } from './database'

export async function handleAIChat(args: {
  conversation_id: string | null
  message: string
  knowledge_base: string
  source_type: 'clipboard' | 'notes'
}): Promise<{ success: boolean; content?: string; error?: string }> {
  const settings = getSettings()
  
  if (!settings.ai_api_key) {
    return { success: false, error: '请先配置 AI API Key' }
  }
  
  try {
    const systemPrompt = `基于以下知识库内容回答用户问题：\n\n${args.knowledge_base}\n\n请用简洁明了的语言回答，不要编造信息。`
    
    const response = await fetch(settings.ai_api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.ai_api_key}`
      },
      body: JSON.stringify({
        model: settings.ai_model_name || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: args.message }
        ]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return { success: false, error: errorData?.error?.message || 'API 请求失败' }
    }
    
    const data = await response.json()
    return { success: true, content: data.choices[0]?.message?.content || '' }
  } catch (error) {
    return { success: false, error: '网络请求失败' }
  }
}

export async function handleAISummarize(args: {
  knowledge_base: string
  source_type: 'clipboard' | 'notes'
}): Promise<{ success: boolean; content?: string; error?: string }> {
  const settings = getSettings()
  
  if (!settings.ai_api_key) {
    return { success: false, error: '请先配置 AI API Key' }
  }
  
  try {
    const systemPrompt = args.source_type === 'clipboard'
      ? '分析以下剪贴板复制记录，推测用户的工作活动，给出一句话总结和鼓励话语。'
      : '分析以下笔记内容，推测用户的工作学习方向，给出一句话总结和鼓励话语。'
    
    const response = await fetch(settings.ai_api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.ai_api_key}`
      },
      body: JSON.stringify({
        model: settings.ai_model_name || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: args.knowledge_base }
        ]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return { success: false, error: errorData?.error?.message || 'API 请求失败' }
    }
    
    const data = await response.json()
    return { success: true, content: data.choices[0]?.message?.content || '' }
  } catch (error) {
    return { success: false, error: '网络请求失败' }
  }
}
