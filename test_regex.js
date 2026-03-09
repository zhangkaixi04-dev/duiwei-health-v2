
const testCases = [
    "今天吃了一个苹果",
    "吃了一个苹果",
    "一个苹果", // Should be false because no action/keyword? Wait, "一个苹果" has quantity but no keyword. 
               // Actually "一个苹果" fails `hasFoodKeyword`? No, "吃" is not there.
    "早饭吃了一个苹果",
    "我喝了一杯牛奶",
    "200g牛肉", // Should be true if context implies? 
                // `hasFoodKeyword` needs to be true. "牛肉" doesn't have keyword.
                // Wait, logic is `(isExplicitDiet || hasDietAction || (hasFoodKeyword && hasQuantity))`
                // So "200g牛肉" fails unless "牛肉" contains keyword? No.
    "我要记饮食：一个苹果",
    "吃了两碗饭",
    "三份饺子", // Fails `hasFoodKeyword`? No "吃".
    "吃三份饺子", // True.
];

const runTest = (text) => {
    // Mock logic from ChatInterface.jsx
    const isExplicitDiet = /(记|录).*(吃|喝|饮食|餐)/.test(text) || text.includes('我要记饮食');

    const hasDietAction = ['吃了', '喝了', '吃完', '喝完', '早饭', '午饭', '晚饭', '早餐', '午餐', '晚餐', '加餐', '夜宵', '下午茶'].some(kw => text.includes(kw));
    
    const quantityRegex = /([0-9]+|[一二三四五六七八九十百]+)\s*(g|ml|克|毫升|碗|杯|份|个|只|条|盘|勺|斤|两)/i;
    const hasQuantity = quantityRegex.test(text);
    
    // Expanded keywords to include food nouns
    const foodKeywords = [
        '吃', '喝', '餐', '饭', '饮', '食', 
        '果', '肉', '菜', '蛋', '奶', '面', '米', '豆', 
        '水', '茶', '酒', '汤', '鱼', '虾', '鸡', '鸭', '牛', '羊', '猪'
    ];
    const hasFoodKeyword = foodKeywords.some(kw => text.includes(kw));

    const dietAntiKeywords = [
        '怎么', '什么', '推荐', '吗', '?', '？', 
        '上火', '便秘', '失眠', 
        '想吃', '能不能', '可以', '好不好', 
        '热量', '多少', '一般', '通常', '注意', 
        '喜欢', '爱吃', '讨厌', '不吃', 
        '每天', '经常', '总是', '习惯', 
        '准备', '打算', '要去', '会' 
    ];
    const isDietQuestion = dietAntiKeywords.some(kw => text.includes(kw));

    const isDietRecord = (isExplicitDiet || hasDietAction || (hasFoodKeyword && hasQuantity)) && !isDietQuestion;

    console.log(`Input: "${text}"`);
    console.log(`  Explicit: ${isExplicitDiet}`);
    console.log(`  Action: ${hasDietAction}`);
    console.log(`  Quantity: ${hasQuantity}`);
    console.log(`  Keyword: ${hasFoodKeyword}`);
    console.log(`  Question: ${isDietQuestion}`);
    console.log(`  Result: ${isDietRecord}`);
    console.log('---');
};

testCases.forEach(runTest);
