import { storageService } from './storageService.js';
import { dietFallback } from '../data/dietFallback.js';
import { findFood } from '../data/foodLibrary.js'; // Import local food library
import { 
    BASE_SCORES, 
    SEASONAL_WEIGHTS, 
    SCENARIO_RULES, 
    getCurrentSeason, 
    tagFood, 
    parseStatus 
} from '../data/constitutionMatrix.js';

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
  chat: async (messages, userProfile = {}, customSystemPrompt = null) => {
     // Use Zhipu AI for general chat since Doubao endpoint is 404
     const API_KEY = '1e52c1eb939a43cb9aba66a83ed799ef.zF7gmf1FJ3Ayxzyr'; 
     const ENDPOINT_ID = 'glm-4-flash'; 
     const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

     // Construct System Prompt with User Context
     let systemPrompt = customSystemPrompt;
     
     if (!systemPrompt) {
         systemPrompt = "你是一位专业、严谨的中医健康顾问“合拍”。你的语言风格客观、理性、专业，避免使用任何过于亲昵的称呼（如“亲爱的”、“宝宝”、“亲”等）。";
         
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
     }

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
        // FIX: Stricter matching. Only show summary if user asks for "Summary/Record/What did I eat".
        // Removed '今天吃' to avoid matching "今天吃什么好" or "今天能吃吗"
        if (lastUserMsg.match(/(复盘|总结|吃了啥|吃了什么|记录了什么|今日饮食复盘|今天饮食记录)/)) {
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
        
        // FIX: Add a specific fallback for "Can I eat?" queries that fail API
        if (lastUserMsg.match(/(能吃|可以吃|能不能吃|该不该吃|怎么吃|好不好)/)) {
            return "抱歉，由于网络波动，我暂时无法连接到云端大脑为您详细分析这种食物。建议您稍后再试，或者直接告诉我“我要记饮食”来记录。";
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
   * 10. AI 饮食分析 (Strict PRD Alignment)
   * 逻辑分层：
   * 1. 本地库查标准值 (Local Standard)
   * 2. 烹饪系数修正 (Cooking Coefficient)
   * 3. 体质矩阵判断 (Constitution Matrix)
   */
  analyze_diet: async (foodInput, userProfile = {}) => {
     const constitutionType = userProfile.constitution?.type || '平和质';
     const input = foodInput || "";
     
     // --- Step 1: Local Rule Engine (Fast Path) ---
     // 1.1 Extract Quantity
     const extractQuantity = (text) => {
        const quantityMap = { '半': 0.5, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
        const numMatch = text.match(/(\d+(\.\d+)?)\s*(个|只|块|片|碗|份|g|克|ml|毫升|斤|两|杯)/);
        if (numMatch) {
            let num = parseFloat(numMatch[1]);
            const unit = numMatch[3];
            if (unit === 'g' || unit === '克' || unit === 'ml' || unit === '毫升') return num / 100; // 100g/ml = 1 unit
            if (unit === 'kg' || unit === '千克') return num * 10;
            if (unit === '斤') return num * 5;
            if (unit === '两') return num * 0.5;
            if (unit === '片' || unit === '块') return num * 0.5; 
            return num; 
        }
        for (const [key, val] of Object.entries(quantityMap)) {
            if (text.includes(key)) return val;
        }
        return 1; 
     };

     const quantity = extractQuantity(input);
     
     // 1.2 Cooking Method Detection & Coefficient (PRD Requirement)
     let cookingMethod = 'raw'; // default
     let cookingCoeff = 1.0;
     
     if (input.match(/(炸|烤|酥|天妇罗)/)) { 
         cookingMethod = 'fried'; 
         cookingCoeff = 2.0; // Fried x1.8-2.5 -> Avg 2.0
     } else if (input.match(/(红烧|糖醋|拔丝)/)) { 
         cookingMethod = 'braised'; 
         cookingCoeff = 1.4; // Braised x1.4
     } else if (input.match(/(火锅|麻辣烫|串串)/)) { 
         cookingMethod = 'hotpot'; 
         cookingCoeff = 1.5; // Hotpot veggies absorb oil x1.5
     } else if (input.match(/(爆炒|煎|油焖)/)) { 
         cookingMethod = 'stirfry'; 
         cookingCoeff = 1.3; 
     }

     // 1.3 Try Local Food Library
     const libraryMatch = findFood(input);
     let localResult = null;

     if (libraryMatch) {
        // Base Calories from Library
        let baseCalories = Math.round((libraryMatch.weight * libraryMatch.calories) / 100);
        
        // --- Special Case: Fried Chicken (Hardcoded fix for demo accuracy) ---
        // Library "炸鸡块" is 290kcal/100g. 
        // If input contains "炸鸡腿", user expects ~260-300kcal per leg (approx 120-150g edible).
        // Current logic: "鸡腿" (185kcal/100g) * 1.5 (weight 150g) * 2.0 (Fried Coeff) = ~555 kcal per leg.
        // User says 120g fried leg ~ 300-350kcal.
        // 555 vs 350 is too high. The Cooking Coeff 2.0 is too aggressive for "Chicken Leg" which already has fat.
        
        // Dynamic Coefficient Adjustment based on Base Fat
        if (libraryMatch.fat > 10 && cookingMethod === 'fried') {
            cookingCoeff = 1.3; // Already fatty, frying adds less relative calories than frying a potato
        }
        
        // Apply Cooking Coefficient
        baseCalories = Math.round(baseCalories * cookingCoeff);
        
        // Recalculate based on USER INPUT WEIGHT if available
        // If user said "120g", we should use that instead of library default weight.
        if (input.match(/(\d+)g/i) || input.match(/(\d+)克/)) {
             const userWeightMatch = input.match(/(\d+)g/i) || input.match(/(\d+)克/);
             const userWeight = parseInt(userWeightMatch[1]);
             // Re-calculate base calories for 1 unit of this weight
             // Library calories is per 100g
             baseCalories = Math.round((userWeight * libraryMatch.calories) / 100);
             baseCalories = Math.round(baseCalories * cookingCoeff);
             
             // Since we used exact weight, set quantity multiplier to 1 effectively for this calculation context?
             // No, the 'quantity' variable below handles "2个", "3碗".
             // If input is "120g chicken", extractQuantity might return 1.2 (if it sees 120g as 1.2 units? No, my extractQuantity logic handles units).
             
             // Let's fix the logic flow.
             // If specific weight is found, we shouldn't use the 'quantity' multiplier on top of it unless it's "2 servings of 120g".
             // Current extractQuantity logic: "120g" -> returns 1.2 (because 100g = 1 unit).
             // So: Base (per 100g) * 1.2 * Coeff.
             
             // Let's trace the error: "120g 炸鸡腿"
             // Library: "鸡腿" -> 185kcal/100g.
             // Coeff: 2.0 (Fried).
             // Quantity: 1.2 (120g).
             // Total = 185 * 2.0 * 1.2 = 444 kcal.
             
             // Why did user get 1334?
             // Input: "吃了两个炸鸡腿、120克吧"
             // extractQuantity might have picked up "两个" (2) AND "120" (1.2)? 
             // My extractQuantity regex priorities might be wrong or it sums them?
             // No, it returns the FIRST match.
             // "两个" -> 2.
             // "120克" -> 1.2.
             // If it picked "2", then:
             // Unit Weight (Chicken Leg) = 150g (from library).
             // Base (1 unit) = 150g * 185/100 * 2.0 = 555 kcal.
             // Total = 555 * 2 = 1110 kcal. Close to 1334.
             
             // ISSUE: The system took "2个" (Standard big legs) instead of "120g" (Small legs or total weight).
             // Fix: If weight is explicitly mentioned, PRIORTIZE weight over "count".
        }
        
        let tags = [];
        if (libraryMatch.carbs > 20) tags.push("高碳水");
        if (libraryMatch.protein > 10) tags.push("高蛋白");
        if (libraryMatch.fat > 10) tags.push("高脂");
        
        // Add Method Tags
        if (cookingMethod === 'fried') tags.push("高油炸");
        if (cookingMethod === 'braised') tags.push("高糖油");

        localResult = {
            category: libraryMatch.type,
            baseCalories,
            tags,
            name: libraryMatch.name,
            cookingMethod
        };
     } 
     
     // 1.4 Try Regex Keywords (Fallback)
     if (!localResult) {
        // Fallback for "Inquiry" about generic foods that are not in local library but match regex.
        // E.g. "Ice cream" -> matches 'cold' or 'highSugar'
        
        const keywords = {
            fruit: /(果|橙|梨|桃|瓜|莓|橘|柚|蕉|葡萄)/,
            highOil: /(炸|烤|煎|红烧|肥|奶油|酥|排|火锅|串)/,
            highSugar: /(糖|甜|蛋糕|奶茶|巧克力|蜜|汁|冰淇淋|雪糕|可乐)/,
            veggie: /(菜|蔬|菇|海带|木耳|笋|豆芽)/,
            protein: /(鱼|虾|鸡|蛋|奶|豆|牛|肉|瘦|排骨)/,
            staple: /(面|饭|粉|粥|馒头|饼|包子|薯)/,
            cold: /(冰|冷|生|沙拉|刺身|苦瓜|冬瓜)/
        };

        if (input.match(keywords.fruit)) localResult = { category: 'fruit', tags: ["维生素"], baseCalories: 50 };
        else if (input.match(keywords.highOil)) localResult = { category: 'highOil', tags: ["高油"], baseCalories: 400 }; 
        else if (input.match(keywords.highSugar)) localResult = { category: 'highSugar', tags: ["高糖", "甜食"], baseCalories: 350 };
        else if (input.match(keywords.staple)) localResult = { category: 'staple', tags: ["碳水"], baseCalories: 250 };
        else if (input.match(keywords.protein)) localResult = { category: 'protein', tags: ["高蛋白"], baseCalories: 150 };
        else if (input.match(keywords.veggie)) localResult = { category: 'veggie', tags: ["膳食纤维"], baseCalories: 30 };
        else if (input.match(keywords.cold)) localResult = { category: 'cold', tags: ["生冷"], baseCalories: 100 };
        
        // Ensure name is set for fallback
        if (localResult) {
            localResult.name = input;
            localResult.baseCalories = Math.round(localResult.baseCalories * cookingCoeff);
            localResult.cookingMethod = cookingMethod;
        }
     }

     // Force High Oil override if keywords exist (Double Check)
     if (cookingMethod !== 'raw' && localResult) {
         if (!localResult.tags.includes('高油') && cookingCoeff > 1.2) localResult.tags.push('高油');
     }

     // If local match found -> Generate Response
     if (localResult) {
         console.log("Local Diet Analysis Hit:", localResult);
         const { category, baseCalories, tags } = localResult;
         
         // Fix for Explicit Weight Conflict:
         // If we ALREADY recalculated baseCalories based on explicit weight (e.g. "120g"),
         // we should NOT apply the `quantity` multiplier again if it was derived from that same weight string.
         // Current `extractQuantity` logic: "120g" -> returns 1.2.
         // If baseCalories was set to (120 * cal/100), it represents 120g.
         // Then `totalCalories = baseCalories * quantity` -> (120g cal) * 1.2 -> Double counting!
         
         let finalQuantity = quantity;
         if (input.match(/(\d+)g/i) || input.match(/(\d+)克/)) {
             // If weight was explicitly handled in the block above, reset quantity to 1 for this calculation
             finalQuantity = 1; 
         }
         
         const totalCalories = Math.round(baseCalories * finalQuantity);
         
         // --- Dynamic Constitution Matrix Logic (PRD 3.0: 2025-02-22 Update) ---
         // Formula: Constitution (Base) + Season (Adj) + Scenario (Weight)
         
         const type = constitutionType;
         const isQuery = /(能|可|该|要)不(能|可|该|要)|(吗|么|？|\?)|(怎么样|好不好)/.test(input);
         
         // 1. Parameter Extraction
         const season = getCurrentSeason(); // 'sanfu', 'summer', etc.
         const baseScoreRaw = BASE_SCORES[type] || 5; // 5-11
         const seasonWeightRaw = SEASONAL_WEIGHTS[type]?.[season] || 0; // 0-3
         const userStatus = parseStatus(input); // e.g., ['tired']
         
         const rules = SCENARIO_RULES[type] || SCENARIO_RULES['平和质'];
         const foodTags = tagFood(input);
         // Merge localResult tags
         if (category) foodTags.push(category);
         if (cookingMethod !== 'raw') foodTags.push(cookingMethod);
         if (localResult.tags) foodTags.push(...localResult.tags);

         // 2. Component Scoring (0-100 Scale)
         
         // A. Constitution Risk Score (Normalized 5-11 -> 45-100)
         const constitutionScore = (baseScoreRaw / 11) * 100;
         
         // B. Season Risk Score (Normalized 0-3 -> 0-100)
         const seasonScore = (seasonWeightRaw / 3) * 100;
         
         // C. Ingredient Risk Score
         const tabooViolation = rules.taboo.filter(t => foodTags.includes(t));
         const isTaboo = tabooViolation.length > 0;
         const isSuitable = rules.suitable.some(s => foodTags.includes(s));
         
         let ingredientScore = 40; // Default Neutral
         if (isTaboo) ingredientScore = 100;
         else if (isSuitable) ingredientScore = 10;
         // Adjust for high oil/sugar if not strictly taboo but generally unhealthy
         else if (foodTags.includes('greasy') || foodTags.includes('highSugar')) ingredientScore = 60;
         
         // D. Status Risk Score
         // If user has negative status (tired, pain, etc.), risk is high
         let statusScore = 20; // Default Low
         if (userStatus.length > 0) statusScore = 90;
         
         // E. Quantity Risk Score (For Record Mode)
         let quantityScore = 20;
         if (totalCalories > 800) quantityScore = 100;
         else if (totalCalories > 500) quantityScore = 60;
         
         // 3. Scenario Weighted Formula
         let finalRiskScore = 0;
         let formulaDesc = "";
         
         if (isQuery) {
             // Formula 1: Inquiry Mode
             // Risk = Ingredient(35%) + Constitution(25%) + Season(25%) + Status(15%)
             finalRiskScore = (ingredientScore * 0.35) + (constitutionScore * 0.25) + (seasonScore * 0.25) + (statusScore * 0.15);
             formulaDesc = "咨询模式 (食材35%+体质25%+时令25%+状态15%)";
         } else {
             // Formula 2: Record Mode
             // Risk = Status(40%) + Quantity(30%) + Constitution(20%) + Season(10%)
             finalRiskScore = (statusScore * 0.40) + (quantityScore * 0.30) + (constitutionScore * 0.20) + (seasonScore * 0.10);
             formulaDesc = "记录模式 (状态40%+食用量30%+体质20%+时令10%)";
         }
         
         console.log(`[Matrix Calculation] ${formulaDesc}: Final Score = ${finalRiskScore.toFixed(1)}`);

         // 4. Output Logic
         let suitability = "基本可以";
         let reason = "符合基础营养需求。";
         let advice = "营养尚可，注意细嚼慢咽。";
         
         if (isQuery) {
             if (finalRiskScore >= 80) {
                 suitability = "严禁食用";
                 reason = `【高危预警】综合风险分 ${finalRiskScore.toFixed(0)} (极高)。${type}体质在此季节/状态下极度敏感。`;
                 advice = rules.inquiry_advice;
                 if (isTaboo) reason += ` 触犯核心禁忌：${tabooViolation.join('/')}。`;
             } else if (finalRiskScore >= 60) {
                 suitability = "不宜食用";
                 reason = `风险分 ${finalRiskScore.toFixed(0)} (偏高)。${seasonWeightRaw > 0 ? '当前时令加重了身体负担。' : '体质匹配度较低。'}`;
                 advice = "建议少吃或不吃，寻找温和的替代品。";
             } else if (finalRiskScore <= 30) {
                 suitability = "推荐";
                 reason = `风险分 ${finalRiskScore.toFixed(0)} (极低)。非常适合您当前的${type}体质。`;
                 advice = "放心享用，有益健康。";
             } else {
                 suitability = "适宜";
                 reason = "风险可控，适量食用无妨。";
                 advice = "可以吃，但不要过量哦。";
             }
         } else {
             // Record Mode
             if (finalRiskScore >= 80) {
                 suitability = "需补救";
                 reason = `【高风险】综合分 ${finalRiskScore.toFixed(0)}。${userStatus.length > 0 ? '身体状态不佳时' : '大量'}摄入此类食物负担过重。`;
                 advice = `【补救方案】${rules.remedy}`;
             } else if (finalRiskScore >= 60) {
                 suitability = "少吃";
                 reason = `风险分 ${finalRiskScore.toFixed(0)}。热量或性质稍有偏差。`;
                 advice = "下顿建议吃得清淡些（如小米粥、烫青菜）。";
             } else if (finalRiskScore <= 30) {
                 suitability = "优选";
                 reason = "这一餐吃得很对！";
                 advice = "坚持这样的饮食习惯，体质会越来越好。";
             }
         }

         return {
             calories: totalCalories,
             nutrients: { 
                 carb: Math.round(totalCalories * 0.5 / 4), 
                 protein: Math.round(totalCalories * 0.2 / 4), 
                 fat: Math.round(totalCalories * 0.3 / 9) 
             },
             suitability,
             reason,
             advice,
             tags: [...new Set([...tags, ...foodTags])] // Deduplicate
         };
     }

     // --- Step 2: Fallback to LLM (Only if Local Failed) ---
     // PRD Requirement: System Prompt must include Cooking Coefficient logic
     console.log("Local Analysis Failed, calling LLM for:", input);
     
     const API_KEY = '1e52c1eb939a43cb9aba66a83ed799ef.zF7gmf1FJ3Ayxzyr'; 
     const ENDPOINT_ID = 'glm-4-flash'; 
     const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

     const systemPrompt = `你是一位专业临床营养师。请分析用户输入的食物：
     
     【硬性规则：烹饪热量法则】
     1. 油炸/天妇罗/裹面：热量系数 x 2.0
     2. 红烧/糖醋/拔丝：热量系数 x 1.4
     3. 火锅(蔬菜类)：热量系数 x 1.5 (吸油)
     4. 爆炒/油煎：热量系数 x 1.3
     
     【核心逻辑：体质矩阵】
     用户体质：${constitutionType}
     
     请参考以下【九体质参数表】进行严格判断：
     - 特禀质：(底分11) 忌发物(海鲜/笋/鹅)/添加剂。换季期高危。
     - 阳虚质：(底分10) 忌生冷/冰饮/油炸/肥腻。三伏/三九天高危。
     - 气虚质：(底分10) 忌耗气(萝卜/山楂)/生冷。春秋换季高危。
     - 阴虚质：(底分9) 忌辛辣/烧烤/羊肉/桂圆。秋季高危。
     - 湿热质：(底分8) 忌酒/甜食/油炸/热带水果。三伏/梅雨高危。
     - 痰湿质：(底分8) 忌肥甘厚味/甜食/糯米。梅雨季高危。
     - 血瘀质：(底分7) 忌寒凉/酸味/柿子/高脂。三九天高危。
     - 气郁质：(底分7) 忌浓茶/咖啡/豆类/红薯。春季高危。
     - 平和质：(底分5) 忌极端生冷/暴饮暴食。
     
     【输出要求】
     1. 综合评估风险分（0-100）。
     2. 如果是询问（如"能吃吗"）：
        - 风险>=80：suitability="严禁食用"，reason="高危预警..."
        - 风险>=60：suitability="不宜食用"
        - 风险<=30：suitability="推荐"
     3. 如果是记录（如"吃了"）：
        - 风险>=80：advice="【补救方案】..." (参考参数表中的补救方案)
     
     请返回JSON: { calories, nutrients: {carb, protein, fat}, suitability, reason, advice, tags }`;

     try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: ENDPOINT_ID,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: input }
                ],
                stream: false
            })
        });
        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);
        
        const text = data.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid JSON format from LLM");
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
     } catch (e) {
        console.error("LLM Analysis Failed:", e);
        
        return {
            calories: 0,
            nutrients: { carb: 0, protein: 0, fat: 0 },
            suitability: "未知",
            reason: "无法识别该食物且网络连接失败。",
            advice: "请检查网络或输入更常见的食物名称。",
            tags: ["未知"]
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
     const API_KEY = '1e52c1eb939a43cb9aba66a83ed799ef.zF7gmf1FJ3Ayxzyr'; 
     const ENDPOINT_ID = 'glm-4-flash'; 
     const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

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

     const systemPrompt = `你是专业中医体质营养师 + 注册营养师，精通：
- 中医九种体质辩证调理（阳虚 / 阴虚 / 气虚 / 痰湿 / 湿热 / 血瘀 / 气郁 / 特禀）
- 现代营养学：热量、蛋白质、碳水、脂肪、膳食纤维、维生素、矿物质
- 膳食搭配：每日≥12 种食材、每周≥25种食材；7 天不重样、精确到克、三餐均衡

【用户档案】
- 每日目标热量：约 ${tdee} kcal
- 中医体质：${constitutionType} (${constitutionDesc})
${allergies ? `- 过敏/忌口：${allergies} (请严格避开这些食材)` : ''}

【规则】
1. 严格按用户记忆的user_profile推荐
2. 禁忌食材绝对不出现
3. 每日总热量匹配用户目标（减脂 / 增肌 / 维持）
4. 输出结构化、清晰、可直接食用

【输出格式】
返回纯JSON格式，包含以下字段：
- date: 日期（YYYY-MM-DD）
- total_calories: 每日总热量
- breakfast: {name, calories, ingredients: [{name, amount}], nutrients: {carbs, protein, fat}, nutrition_points: [], constitution_fit}
- lunch: {name, calories, ingredients: [{name, amount}], nutrients: {carbs, protein, fat}, nutrition_points: [], constitution_fit}
- dinner: {name, calories, ingredients: [{name, amount}], nutrients: {carbs, protein, fat}, nutrition_points: [], constitution_fit}
- daily_summary: {ingredient_count, nutrition_balance, key_benefits: []}
- advice: 建议

严禁输出任何Markdown标记或代码块，只返回纯文本JSON。`;

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
            ...fallbackPlan
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
   * 7. 生成健康周报 (Based on Real Health Data)
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
    
    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    
    // 2. Gather Data from storageService
    let totalCalories = 0;
    let daysRecorded = 0;
    let poopIssues = 0;
    let sleepTotal = 0;
    let sleepDays = 0;
    let exerciseMins = 0;

    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDate(d);
        const logs = storageService.getDailyLogs(dateStr);
        
        // Diet
        if (logs.diet && logs.diet.length > 0) {
            daysRecorded++;
            logs.diet.forEach(item => {
                totalCalories += (item.calories || 0);
            });
        }
        
        // Sleep (Cross-check HEALTH_RECORDS if not in daily logs)
        // PRD 3.2 says sleep is in dailyLogs, but we save to HEALTH_RECORDS
        // Let's check HEALTH_RECORDS for matching date
        const allSleep = storageService.getHealthRecords().sleep || [];
        const sleepForDay = allSleep.find(s => s.timestamp.startsWith(dateStr));
        
        if (sleepForDay) {
            sleepDays++;
            sleepTotal += (parseFloat(sleepForDay.duration) || 0);
        }
        
        // Exercise
        if (logs.exercise && logs.exercise.length > 0) {
            logs.exercise.forEach(ex => exerciseMins += (ex.duration || 0));
        }

        // Poop
        if (logs.poop && logs.poop.length > 0) {
            logs.poop.forEach(p => {
                if (p.issue && p.issue !== '正常') poopIssues++;
            });
        }
    }

    const avgCalories = daysRecorded > 0 ? Math.round(totalCalories / daysRecorded) : 0;
    const avgSleep = sleepDays > 0 ? (sleepTotal / sleepDays).toFixed(1) : 0;
    
    // 3. Generate Summary with LLM
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const systemPrompt = `你是一位专业健康顾问。请根据以下周数据生成一份简短的健康周报（200字以内）。
    
    【本周数据】
    - 饮食记录天数：${daysRecorded}天
    - 平均日摄入热量：${avgCalories} kcal
    - 睡眠记录天数：${sleepDays}天 (平均时长 ${avgSleep}小时)
    - 运动总时长：${exerciseMins} 分钟
    - 排便异常次数：${poopIssues} 次
    
    【要求】
    1. 语气亲切、专业。
    2. 针对数据给出1-2条具体改进建议。
    3. 如果数据很少（如0天），鼓励用户多记录。
    4. 返回HTML格式（无Markdown），使用 <b> 加粗关键指标。
    5. 同时返回一个"关键词"（2-4字，如"自律"、"治愈"）和一组"词云标签"（3-5个词，如"高蛋白"、"坚持运动"）。
    6. 最终输出JSON格式：{ "summary": "...", "keyword": "...", "tags": [{ "text": "...", "weight": 5 }, ...] }`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: ENDPOINT_ID,
                messages: [{ role: "system", content: systemPrompt }],
                stream: false
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        // Parse JSON from LLM
        let result = {};
        try {
             result = JSON.parse(content.replace(/```json|```/g, '').trim());
        } catch (parseError) {
             console.error("Failed to parse LLM JSON:", parseError);
             // Fallback if LLM returns text instead of JSON
             result = {
                 summary: content,
                 keyword: "健康",
                 tags: []
             };
        }

        return {
            success: true,
            summary: result.summary || "暂无详细总结",
            keyword: result.keyword || "生活", // Return keyword
            tags: Array.isArray(result.tags) ? result.tags : [], // Return tags safely
            stats: {
                avgCalories,
                exerciseMins,
                poopIssues,
                avgSleep: parseFloat(avgSleep)
            }
        };

    } catch (e) {
        console.error("Weekly Report Generation Failed:", e);
        return {
            success: false,
            summary: `本周您记录了 <b>${daysRecorded}</b> 天饮食，平均热量 <b>${avgCalories}</b> kcal。继续保持记录习惯，有助于更好地了解身体！`,
            keyword: "坚持",
            tags: [],
            stats: { avgCalories, exerciseMins, poopIssues, avgSleep: parseFloat(avgSleep) }
        };
    }
  },

  /**
   * 14. AI 意图识别 (Intent Classification)
   * 解决关键词匹配精度差的问题
   */
  classifyIntent: async (text) => {
    // 1. Fast Path: Regex for Obvious Commands (Zero Latency)
    if (/^(我要|想)?(记|录)(一下)?(饮食|吃饭|早餐|午餐|晚餐)?$/.test(text.trim()) || text.trim() === '我要记饮食') return { intent: 'diet_record', confidence: 1.0 };
    if (/^(我要|想)?(记|录)(一下)?(睡眠|睡觉)?$/.test(text.trim()) || text.trim() === '我要记睡眠') return { intent: 'sleep_record', confidence: 1.0 };
    if (/^(我要|想)?(记|录)(一下)?(排便|大便|拉屎)?$/.test(text.trim()) || text.trim() === '我要记排便') return { intent: 'poop_record', confidence: 1.0 };
    if (/^(我要|想)?(记|录)(一下)?(经期|月经|大姨妈)?$/.test(text.trim()) || text.trim() === '我要记经期') return { intent: 'period_record', confidence: 1.0 };
    
    // 2. LLM Path (High Precision)
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const systemPrompt = `你是一个意图分类器。请分析用户输入的文本，返回 JSON 格式的意图分类。
    
    【分类标签】
    - diet_record: 记录饮食 (如: "吃了两个苹果", "早饭一碗粥", "喝了杯奶茶")
    - diet_inquiry: 饮食咨询 (如: "阳虚能吃西瓜吗", "这个热量多少", "吃什么好")
    - diet_summary: 饮食复盘 (如: "今天吃了什么", "总结一下饮食", "复盘")
    - sleep_record: 记录睡眠 (如: "昨晚11点睡的", "刚醒", "睡了8小时")
    - poop_record: 记录排便 (如: "拉肚子了", "便秘", "羊屎蛋")
    - period_record: 记录经期 (如: "大姨妈来了", "痛经", "例假结束")
    - status_record: 记录身体状态 (如: "头痛", "很累", "开心", "胃胀")
    - exercise_record: 记录运动 (如: "跑了5公里", "站桩20分钟")
    - chat: 闲聊/其他 (如: "你好", "天气不错", "谢谢", "在吗")

    【输出要求】
    1. 返回纯 JSON: { "intent": "...", "confidence": 0.0-1.0 }
    2. 不要 Markdown。
    3. 只有当用户明确表达“吃了/喝了/睡了”等发生过的动作时，才算 record。如果是“想吃/能吃吗”，算 inquiry。
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: ENDPOINT_ID,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                stream: false
            })
        });
        const data = await response.json();
        const jsonStr = data.choices[0].message.content.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Intent Classification Failed:", e);
        return { intent: 'chat', confidence: 0 }; // Fallback
    }
  },

  /**
   * 14. AI 生成动态洞察
   * @param {Object} userProfile 用户档案
   * @param {Object} dailyData 今日数据
   * @param {Object} weekData 本周数据
   * @returns {Promise<Object>} 生成的洞察内容
   */
  generate_dynamic_insight: async (userProfile, dailyData = {}, weekData = {}) => {
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const constitutionType = userProfile.constitution?.type || '平和质';
    const constitutionDesc = userProfile.constitution?.desc || '';
    const basicInfo = userProfile.basicInfo || {};

    const systemPrompt = `你是专业中医体质营养师 + 注册营养师，精通：
- 中医九种体质辩证调理（阳虚 / 阴虚 / 气虚 / 痰湿 / 湿热 / 血瘀 / 气郁 / 特禀）
- 现代营养学：热量、蛋白质、碳水、脂肪、膳食纤维、维生素、矿物质
- 膳食搭配：每日≥12 种食材、每周≥25种食材；7 天不重样、精确到克、三餐均衡

【用户档案】
- 中医体质：${constitutionType} (${constitutionDesc})
- 基础信息：${basicInfo.gender === 'female' ? '女' : '男'}, ${basicInfo.age || ''}岁

【今日数据】
${JSON.stringify(dailyData, null, 2)}

【本周数据】
${JSON.stringify(weekData, null, 2)}

【规则】
1. 严格按用户体质进行分析
2. 不虚构饮水、疲劳、体态、症状、舌苔、脉象等未记录的信息
3. 所有分析、建议都要和${constitutionType}强绑定
4. 不做医疗诊断、不开药方、不承诺治愈、不使用恐怖化表述
5. 信息输入和输出之间要有围绕体质调理的证据链
6. 数据结论跟科学指标有呼应对比（如：睡眠比较好的是23点前睡觉、睡够7-8小时）

【输出格式】
返回纯JSON格式，包含以下字段：
- today_insight: {
    core_issue: "核心问题（1个）",
    actions: ["立即能改的动作（1-2个）"],
    analysis: "结合体质的分析说明"
  }
- week_insight: {
    long_term_problems: ["最影响体质的长期问题（1-2个）"],
    next_week_goals: ["下周可坚持的小目标（1-2个）"],
    scientific_evidence: "科学依据说明"
  }

严禁输出任何Markdown标记或代码块，只返回纯文本JSON。`;

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
        console.error("Dynamic Insight Generation Error:", e);
        
        // 生成静态fallback数据
        const staticInsight = {
            today_insight: {
                core_issue: "需要结合今日记录进一步分析",
                actions: ["继续保持健康记录", "关注身体感受"],
                analysis: "建议您继续记录健康数据，系统将为您提供更精准的体质分析。"
            },
            week_insight: {
                long_term_problems: ["保持规律的生活习惯", "关注长期健康趋势"],
                next_week_goals: ["坚持健康记录", "保持规律作息"],
                scientific_evidence: "规律的生活习惯和持续的健康记录是改善体质的基础。"
            }
        };
        
        // 根据体质微调
        switch (constitutionType) {
            case '气虚质':
                staticInsight.today_insight.core_issue = "气虚体质需要注意能量补充";
                staticInsight.today_insight.actions = ["适当增加优质蛋白质摄入", "避免过度劳累"];
                staticInsight.today_insight.analysis = "气虚体质需要补气养身，建议适当增加营养摄入，避免过度消耗体力。";
                break;
            case '阳虚质':
                staticInsight.today_insight.core_issue = "阳虚体质需要注意保暖";
                staticInsight.today_insight.actions = ["避免生冷食物", "注意身体保暖"];
                staticInsight.today_insight.analysis = "阳虚体质需要温补阳气，建议避免生冷，注意保暖。";
                break;
            case '阴虚质':
                staticInsight.today_insight.core_issue = "阴虚体质需要注意滋阴";
                staticInsight.today_insight.actions = ["多喝水补充水分", "避免辛辣刺激食物"];
                staticInsight.today_insight.analysis = "阴虚体质需要滋阴润燥，建议多喝水，避免辛辣刺激食物。";
                break;
            default:
                break;
        }
        
        return staticInsight;
    }
  }
};
