// Standard TCM Constitution Questionnaire (Wang Qi 72-question version)
// Each type has 8 questions. 
// Score calculation: [(Raw Score - Number of Questions) / (Number of Questions * 4)] * 100

export const questionnaireData = [
  // --- 1. Yang Deficiency (阳虚质) ---
  { id: 1, type: 'yang_xu', question: '您手脚发凉吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 2, type: 'yang_xu', question: '您胃脘部、背部或腰膝部怕冷吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 3, type: 'yang_xu', question: '您感到怕冷、衣服比别人穿得多吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 4, type: 'yang_xu', question: '您比别人不耐寒（冬天特别怕冷）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 5, type: 'yang_xu', question: '您吃（喝）凉的东西会感到不舒服或者怕吃（喝）凉的东西吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 6, type: 'yang_xu', question: '您受凉或吃（喝）凉的东西后，容易腹泻（拉肚子）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 7, type: 'yang_xu', question: '您平时大便稀溏（不成形）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 8, type: 'yang_xu', question: '您平时小便清长（尿液颜色清淡、量多）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 2. Yin Deficiency (阴虚质) ---
  { id: 9, type: 'yin_xu', question: '您感到手脚心发热吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 10, type: 'yin_xu', question: '您感觉身体、脸上发热吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 11, type: 'yin_xu', question: '您皮肤或口唇干吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 12, type: 'yin_xu', question: '您口唇的颜色比一般人红吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 13, type: 'yin_xu', question: '您容易便秘或大便干燥吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 14, type: 'yin_xu', question: '您面部两颧潮红或偏红吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 15, type: 'yin_xu', question: '您感到眼睛干涩吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 16, type: 'yin_xu', question: '您感到口干咽燥、总想喝水吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 3. Qi Deficiency (气虚质) ---
  { id: 17, type: 'qi_xu', question: '您容易疲乏吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 18, type: 'qi_xu', question: '您容易气短（呼吸短促，接不上气）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 19, type: 'qi_xu', question: '您容易心慌吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 20, type: 'qi_xu', question: '您容易头晕或站起时眩晕吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 21, type: 'qi_xu', question: '您比别人容易感冒吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 22, type: 'qi_xu', question: '您喜欢安静、懒得说话吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 23, type: 'qi_xu', question: '您说话声音低弱无力吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 24, type: 'qi_xu', question: '您活动量稍大就容易出虚汗吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 4. Phlegm-Dampness (痰湿质) ---
  { id: 25, type: 'tan_shi', question: '您感到胸闷或腹部胀满吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 26, type: 'tan_shi', question: '您感到身体沉重不轻松或不爽快吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 27, type: 'tan_shi', question: '您腹部肥满松软吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 28, type: 'tan_shi', question: '您有额部油脂分泌多的现象吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 29, type: 'tan_shi', question: '您上眼睑比别人肿（轻微隆起）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 30, type: 'tan_shi', question: '您嘴里有黏黏的感觉吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 31, type: 'tan_shi', question: '您平时痰多，特别是咽喉部总感到有痰堵着吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 32, type: 'tan_shi', question: '您舌苔厚腻或有舌苔厚厚的感觉吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 5. Damp-Heat (湿热质) ---
  { id: 33, type: 'shi_re', question: '您面部或鼻部有油腻感或者油垢发亮吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 34, type: 'shi_re', question: '您容易生痤疮或疮疖吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 35, type: 'shi_re', question: '您感到口苦或嘴里有异味吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 36, type: 'shi_re', question: '您大便黏滞不爽、有解不尽的感觉吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 37, type: 'shi_re', question: '您小便时尿道有发热感、尿色浓（深）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 38, type: 'shi_re', question: '您带下色黄（女性）或阴囊潮湿（男性）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 39, type: 'shi_re', question: '您感到身体困重、发热吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 40, type: 'shi_re', question: '您容易心烦急躁吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 6. Blood Stasis (血瘀质) ---
  { id: 41, type: 'xue_yu', question: '您皮肤常在不知不觉中出现青紫瘀斑（皮下出血）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 42, type: 'xue_yu', question: '您两颧部有细微红丝吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 43, type: 'xue_yu', question: '您身体上有哪里疼痛吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 44, type: 'xue_yu', question: '您面色晦暗或容易出现褐斑吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 45, type: 'xue_yu', question: '您容易有黑眼圈吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 46, type: 'xue_yu', question: '您口唇颜色偏暗吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 47, type: 'xue_yu', question: '您舌底静脉怒张（舌下静脉变粗、变紫）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 48, type: 'xue_yu', question: '您平时记忆力差、容易忘事吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 7. Qi Stagnation (气郁质) ---
  { id: 49, type: 'qi_yu', question: '您感到闷闷不乐、情绪低沉吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 50, type: 'qi_yu', question: '您容易精神紧张、焦虑不安吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 51, type: 'qi_yu', question: '您容易多愁善感、感情脆弱吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 52, type: 'qi_yu', question: '您容易感到害怕或受到惊吓吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 53, type: 'qi_yu', question: '您胁肋部或乳房胀痛吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 54, type: 'qi_yu', question: '您无缘无故叹气吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 55, type: 'qi_yu', question: '您咽喉部有异物感，吐之不出、咽之不下吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 56, type: 'qi_yu', question: '您睡眠不好、多梦易醒吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 8. Special Constitution (特禀质) ---
  { id: 57, type: 'te_bing', question: '您没有感冒时也会打喷嚏吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 58, type: 'te_bing', question: '您没有感冒时也会鼻塞、流鼻涕吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 59, type: 'te_bing', question: '您有因季节变化、温度变化或异味等原因而咳喘的现象吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 60, type: 'te_bing', question: '您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 61, type: 'te_bing', question: '您皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 62, type: 'te_bing', question: '您皮肤因过敏出现过紫癜（紫红色瘀点、瘀斑）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 63, type: 'te_bing', question: '您皮肤一抓就红，并出现抓痕吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 64, type: 'te_bing', question: '您的皮肤容易过敏（如对金属、化妆品等）吗？', options: ['没有', '很少', '有时', '经常', '总是'] },

  // --- 9. Gentle Constitution (平和质) ---
  { id: 65, type: 'ping_he', question: '您精力充沛吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 66, type: 'ping_he', question: '您说话声音低弱无力吗？(反向计分)', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 67, type: 'ping_he', question: '您感到闷闷不乐、情绪低沉吗？(反向计分)', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 68, type: 'ping_he', question: '您比别人容易感冒吗？(反向计分)', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 69, type: 'ping_he', question: '您能适应外界自然和社会环境的变化吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 70, type: 'ping_he', question: '您睡眠良好吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 71, type: 'ping_he', question: '您胃口好吗？', options: ['没有', '很少', '有时', '经常', '总是'] },
  { id: 72, type: 'ping_he', question: '您容易疲乏吗？(反向计分)', options: ['没有', '很少', '有时', '经常', '总是'] },
];

export const calculateConstitution = (answers) => {
    // answers: { questionId: score (1-5) }
    
    // 1. Group scores by type
    const scores = {};
    const counts = {}; // Number of questions answered per type
    
    Object.keys(answers).forEach(qid => {
        const q = questionnaireData.find(i => i.id === parseInt(qid));
        if (q) {
            scores[q.type] = (scores[q.type] || 0) + answers[qid];
            counts[q.type] = (counts[q.type] || 0) + 1;
        }
    });

    const typeMap = {
        'yang_xu': '阳虚',
        'yin_xu': '阴虚',
        'qi_xu': '气虚',
        'tan_shi': '痰湿',
        'shi_re': '湿热',
        'xue_yu': '血瘀',
        'qi_yu': '气郁',
        'te_bing': '特禀',
        'ping_he': '平和'
    };

    // 2. Calculate Standard Score (0-100)
    // Formula: [(Raw Score - Number of Questions) / (Number of Questions * 4)] * 100
    const radarData = [];
    let maxType = 'ping_he';
    let maxScore = -1;

    Object.keys(typeMap).forEach(key => {
        const rawScore = scores[key] || 0;
        const qCount = counts[key] || 8; // Default to 8
        
        // If no answers, score is 0
        let standardScore = 0;
        if (counts[key] > 0) {
            standardScore = ((rawScore - qCount) / (qCount * 4)) * 100;
        }
        
        // Ensure within 0-100
        standardScore = Math.max(0, Math.min(100, Math.round(standardScore)));
        
        radarData.push({
            subject: typeMap[key],
            A: standardScore,
            fullMark: 100
        });

        // Determine main constitution
        // Note: Determination rules are complex in standard (e.g., >40, >30), 
        // here we simplify to max score for now, but ideally should follow standard rules.
        // Standard rule: 
        // Pinghe: Pinghe >= 60 and others < 30 (or < 40 in some versions)
        // Others: Score >= 40 (Yes), 30-39 (Tendency)
        
        if (key !== 'ping_he' && standardScore > maxScore) {
            maxScore = standardScore;
            maxType = key;
        }
    });
    
    // Special check for Pinghe
    const pingheScore = radarData.find(d => d.subject === '平和').A;
    const othersMax = Math.max(...radarData.filter(d => d.subject !== '平和').map(d => d.A));
    
    if (pingheScore >= 60 && othersMax < 30) {
        maxType = 'ping_he';
        maxScore = pingheScore;
    } else if (maxType === 'ping_he' && othersMax >= 30) {
        // Fallback if loop didn't set maxType (e.g. all 0) or logic needed
        // If others are high, it's not Pinghe
        // Find the max of others again
        const maxOther = radarData.filter(d => d.subject !== '平和').reduce((prev, current) => (prev.A > current.A) ? prev : current);
        maxType = Object.keys(typeMap).find(key => typeMap[key] === maxOther.subject);
        maxScore = maxOther.A;
    }

    const fullTypeMap = {
        'yang_xu': '阳虚质',
        'yin_xu': '阴虚质',
        'qi_xu': '气虚质',
        'tan_shi': '痰湿质',
        'shi_re': '湿热质',
        'xue_yu': '血瘀质',
        'qi_yu': '气郁质',
        'te_bing': '特禀质',
        'ping_he': '平和质'
    };

    return {
        type: fullTypeMap[maxType],
        score: maxScore,
        radarData, // For Radar Chart
        desc: `您的体质主要倾向为${fullTypeMap[maxType]}（${maxScore}分）。\n从雷达图可以看出，您同时兼有${radarData.filter(d => d.A >= 30 && d.subject !== typeMap[maxType] && d.subject !== '平和').map(d => d.subject).join('、')}倾向。建议综合调理。`
    };
};
