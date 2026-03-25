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

    const systemPrompt = `你是一位冷静、敏锐且极具审美能力的“数字博物馆”资深策展人。
    请阅读用户本周在“感知、情绪、创意、决策”四个展馆中留下的记录，为她/他撰写一份【年度回顾质感】的周展前言。
    
    【用户本周记录】
    ${inputs.length > 0 ? inputs : "（本周暂无新增记录，生活在静默中寻找平衡）"}
    
    【撰写要求】
    1. **表达主体**：你是观察者，用户是主角。请用“你记录了xxx”、“你本周的表现是xxx”这类视角。
    2. **拒绝死板**：禁止像流水账一样按顺序罗列“感知馆、情绪馆...”。要把这些记录打碎重组，发现它们内在的关联和冲突。
    3. **文风逻辑**：
       - **拒绝鸡汤与煽情**：不要空洞的鼓励。要客观、克制，通过对细节的精准捕捉来产生力量。
       - **高洞察力**：从琐碎中读出用户的潜意识或生活状态。
       - **对比与联想**：比如将“周一的忙碌”与“周日的留白”做对比，将“微小的动作”联想到“宏大的生活哲学”。
    4. **排版要求**：在 \`summary\` 字段中返回 HTML。使用 <p> 分段，用 <strong> 突出那些精准的洞察点。
    5. **字数**：300 字左右。
    6. **核心提取**：提取 1 个精准的“本周关键词”和一组有质感的“氛围标签”。
    
    【返回格式】
    必须严格返回纯JSON格式：
    {
      "summary": "...",
      "keyword": "...",
      "tags": [{"text":"...", "weight":5}, ...]
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
            summary: `<p>✨ <strong>生活是由无数个微小的瞬间组成的。</strong></p>
<p>即使本周留白，也是为了下一次更绚烂的绽放。在这段静默的时光里，你的博物馆正在悄悄积蓄能量。有时候，停下脚步去观察一朵花的开落，或者仅仅是允许自己发呆十分钟，都是一种了不起的“藏品”。</p>
<p><strong>不要因为没有记录而感到焦虑。</strong> 每一个当下，无论你是否落笔，它都已经深刻地刻画在你的生命里。愿你在下周，能重新找回那份捕捉微光的好奇心，继续在这里，与更真实的自己相遇。✨</p>`,
            keyword: "蓄能",
            tags: [{text: "允许留白", weight: 5}, {text: "静默生长", weight: 3}]
        };
    }
  },

  /**
   * Generate Monthly Review for Cangzhen (Museum)
   * 
   * @param {string} userId 
   * @param {number} month Offset (0 for current, -1 for last month)
   */
  report_monthly: async (userId, monthOffset = 0) => {
    // 1. Calculate Date Range
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // 2. Fetch Memories
    const memories = await storageService.getCangzhenMemories();
    const monthMemories = memories.filter(m => {
        if (!m) return false;
        let mDate = m.id ? new Date(m.id) : (m.date ? new Date(m.date) : null);
        if (!mDate || isNaN(mDate.getTime())) return false;
        return mDate >= startOfMonth && mDate <= endOfMonth;
    });

    const inputs = monthMemories.map(m => {
        const hallMap = { sensation: '感知', emotion: '情绪', inspiration: '创意', wanxiang: '决策' };
        return `[${hallMap[m.hall] || '记录'}] ${m.content || '(图片记录)'}`;
    }).join('\n');

    // 3. Call Doubao AI
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const systemPrompt = `你是一位冷静、敏锐且极具审美能力的“数字博物馆”资深策展人。
    请阅读用户【本月】在“感知、情绪、创意、决策”四个展馆中留下的灵感碎片，为她/他撰写一份【年度回顾质感】的月度深度复盘。
    
    【用户本月记录】
    ${inputs.length > 0 ? inputs : "（本月暂无新增记录，生活在静默中蓄力）"}
    
    【撰写要求】
    1. **表达主体**：你是观察者，用户是主角。请用“你记录了xxx”、“你本月呈现的状态是xxx”这类视角。
    2. **拒绝死板**：禁止像流水账一样按顺序罗列。要把一整个月的记录打碎重组，发现它们内在的关联、冲突与成长曲线。
    3. **文风逻辑**：
       - **拒绝鸡汤与煽情**：不要空洞的夸奖。要客观、克制，通过对细节的精准捕捉来产生力量。
       - **高洞察力**：从月度的琐碎中读出用户的潜意识、生活惯性或思维突破。
       - **对比与联想**：将月初与月末的状态做对比，将用户的某个小习惯联想到更宏大的生命课题。
    4. **排版要求**：在 \`summary\` 字段中返回 HTML。使用 <p> 分段，用 <strong> 突出那些精准的洞察点。
    5. **字数与深度（极其重要）**：字数必须在 300 - 400 字之间！绝对不能只有一两句话。必须要有起承转合，有层次感地进行深度剖析。
    6. **核心提取**：提取 1 个精准的“月度关键词”和一组有质感的“氛围标签”。
    
    【返回格式】
    必须严格返回纯JSON格式：
    {
      "summary": "...",
      "keyword": "...",
      "tags": [{"text":"...", "weight":5}, ...]
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
        console.error("Cangzhen Monthly Report Error:", e);
        return {
            success: false,
            summary: `<p>📅 <strong>每一个月，都是一场缓慢的权力移交：从外界的影响，交还给内心的感受。</strong></p>
<p>纵观你本月的记录，或许并不密集，但却呈现出一种清晰的<strong>「沉淀」</strong>状态。那些没有被记录下来的日子，并非空白，而是你在复杂生活之后，为大脑进行的系统性重置。你开始理解，最深刻的成长往往产生于极度的宁静之中。</p>
<p>在快节奏的当下，允许自己放慢脚步，本身就是一种极具张力的决策。这一个月，你正在通过这些零星的碎片，或者大段的留白，完成一次对自我的深度扫描。<strong>不要停下这种感知，它是你与时光握手言和的最佳证明。</strong> 🌙</p>`,
            keyword: "沉淀",
            tags: [
              { text: "深度扫描", weight: 5 },
              { text: "系统重置", weight: 4 },
              { text: "内生力量", weight: 3 }
            ]
        };
    }
  }
};
