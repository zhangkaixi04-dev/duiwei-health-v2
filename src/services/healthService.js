import { storageService } from './storageService.js';
import { dietFallback } from '../data/dietFallback.js';
import { taskLibrary } from '../data/taskLibrary.js'; // Import the new task library
import { findFood } from '../data/foodLibrary.js'; // Import local food library

// Mock Health Data Service
// Simulating backend APIs for vertical health capabilities

export const healthService = {
  
  /**
   * 8. AI 舌诊分析
   * @param {string} imageData Base64 string of the image
   * @param {string} provider 'mock' | 'baidu' | 'gemini' | 'zhipu'
   */
  analyze_tongue: async (imageData, provider = 'mock') => {
    try {
        if (provider === 'baidu') {
            return await healthService._baiduAnalyzeTongue(imageData);
        } else if (provider === 'gemini') {
            return await healthService._geminiAnalyzeTongue(imageData);
        } else if (provider === 'zhipu') {
            return await healthService._zhipuAnalyzeTongue(imageData);
        } else {
            return await healthService._mockAnalyzeTongue(imageData);
        }
    } catch (e) {
        console.error("Tongue Analysis Failed:", e);
        return { success: false, error: e.message };
    }
  },

  /**
   * 9. AI 聊天 (通用对话)
   * @param {Array} messages History of messages
   * @param {Object} userProfile Contextual user data (constitution, basic info, etc.)
   */
  chat: async (messages, userProfile = {}) => {
     // Use Doubao (Volcengine Ark) for general chat
     // NOTE: Replace with a stable/production endpoint ID when available.
     const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
     const ENDPOINT_ID = 'ep-20250218143825-9k28d'; // Updated to a more stable endpoint
     const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

     // Construct System Prompt with User Context
     let systemPrompt = "你是一位专业、严谨的中医健康顾问“合拍”。你的语言风格客观、理性、专业，避免使用任何过于亲昵的称呼（如“亲爱的”、“宝宝”、“亲”等）。";
     
     // Inject User Profile if available
     if (userProfile && Object.keys(userProfile).length > 0) {
         systemPrompt += `\n\n【当前用户档案】：\n`;
         if (userProfile.gender && userProfile.age) systemPrompt += `- 基础信息：${userProfile.gender === 'female' ? '女' : '男'}, ${userProfile.age}岁\n`;
         if (userProfile.constitution) systemPrompt += `- 中医体质：${userProfile.constitution.type} (${userProfile.constitution.desc})\n`;
         if (userProfile.sleepTime) systemPrompt += `- 平时作息：${userProfile.sleepTime} 入睡\n`;
         if (userProfile.activity) systemPrompt += `- 活动强度：${userProfile.activity}\n`;
         
         systemPrompt += `\n请结合用户的【体质特征】和【生活习惯】进行针对性分析。例如：如果用户是阳虚质且熬夜，应重点提醒补阳和早睡；如果入睡晚，需分析是否因脾胃不和或肝火旺导致。`;
     }

     systemPrompt += "\n\n【重要指令】：\n1. 严禁输出任何形式的思考过程、推理步骤或Chain of Thought。\n2. 严禁使用 <think> 等标签。\n3. 直接输出最终回复给用户，就像正常聊天一样。\n4. 回复必须简短精炼，不要长篇大论。\n5. 不要使用Markdown代码块，直接返回纯文本。\n6. 如果用户涉及严重医疗问题，请建议就医。";

     // Convert app messages to API format
     const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
        })).slice(-10) // Keep last 10 turns context
     ];

     try {
        // Create a timeout promise
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timed out after 15 seconds")), 15000)
        );

        const apiRequest = fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: ENDPOINT_ID,
                messages: apiMessages,
                stream: false // Explicitly disable streaming
            })
        });

        // Race between fetch and timeout
        const response = await Promise.race([apiRequest, timeout]);

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Doubao API Error Response:", errorData);
            throw new Error(`API Error ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        
        // Debugging logs
        console.log("Doubao API Response:", data);

        if (data.error) {
            console.error("Doubao API Error Details:", data.error);
            throw new Error(data.error.message);
        }
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error("Empty choices returned from API");
        }
        
        return data.choices[0].message.content;
     } catch (e) {
        console.error("Doubao Chat API Error:", e);
        // Fallback to local rule-based response
        const fallbackResponses = [
            "抱歉，我刚刚走神了。您能再说一遍吗？",
            "网络似乎有点波动，但我在这里。请继续。",
            "这个问题很有趣，但我需要更多时间思考。我们可以换个话题吗？",
            "我正在努力连接大脑，请稍等片刻后再试。"
        ];
        // Simple keyword matching for better fallback
        const lastUserMsg = messages.filter(m => m.sender === 'user').pop()?.text || "";
        
        // Context-aware fallbacks
        if (lastUserMsg.match(/(吃|喝|早饭|午饭|晚饭|饮食|餐|咋样|怎么样)/)) {
            // Try to get today's logs to give a meaningful summary
            try {
                const today = new Date().toISOString().split('T')[0];
                const dailyLogs = storageService.getDailyLogs(today);
                const dietLogs = dailyLogs.diet || [];
                
                if (dietLogs.length > 0) {
                     // Deduplicate logic: "Apple, Apple" -> "Apple x2"
                     const foodCounts = {};
                     dietLogs.forEach(item => {
                         const name = (item.name || item).trim();
                         // Ignore empty names
                         if (!name) return;
                         // Normalize key to avoid subtle diffs? For now exact match.
                         foodCounts[name] = (foodCounts[name] || 0) + 1;
                     });
                     
                     const foodList = Object.entries(foodCounts)
                        .map(([name, count]) => count > 1 ? `${name} x${count}` : name)
                        .join('、');

                     const totalCal = (dailyLogs.nutrition?.calories) || 0;
                     
                     let feedback = `您今天记录了：${foodList}。`;
                     if (totalCal > 0) feedback += `\n估算总热量约 ${totalCal} 千卡。`;
                     
                     // Add warning for absurdly high calories (likely duplication error)
                     if (totalCal > 4000) {
                         feedback += "\n⚠️ 热量数据偏高，可能是因为重复记录了相同的食物。";
                     } else if (totalCal > 2000) {
                         feedback += "\n热量摄入略高，建议晚餐清淡一点哦。";
                     } else if (totalCal < 1200 && totalCal > 0) {
                         feedback += "\n热量摄入偏低，注意不要过度节食。";
                     } else {
                         feedback += "\n整体饮食结构还不错，继续保持！";
                     }
                     
                     return feedback;
                } else {
                     return "您今天还没有记录饮食哦。快告诉我您吃了什么吧？";
                }
            } catch (err) {
                return "收到您的饮食记录。由于网络原因，AI 暂时无法进行详细营养分析，建议您稍后再试，或者直接使用“记饮食”卡片。";
            }
        }
        if (lastUserMsg.match(/(睡|醒|觉|梦)/)) {
            return "收到您的睡眠反馈。由于网络原因，建议您稍后再试，或者使用“记睡眠”功能来记录具体时间。";
        }
        if (lastUserMsg.match(/(痛|不舒服|难受|痒|晕)/)) {
            return "抱歉，我现在无法连接到医疗知识库。如果您感觉严重不适，请务必及时就医。";
        }

        if (lastUserMsg.includes("你好") || lastUserMsg.includes("在吗")) {
            return "您好！我是您的中医健康顾问“合拍”。有什么可以帮您的吗？";
        }
        if (lastUserMsg.includes("谢谢")) {
            return "不客气，祝您健康！";
        }
        if (lastUserMsg.includes("再见")) {
            return "再见，祝您生活愉快，身体健康！";
        }
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
     }
  },

  /**
   * Internal: Zhipu AI (GLM-4V) Analysis (China Available)
   * Get Key: https://open.bigmodel.cn/
   */
  _zhipuAnalyzeTongue: async (imageData) => {
    const API_KEY = '1e52c1eb939a43cb9aba66a83ed799ef.zF7gmf1FJ3Ayxzyr'; // User provided Key
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    // Ensure base64 header is present for Zhipu if needed, or just data URL
    // Zhipu accepts: { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
    const base64Url = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;

    const payload = {
        model: "glm-4v",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "你是一位资深中医专家。请仔细观察这张舌象图片，重点关注【舌体是否胖大】、【边缘是否有齿痕】、【舌质颜色】和【舌苔厚薄/颜色】。如果是胖大舌且有齿痕，请明确指出。返回JSON格式，包含以下字段：tongueColor(舌质颜色，如淡白/红/暗红), coating(舌苔特征，如白腻/黄腻/薄白), shape(舌体形状，如胖大/瘦薄/正常，有齿痕请务必标注), type(中医体质判定,如气虚质/湿热质/平和质/阳虚质等), desc(简短的体质描述和调理建议)。不要输出Markdown代码块，直接返回纯JSON字符串。" },
                    { type: "image_url", image_url: { url: base64Url } }
                ]
            }
        ]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }

    // Parse Zhipu response text to JSON
    const text = data.choices[0].message.content;
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return {
        success: true,
        result: {
            ...result,
            confidence: 0.90 // Mock confidence
        }
    };
  },

  /**
   * Internal: Google Gemini 1.5 Flash Analysis (Free Tier)
   * Get Key: https://aistudio.google.com/app/apikey
   */
  _geminiAnalyzeTongue: async (imageData) => {
    const API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // Remove header if present (data:image/jpeg;base64,)
    const base64Data = imageData.split(',')[1] || imageData;

    const payload = {
      contents: [{
        parts: [
          { text: "请作为一位资深中医专家分析这张舌象图片。返回JSON格式，包含以下字段：tongueColor(舌质颜色), coating(舌苔特征), shape(舌体形状), type(中医体质判定,如气虚质/湿热质/平和质等), desc(简短的体质描述和调理建议)。不要输出Markdown代码块，直接返回纯JSON字符串。" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }

    // Parse Gemini response text to JSON
    const text = data.candidates[0].content.parts[0].text;
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return {
        success: true,
        result: {
            ...result,
            confidence: 0.95 // Mock confidence for LLM
        }
    };
  },

  /**
   * Internal: Mock Tongue Analysis
   */
  _mockAnalyzeTongue: async (imageData) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network
    
    // Simple heuristic: check if image data is valid (mock)
    if (!imageData) throw new Error("No image data");

    // Randomize slightly for demo effect
    const results = [
        { type: '气虚质', tongueColor: '淡白', coating: '白薄', shape: '胖大', desc: '元气不足，容易疲乏，语音低弱。' },
        { type: '湿热质', tongueColor: '红', coating: '黄腻', shape: '正常', desc: '湿热内蕴，面垢油光，口苦口干。' },
        { type: '血瘀质', tongueColor: '紫暗', coating: '薄', shape: '有瘀点', desc: '血行不畅，肤色晦暗，易有疼痛。' }
    ];
    const result = results[Math.floor(Math.random() * results.length)];

    return {
        success: true,
        result: {
            ...result,
            confidence: 0.88
        }
    };
  },

  /**
   * Internal: Baidu AI Cloud Tongue Diagnosis (Example)
   * NOTE: This requires a valid Access Token from Baidu AI Cloud.
   * You need to sign up at https://console.bce.baidu.com/ai/
   */
  _baiduAnalyzeTongue: async (imageData) => {
    // 1. Get Access Token (Server-side usually, but here client-side for demo)
    // Replace with your own API Key and Secret Key
    const AK = 'YOUR_API_KEY';
    const SK = 'YOUR_SECRET_KEY';
    
    try {
        // Step A: Get Token
        // In production, this should be done via your backend to hide keys
        const tokenResponse = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`, {
            method: 'POST'
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Step B: Call Image Recognition API (Using General Object Detection as placeholder or specific Tongue API if available)
        // Note: Baidu has "Body Analysis" or specialized medical partners. 
        // For this demo, we assume a custom endpoint or general classification.
        
        // Since we don't have a real Tongue API URL without signing a contract, 
        // we will log what would happen.
        console.log("Calling Baidu API with token:", accessToken);
        
        // Mocking the successful response for the user to see flow
        // In reality: 
        // const response = await fetch(`https://aip.baidubce.com/rest/2.0/image-classify/v2/tongue_analysis?access_token=${accessToken}`, {
        //    method: 'POST',
        //    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //    body: `image=${encodeURIComponent(imageData.split(',')[1])}` // Remove header
        // });
        
        throw new Error("请先配置真实的百度 API Key 和 Secret Key");

    } catch (error) {
        console.error("API Call Failed:", error);
        return { success: false, error: error.message };
    }
  },

  /**
   * 10. AI 饮食分析 (Real LLM + Advanced Fallback)
   * @param {string} foodInput Text description of food (e.g., "一碗红烧牛肉面")
   * @param {Object} userProfile Contextual user data
   */
  analyze_diet: async (foodInput, userProfile = {}) => {
     // Use Doubao (Volcengine Ark)
     const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
     const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
     const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

     const constitutionType = userProfile.constitution?.type || '平和质';

     const systemPrompt = `你是一位专业临床营养师兼中医体质调理师。擅长根据现代营养学和中医九种体质给出饮食建议。
你的语气必须：专业、简洁、不玄学、可执行。

【理论依据】
本分析基于《中医体质分类与判定》标准 (ZYYXH/T157-2009) 及现代营养学基础。

【烹饪调整规则（严格执行）】
如果用户输入未包含具体热量数据，请基于食材基准热量，应用以下系数进行估算：
1. **油炸/天妇罗/裹面**：热量系数 x 1.8 ~ 2.5（视裹粉厚度）；脂肪大幅增加。
2. **红烧/糖醋/拔丝**：热量系数 x 1.4；碳水(糖)额外增加 10-15g/100g。
3. **爆炒/油煎**：热量系数 x 1.3；脂肪额外增加 5-10g/100g。
4. **清蒸/水煮/凉拌**：热量系数 x 1.0；如含酱汁，热量微增。
5. **火锅/麻辣烫**：视汤底吸油情况，蔬菜类热量系数 x 1.5（极易吸油），肉类 x 1.1。
6. **烘焙/起酥**：热量系数 x 1.5；反式脂肪酸风险增加。

【任务】
请基于用户输入的食物内容和体质，进行以下分析并返回JSON：

1. **模糊量词检测（优先执行）**：
   - 如果用户使用“1碗”、“1份”、“少许”、“适量”等模糊量词，且未提供具体克数或详细描述（如“大碗”、“小份”），**必须**返回 \`needClarification: true\`。
   - 构造一个友好的 \`clarificationQuestion\`，引导用户补充重量或参照物（如“请问是拳头大小的一份，还是像家里吃饭的小碗？”）。
   - **例外**：如果是标准单位（如“1个鸡蛋”、“1瓶牛奶”、“1听可乐”），无需追问，直接估算。

2. **食物识别**：精确识别食材、烹饪方式、份量。
3. **营养估算**：热量(kcal)和三大营养素(碳水/蛋白质/脂肪)重量(g)。**必须应用上述烹饪调整规则**。
4. **营养学评价**：判断是否高油/高糖/高盐/精制碳水/优质蛋白/膳食纤维充足等。
5. **中医体质匹配**：判断该食物对该体质是否适宜（适宜/基本可以/少吃/不宜），并给出1句中医理由。
6. **最终建议**：给出简短、可执行的一句话建议。

【体质判断规则（必须遵守）】
- 阳虚质：生冷、寒凉、冰饮、生食、绿茶、苦瓜 → 不宜
- 湿热质：油腻、甜腻、辛辣、烈酒、热带水果（芒果/榴莲）→ 少吃；黄瓜/绿豆/苦瓜/薏米 → 适宜
- 痰湿质：肥甘厚味、甜食、奶茶、油炸、生冷 → 少吃
- 阴虚质：辛辣、烧烤、油炸、温补大料 → 少吃
- 气虚质：生冷、寒凉、过度空腹、油腻难消化 → 少吃
- 气郁质：浓茶、咖啡、烈酒、过度辛辣 → 少吃
- 血瘀质：生冷、冰冻、油腻黏滞 → 少吃
- 特禀质：海鲜、辛辣、刺激、未知陌生食物 → 谨慎
- 平和质：均衡即可，控量控油糖

【返回格式示例（纯JSON，无Markdown）】
// 情况1：需要追问
{
  "needClarification": true,
  "clarificationQuestion": "收到。请问这碗红烧牛肉面大约多大？是家里吃饭的小碗（约200g），还是餐馆的大海碗（约400g）？"
}

// 情况2：无需追问（正常分析）
{
  "needClarification": false,
  "calories": 650,
  "nutrients": { "carb": 85, "protein": 25, "fat": 20 },
  "tags": ["高碳水", "高钠"],
  "suitability": "少吃",
  "reason": "红烧牛肉面湿热较重，容易助湿生热。",
  "advice": "湿热体质建议少喝汤，搭配一盘清炒时蔬平衡油腻。"
}`;

     let userContent = `我吃了：${foodInput}\n我的体质是：${constitutionType}`;

     try {
        // Create a timeout promise (15s)
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Diet Analysis timed out after 15 seconds")), 15000)
        );

        const apiRequest = fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: ENDPOINT_ID,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                stream: false
            })
        });

        // Race between fetch and timeout
        const response = await Promise.race([apiRequest, timeout]);

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API Error ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.choices[0].message.content;
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);

     } catch (e) {
        console.error("Diet Analysis Error (Fallback Triggered):", e);
        
        // --- 兜底层：本地规则引擎 (重大优化) ---
        const input = foodInput || "";
        let category = '其他';
        let tags = [];
        let baseCalories = 0; // 单份基准热量
        let suitability = "基本可以";
        let reason = "";
        let advice = "";

        // 辅助函数：提取数量
        const extractQuantity = (text) => {
            // 匹配 "5个", "半碗", "300g" 等
            const quantityMap = { '半': 0.5, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
            
            // 1. 优先匹配数字 + 单位
            const numMatch = text.match(/(\d+(\.\d+)?)\s*(个|只|块|片|碗|份|g|克|ml|毫升|斤|两|杯)/);
            if (numMatch) {
                let num = parseFloat(numMatch[1]);
                const unit = numMatch[3];
                // 简单的单位归一化 (以"份"为基准)
                if (unit === 'g' || unit === '克') return num / 100; // 100g = 1份
                if (unit === 'ml' || unit === '毫升') return num / 100; // 100ml = 1份
                if (unit === 'kg' || unit === '千克') return num * 10;
                if (unit === '斤') return num * 5;
                if (unit === '两') return num * 0.5;
                if (unit === '片' || unit === '块') return num * 0.5; // 假设一片/块较小
                return num; // 个/碗/杯/份 默认为1
            }

            // 2. 匹配中文数字 + 单位 (e.g., "两个")
            for (const [key, val] of Object.entries(quantityMap)) {
                if (text.includes(key)) return val;
            }
            
            return 1; // 默认为1份
        };

        const quantity = extractQuantity(input);

        // 1. 优先尝试本地食物库 (New Feature)
        const libraryMatch = findFood(input);
        
        if (libraryMatch) {
            category = libraryMatch.type; // e.g. 'fruit', 'veggie'
            // Calculate base calories per unit (weight * calories/100g)
            baseCalories = Math.round((libraryMatch.weight * libraryMatch.calories) / 100);
            
            // Generate dynamic tags based on nutrients
            if (libraryMatch.carbs > 20) tags.push("高碳水");
            if (libraryMatch.protein > 10) tags.push("高蛋白");
            if (libraryMatch.fat > 10) tags.push("高脂");
            if (libraryMatch.calories < 50) tags.push("低卡");
            
            // Add category-specific tags
            if (category === 'fruit') tags.push("维生素");
            if (category === 'veggie') tags.push("膳食纤维");
            
        } else {
            // 2. 关键词分类 (Fallback if not in library)
            const keywords = {
                fruit: /(果|橙|梨|桃|瓜|莓|橘|柚|蕉|葡萄)/, // 优先匹配水果
                highOil: /(炸|烤|煎|红烧|肥|奶油|酥|排|火锅|串)/,
                highSugar: /(糖|甜|蛋糕|奶茶|巧克力|蜜|汁|冰淇淋|可乐)/,
                veggie: /(菜|蔬|菇|海带|木耳|笋|豆芽)/,
                protein: /(鱼|虾|鸡|蛋|奶|豆|牛|肉|瘦|排骨)/,
                staple: /(面|饭|粉|粥|馒头|饼|包子|薯)/,
                cold: /(冰|冷|生|沙拉|刺身|苦瓜|冬瓜)/
            };

            // Determine Category & Base Calories (Per Unit)
            if (input.match(keywords.fruit)) {
                category = 'fruit';
                tags = ["维生素", "天然糖分"];
                baseCalories = 50; // 一个水果约50-60kcal
            } else if (input.match(keywords.highOil)) {
                category = 'highOil';
                tags = ["高油", "重口味"];
                baseCalories = 400; // 一份炸鸡/烧烤
            } else if (input.match(keywords.highSugar)) {
                category = 'highSugar';
                tags = ["高糖", "快乐水"];
                baseCalories = 350; // 一块蛋糕/一杯奶茶
            } else if (input.match(keywords.staple)) {
                category = 'staple';
                tags = ["碳水", "主食"];
                baseCalories = 250; // 一碗饭
            } else if (input.match(keywords.protein)) {
                category = 'protein';
                tags = ["高蛋白", "营养"];
                baseCalories = 150; // 一份肉/蛋
            } else if (input.match(keywords.veggie)) {
                category = 'veggie';
                tags = ["低卡", "膳食纤维"];
                baseCalories = 30; // 一份蔬菜
            } else if (input.match(keywords.cold)) {
                category = 'cold';
                tags = ["生冷", "寒凉"];
                baseCalories = 100;
            } else {
                baseCalories = 200; // Default
            }
        }

        // Calculate Total Calories
        const totalCalories = Math.round(baseCalories * quantity);

        // 2. 体质 x 食物 联动规则
        const type = constitutionType; // Short alias
        // 判断语态
        const isQuery = /(能|可|该|要)不(能|可|该|要)|(吗|么|？|\?)/.test(input);
        const isPastTense = (text) => {
            return /(吃|喝|尝|用)了|(完)了|已经/.test(text) || !/(能|可|该|要)不(能|可|该|要)|(吗|么|？|\?)/.test(text);
        };
        const hasEaten = isPastTense(input);

        // 特殊处理：如果输入包含“冰”或“雪糕”，强制设为 cold 且给出严重警告
        if (input.includes('冰') || input.includes('雪糕')) {
            category = 'cold';
            // 确保 tags 里有寒凉
            if (!tags.includes('生冷') && !tags.includes('寒凉')) tags.push('生冷');
        }

        // --- 九大体质判定逻辑 ---
        // 依据标准：《中医体质分类与判定》 (ZYYXH/T157-2009)
        // 核心原则：
        // 1. 虚则补之，实则泻之
        // 2. 寒者热之，热者寒之
        // 3. 顺时而食，因人制宜

        if (type.includes('阳虚')) {
            // 阳虚：忌生冷，宜温补
            if (category === 'cold' || category === 'fruit') {
                suitability = category === 'fruit' ? '适量' : '不宜';
                reason = category === 'fruit' ? '大多数水果性质偏凉，阳虚体质不宜多吃。' : '生冷寒凉损耗阳气，雪上加霜。';
                advice = isQuery ? (category === 'fruit' ? '建议每次只吃一点点，或者煮热了吃。' : '建议忍住别吃，换成热饮吧。') 
                                 : '既然吃了，建议喝杯姜枣茶暖暖胃，注意保暖。';
            } else if (category === 'highOil') {
                suitability = '不宜';
                reason = '阳虚者脾胃运化无力，油腻极难代谢。';
                advice = '建议少吃，以免加重脾胃负担。';
            } else {
                suitability = '适宜';
                reason = '温补营养，适合您的体质。';
                advice = '吃得很好！保持脾胃温暖。';
            }
        } 
        else if (type.includes('阴虚')) {
            // 阴虚：忌辛辣/燥热，宜滋阴
            if (input.match(/(辣|烤|炸|羊肉|姜|蒜)/) || category === 'highOil') {
                suitability = '少吃';
                reason = '辛辣燥热伤阴助火，容易导致口干舌燥。';
                advice = isQuery ? '建议少吃，容易上火。' : '既然吃了，建议多喝温水，或者吃点银耳/梨润一润。';
            } else if (category === 'cold' || category === 'fruit') {
                suitability = '适宜';
                reason = '性质清凉，有助于滋阴降火。';
                advice = '非常适合您，可以适量多吃点。';
            } else {
                suitability = '适宜';
                reason = '清润滋养。';
                advice = '保持清淡饮食对您很有好处。';
            }
        }
        else if (type.includes('气虚')) {
            // 气虚：忌耗气/生冷/难消化，宜益气/易消化
            if (category === 'cold' || input.match(/(萝卜|山楂)/)) { // 萝卜破气
                suitability = '少吃';
                reason = input.match(/(萝卜|山楂)/) ? '萝卜/山楂虽好但破气，气虚者不宜多食。' : '生冷食物耗损脾胃之气。';
                advice = isQuery ? '建议少吃，以免气短乏力。' : '注意观察身体反应，如果觉得累就歇一歇。';
            } else if (category === 'highOil' || category === 'staple' && input.match(/(糯米|年糕)/)) {
                suitability = '少吃';
                reason = '黏腻难消化，容易困阻脾胃。';
                advice = '建议细嚼慢咽，避免积食。';
            } else if (input.match(/(鸡|薯|山药|土豆|牛肉|大枣)/)) {
                suitability = '推荐';
                reason = '甘温补气，非常适合气虚体质。';
                advice = '这类食物可以常吃，增强体力。';
            } else {
                suitability = '适宜';
                reason = '营养均衡。';
                advice = '注意按时吃饭，不要过度空腹。';
            }
        }
        else if (type.includes('痰湿')) {
            // 痰湿：忌肥甘厚味/甜腻，宜清淡/健脾
            if (category === 'highOil' || category === 'highSugar' || input.match(/(肥|腻|奶茶|炸)/)) {
                suitability = '少吃';
                reason = '肥甘厚味和甜食是生痰之源，加重身体沉重感。';
                advice = isQuery ? '建议少吃或不吃，甜食和油腻最伤脾胃。' : '这一顿稍微有点油腻/甜了，建议下一餐多吃绿叶菜，或者去快走30分钟。';
            } else if (input.match(/(冬瓜|萝卜|薏米|陈皮|普洱)/)) {
                suitability = '推荐';
                reason = '理气化痰，有助于改善体质。';
                advice = '非常棒的选择，有助于代谢痰湿。';
            } else {
                suitability = '基本可以';
                reason = '注意控制总量。';
                advice = '饮食宜清淡，只吃七分饱。';
            }
        }
        else if (type.includes('湿热')) {
            // 湿热：忌辛辣/滋腻/热带水果，宜清热祛湿
             // 1. 湿热/痰湿的核心忌口：高糖、高油、辛辣、酒
             if (category === 'highOil' || category === 'highSugar' || input.match(/(酒|辣|炸|烤|肥|腻)/)) {
                 suitability = '少吃';
                 reason = '湿热体质最怕肥甘厚味与辛辣助热，容易加重湿热内蕴。';
                 advice = isQuery ? '建议大幅减少摄入，或者浅尝辄止。' : '既然吃了，建议喝点金银花茶或菊花茶清热，或者去运动出点汗。';
             } 
             // 2. 热带水果（湿热特忌）
             else if (input.match(/(芒果|榴莲|荔枝|龙眼|菠萝蜜)/)) {
                 suitability = '慎食';
                 reason = '这类水果糖分高且性质湿热，犹如火上浇油，助湿生热。';
                 advice = isQuery ? '建议最好别吃，容易诱发痤疮或口苦。' : '建议多喝温水，或者喝点绿豆汤平衡一下。';
             }
             // 3. 海鲜（发物）
             else if (input.match(/(虾|蟹|海鲜|蚝|鱿鱼)/)) {
                 suitability = '注意';
                 reason = '海鲜属于“发物”，湿热体质容易诱发皮肤过敏或湿疹。';
                 advice = isQuery ? '如果近期皮肤状态不稳定，建议暂时别吃。' : '注意观察皮肤反应，如有瘙痒请暂停食用。';
             }
             // 4. 推荐食材：清热祛湿/粗粮
             else if (input.match(/(黄瓜|苦瓜|冬瓜|丝瓜|绿豆|薏米|赤小豆|玉米|燕麦|芹菜|荷叶)/)) {
                 suitability = '适宜';
                 reason = '清热祛湿，有助于平衡体质，减轻身体沉重感。';
                 advice = '非常适合您！建议适量食用，烹饪方式以清淡为主。';
             }
             else {
                 suitability = '基本可以';
                 reason = '饮食清淡为佳。';
                 advice = '注意避免重口味，保持清淡。';
             }
        }
        else if (type.includes('血瘀')) {
            // 血瘀：忌寒凉/收涩，宜活血
            if (category === 'cold' || input.match(/(冰|冷)/)) {
                suitability = '少吃';
                reason = '寒凝血瘀，冷食会加重血液凝滞，导致疼痛。';
                advice = isQuery ? '建议别吃冷饮，喝点热的吧。' : '既然吃了，建议泡个热水脚促进循环。';
            } else if (input.match(/(山楂|黑豆|木耳|醋|玫瑰)/)) {
                suitability = '推荐';
                reason = '行气活血，有助于改善微循环。';
                advice = '这类食物对您很有好处，可以常吃。';
            } else if (category === 'highOil') {
                suitability = '少吃';
                reason = '油脂过多会增加血液粘稠度。';
                advice = '建议饮食清淡，少吃油腻。';
            } else {
                suitability = '适宜';
                reason = '营养均衡。';
                advice = '保持心情舒畅，饮食有节。';
            }
        }
        else if (type.includes('气郁')) {
            // 气郁：忌刺激/收敛，宜疏肝
            if (input.match(/(咖啡|浓茶|酒|辣)/)) {
                suitability = '慎食';
                reason = '过度刺激可能加重焦虑或烦躁。';
                advice = isQuery ? '建议少喝，以免影响情绪或睡眠。' : '如果感到心烦，建议听听音乐放松一下。';
            } else if (input.match(/(玫瑰|金桔|佛手|橙|柚)/)) { // 芳香理气
                suitability = '推荐';
                reason = '芳香类食物有助于疏肝解郁，调节情绪。';
                advice = '闻起来香香的食物能让心情变好哦！';
            } else {
                suitability = '适宜';
                reason = '正常饮食。';
                advice = '吃饭时保持心情愉快最重要。';
            }
        }
        else if (type.includes('特禀')) {
            // 特禀：忌发物/致敏源
            if (input.match(/(虾|蟹|海鲜|鹅|笋|酒|辣)/)) {
                suitability = '慎食';
                reason = '特禀体质易过敏，海鲜、辛辣等“发物”需格外小心。';
                advice = isQuery ? '如果不确定是否过敏，建议别吃。' : '注意观察皮肤和呼吸道反应。';
            } else {
                suitability = '基本可以';
                reason = '清淡饮食，避开过敏源。';
                advice = '饮食宜清淡、均衡，增强免疫力。';
            }
        }
        else {
            // 平和质
            if (category === 'highOil' || category === 'highSugar') {
                suitability = '少吃';
                reason = '热量与脂肪较高，虽无特定禁忌，但需节制。';
                advice = isQuery ? '偶尔解馋可以，别吃太多。' : '这一餐热量有点高，建议下一餐多吃蔬菜平衡一下。';
            } else if (category === 'veggie' || category === 'fruit') {
                suitability = '推荐';
                reason = '富含膳食纤维和维生素，非常健康。';
                advice = '完美的清淡选择！';
            } else if (category === 'protein') {
                suitability = '推荐';
                reason = '优质蛋白质是身体修复的基础。';
                advice = '很棒的营养来源！注意烹饪方式不要太油哦。';
            } else {
                suitability = '适宜';
                reason = '营养均衡。';
                advice = '保持多样化饮食，您吃得很健康！';
            }
        }



        // Quantity Check (Global Override)
        if (quantity > 3) {
            if (hasEaten) {
                advice += ` 另外，您这一顿吃的分量（${quantity}份）有点多了，建议饭后适当走动消食，下一餐记得减量哦。`;
            } else {
                advice += ` 另外，${quantity}份的分量确实有点多，建议分次食用或与人分享，避免积食。`;
            }
            if (category === 'fruit' || category === 'highSugar') {
                reason += ' 且摄入糖分总量已超标。';
                suitability = '少吃';
            }
        }

        // Defaults
        if (!advice) advice = "营养尚可，注意细嚼慢咽。";
        if (!reason) reason = "符合基础营养需求。";

        return {
            calories: totalCalories, 
            nutrients: { 
                carb: Math.round(totalCalories * 0.5 / 4), 
                protein: Math.round(totalCalories * 0.2 / 4), 
                fat: Math.round(totalCalories * 0.3 / 9) 
            },
            suitability: suitability,
            reason: reason,
            advice: advice,
            tags: tags
        };
     }
  },

    // ... (Previous code)
    
  /**
   * 11. AI 运动分析
   * @param {string} text User input (e.g., "跑步5公里", "站桩20分钟")
   * @param {Object} userProfile
   */
  analyze_exercise: async (text, userProfile = {}) => {
    // Simple regex-based parsing for immediate response (Mock AI)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Extract ALL durations and sum them up (for multi-exercise input)
    const matches = [...text.matchAll(/(\d+|[一二三四五六七八九十]+)\s*(分钟|min|h|小时)/gi)];
    let totalDuration = 0;
    let mainType = '运动';

    if (matches.length > 0) {
        matches.forEach(m => {
            let val = parseInt(m[1]);
            if (m[2].includes('小时') || m[2] === 'h') val *= 60;
            totalDuration += val;
        });
    } else {
        totalDuration = 30; // default
    }

    // Identify Types (Take the first one or combine)
    const foundTypes = [];
    if (text.includes('站桩')) foundTypes.push('站桩');
    if (text.includes('八段锦')) foundTypes.push('八段锦');
    if (text.includes('太极')) foundTypes.push('太极');
    if (text.includes('跑步') || text.includes('跑')) foundTypes.push('跑步');
    if (text.includes('走') || text.includes('散步')) foundTypes.push('快走');
    if (text.includes('瑜伽')) foundTypes.push('瑜伽');
    if (text.includes('游泳')) foundTypes.push('游泳');
    if (text.includes('跳绳')) foundTypes.push('跳绳');
    if (text.includes('无氧') || text.includes('力量') || text.includes('举铁')) foundTypes.push('力量训练');
    
    mainType = foundTypes.length > 0 ? foundTypes.join('+') : '运动';
    
    // Calories: Use an average multiplier for multi-exercise
    let calories = totalDuration * 6; // base
    if (text.includes('跑步') || text.includes('跳绳') || text.includes('游泳')) calories = totalDuration * 10;
    else if (text.includes('站桩') || text.includes('太极')) calories = totalDuration * 3.5;

    // --- 体质关联建议 (New Feature) ---
    const type = userProfile.constitution?.type || '平和质';
    let advice = `${mainType}对您的健康很有益处。`;
    
    // 运动强度判断
    const isHighIntensity = calories / totalDuration > 8; // >8kcal/min

    if (type.includes('阳虚')) {
        if (isHighIntensity && totalDuration > 45) {
            advice = `${mainType}强度较大，阳虚体质不宜大汗淋漓，请注意防风保暖，避免耗损阳气。`;
        } else {
            advice = `动则生阳，${mainType}非常适合您！建议在阳光充足时进行，有助于提升阳气。`;
        }
    } else if (type.includes('阴虚')) {
        if (isHighIntensity) {
            advice = `阴虚体质津液不足，${mainType}出汗较多，运动后请务必及时补充水分，避免熬夜。`;
        } else {
            advice = `${mainType}比较温和，适合阴虚体质，有助于调养心神。`;
        }
    } else if (type.includes('湿热') || type.includes('痰湿')) {
        if (!isHighIntensity && totalDuration < 30) {
            advice = `${mainType}强度稍低，对于${type}，建议适当增加强度或时长，微微出汗才能有效排湿。`;
        } else {
            advice = `非常棒！${mainType}能有效促进代谢，帮助排出体内湿气，坚持就是胜利。`;
        }
    } else if (type.includes('气虚')) {
        if (isHighIntensity) {
            advice = `气虚体质不宜过度劳累，${mainType}如果感到气喘吁吁，请务必减量，以免耗气。`;
        } else {
            advice = `适度的${mainType}有助于补气，但请量力而行，以运动后不感到极度疲乏为度。`;
        }
    } else if (type.includes('气郁')) {
        advice = `${mainType}有助于疏肝解郁，宣泄情绪。运动时试着大口呼吸，把烦恼都呼出去！`;
    } else if (type.includes('血瘀')) {
        advice = `${mainType}能促进气血运行，对改善血瘀非常有帮助。建议坚持，并在运动后做些拉伸。`;
    }

    return {
        type: mainType,
        duration: totalDuration,
        calories: Math.round(calories),
        advice: advice
    };
  },

  /**
   * 12. AI 排便/消化分析 (New)
   * @param {string} text User input (e.g., "便秘", "拉肚子", "羊屎蛋")
   * @param {Object} userProfile
   */
  analyze_bowel: async (text, userProfile = {}) => {
      // Simulate AI Analysis delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const type = userProfile.constitution?.type || '平和质';
      let issue = '正常';
      let advice = '消化功能正常，继续保持。';
      let tags = [];

      // Simple keyword analysis
      if (text.match(/(干|硬|球|羊|难|秘|费力|痛|血)/)) {
          issue = '便秘/干结';
          tags.push('便秘');
          
          if (type.includes('阴虚') || type.includes('湿热')) {
              advice = `${type}容易肠燥或湿热蕴结，导致大便干结。建议多吃火龙果、蜂蜜水，少吃辛辣。`;
          } else if (type.includes('气虚') || type.includes('阳虚')) {
              advice = `${type}往往因推动无力导致排便困难（虚秘）。不宜盲目吃泻药，建议吃点肉苁蓉、黑芝麻润肠通便。`;
          } else if (type.includes('气郁')) {
              advice = '气机郁滞也会导致排便不畅（气秘）。建议多做腹部按摩，保持心情舒畅。';
          } else {
              advice = '建议多喝水，增加膳食纤维摄入（如玉米、芹菜）。';
          }
      } 
      else if (text.match(/(稀|水|喷|泻|烂|不成形|多次)/)) {
          issue = '腹泻/便溏';
          tags.push('腹泻');

          if (type.includes('阳虚') || type.includes('气虚')) {
              advice = `${type}脾胃虚寒，运化无力。建议少吃生冷水果，可以用生姜贴肚脐或喝点热粥。`;
          } else if (type.includes('湿热') || type.includes('痰湿')) {
              advice = '湿气下注导致大便粘腻不成形。建议食用薏米、白扁豆健脾祛湿。';
          } else {
              advice = '注意腹部保暖，近期饮食宜清淡易消化。';
          }
      }
      else if (text.match(/(粘|黏|沾|不净)/)) {
          issue = '粘滞不爽';
          tags.push('湿气重');
          advice = '大便粘滞是湿气重的典型表现。建议减少油腻甜食，多做运动出汗排湿。';
      }

      return {
          issue,
          advice,
          tags,
          timestamp: new Date().toISOString()
      };
  },

  /**
   * 13. AI 识别食物图片 (Real Vision)
   * 接入智谱 GLM-4V 进行真实识别
   */
  analyze_food_image: async (imageFile) => {
    console.log("Analyzing food image...", imageFile);
    
    // 1. Convert Blob/File to Base64
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        // 如果是 File 对象（来自 input type="file"），转 Base64
        // 如果已经是 URL (blob:...)，需要 fetch 后转 blob 再转 base64
        let base64Image = '';
        if (imageFile instanceof File || imageFile instanceof Blob) {
            base64Image = await toBase64(imageFile);
        } else if (typeof imageFile === 'string' && imageFile.startsWith('blob:')) {
             const blob = await fetch(imageFile).then(r => r.blob());
             base64Image = await toBase64(blob);
        } else {
             base64Image = imageFile; // Assume already base64 or url
        }

        // 2. Call Real API (Zhipu GLM-4V)
        // 注意：这里复用您在 analyze_tongue 中配置的 Key，或者您可以单独配置
        return await healthService._zhipuAnalyzeFood(base64Image);

    } catch (e) {
        console.error("Real Food Analysis Failed, falling back to mock:", e);
        
        // Fallback Mock Result (模拟 AI 看到的食物)
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResults = [
            {
                food: "红烧牛肉面 (模拟结果)",
                weight: "550g",
                imageUrl: typeof imageFile === 'string' ? imageFile : null,
                analysis: "【API调用失败，显示模拟数据】识别到一碗红烧牛肉面。根据标准碗的大小（直径约18cm）估算：面条约200g，牛肉约80g，汤料和蔬菜约270g。",
                nutrition: {
                    calories: 680,
                    nutrients: { carb: 85, protein: 28, fat: 25 },
                    suitability: "中等",
                    advice: "钠含量较高，建议少喝汤。"
                }
            },
            {
                food: "鸡胸肉沙拉 (模拟结果)",
                weight: "320g",
                imageUrl: typeof imageFile === 'string' ? imageFile : null,
                analysis: "【API调用失败，显示模拟数据】识别到一份轻食沙拉。包含煎鸡胸肉、生菜、圣女果和少量玉米粒。",
                nutrition: {
                    calories: 350,
                    nutrients: { carb: 20, protein: 35, fat: 12 },
                    suitability: "适宜",
                    advice: "非常健康的减脂餐，蛋白质充足。"
                }
            }
        ];
        return mockResults[Math.floor(Math.random() * mockResults.length)];
    }
  },

  /**
   * Internal: Zhipu GLM-4V for Food Analysis
   */
  _zhipuAnalyzeFood: async (imageData) => {
    // 使用与舌诊相同的 Key，或者替换为新的
    const API_KEY = '1e52c1eb939a43cb9aba66a83ed799ef.zF7gmf1FJ3Ayxzyr'; 
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const base64Url = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;

    const systemPrompt = `你是一位专业的营养师。请分析这张图片中的食物。
1. 识别食物名称。
2. 根据图片中的容器或参照物，预估食物的大致重量(克)。如果不确定，请根据常见份量估算（如一碗饭约200g）。
3. 估算其热量(kcal)和三大营养素(碳水/蛋白质/脂肪，单位g)。
4. 返回纯JSON格式，包含以下字段：
   - food (食物名称)
   - weight (预估重量，如"约250g")
   - analysis (简短的视觉分析描述，说明识别到了什么配料)
   - nutrition: { calories (数字), nutrients: { carb (数字), protein (数字), fat (数字) }, suitability (适宜/中等/少食), advice (一句话建议) }

严禁输出Markdown代码块，直接返回纯JSON字符串。`;

    const payload = {
        model: "glm-4v",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: systemPrompt },
                    { type: "image_url", image_url: { url: base64Url } }
                ]
            }
        ]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const text = data.choices[0].message.content;
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return {
        ...result,
        imageUrl: base64Url // Pass back for display
    };
  },

  generate_meal_plan: async (userProfile) => {
     const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
     const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
     const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

     // Calculate TDEE or use default
     let tdee = 1800;
     if (userProfile.basicInfo) {
        const { weight, height, age, gender, activity } = userProfile.basicInfo;
        if (weight && height && age) {
            let bmr = gender === 'male' 
                ? (13.88 * weight) + (4.16 * height) - (3.43 * age) - 112.4
                : (9.24 * weight) + (3.1 * height) - (4.33 * age) + 447.6;
            const factors = { 'light': 1.2, 'medium': 1.55, 'heavy': 1.725 };
            tdee = Math.round(bmr * (factors[activity] || 1.2));
        }
     }

     const constitutionType = userProfile.constitution?.type || '平和质';
     const constitutionDesc = userProfile.constitution?.desc || '';

     // Add allergies handling
     let allergies = '';
     if (userProfile.medicalHistory && userProfile.medicalHistory.allergies) {
        if (Array.isArray(userProfile.medicalHistory.allergies)) {
             allergies = userProfile.medicalHistory.allergies.join('、');
        } else if (typeof userProfile.medicalHistory.allergies === 'string') {
             allergies = userProfile.medicalHistory.allergies;
        }
     }

     const systemPrompt = `你是一位精通中医食疗和现代营养学的健康顾问。请为用户生成今日的三餐食谱（早餐、午餐、晚餐）。
用户档案：
- 每日目标热量：约 ${tdee} kcal
- 中医体质：${constitutionType} (${constitutionDesc})
- 季节：春季 (惊蛰)
${allergies ? `- 过敏/忌口：${allergies} (请严格避开这些食材)` : ''}

要求：
1. 食谱需符合中医“顺时而食”和体质调理原则（如阳虚补阳、湿热祛湿）。
2. 需符合现代营养学三大营养素配比。
3. 返回纯JSON格式，包含 breakfast, lunch, dinner 三个对象，每个对象包含 name(菜名组合), calories(热量), carbs(碳水g), protein(蛋白质g), fat(脂肪g), tag(简短调理标签)。
4. 菜名必须具体，并且【强制包含】每种食物的具体克数/数量（如：小米粥(250g)、鸡蛋(1个)、清炒菠菜(150g)）。不要使用“适量”、“少许”等模糊词汇。
5. 严禁输出任何Markdown标记或代码块（如 \`\`\`json），只返回纯文本JSON。
6. 确保JSON格式合法，无多余字符。

返回格式示例：
{
  "breakfast": { "name": "...", "calories": 400, "carbs": 50, "protein": 20, "fat": 10, "tag": "..." },
  "lunch": { ... },
  "dinner": { ... }
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
        if (data.error) throw new Error(data.error.message);

        const text = data.choices[0].message.content;
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (e) {
        console.error("Meal Plan Generation Error:", e);
        
        // Fallback to static data based on constitution
        // Ensure we have a valid fallback, default to '平和质' if type not found
        const fallbackPlan = dietFallback[constitutionType] || dietFallback['平和质'];
        
        // Return a safe copy to avoid mutation if we were to modify it
        return {
            breakfast: { ...fallbackPlan.breakfast },
            lunch: { ...fallbackPlan.lunch },
            dinner: { ...fallbackPlan.dinner }
        };
    }
  },

  /**
   * 1. 获取用户体质
   * @param {string} userId 
   * @returns {Promise<Object>} { type: '阳虚质', tags: ['怕冷', '易疲劳'], score: 85 }
   */
  get_constitution: async (userId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use storageService to get user profile
    const userProfile = storageService.getUserProfile();
    
    // Check if we have constitution result stored in profile
    if (userProfile.constitution && userProfile.constitution.type) {
        return userProfile.constitution;
    }
    
    const basicInfo = userProfile.basicInfo || {};
    
    // Mock logic: infer from symptoms or random
    let type = '平和质';
    let tags = ['精力充沛', '睡眠安稳'];
    
    // Simple mock logic based on user input (if available)
    if (basicInfo.gender === 'female') {
        type = '阳虚质';
        tags = ['手脚冰凉', '易疲劳', '代谢慢'];
    }
    
    return {
      type,
      tags,
      score: 85, // Health score
      desc: '阳气不足，失于温煦。以形寒肢冷等虚寒表现为主要特征。'
    };
  },

  /**
   * 2. 获取饮食与营养数据
   * @param {string} userId 
   * @param {string} dateRange 'today' | 'week'
   */
  get_nutrition: async (userId, dateRange = 'today') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Use storageService
    const today = new Date().toISOString().split('T')[0];
    const dailyLogs = storageService.getDailyLogs(today);
    
    // If dailyLogs.diet exists (new structure), use it.
    // If not, try to fallback or just return empty.
    const foodLog = dailyLogs.diet || [];
    
    // Mock analysis of food log
    return {
      logs: foodLog.map(item => item.name || item), // Handle object or string
      summary: {
        totalCalories: 1450,
        targetCalories: 1800,
        macro: { carb: '45%', protein: '20%', fat: '35%' },
        variety: 8, // types of food
        score: 75
      },
      suggestion: '今日碳水摄入偏低，建议晚餐增加一些粗粮。'
    };
  },

  /**
   * 3. 获取运动数据
   * @param {string} userId 
   * @param {string} dateRange 
   */
  get_sports: async (userId, dateRange = 'today') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check connected devices
    const settings = storageService.getSettings();
    const devices = settings.devices || {};
    const hasDevice = Object.values(devices).some(v => v);

    if (hasDevice) {
        // Mock Device Data (More precise)
        return {
            steps: 8432,
            distance: 5.8, // km
            caloriesBurned: 320,
            source: devices.apple ? 'Apple Health' : (devices.huawei ? 'Huawei Health' : 'Smart Device'),
            records: [
                { type: 'run', duration: 45, time: '07:30', kcal: 280 },
                { type: 'walk', duration: 20, time: '19:00', kcal: 40 }
            ]
        };
    }

    return {
      steps: 6540,
      distance: 4.2, // km
      caloriesBurned: 240,
      source: '手机计步',
      records: [
        { type: 'walk', duration: 30, time: '08:00' }
      ]
    };
  },

  /**
   * 4. 获取睡眠数据
   * @param {string} userId 
   * @param {string} dateRange 
   */
  get_sleep: async (userId, dateRange = 'today') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check connected devices
    const settings = storageService.getSettings();
    const devices = settings.devices || {};
    const hasDevice = Object.values(devices).some(v => v);

    if (hasDevice) {
         // Mock Device Data (Detailed stages)
         return {
            duration: 7.8,
            score: 88,
            deepSleep: '1h 45m', 
            lightSleep: '4h 30m',
            remSleep: '1h 35m',
            bedTime: '23:15',
            wakeTime: '07:05',
            quality: 'good',
            source: devices.apple ? 'Apple Watch' : (devices.huawei ? 'Huawei Watch' : 'Smart Device')
         };
    }
    
    // Use storageService for manual records
    const lastSleep = storageService.getLatestHealthRecord('sleep');
    
    if (!lastSleep) {
      return { status: 'no_record' };
    }

    return {
      duration: lastSleep.duration, // e.g., 7.5
      score: lastSleep.score || 80,
      deepSleep: '2h', // Mock
      lightSleep: '5h', // Mock
      bedTime: lastSleep.sleepTime,
      wakeTime: lastSleep.wakeTime,
      quality: lastSleep.subjectiveEval || 'normal',
      source: '手动记录'
    };
  },

  /**
   * 5. 获取排便消化数据
   * @param {string} userId 
   * @param {string} dateRange 
   */
  get_bowel: async (userId, dateRange = 'today') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Ideally we should store a list of poop records. 
    // For now we assume the chat interface might store this differently, 
    // but here we return a mock structure.
    return {
      count: 1,
      lastType: 4, // Bristol Type 4
      consistency: '正常',
      color: '黄褐色',
      regularity: '规律'
    };
  },

  /**
   * 6. 获取月经周期数据 (女性)
   * @param {string} userId 
   */
  get_period: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userProfile = storageService.getUserProfile();
    const basicInfo = userProfile.basicInfo || {};
    
    if (basicInfo.gender !== 'female') return null;

    return {
      phase: '安全期', // 经期, 排卵期, 安全期
      dayInCycle: 12,
      nextPeriodDays: 16,
      symptoms: basicInfo.painLevel || '无痛感'
    };
  },

  /**
   * 7. 生成周总结报告 (Real AI)
   * @param {string} userId 
   * @param {number} weekOffset 0 for current week, 1 for last week, etc.
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
    
    const formatDate = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
    const dateRange = `${formatDate(startOfWeek)}-${formatDate(endOfWeek)}`;

    // 2. Gather Data from LocalStorage (Mocked "Backend")
    // In a real app, this would be a DB query. Here we read from localStorage.
    // Note: Since healthService is a JS module, it can't directly access React State,
    // so we rely on localStorage being the source of truth.
    const stored = localStorage.getItem('cangzhen_memories');
    let memories = [];
    if (stored) {
        try { memories = JSON.parse(stored); } catch (e) {}
    }

    // Filter logs for the selected week
    const weeklyMemories = memories.filter(m => {
        const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
        return mDate >= startOfWeek && mDate <= endOfWeek;
    });

    // 3. Prepare AI Prompt
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    // Summarize data for AI
    const memorySummary = weeklyMemories.map(m => `[${m.hall}] ${m.content} (Tags: ${m.tags?.join(',')})`).join('\n');
    const hallCounts = {
        sensation: weeklyMemories.filter(m => m.hall === 'sensation').length,
        emotion: weeklyMemories.filter(m => m.hall === 'emotion').length,
        inspiration: weeklyMemories.filter(m => m.hall === 'inspiration').length,
        wanxiang: weeklyMemories.filter(m => m.hall === 'wanxiang').length,
    };

    // Prompt Template: "Personal Growth & Emotion Review" Style
    const systemPrompt = `Role: 你是一位私人成长教练，擅长通过提问引导我发现生活中的“微光”和“缝隙里的糖”。
    
    Input Data:
    - 本周记录数：${weeklyMemories.length}
    - 记录分布：感知(${hallCounts.sensation}), 情绪(${hallCounts.emotion}), 灵感(${hallCounts.inspiration}), 决策(${hallCounts.wanxiang})
    - 详细记录内容：
    ${memorySummary.substring(0, 2000)} (截取部分)

    Output Requirements:
    请为我写一封简短的周回顾信（HTML格式，无Markdown代码块），包含：
    1. **本周关键词**：提炼一个词。
    2. **心境形状分析**：描述我本周的情绪流向（如“像一条缓慢的河流”）。
    3. **温柔的提醒**：针对我的记录，给我一些不必紧绷的建议。
    4. **下周的种子**：为下周埋下一个小小的期待。

    Style:
    散文诗般的语言，温暖、治愈、充满同理心，避免说教。字数控制在 200 字以内。
    请直接返回 HTML 字符串，例如：<strong>关键词：...</strong><br/><br/>...
    `;

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
        if (data.error) throw new Error(data.error.message);
        
        const aiText = data.choices[0].message.content;

        return {
            success: true,
            summary: aiText, // HTML string
            keyword: aiText.match(/关键词[：:]\s*(\S+)/)?.[1] || "成长", // Simple regex extraction
            count: weeklyMemories.length,
            hallCounts
        };

    } catch (e) {
        console.error("Weekly Report Generation Failed:", e);
        // Fallback
        return {
            success: false,
            summary: "网络似乎有点拥堵，但我依然为你记录下了这周的点点滴滴。无论数据如何，每一个当下都值得被珍藏。",
            keyword: "记录",
            count: weeklyMemories.length,
            hallCounts
        };
    }
  },

  /**
   * 13. 获取每日推荐 (Cangzhen - AI Learning & Iteration)
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
  }
};
