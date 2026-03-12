/**
 * Constitution Matrix (Dynamic Logic Engine)
 * 
 * Implements the "Constitution x Season x Scenario" logic.
 * 
 * 1. Base Constitution Score (20%): Fixed base scores.
 * 2. Seasonal Weighting (+0/+1/+2/+3): Dynamic coefficients.
 * 3. Two Core Scenarios:
 *    - Inquiry (Before Eating): Risk Assessment -> Permission.
 *    - Record (After Eating): Damage Control -> Remedy.
 */

// --- 1. Base Scores (Sensitivity) ---
export const BASE_SCORES = {
    '特禀质': 11, // Highest sensitivity
    '阳虚质': 10,
    '气虚质': 10,
    '阴虚质': 9,
    '湿热质': 8,
    '痰湿质': 8,
    '血瘀质': 7,
    '气郁质': 7,
    '平和质': 5   // Lowest sensitivity
};

// --- 2. Seasonal Weights (Constitution x Season) ---
// Seasons: 'spring', 'summer', 'sanfu', 'meiyu' (long_summer), 'autumn', 'winter', 'sanjiu'
// Rules: High Risk (+3), Medium Risk (+2), Low Risk (+1), Safe (+0)
export const SEASONAL_WEIGHTS = {
    '特禀质': { spring: 3, autumn: 3, meiyu: 2, sanfu: 1, sanjiu: 1, summer: 1, winter: 1 }, // Flower/Allergy seasons
    '阳虚质': { sanfu: 3, sanjiu: 3, winter: 2, spring: 1, autumn: 1, meiyu: 1, summer: 1 }, // Sanfu/Sanjiu are critical
    '气虚质': { spring: 3, autumn: 3, sanjiu: 2, sanfu: 2, meiyu: 1, winter: 2, summer: 2 }, // Transition seasons
    '阴虚质': { autumn: 3, sanfu: 2, spring: 1, sanjiu: 1, meiyu: 0, summer: 2, winter: 1 }, // Dry autumn
    '湿热质': { sanfu: 3, meiyu: 3, summer: 2, spring: 1, sanjiu: 0, autumn: 1, winter: 0 }, // Hot & Humid
    '痰湿质': { meiyu: 3, sanfu: 1, sanjiu: 1, spring: 1, autumn: 0, summer: 1, winter: 1 }, // Dampness
    '血瘀质': { sanjiu: 3, winter: 3, spring: 2, meiyu: 1, sanfu: 1, autumn: 0, summer: 1 }, // Cold
    '气郁质': { spring: 3, winter: 2, autumn: 2, meiyu: 1, sanfu: 1, sanjiu: 1, summer: 1 }, // Spring
    '平和质': { spring: 0, summer: 0, sanfu: 0, meiyu: 0, autumn: 0, winter: 0, sanjiu: 0 }
};

// --- 3. Scenario Rules (The "Golden Rules") ---
export const SCENARIO_RULES = {
    '特禀质': {
        taboo: ['fa_wu', 'seafood', 'bamboo_shoot', 'goose', 'processed', 'additives'],
        inquiry_advice: "忌发物（如虾蟹、笋、鹅）及添加剂食品。换季期请保持高度警惕。",
        remedy: "建议立即停止食用。抗过敏处理、清洁鼻腔，可喝小米粥养胃。",
        suitable: ['millet', 'greens', 'mild_food']
    },
    '阳虚质': {
        taboo: ['cold', 'raw', 'iced', 'greasy', 'fried', 'fatty'],
        inquiry_advice: "忌生冷、冰饮、油炸及肥腻食物。三伏/三九天严禁贪凉。",
        remedy: "建议饮用姜枣茶、热敷腹部、艾灸神阙穴。下一餐务必清淡温热。",
        suitable: ['lamb', 'ginger', 'date', 'millet']
    },
    '气虚质': {
        taboo: ['energy_draining', 'radish', 'hawthorn', 'betel_nut', 'mint', 'raw', 'cold'],
        inquiry_advice: "忌耗气食物（如生萝卜、山楂、薄荷）。春秋换季请避免劳累。",
        remedy: "建议食用山药粥、黄芪水。请静养，避免剧烈运动。",
        suitable: ['yam', 'chicken', 'astragalus', 'ginseng']
    },
    '阴虚质': {
        taboo: ['spicy', 'hot', 'lamb', 'bbq', 'fried', 'litchi', 'hotpot'],
        inquiry_advice: "忌辛辣、烧烤、羊肉及桂圆。秋季务必滋阴润燥。",
        remedy: "建议饮用石斛水、银耳梨汤或麦冬茶。避免熬夜。",
        suitable: ['pear', 'duck', 'lily_bulb', 'white_fungus', 'dendrobium']
    },
    '湿热质': {
        taboo: ['alcohol', 'sweet', 'fried', 'greasy', 'tropical_fruit', 'bbq'],
        inquiry_advice: "忌酒、甜食、油炸及热带水果。三伏/梅雨季严禁夜宵烧烤。",
        remedy: "建议饮用金银花露、绿豆汤或赤小豆水。饮食需清淡。",
        suitable: ['mung_bean', 'winter_melon', 'celery', 'bitter_melon']
    },
    '痰湿质': {
        taboo: ['greasy', 'fatty', 'sweet', 'sticky', 'dairy', 'glutinous', 'cream'],
        inquiry_advice: "忌肥甘厚味、奶油及黏滞食物（糯米/年糕）。梅雨季需注意祛湿。",
        remedy: "建议饮用陈皮水、红豆薏米水。饭后快走40分钟帮助代谢。",
        suitable: ['chenpi', 'barley', 'winter_melon', 'radish']
    },
    '血瘀质': {
        taboo: ['cold', 'sour', 'astringent', 'fatty', 'ice', 'persimmon'],
        inquiry_advice: "忌寒凉、冰饮、酸味重（如柿子）及高脂食物。冬季重点防寒。",
        remedy: "建议饮用玫瑰花茶、红糖姜茶。晚上温水泡脚。",
        suitable: ['rose', 'hawthorn_cooked', 'brown_sugar', 'warm_food']
    },
    '气郁质': {
        taboo: ['stimulant', 'coffee', 'strong_tea', 'alcohol', 'gas_producing', 'beans', 'sweet_potato'],
        inquiry_advice: "忌浓茶、咖啡、烈酒及胀气食物（豆类/红薯）。春季需注意疏肝。",
        remedy: "建议服用逍遥丸（遵医嘱）或饮用薄荷茶。尝试户外快走或大声唱歌。",
        suitable: ['mint', 'chenpi', 'citrus', 'coriander']
    },
    '平和质': {
        taboo: ['extreme_cold', 'extreme_hot', 'binge_eating'],
        inquiry_advice: "无绝对禁忌，忌极端生冷辛辣及暴饮暴食。",
        remedy: "建议下一餐清淡饮食，正常休息即可。",
        suitable: ['balanced', 'grains', 'seasonal']
    }
};

