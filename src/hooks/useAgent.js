import { useState, useEffect } from 'react';

// Mock Knowledge Base
const TCM_TIPS = {
  'sleep_bad': ['睡前泡脚20分钟，水温40度左右，有助于引火归元。', '可以尝试按揉“神门穴”和“三阴交”，每侧3分钟。', '晚餐少吃点，避免“胃不和则卧不安”。'],
  'digestion_bad': ['顺时针揉腹50下，促进肠道蠕动。', '建议喝点陈皮普洱茶，理气健脾。', '最近少吃生冷瓜果，多吃温热易消化的食物。'],
  'period_pain': ['注意保暖，贴个暖宝宝在小腹。', '喝点红糖姜茶，活血化瘀。', '如果疼痛难忍，建议及时就医哦。'],
  'energy_low': ['可能是气虚了，可以煮点黄芪枸杞水喝。', '中午小憩20分钟，给身体充电。', '避免剧烈运动，适合做八段锦养养气。']
};

export const useAgent = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [memory, setMemory] = useState(null);

  // Load Memory on Init
  useEffect(() => {
    const savedProfile = localStorage.getItem('duiwei_user_profile');
    if (savedProfile) {
      setMemory(JSON.parse(savedProfile));
    }
  }, []);

  const processMessage = async (text) => {
    setIsTyping(true);
    
    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let response = { text: '', type: 'text', data: null };

    try {
      // 1. Compliance Guardrails (First Line of Defense)
      if (text.match(/(药|处方|治疗|治好|病|医生|医院|手术|检查|诊断)/)) {
        if (!text.match(/(中药|山药|红药水)/)) { // Whitelist common food/safe terms
           response.text = '这部分涉及医疗诊断，合拍 AI 无法为您判断。建议您及时前往医院咨询专业医生哦。👩‍⚕️';
           setIsTyping(false);
           return response;
        }
      }

      // 2. Intent Recognition
      
      // --- DIET ---
      if (text.match(/(吃|喝|饭|面|肉|菜|餐|饿|饱)/)) {
        // Save to LocalStorage
        const record = { id: Date.now(), date: new Date().toISOString(), text };
        const history = JSON.parse(localStorage.getItem('hepai_diet_records') || '[]');
        localStorage.setItem('hepai_diet_records', JSON.stringify([...history, record]));
        
        response.text = `已为您记录饮食。😋\n记得细嚼慢咽，不仅有助于消化，还能让身体更好地吸收营养。`;
      }
      
      // --- SLEEP ---
      else if (text.match(/(睡|醒|梦|熬夜|早起)/)) {
        const record = { id: Date.now(), date: new Date().toISOString(), text };
        const history = JSON.parse(localStorage.getItem('hepai_sleep_records') || '[]');
        localStorage.setItem('hepai_sleep_records', JSON.stringify([...history, record]));

        if (text.includes('不好') || text.includes('失眠') || text.includes('多梦')) {
           response.text = `抱抱你，没睡好真的很辛苦。🌙\n${TCM_TIPS['sleep_bad'][Math.floor(Math.random() * TCM_TIPS['sleep_bad'].length)]}`;
        } else {
           response.text = '收到睡眠记录。拥有好睡眠是健康的第一步，继续保持哦！💤';
        }
      }

      // --- POOP ---
      else if (text.match(/(便|拉|厕所|排泄)/)) {
        const record = { id: Date.now(), date: new Date().toISOString(), text };
        const history = JSON.parse(localStorage.getItem('hepai_bowel_records') || '[]');
        localStorage.setItem('hepai_bowel_records', JSON.stringify([...history, record]));

        if (text.includes('难') || text.includes('干') || text.includes('秘')) {
          response.text = `听起来有点便秘呢。\n${TCM_TIPS['digestion_bad'][0]}`;
        } else {
          response.text = '已记录排便情况。肠道通畅，气色才会好！🚽';
        }
      }

      // --- PERIOD ---
      else if (text.match(/(姨妈|经|例假|血)/)) {
        const record = { id: Date.now(), date: new Date().toISOString(), text };
        const history = JSON.parse(localStorage.getItem('hepai_period_records') || '[]');
        localStorage.setItem('hepai_period_records', JSON.stringify([...history, record]));

        if (text.includes('痛') || text.includes('疼')) {
          response.text = `心疼你。生理期不舒服的话：\n${TCM_TIPS['period_pain'][0]}\n如果实在难受，一定要休息哦。`;
        } else {
          response.text = '已记录生理期。特殊时期，对自己好一点，多喝热水不是敷衍哦~ 🍵';
        }
      }

      // --- STATUS / FEELING ---
      else if (text.match(/(累|烦|开心|难过|焦虑|痛|晕|冷|热)/)) {
         if (text.includes('累') || text.includes('乏')) {
            response.text = `感到疲惫是身体在求救。\n${TCM_TIPS['energy_low'][Math.floor(Math.random() * TCM_TIPS['energy_low'].length)]}`;
         } else if (text.includes('烦') || text.includes('焦虑')) {
            response.text = '深呼吸... 试着闭上眼睛，专注于呼吸 1 分钟。情绪是流动的能量，让它慢慢流走。🍃';
         } else {
            response.text = '我听到了您的感受。如果不舒服持续存在，请一定重视。';
         }
      }

      // --- WEEKLY REPORT TRIGGER ---
      else if (text.includes('周报') || text.includes('总结')) {
         response.type = 'report_card';
         response.text = '为您生成了本周健康周报，请查收。';
         // In real app, we would calculate stats here
         response.data = {
           title: '本周健康周报',
           score: 85,
           summary: '本周作息规律，饮食均衡。但运动量略有不足，建议周末去爬爬山哦。',
           stats: [
             { label: '平均睡眠', value: '7.2h' },
             { label: '运动达标', value: '3/7天' },
             { label: '心情指数', value: '不错' }
           ]
         };
      }

      // --- CHITCHAT ---
      else {
        const greetings = [
          '我在呢，随时听您倾诉。',
          '今天过得怎么样？',
          '我在，您可以告诉我今天的饮食或身体感受。',
          '我在听。'
        ];
        response.text = greetings[Math.floor(Math.random() * greetings.length)];
      }

    } catch (error) {
      console.error(error);
      response.text = '抱歉，我刚刚走神了。能再说一遍吗？';
    }

    setIsTyping(false);
    return response;
  };

  return {
    processMessage,
    isTyping
  };
};
