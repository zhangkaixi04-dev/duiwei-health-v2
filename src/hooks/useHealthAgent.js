import { useState, useRef, useEffect } from 'react';
import { agentCore } from '../services/agentCore.js';

export const useHealthAgent = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [agent, setAgent] = useState(null);
  const agentRef = useRef(null);

  useEffect(() => {
    const newAgent = agentCore.createAgent();
    agentRef.current = newAgent;
    setAgent(newAgent);
  }, []);

  const processMessage = async (userMessage) => {
    if (!agentRef.current) {
      return {
        type: 'text',
        content: '抱歉，智能体还未初始化，请稍候...'
      };
    }

    setIsTyping(true);

    try {
      const result = await agentRef.current.processWithTools(userMessage);
      setIsTyping(false);
      return result;
    } catch (error) {
      console.error('Agent error:', error);
      setIsTyping(false);
      return {
        type: 'text',
        content: '抱歉，我刚刚走神了。您能再说一遍吗？'
      };
    }
  };

  const clearMemory = () => {
    if (agentRef.current) {
      agentRef.current.clearMemory();
    }
  };

  const getAgentContext = () => {
    if (agentRef.current) {
      return agentRef.current.memory.getContext();
    }
    return null;
  };

  return {
    processMessage,
    isTyping,
    clearMemory,
    getAgentContext,
    agent
  };
};
