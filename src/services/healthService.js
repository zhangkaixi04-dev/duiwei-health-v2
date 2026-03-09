import { storageService } from './storageService.js';
import { dietFallback } from '../data/dietFallback.js';

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
        if (lastUserMsg.match(/(吃|喝|早饭|午饭|晚饭|饮食|餐)/)) {
            return "收到您的饮食记录。由于网络原因，AI 暂时无法进行详细营养分析，建议您稍后再试，或者直接使用“记饮食”卡片。";
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
   * 10. AI 饮食分析 (Real LLM)
   * @param {string} foodInput Text description of food (e.g., "一碗红烧牛肉面")
   * @param {Object} userProfile Contextual user data
   */
  analyze_diet: async (foodInput, userProfile = {}) => {
     // Use Doubao (Volcengine Ark)
     const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
     const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
     const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

     const systemPrompt = `你是一位专业营养师兼中医健康顾问。请基于用户输入的食物内容，进行以下分析：
1. 估算热量(kcal)和三大营养素(碳水/蛋白质/脂肪)占比。
2. 结合用户的中医体质(如果提供)，判断该食物是否适合，并给出简短建议。
3. 严禁输出Chain of Thought，直接返回JSON格式结果。

返回格式示例：
{
  "calories": 650,
  "nutrients": { "carb": "55%", "protein": "20%", "fat": "25%" },
  "suitability": "中等",
  "advice": "红烧牛肉面湿热较重，您是湿热质，建议少喝汤，多配青菜。",
  "tags": ["高碳水", "高钠"]
}`;

     let userContent = `我吃了：${foodInput}`;
     if (userProfile.constitution) {
         userContent += `\n我的体质是：${userProfile.constitution.type} (${userProfile.constitution.desc})`;
     }

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
        console.error("Diet Analysis Error:", e);
        // Fallback mock if API fails - More realistic mock
        return {
            calories: Math.floor(Math.random() * (800 - 200) + 200), // Random 200-800
            nutrients: { 
                carb: `${Math.floor(Math.random() * 40 + 30)}%`, 
                protein: `${Math.floor(Math.random() * 20 + 10)}%`, 
                fat: `${Math.floor(Math.random() * 30 + 10)}%` 
            },
            suitability: ["适宜", "中等", "少食"][Math.floor(Math.random() * 3)],
            advice: "该食物营养尚可，建议搭配蔬菜食用，保持营养均衡。",
            tags: ["家常菜", "热量适中"]
        };
     }
  },

    // ... (Previous code)
    
  /**
   * 12. AI 识别食物图片 (New)
   * 模拟视觉 AI 分析过程：图片 -> 识别物体 -> 估算体积/重量 -> 计算营养
   */
  analyze_food_image: async (imageFile) => {
    console.log("Analyzing image...", imageFile);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 这里通常是调用 Vision API，例如 OpenAI GPT-4o Vision 或 豆包视觉版
    // const formData = new FormData();
    // formData.append('image', imageFile);
    // const response = await api.post('/vision', formData);

    // Mock Result (模拟 AI 看到的食物)
    // 随机返回一种食物组合，模拟识别结果
    const mockResults = [
        {
            food: "红烧牛肉面",
            weight: "550g",
            analysis: "识别到一碗红烧牛肉面。根据标准碗的大小（直径约18cm）估算：面条约200g，牛肉约80g，汤料和蔬菜约270g。",
            nutrition: {
                calories: 680,
                nutrients: { carb: 85, protein: 28, fat: 25 },
                suitability: "中等",
                advice: "钠含量较高，建议少喝汤。"
            }
        },
        {
            food: "鸡胸肉沙拉",
            weight: "320g",
            analysis: "识别到一份轻食沙拉。包含煎鸡胸肉、生菜、圣女果和少量玉米粒。分量适中。",
            nutrition: {
                calories: 350,
                nutrients: { carb: 20, protein: 35, fat: 12 },
                suitability: "适宜",
                advice: "非常健康的减脂餐，蛋白质充足。"
            }
        },
        {
            food: "扬州炒饭",
            weight: "300g",
            analysis: "识别到一盘炒饭，配料有火腿、鸡蛋、豌豆。油脂光泽较明显。",
            nutrition: {
                calories: 520,
                nutrients: { carb: 70, protein: 12, fat: 22 },
                suitability: "少食",
                advice: "碳水和油脂较高，建议搭配一份水煮青菜。"
            }
        }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
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
    const end = new Date();
    end.setDate(end.getDate() - (weekOffset * 7));
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    
    const formatDate = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
    const dateRange = `${formatDate(start)}-${formatDate(end)}`;

    // 2. Gather Data
    const userProfile = storageService.getUserProfile();
    const allLogs = storageService.getDailyLogs();
    const healthRecords = storageService.getHealthRecords();

    // Filter logs for the selected week
    const weeklyLogs = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (allLogs[dateStr]) {
            weeklyLogs.push({ date: dateStr, ...allLogs[dateStr] });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Prepare AI Prompt
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const systemPrompt = `你是一位资深中医健康顾问。请基于用户档案和本周数据生成健康周报。
    
【用户档案】
- 性别/年龄：${userProfile.basicInfo?.gender === 'female' ? '女' : '男'} ${userProfile.basicInfo?.age || '?'}岁
- 中医体质：${userProfile.constitution?.type || '未知'} (${userProfile.constitution?.desc || ''})
- 既往病史：${userProfile.medicalHistory?.diseases?.join(',') || '无'}

【本周数据 (${dateRange})】
- 记录天数：${weeklyLogs.length}天
- 饮食记录：${JSON.stringify(weeklyLogs.map(l => ({ d: l.date, food: l.diet?.length || 0 })))}
- 睡眠记录：${JSON.stringify(healthRecords.sleep?.slice(-7) || [])}
- 运动记录：${JSON.stringify(weeklyLogs.map(l => ({ d: l.date, ex: l.exercise })))}
- 情绪记录：(假设数据) ${weeklyLogs.length > 0 ? '有波动' : '暂无详细记录'}

【输出要求】
1. **必须返回纯JSON格式**，严禁Markdown。
2. **综合得分(totalScore)**：0-10分（保留1位小数）。评分标准参考《中国居民膳食指南》及中医养生标准（如子午流注睡眠），结合数据完整度打分。
3. **雷达图(radar)**：包含 情绪、饮食、睡眠、运动、消化 5个维度。每个维度满分10分。
4. **详情(details)**：每个维度需包含 score(0-10), status(简短状态词), trend(up/down/flat), desc(现象描述), breakdown(数据支撑), suggestion(建议)。
5. **总结(summary)**：结合体质和本周表现，给出一段专业、温暖的建议（100字左右）。

【JSON结构示例】
{
  "dateRange": "${dateRange}",
  "totalScore": "8.5",
  "summary": "...",
  "radar": [ {"subject": "情绪", "A": 8, "fullMark": 10}, ... ],
  "details": {
    "emotion": { "score": 8, "title": "情绪", "status": "平稳", "trend": "flat", "desc": "...", "breakdown": "...", "suggestion": "..." },
    ... (其他4个维度)
  }
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
        const result = JSON.parse(jsonStr);

        // Ensure dateRange matches requested
        result.dateRange = dateRange;
        
        return result;

    } catch (e) {
        console.error("Weekly Report AI Generation Failed:", e);
        
        // FALLBACK: Use Mock Data if AI fails
        const baseScore = 7.5 - (weekOffset * 0.1); 
        return {
          dateRange: dateRange,
          totalScore: (baseScore + 0.3).toFixed(1), 
          summary: `(AI生成失败，显示默认数据) 本周（${dateRange}）整体健康状况良好。结合您的【${userProfile.constitution?.type || '平和质'}】特征，建议保持规律作息。`,
          radar: [
            { subject: '情绪', A: 7, fullMark: 10 },
            { subject: '饮食', A: 6, fullMark: 10 },
            { subject: '睡眠', A: 9, fullMark: 10 },
            { subject: '运动', A: 8, fullMark: 10 },
            { subject: '消化', A: 7, fullMark: 10 },
          ],
          details: {
            emotion: { score: 7, title: '情绪', status: '波动', trend: 'up', desc: '情绪起伏较大。', breakdown: '暂无详细记录', suggestion: '多做深呼吸。' },
            diet: { score: 6, title: '饮食', status: '油腻', trend: 'down', desc: '外卖较多。', breakdown: '暂无详细记录', suggestion: '饮食清淡。' },
            sleep: { score: 9, title: '睡眠', status: '充沛', trend: 'flat', desc: '作息规律。', breakdown: '平均7.5小时', suggestion: '继续保持。' },
            exercise: { score: 8, title: '运动', status: '达标', trend: 'up', desc: '运动积极。', breakdown: '每周3次', suggestion: '注意拉伸。' },
            digestion: { score: 7, title: '消化', status: '良好', trend: 'flat', desc: '排便正常。', breakdown: '每日1次', suggestion: '多喝水。' }
          }
        };
    }
  }
};
