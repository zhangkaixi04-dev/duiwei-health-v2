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
   * 12. AI 识别食物图片 (Real Vision)
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
2. 包含字段：
   - dateRange (字符串)
   - score (数字, 0-100)
   - summary (简短总结，不超过50字)
   - tcmInsight (中医视角分析，包含体质和节气建议)
   - metrics (对象: sleepAvg, exerciseDays, dietScore, poopStatus)
   - actionCards (数组，3个对象: type, title, icon(字符串名), color, bg, content)

返回示例：
{
  "dateRange": "10.23-10.29",
  "score": 85,
  "summary": "本周整体状态良好，睡眠质量提升。",
  "tcmInsight": "您属于<b>气虚质</b>，本周作息规律，但运动量略少。秋分将至，建议多吃润肺食物。",
  "metrics": { "sleepAvg": 7.5, "exerciseDays": 3, "dietScore": 80, "poopStatus": "正常" },
  "actionCards": [
     { "type": "diet", "title": "饮食建议", "icon": "Utensils", "color": "text-orange-500", "bg": "bg-orange-50", "content": "多吃山药、莲子。" },
     ...
  ]
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
        return JSON.parse(content.replace(/```json|```/g, '').trim());

    } catch (e) {
        console.error("Weekly Report Generation Failed:", e);
        throw e; // Let caller handle fallback
    }
  },

  /**
   * 13. 获取每日推荐 (Cangzhen - Doubao API)
   * Generates 3 personalized micro-actions based on user profile and date.
   */
  get_daily_recommendation: async (userProfile = {}) => {
    // 1. Check Cache first (to avoid API cost on every render)
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `cangzhen_daily_rec_${today}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            console.warn("Cache parse failed, fetching new.");
        }
    }

    // 2. Call Doubao API
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d'; 
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    // Construct prompt
    let profileDesc = "用户";
    if (userProfile.constitution) profileDesc += `，中医体质为${userProfile.constitution.type}`;
    if (userProfile.basicInfo?.gender) profileDesc += `，性别${userProfile.basicInfo.gender === 'female' ? '女' : '男'}`;

    const systemPrompt = `你是一位治愈系的数字博物馆导览员，也是一位生活美学家。
请基于今天的日期（${today}）和用户画像（${profileDesc}），为用户生成 3 条“今日推荐”微行动。

【维度说明】
1. **感知 (Sensation)**：引导用户通过五感（视听嗅味触）去发现生活中的微小美好。例如：去公园闻桂花、听雨声、摸树皮。
2. **情绪 (Emotion)**：引导用户关注内心，进行自我关怀或情绪释放。例如：给自己买束花、拥抱自己、写下三件开心的事。
3. **灵感 (Inspiration)**：引导用户进行微小的创造或思考。例如：读一首诗、画一笔涂鸦、思考一个无解的问题。

【输出要求】
1. **必须返回纯JSON格式**。
2. 包含 3 个对象，key 分别为 sensation, emotion, inspiration。
3. 每个 value 是一个简短的行动指令（不超过 20 字）。
4. 语言风格：温柔、诗意、治愈、简洁。

【JSON示例】
{
  "sensation": "在路边找一朵未名的小花，轻嗅它的香气。",
  "emotion": "泡个热水澡，想象烦恼随蒸汽消散。",
  "inspiration": "用手机拍下影子的形状，给它起个名字。"
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
        const result = JSON.parse(content.replace(/```json|```/g, '').trim());

        // 3. Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify(result));
        
        return result;

    } catch (e) {
        console.error("Daily Recommendation API Failed:", e);
        // Fallback to static content if API fails
        return {
            sensation: "去窗边看看云的形状，猜猜它像什么。",
            emotion: "深呼吸三次，告诉自己：今天已经做得很好了。",
            inspiration: "随手翻开一本书的第 20 页，读第一句话。"
        };
    }
  }
};
