import { storageService } from './storageService.js';

// Cangzhen Service - Dedicated to the Museum/Soul App
// Separated from healthService (Hepai) to avoid logic conflicts.

export const cangzhenService = {

  /**
   * Generate Weekly Review for Cangzhen (Museum)
   * Analyzes 'cangzhen_memories' (Sensation, Emotion, Inspiration, Wanxiang)
   * NOT Diet/Health data.
   * 
   * @param {string} userId 
   * @param {number} weekOffset 0 for current week, -1 for last week
   */
  report_weekly: async (userId, weekOffset = 0) => {
    // 1. Calculate Date Range
    const now = new Date();
    const currentDay = now.getDay(); 
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff + (weekOffset * 7));
    startOfWeek.setHours(0,0,0,0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    
    // 2. Fetch Memories from LocalStorage (Directly or via storageService if adaptable)
    // We access localStorage 'cangzhen_memories' directly to be safe and specific
    const stored = localStorage.getItem('cangzhen_memories');
    let memories = [];
    if (stored) {
        try {
            memories = JSON.parse(stored);
        } catch (e) {
            memories = [];
        }
    }

    // Filter by Date
    const weekMemories = memories.filter(m => {
        if (!m) return false;
        // Parse date (support timestamp number or string)
        let mDate = null;
        if (typeof m.id === 'number') mDate = new Date(m.id);
        else if (m.date) mDate = new Date(m.date); // Rough parsing
        
        if (!mDate || isNaN(mDate.getTime())) return false;
        return mDate >= startOfWeek && mDate <= endOfWeek;
    });

    const count = weekMemories.length;
    
    // 3. Prepare Content for AI
    // We only send specific fields to save tokens and focus context
    const inputs = weekMemories.map(m => {
        const hallMap = { sensation: '感知', emotion: '情绪', inspiration: '创意', wanxiang: '决策' };
        return `[${hallMap[m.hall] || '记录'}] ${m.content || '(图片记录)'}`;
    }).join('\n');

    // 4. Call LLM (Doubao)
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const systemPrompt = `你是一位温柔、细腻的“数字博物馆”策展人。请阅读用户本周的灵感碎片（藏品），为她/他写一段简短的周展前言（周报）。
    
    【用户本周藏品】
    ${inputs.length > 0 ? inputs : "（本周暂无新增藏品）"}
    
    【撰写要求】
    1. 风格：文艺、治愈、富有哲理（参考《Kinfolk》或艺术展风格）。
    2. 内容：不要罗列流水账。要从碎片中提炼出一种“生活状态”或“情绪色调”。
    3. 如果没有藏品，请写一段关于“留白”或“期待”的优美文字。
    4. 字数：100字左右。
    5. **关键**：请同时提取一个“年度关键词”（2个字，如：破茧、微光、沉淀）和一组“标签”（3-5个，如：#捕捉生活 #情绪着陆）。
    
    【返回格式】
    请严格返回纯JSON格式，不要Markdown代码块：
    {
      "summary": "HTML格式的文本...",
      "keyword": "关键词",
      "tags": [{"text":"标签1","weight":5}, {"text":"标签2","weight":3}]
    }`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: ENDPOINT_ID,
                messages: [{ role: "system", content: systemPrompt }],
                stream: false
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        let result = {};
        try {
             result = JSON.parse(content.replace(/```json|```/g, '').trim());
        } catch (e) {
             result = { summary: content, keyword: "生活", tags: [] };
        }

        return {
            success: true,
            summary: result.summary,
            keyword: result.keyword,
            tags: Array.isArray(result.tags) ? result.tags : []
        };

    } catch (e) {
        console.error("Cangzhen Report Error:", e);
        return {
            success: false,
            summary: "生活是由无数个微小的瞬间组成的。即使本周留白，也是为了下一次更绚烂的绽放。",
            keyword: "留白",
            tags: []
        };
    }
  }
};
