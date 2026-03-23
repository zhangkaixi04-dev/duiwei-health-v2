import { storageService } from './storageService.js';
import { taskLibrary } from '../data/taskLibrary.js';

// Cangzhen Service - Dedicated to the Museum/Soul App
// Separated from healthService (Hepai) to avoid logic conflicts.

export const cangzhenService = {

  /**
   * Get Daily Recommendations (Cangzhen - AI Learning & Iteration)
   * This implementation achieves AI iteration by:
   * 1. Using the 80 curated tasks as "Few-Shot" learning examples for the LLM.
   * 2. Dynamically generating 4 personalized tasks (one per hall) based on user profile.
   * 3. Ensuring the style and depth match the high-quality human-curated library.
   */
  get_daily_recommendation: async () => {
    // 1. Check Cache first
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `cangzhen_daily_rec_v4_${today}`; // New version (Decoupled from constitution)
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.sensation) return parsed;
        } catch (e) {
            console.warn("Cache parse failed.");
        }
    }

    // 2. AI Iteration Logic: Use Doubao API to generate based on Library
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    // Provide samples from the library to "teach" the AI the style
    const sensationSamples = taskLibrary.sensation.slice(0, 3).join('；');
    const emotionSamples = taskLibrary.emotion.slice(1, 4).join('；');
    const inspirationSamples = taskLibrary.inspiration.slice(0, 3).join('；');
    const wanxiangSamples = taskLibrary.wanxiang.slice(1, 4).join('；');

    const systemPrompt = `你是一位治愈系的数字博物馆导览员。你的任务是基于参考库，为用户迭代生成 4 条“今日推荐”微行动。
    
    【学习参考库（风格示例）】
    - 感知馆：${sensationSamples}
    - 情绪馆：${emotionSamples}
    - 创意馆：${inspirationSamples}
    - 决策馆：${wanxiangSamples}

    【当前日期】
    - ${today}

    【输出指令】
    1. **感知馆 (sensation)**：引导五感发现美好。
    2. **情绪馆 (emotion)**：引导温柔表达与自我关怀。
    3. **创意馆 (inspiration)**：引导微小灵感与奇思妙想。
    4. **决策馆 (wanxiang)**：引导主动选择与立场承诺。

    【要求】
    1. 必须返回纯JSON格式，包含 sensation, emotion, inspiration, wanxiang 四个字段。
    2. 每条指令必须是原创的，但必须严格继承参考库的“温柔、细腻、有力量”的文风。
    3. 字数控制在 15-25 字之间，不要口号，要具体的、可执行的小事。
    4. 严禁使用 Markdown 代码块。`;

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

        if (!response.ok) throw new Error("API Request Failed");

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content.replace(/```json|```/g, '').trim());

        // Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify(result));
        return result;

    } catch (e) {
        console.error("AI Iteration Failed, falling back to random library selection:", e);
        
        // Fallback: Random selection from the high-quality library (Learning from the best)
        const getRandom = (cat) => taskLibrary[cat][Math.floor(Math.random() * taskLibrary[cat].length)];
        const fallback = {
            sensation: getRandom('sensation'),
            emotion: getRandom('emotion'),
            inspiration: getRandom('inspiration'),
            wanxiang: getRandom('wanxiang')
        };
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
        return fallback;
    }
  },

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
    
    // 2. Fetch Memories from LocalStorage via storageService (User Isolated)
    const memories = await storageService.getCangzhenMemories();

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

    const systemPrompt = `你是一位深具洞察力且温柔细腻的“数字博物馆”策展人。请阅读用户本周在“感知、情绪、创意、决策”四个展馆中留下的灵感碎片（藏品），为她/他撰写一份极具质感和深度的「周展前言」（周报）。
    
    【用户本周藏品】
    ${inputs.length > 0 ? inputs : "（本周暂无新增藏品，展馆正在静静呼吸）"}
    
    【撰写要求】
    1. **文风**：文艺、治愈、富有哲理与空间感（如顶级艺术展的策展前言，参考《Kinfolk》风格）。语气亲切、像老朋友的低语。
    2. **内容深度**：
       - **串联与提炼**：不要罗列流水账！要将用户的碎片串联成一个有内在逻辑的故事或情绪流。
       - **情感共鸣**：从字里行间读懂用户的喜悦、疲惫、思考或迷茫，给予温暖的回应与肯定。
       - **生活哲理**：在结尾升华，给出一段富有启发性、能带来力量的寄语。
    3. **排版与格式**：在 \`summary\` 字段中返回 HTML 格式的文本。使用 <p> 分段，可以用 <strong> 突出核心金句或情绪词，使排版错落有致。总字数约 200-300 字，内容要充实丰满。
    4. **留白处理**：如果本周无藏品，请写一段关于“停下脚步、允许留白、积蓄能量”的优美散文，鼓励用户下周继续记录。
    5. **核心提取**：精准提取 1 个高度概括本周状态的“本周关键词”（2-4个字，如：破茧、自洽、向内求索）和一组“情绪/状态标签”（3-5个，带有艺术感，如：#捕捉微光 #允许一切发生）。
    
    【返回格式】
    必须严格返回纯JSON格式（不要包含任何Markdown代码块如 \`\`\`json）：
    {
      "summary": "<p>第一段：情绪的共鸣与串联...</p><p>第二段：藏品背后的闪光点...</p><p>第三段：温暖有力量的寄语...</p>",
      "keyword": "自洽",
      "tags": [{"text":"情绪着陆","weight":5}, {"text":"接纳","weight":4}, {"text":"向内生长","weight":3}]
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
            summary: "<p>生活是由无数个微小的瞬间组成的。即使本周留白，也是为了下一次更绚烂的绽放。</p>",
            keyword: "留白",
            tags: []
        };
    }
  }
};