// --- 4. Food Property Dictionary (Linking Food -> Tags) ---
// This is the "Knowledge Graph" enabling the logic.
export const FOOD_TAGS = {
    // Cold / Cooling
    'cold': /(西瓜|冰|雪糕|冷饮|凉茶|苦瓜|冬瓜|绿豆|海带|紫菜|螃蟹|鸭|梨|柚子|香蕉|猕猴桃|柿子|生鱼片|沙拉|sashimi)/,
    // Hot / Heating / Yang
    'hot': /(羊肉|狗肉|鹿肉|姜|蒜|葱|辣椒|花椒|胡椒|韭菜|榴莲|荔枝|龙眼|桂圆|白酒|红糖)/,
    // Damp / Greasy / Sweet
    'greasy': /(肥肉|五花肉|猪蹄|油炸|炸鸡|薯条|蛋糕|奶油|巧克力|糖|甜点|奶茶|可乐|cheese|butter|cream)/,
    // Fa Wu (Trigger foods)
    'fa_wu': /(虾|蟹|海鲜|鹅|公鸡|笋|蘑菇|香菜|椿|腐乳|酒酿)/,
    // Gas Producing
    'gas_producing': /(豆|红薯|洋葱|萝卜|土豆|芋头|板栗)/,
    // Acidic / Astringent
    'sour': /(柠檬|乌梅|山楂|酸奶|醋|李子)/,
    // Stimulants
    'stimulant': /(咖啡|浓茶|酒|烟)/,
    // Sticky
    'sticky': /(糯米|年糕|汤圆|粽子|驴打滚)/,
    // Energy Draining (Qi Consuming)
    'energy_draining': /(萝卜|山楂|槟榔|薄荷|空心菜)/
};

// --- 5. Helper Functions ---

/**
 * Get current TCM seasonal phase
 * @param {Date} date Optional, defaults to now
 */
export const getCurrentSeason = (date = new Date()) => {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Sanjiu (Approx Jan 9 - Jan 27, simplified to Jan)
    if (month === 1) return 'sanjiu';
    
    // Spring (Feb - Apr)
    if (month >= 2 && month <= 4) return 'spring';
    
    // Meiyu (Approx mid-June to early July)
    if (month === 6 || (month === 7 && day < 10)) return 'meiyu';
    
    // Sanfu (Approx mid-July to mid-Aug)
    if ((month === 7 && day >= 10) || (month === 8 && day <= 20)) return 'sanfu';
    
    // Summer (Rest of May - Aug)
    if (month >= 5 && month <= 8) return 'summer';
    
    // Autumn (Sep - Nov)
    if (month >= 9 && month <= 11) return 'autumn';
    
    // Winter (Dec)
    return 'winter';
};

/**
 * Tag a food string with properties
 * @param {string} foodName 
 * @returns {Array<string>} tags
 */
export const tagFood = (foodName) => {
    const tags = [];
    Object.entries(FOOD_TAGS).forEach(([tag, regex]) => {
        if (regex.test(foodName)) {
            tags.push(tag);
        }
    });
    
    // Add cooking method tags
    if (/(炸|煎|烤|烧烤)/.test(foodName)) tags.push('greasy', 'hot');
    if (/(冰|冻|凉拌)/.test(foodName)) tags.push('cold');
    if (/(生|刺身)/.test(foodName)) tags.push('raw', 'cold');
    
    return tags;
};

/**
 * Extract status from user input
 * @param {string} text 
 * @returns {Array<string>} status tags
 */
export const parseStatus = (text) => {
    const status = [];
    if (/(累|疲|乏|困)/.test(text)) status.push('tired');
    if (/(痛|疼)/.test(text)) status.push('pain');
    if (/(拉肚子|腹泻|稀)/.test(text)) status.push('diarrhea');
    if (/(便秘|干)/.test(text)) status.push('constipation');
    if (/(冷|凉)/.test(text)) status.push('cold_feeling');
    if (/(热|烫|上火)/.test(text)) status.push('hot_feeling');
    if (/(心情|郁闷|烦)/.test(text)) status.push('bad_mood');
    if (/(经期|大姨妈)/.test(text)) status.push('period');
    return status;
};
