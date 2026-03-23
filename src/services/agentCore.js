import { healthService } from './healthService.js';
import { scoringService } from './scoringService.js';
import { storageService } from './storageService.js';

const TOOLS = [
  {
    name: 'get_user_profile',
    description: '获取用户的健康档案，包括体质类型、年龄、身高等基本信息',
    parameters: {},
    execute: async () => {
      const profile = storageService.getUserProfile();
      return {
        success: true,
        data: profile || {}
      };
    }
  },
  {
    name: 'get_health_score',
    description: '获取用户的健康评分数据，包括各模块得分和每日趋势',
    parameters: {
      weekOffset: {
        type: 'number',
        description: '周偏移量，0表示本周，-1表示上周，以此类推',
        default: 0
      }
    },
    execute: async (params = {}) => {
      try {
        const scoreData = scoringService.calculateWeeklyScore(params.weekOffset || 0);
        return {
          success: true,
          data: scoreData
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  },
  {
    name: 'analyze_diet',
    description: '分析用户摄入的食物，提供营养和体质适配建议',
    parameters: {
      foodInput: {
        type: 'string',
        description: '食物描述，如"吃了一碗牛肉面"',
        required: true
      }
    },
    execute: async (params) => {
      try {
        const userProfile = storageService.getUserProfile() || {};
        const analysis = await healthService.analyze_diet(params.foodInput, userProfile);
        return {
          success: true,
          data: analysis
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  },
  {
    name: 'get_daily_logs',
    description: '获取用户某日的健康记录数据',
    parameters: {
      date: {
        type: 'string',
        description: '日期，格式为YYYY-MM-DD，默认为今天',
        default: new Date().toISOString().split('T')[0]
      }
    },
    execute: async (params = {}) => {
      try {
        const date = params.date || new Date().toISOString().split('T')[0];
        const logs = storageService.getDailyLogs(date);
        return {
          success: true,
          data: logs
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  },
  {
    name: 'search_food',
    description: '在食物库中搜索食物信息',
    parameters: {
      keyword: {
        type: 'string',
        description: '搜索关键词',
        required: true
      }
    },
    execute: async (params) => {
      try {
        const { findFood } = await import('../data/foodLibrary.js');
        const result = findFood(params.keyword);
        return {
          success: true,
          data: result || null
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
];

class AgentMemory {
  constructor() {
    this.conversationHistory = [];
    this.userProfile = null;
    this.toolResults = [];
    this.maxHistoryLength = 20;
  }

  addMessage(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });

    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  addToolResult(toolName, result) {
    this.toolResults.push({
      toolName,
      result,
      timestamp: Date.now()
    });
  }

  loadUserProfile() {
    this.userProfile = storageService.getUserProfile();
    return this.userProfile;
  }

  getContext() {
    return {
      conversationHistory: this.conversationHistory,
      userProfile: this.userProfile,
      recentToolResults: this.toolResults.slice(-5)
    };
  }

  clear() {
    this.conversationHistory = [];
    this.toolResults = [];
  }
}

class HealthAgent {
  constructor() {
    this.memory = new AgentMemory();
    this.tools = TOOLS;
  }

  getToolsDescription() {
    return this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }

  async executeTool(toolName, params = {}) {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      return {
        success: false,
        error: `工具 ${toolName} 不存在`
      };
    }

    try {
      const result = await tool.execute(params);
      this.memory.addToolResult(toolName, result);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildSystemPrompt(context) {
    const { userProfile, conversationHistory, recentToolResults } = context;
    
    let systemPrompt = `你是一位专业、严谨的中医健康顾问"合拍"。

【核心定位】
- 你是一个智能健康助手，能够主动使用工具获取信息
- 你的语言风格客观、理性、专业，避免使用过于亲昵的称呼
- 结合中医体质理论和现代营养学，提供个性化健康建议

【可用工具】
${JSON.stringify(this.getToolsDescription(), null, 2)}

【工具使用规则】
1. 如果需要了解用户的健康档案，先调用 get_user_profile
2. 如果需要分析健康评分，调用 get_health_score
3. 如果用户提到饮食，先判断是否需要调用 analyze_diet
4. 不要重复调用相同的工具，除非有新的信息
5. 工具调用失败时，使用已知信息继续对话，不要让用户知道工具调用失败了

【回复要求】
1. 先思考需要什么信息，决定是否调用工具
2. 直接回复用户，不要暴露思考过程
3. 回复必须简短精炼，不要长篇大论
4. 如果用户涉及严重医疗问题，请建议就医
5. 禁止医疗诊断、开药方、承诺治愈

`;

    if (userProfile && Object.keys(userProfile).length > 0) {
      systemPrompt += `\n【当前用户档案】：\n`;
      if (userProfile.gender && userProfile.age) systemPrompt += `- 基础信息：${userProfile.gender === 'female' ? '女' : '男'}, ${userProfile.age}岁\n`;
      if (userProfile.constitution) systemPrompt += `- 中医体质：${userProfile.constitution.type} (${userProfile.constitution.desc})\n`;
      if (userProfile.sleepTime) systemPrompt += `- 平时作息：${userProfile.sleepTime} 入睡\n`;
    }

    if (recentToolResults.length > 0) {
      systemPrompt += `\n【最近工具调用结果】：\n`;
      recentToolResults.forEach((result, idx) => {
        systemPrompt += `${idx + 1}. ${result.toolName}: ${JSON.stringify(result.result).substring(0, 200)}...\n`;
      });
    }

    return systemPrompt;
  }

  async process(userMessage) {
    this.memory.loadUserProfile();
    this.memory.addMessage('user', userMessage);

    const context = this.memory.getContext();

    const chatMessages = context.conversationHistory.map(msg => ({
      sender: msg.role === 'assistant' ? 'ai' : 'user',
      text: msg.content
    }));

    try {
      const response = await healthService.chat(
        chatMessages,
        context.userProfile || {}
      );

      this.memory.addMessage('assistant', response);
      return {
        type: 'text',
        content: response
      };
    } catch (error) {
      console.error('Agent processing error:', error);
      const fallbackResponse = '抱歉，我刚刚走神了。您能再说一遍吗？';
      this.memory.addMessage('assistant', fallbackResponse);
      return {
        type: 'text',
        content: fallbackResponse
      };
    }
  }

  async processWithTools(userMessage) {
    this.memory.loadUserProfile();
    this.memory.addMessage('user', userMessage);

    const context = this.memory.getContext();
    const intent = this.analyzeIntent(userMessage);

    let toolResults = [];

    if (intent.needsProfile && !context.userProfile) {
      const result = await this.executeTool('get_user_profile');
      if (result.success) {
        toolResults.push(result);
      }
    }

    if (intent.needsScore) {
      const result = await this.executeTool('get_health_score');
      if (result.success) {
        toolResults.push(result);
      }
    }

    if (intent.needsDietAnalysis) {
      const result = await this.executeTool('analyze_diet', { foodInput: userMessage });
      if (result.success) {
        toolResults.push(result);
      }
    }

    const chatMessages = context.conversationHistory.map(msg => ({
      sender: msg.role === 'assistant' ? 'ai' : 'user',
      text: msg.content
    }));

    try {
      const response = await healthService.chat(
        chatMessages,
        context.userProfile || {}
      );

      this.memory.addMessage('assistant', response);
      return {
        type: 'text',
        content: response,
        toolResults
      };
    } catch (error) {
      console.error('Agent processing error:', error);
      const fallbackResponse = '抱歉，我刚刚走神了。您能再说一遍吗？';
      this.memory.addMessage('assistant', fallbackResponse);
      return {
        type: 'text',
        content: fallbackResponse,
        toolResults
      };
    }
  }

  analyzeIntent(message) {
    const lowerMsg = message.toLowerCase();
    return {
      needsProfile: lowerMsg.includes('体质') || lowerMsg.includes('档案') || lowerMsg.includes('我的'),
      needsScore: lowerMsg.includes('评分') || lowerMsg.includes('得分') || lowerMsg.includes('健康分') || lowerMsg.includes('周报') || lowerMsg.includes('总结'),
      needsDietAnalysis: lowerMsg.includes('吃了') || lowerMsg.includes('喝了') || lowerMsg.includes('饮食') || lowerMsg.includes('能吃') || lowerMsg.includes('可以吃'),
      needsSearch: lowerMsg.includes('什么') || lowerMsg.includes('怎么') || lowerMsg.includes('查询') || lowerMsg.includes('搜索')
    };
  }

  clearMemory() {
    this.memory.clear();
  }
}

export const agentCore = {
  HealthAgent,
  AgentMemory,
  TOOLS,
  createAgent: () => new HealthAgent()
};
