export const intentService = {
  async classifyIntent(input) {
    const text = input.trim();
    
    if (!text) return { intent: 'unknown', hasPortion: false, foodName: null, portion: null };
    
    const API_KEY = 'dad8fc14-6dac-40f8-8ade-599d60a53336'; 
    const ENDPOINT_ID = 'ep-20250218143825-9k28d';
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    
    const systemPrompt = `你是一位专业的意图分类助手。请分析用户的输入，判断是记录意图还是聊天意图。

【定义】
- record_intent（记录意图）：用户明确告知已经摄入了食物/饮品，需要记录下来。特征词：吃了、喝了、记录、我吃了、我喝了等明确表达已经完成的动作。
- chat_intent（聊天/咨询意图）：用户在询问、咨询、闲聊，或者表达想要/打算吃什么，但还没有实际摄入。特征词：能吃吗、可以吃吗、吃什么、推荐、建议、好吃吗、怎么做、想喝、想吃、今天吃什么等。

【输出要求】
返回纯JSON格式，包含以下字段：
- intent: "record_intent" | "chat_intent"
- foodName: 识别到的食物名称（如果有）
- portion: 识别到的份量（如果有，如"200g"、"一碗"、"一个"）
- hasPortion: 是否有份量信息（true/false）

【示例】
输入："我吃了一碗米饭" → {"intent":"record_intent","foodName":"米饭","portion":"一碗","hasPortion":true}
输入："今天能吃冰淇淋吗" → {"intent":"chat_intent","foodName":"冰淇淋","portion":null,"hasPortion":false}
输入："喝了一杯牛奶" → {"intent":"record_intent","foodName":"牛奶","portion":"一杯","hasPortion":true}
输入："推荐一下今天吃什么" → {"intent":"chat_intent","foodName":null,"portion":null,"hasPortion":false}
输入："麻辣香锅好吃吗" → {"intent":"chat_intent","foodName":"麻辣香锅","portion":null,"hasPortion":false}`;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: ENDPOINT_ID,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const content = data.choices[0].message.content;
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(jsonStr);
      
      return {
        intent: result.intent || 'chat_intent',
        hasPortion: result.hasPortion || false,
        foodName: result.foodName || null,
        portion: result.portion || null
      };
      
    } catch (e) {
      console.error("LLM Intent Classification Failed, falling back to rules:", e);
      
      return this.fallbackClassifyIntent(input);
    }
  },
  
  fallbackClassifyIntent(input) {
    const text = input.trim().toLowerCase();
    
    if (!text) return { intent: 'unknown', hasPortion: false, foodName: null, portion: null };
    
    const RECORD_KEYWORDS = [
      '吃了', '喝了', '记录', '记一下', '我吃了', '我喝了',
      '早餐', '午餐', '晚餐', '早饭', '中饭', '晚饭',
      '摄入', '食用', '饮用', '吃了一碗', '喝了一杯',
      '中午吃了', '晚上吃了', '早上吃了', '下午吃了',
      '吃了个', '吃了块', '吃了片', '吃了根', '喝了瓶',
      '记录一下', '帮我记', '记录饮食', '记一下饮食'
    ];
    
    const CHAT_INDICATORS = [
      '好吃吗', '怎么做', '怎么吃', '吃什么', '喝什么',
      '推荐', '建议', '应该', '可以吗', '好不好',
      '怎么样', '行吗', '能吃吗', '能喝吗',
      '好饱', '吃饱了', '吃撑了', '吃得好',
      '想吃', '想喝', '想要', '要不要',
      '今天吃', '今天喝', '明天吃', '明天喝',
      '麻辣香锅好吃', '火锅好吃', '烧烤好吃',
      '吗', '呢', '吧', '啊', '？', '?'
    ];
    
    const FOOD_KEYWORDS = [
      '米饭', '面条', '馒头', '包子', '饺子', '馄饨',
      '牛肉', '猪肉', '鸡肉', '鱼肉', '羊肉', '虾',
      '蔬菜', '青菜', '白菜', '萝卜', '土豆', '西红柿',
      '水果', '苹果', '香蕉', '橙子', '西瓜', '葡萄',
      '牛奶', '豆浆', '咖啡', '茶', '奶茶', '可乐',
      '鸡蛋', '豆腐', '香菇', '木耳', '海带', '紫菜',
      '粥', '汤', '饭', '面', '饼', '糕',
      '麻辣烫', '火锅', '烧烤', '炒菜', '炖菜', '蒸菜',
      '麻辣香锅', '酸菜鱼', '红烧肉', '宫保鸡丁', '鱼香肉丝'
    ];
    
    const PORTION_PATTERNS = [
      /(\d+)\s*g/i,
      /(\d+)\s*克/i,
      /(\d+)\s*ml/i,
      /(\d+)\s*毫升/i,
      /(\d+)\s*个/i,
      /(\d+)\s*碗/i,
      /(\d+)\s*盘/i,
      /(\d+)\s*杯/i,
      /(\d+)\s*瓶/i,
      /(\d+)\s*片/i,
      /(\d+)\s*块/i,
      /(\d+)\s*根/i,
      /(\d+)\s*条/i,
      /一小碗|一大碗|一小盘|一大盘|一小杯|一大杯/i
    ];
    
    const hasRecordKeyword = RECORD_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
    const hasFoodKeyword = FOOD_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
    const hasChatIndicator = CHAT_INDICATORS.some(keyword => text.includes(keyword.toLowerCase()));
    
    const portionMatch = this.extractPortion(input, PORTION_PATTERNS);
    const foodName = this.extractFoodName(input, FOOD_KEYWORDS, RECORD_KEYWORDS);
    
    if (hasRecordKeyword && hasFoodKeyword && !hasChatIndicator) {
      return {
        intent: 'record_intent',
        hasPortion: !!portionMatch,
        foodName: foodName,
        portion: portionMatch
      };
    }
    
    if (hasFoodKeyword && !hasChatIndicator) {
      return {
        intent: 'record_intent',
        hasPortion: !!portionMatch,
        foodName: foodName,
        portion: portionMatch
      };
    }
    
    return {
      intent: 'chat_intent',
      hasPortion: false,
      foodName: null,
      portion: null
    };
  },
  
  extractPortion(input, patterns) {
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  },
  
  extractFoodName(input, foodKeywords, recordKeywords) {
    const text = input.trim();
    
    for (const keyword of foodKeywords) {
      if (text.includes(keyword)) {
        return keyword;
      }
    }
    
    for (const recordKeyword of recordKeywords) {
      if (text.includes(recordKeyword)) {
        const parts = text.split(recordKeyword);
        if (parts.length > 1) {
          const afterKeyword = parts[1].trim();
          if (afterKeyword.length > 0) {
            const firstPart = afterKeyword.split(/[，。！？,.!?]/)[0].trim();
            if (firstPart.length > 0) {
              return firstPart;
            }
          }
        }
      }
    }
    
    return text;
  }
};
