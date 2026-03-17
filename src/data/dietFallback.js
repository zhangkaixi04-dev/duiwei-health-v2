export const dietFallback = {
  "平和质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1800,
    breakfast: { 
      name: "小米粥 + 煮鸡蛋 + 凉拌菠菜", 
      calories: 400, 
      ingredients: [
        {"name": "小米", "amount": "50g"},
        {"name": "鸡蛋", "amount": "1个"},
        {"name": "菠菜", "amount": "150g"}
      ],
      nutrients: {"carbs": 55, "protein": 18, "fat": 12}, 
      nutrition_points: ["富含蛋白质", "提供上午能量"],
      constitution_fit: "适合平和质体质，营养均衡"
    },
    lunch: { 
      name: "杂粮饭 + 清蒸鲈鱼 + 西兰花炒木耳", 
      calories: 750, 
      ingredients: [
        {"name": "大米", "amount": "80g"},
        {"name": "糙米", "amount": "70g"},
        {"name": "鲈鱼", "amount": "120g"},
        {"name": "西兰花", "amount": "150g"},
        {"name": "木耳", "amount": "50g"}
      ],
      nutrients: {"carbs": 85, "protein": 35, "fat": 20}, 
      nutrition_points: ["高蛋白低脂肪", "营养丰富"],
      constitution_fit: "适合平和质体质，易消化"
    },
    dinner: { 
      name: "红薯杂粮粥 + 芹菜香干肉丝", 
      calories: 500, 
      ingredients: [
        {"name": "红薯", "amount": "100g"},
        {"name": "大米", "amount": "50g"},
        {"name": "芹菜", "amount": "100g"},
        {"name": "香干", "amount": "50g"},
        {"name": "瘦肉", "amount": "50g"}
      ],
      nutrients: {"carbs": 60, "protein": 25, "fat": 15}, 
      nutrition_points: ["高纤维", "清淡养胃"],
      constitution_fit: "适合平和质体质，清淡养胃"
    },
    daily_summary: {
      ingredient_count: 14,
      nutrition_balance: "碳水58%、蛋白质18%、脂肪24%",
      key_benefits: ["营养均衡", "食材丰富", "体质适配"]
    },
    advice: "饮食宜清淡，粗细搭配，保持营养均衡，不偏食。"
  },
  "气虚质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1850,
    breakfast: { 
      name: "山药小米粥 + 鹌鹑蛋", 
      calories: 420, 
      ingredients: [
        {"name": "山药", "amount": "100g"},
        {"name": "小米", "amount": "50g"},
        {"name": "鹌鹑蛋", "amount": "3个"}
      ],
      nutrients: {"carbs": 60, "protein": 15, "fat": 10}, 
      nutrition_points: ["益气健脾", "易消化"],
      constitution_fit: "适合气虚质体质，益气健脾"
    },
    lunch: { 
      name: "黄芪炖鸡腿 + 米饭 + 香菇青菜", 
      calories: 780, 
      ingredients: [
        {"name": "鸡腿", "amount": "150g"},
        {"name": "黄芪", "amount": "10g"},
        {"name": "大米", "amount": "150g"},
        {"name": "香菇", "amount": "50g"},
        {"name": "青菜", "amount": "150g"}
      ],
      nutrients: {"carbs": 90, "protein": 40, "fat": 25}, 
      nutrition_points: ["补气养身", "高蛋白"],
      constitution_fit: "适合气虚质体质，补气养身"
    },
    dinner: { 
      name: "南瓜粥 + 清蒸鳕鱼", 
      calories: 520, 
      ingredients: [
        {"name": "南瓜", "amount": "150g"},
        {"name": "大米", "amount": "50g"},
        {"name": "鳕鱼", "amount": "100g"}
      ],
      nutrients: {"carbs": 65, "protein": 30, "fat": 12}, 
      nutrition_points: ["易吸收", "高蛋白"],
      constitution_fit: "适合气虚质体质，易吸收"
    },
    daily_summary: {
      ingredient_count: 12,
      nutrition_balance: "碳水60%、蛋白质19%、脂肪21%",
      key_benefits: ["益气健脾", "高蛋白", "易消化"]
    },
    advice: "宜食益气健脾的食物，如黄豆、白扁豆、鸡肉、香菇、大枣等。少食空心菜、生萝卜等耗气食物。"
  },
  "阳虚质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1900,
    breakfast: { 
      name: "核桃黑米粥 + 煎蛋", 
      calories: 450, 
      ingredients: [
        {"name": "核桃", "amount": "30g"},
        {"name": "黑米", "amount": "50g"},
        {"name": "鸡蛋", "amount": "1个"}
      ],
      nutrients: {"carbs": 50, "protein": 15, "fat": 20}, 
      nutrition_points: ["温补肾阳", "高蛋白"],
      constitution_fit: "适合阳虚质体质，温补肾阳"
    },
    lunch: { 
      name: "羊肉炖萝卜 + 馒头 + 韭菜炒蛋", 
      calories: 800, 
      ingredients: [
        {"name": "羊肉", "amount": "100g"},
        {"name": "白萝卜", "amount": "150g"},
        {"name": "馒头", "amount": "1个"},
        {"name": "韭菜", "amount": "100g"},
        {"name": "鸡蛋", "amount": "1个"}
      ],
      nutrients: {"carbs": 80, "protein": 35, "fat": 35}, 
      nutrition_points: ["温阳散寒", "高热量"],
      constitution_fit: "适合阳虚质体质，温阳散寒"
    },
    dinner: { 
      name: "生姜红薯粥 + 虾仁豆腐", 
      calories: 550, 
      ingredients: [
        {"name": "生姜", "amount": "10g"},
        {"name": "红薯", "amount": "100g"},
        {"name": "大米", "amount": "50g"},
        {"name": "虾仁", "amount": "50g"},
        {"name": "豆腐", "amount": "100g"}
      ],
      nutrients: {"carbs": 70, "protein": 25, "fat": 15}, 
      nutrition_points: ["暖胃安神", "高蛋白"],
      constitution_fit: "适合阳虚质体质，暖胃安神"
    },
    daily_summary: {
      ingredient_count: 13,
      nutrition_balance: "碳水55%、蛋白质18%、脂肪27%",
      key_benefits: ["温阳散寒", "高蛋白", "高热量"]
    },
    advice: "宜食温阳食品，如羊肉、韭菜、生姜、核桃等。少食生冷寒凉食物，如西瓜、梨、冷饮。"
  },
  "阴虚质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1750,
    breakfast: { 
      name: "百合银耳羹 + 全麦面包 + 牛奶", 
      calories: 400, 
      ingredients: [
        {"name": "百合", "amount": "20g"},
        {"name": "银耳", "amount": "15g"},
        {"name": "全麦面包", "amount": "2片"},
        {"name": "牛奶", "amount": "200ml"}
      ],
      nutrients: {"carbs": 60, "protein": 15, "fat": 10}, 
      nutrition_points: ["滋阴润燥", "高蛋白"],
      constitution_fit: "适合阴虚质体质，滋阴润燥"
    },
    lunch: { 
      name: "鸭肉冬瓜汤 + 米饭 + 清炒莲藕", 
      calories: 700, 
      ingredients: [
        {"name": "鸭肉", "amount": "100g"},
        {"name": "冬瓜", "amount": "200g"},
        {"name": "大米", "amount": "150g"},
        {"name": "莲藕", "amount": "150g"}
      ],
      nutrients: {"carbs": 85, "protein": 30, "fat": 20}, 
      nutrition_points: ["滋阴清热", "高蛋白"],
      constitution_fit: "适合阴虚质体质，滋阴清热"
    },
    dinner: { 
      name: "皮蛋瘦肉粥 + 凉拌黄瓜", 
      calories: 480, 
      ingredients: [
        {"name": "皮蛋", "amount": "1个"},
        {"name": "瘦肉", "amount": "50g"},
        {"name": "大米", "amount": "80g"},
        {"name": "黄瓜", "amount": "150g"}
      ],
      nutrients: {"carbs": 55, "protein": 20, "fat": 15}, 
      nutrition_points: ["清热生津", "低脂肪"],
      constitution_fit: "适合阴虚质体质，清热生津"
    },
    daily_summary: {
      ingredient_count: 12,
      nutrition_balance: "碳水60%、蛋白质19%、脂肪21%",
      key_benefits: ["滋阴润燥", "高蛋白", "低脂肪"]
    },
    advice: "宜食滋阴润燥的食物，如鸭肉、百合、银耳、梨、黑芝麻。少食辛辣燥热之品，如羊肉、辣椒。"
  },
  "痰湿质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1700,
    breakfast: { 
      name: "薏米红豆粥 + 煮鸡蛋", 
      calories: 380, 
      ingredients: [
        {"name": "薏米", "amount": "30g"},
        {"name": "红豆", "amount": "30g"},
        {"name": "大米", "amount": "40g"},
        {"name": "鸡蛋", "amount": "1个"}
      ],
      nutrients: {"carbs": 55, "protein": 15, "fat": 8}, 
      nutrition_points: ["健脾利湿", "低脂肪"],
      constitution_fit: "适合痰湿质体质，健脾利湿"
    },
    lunch: { 
      name: "冬瓜排骨汤 + 糙米饭 + 凉拌海带丝", 
      calories: 650, 
      ingredients: [
        {"name": "排骨", "amount": "80g"},
        {"name": "冬瓜", "amount": "200g"},
        {"name": "糙米", "amount": "150g"},
        {"name": "海带丝", "amount": "150g"}
      ],
      nutrients: {"carbs": 70, "protein": 30, "fat": 20}, 
      nutrition_points: ["化痰降脂", "高纤维"],
      constitution_fit: "适合痰湿质体质，化痰降脂"
    },
    dinner: { 
      name: "燕麦粥 + 芹菜炒豆干", 
      calories: 450, 
      ingredients: [
        {"name": "燕麦", "amount": "50g"},
        {"name": "芹菜", "amount": "150g"},
        {"name": "豆干", "amount": "100g"}
      ],
      nutrients: {"carbs": 50, "protein": 20, "fat": 15}, 
      nutrition_points: ["清淡消脂", "高纤维"],
      constitution_fit: "适合痰湿质体质，清淡消脂"
    },
    daily_summary: {
      ingredient_count: 12,
      nutrition_balance: "碳水59%、蛋白质20%、脂肪21%",
      key_benefits: ["健脾利湿", "高纤维", "低脂肪"]
    },
    advice: "宜食健脾利湿化痰的食物，如冬瓜、薏米、赤小豆、海带、萝卜。少食肥甘厚味、甜食、酒类。"
  },
  "湿热质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1680,
    breakfast: { 
      name: "绿豆粥 + 凉拌苦瓜", 
      calories: 350, 
      ingredients: [
        {"name": "绿豆", "amount": "30g"},
        {"name": "大米", "amount": "70g"},
        {"name": "苦瓜", "amount": "100g"}
      ],
      nutrients: {"carbs": 60, "protein": 8, "fat": 5}, 
      nutrition_points: ["清热祛湿", "低脂肪"],
      constitution_fit: "适合湿热质体质，清热祛湿"
    },
    lunch: { 
      name: "米饭 + 丝瓜炒肉片 + 凉拌西红柿", 
      calories: 680, 
      ingredients: [
        {"name": "大米", "amount": "150g"},
        {"name": "丝瓜", "amount": "200g"},
        {"name": "瘦肉", "amount": "50g"},
        {"name": "西红柿", "amount": "150g"}
      ],
      nutrients: {"carbs": 80, "protein": 25, "fat": 20}, 
      nutrition_points: ["清热利尿", "低脂肪"],
      constitution_fit: "适合湿热质体质，清热利尿"
    },
    dinner: { 
      name: "荷叶粥 + 蒜泥茄子", 
      calories: 420, 
      ingredients: [
        {"name": "荷叶", "amount": "10g"},
        {"name": "大米", "amount": "80g"},
        {"name": "茄子", "amount": "150g"},
        {"name": "大蒜", "amount": "10g"}
      ],
      nutrients: {"carbs": 55, "protein": 10, "fat": 15}, 
      nutrition_points: ["清暑利湿", "低脂肪"],
      constitution_fit: "适合湿热质体质，清暑利湿"
    },
    daily_summary: {
      ingredient_count: 11,
      nutrition_balance: "碳水62%、蛋白质16%、脂肪22%",
      key_benefits: ["清热祛湿", "低脂肪", "高纤维"]
    },
    advice: "宜食清热利湿的食物，如绿豆、苦瓜、冬瓜、丝瓜、芹菜。忌辛辣、滋补、油腻食物。"
  },
  "血瘀质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1780,
    breakfast: { 
      name: "黑豆豆浆 + 全麦馒头 + 煎蛋", 
      calories: 420, 
      ingredients: [
        {"name": "黑豆", "amount": "30g"},
        {"name": "黄豆", "amount": "20g"},
        {"name": "全麦馒头", "amount": "1个"},
        {"name": "鸡蛋", "amount": "1个"}
      ],
      nutrients: {"carbs": 55, "protein": 20, "fat": 12}, 
      nutrition_points: ["活血化瘀", "高蛋白"],
      constitution_fit: "适合血瘀质体质，活血化瘀"
    },
    lunch: { 
      name: "黑木耳炒肉片 + 米饭 + 山楂茶", 
      calories: 720, 
      ingredients: [
        {"name": "黑木耳", "amount": "30g"},
        {"name": "瘦肉", "amount": "80g"},
        {"name": "大米", "amount": "150g"},
        {"name": "山楂", "amount": "10g"}
      ],
      nutrients: {"carbs": 80, "protein": 30, "fat": 25}, 
      nutrition_points: ["行气活血", "高蛋白"],
      constitution_fit: "适合血瘀质体质，行气活血"
    },
    dinner: { 
      name: "红糖红枣粥 + 醋溜白菜", 
      calories: 480, 
      ingredients: [
        {"name": "红糖", "amount": "10g"},
        {"name": "红枣", "amount": "30g"},
        {"name": "大米", "amount": "80g"},
        {"name": "白菜", "amount": "200g"},
        {"name": "醋", "amount": "10ml"}
      ],
      nutrients: {"carbs": 70, "protein": 10, "fat": 12}, 
      nutrition_points: ["温通经脉", "高纤维"],
      constitution_fit: "适合血瘀质体质，温通经脉"
    },
    daily_summary: {
      ingredient_count: 13,
      nutrition_balance: "碳水59%、蛋白质19%、脂肪22%",
      key_benefits: ["活血化瘀", "高蛋白", "高纤维"]
    },
    advice: "宜食活血化瘀的食物，如黑木耳、山楂、醋、玫瑰花、桃仁。少食寒凉冷饮，以免血遇寒则凝。"
  },
  "气郁质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1720,
    breakfast: { 
      name: "玫瑰花茶 + 全麦面包 + 煎蛋", 
      calories: 380, 
      ingredients: [
        {"name": "玫瑰花", "amount": "5g"},
        {"name": "全麦面包", "amount": "2片"},
        {"name": "鸡蛋", "amount": "1个"}
      ],
      nutrients: {"carbs": 45, "protein": 15, "fat": 12}, 
      nutrition_points: ["疏肝解郁", "高蛋白"],
      constitution_fit: "适合气郁质体质，疏肝解郁"
    },
    lunch: { 
      name: "黄花菜炒肉 + 荞麦面 + 橙子", 
      calories: 680, 
      ingredients: [
        {"name": "黄花菜", "amount": "30g"},
        {"name": "瘦肉", "amount": "80g"},
        {"name": "荞麦面", "amount": "150g"},
        {"name": "橙子", "amount": "1个"}
      ],
      nutrients: {"carbs": 75, "protein": 25, "fat": 20}, 
      nutrition_points: ["理气宽中", "高纤维"],
      constitution_fit: "适合气郁质体质，理气宽中"
    },
    dinner: { 
      name: "小米粥 + 凉拌萝卜丝", 
      calories: 400, 
      ingredients: [
        {"name": "小米", "amount": "80g"},
        {"name": "白萝卜", "amount": "150g"}
      ],
      nutrients: {"carbs": 55, "protein": 10, "fat": 10}, 
      nutrition_points: ["行气消滞", "低脂肪"],
      constitution_fit: "适合气郁质体质，行气消滞"
    },
    daily_summary: {
      ingredient_count: 10,
      nutrition_balance: "碳水58%、蛋白质18%、脂肪24%",
      key_benefits: ["疏肝解郁", "高纤维", "低脂肪"]
    },
    advice: "宜食疏肝理气解郁的食物，如黄花菜、海带、山楂、玫瑰花、柑橘。少食辛辣、咖啡、浓茶。"
  },
  "特禀质": {
    date: new Date().toISOString().split('T')[0],
    total_calories: 1700,
    breakfast: { 
      name: "小米粥 + 馒头 + 煮青菜", 
      calories: 380, 
      ingredients: [
        {"name": "小米", "amount": "80g"},
        {"name": "馒头", "amount": "1个"},
        {"name": "青菜", "amount": "150g"}
      ],
      nutrients: {"carbs": 65, "protein": 10, "fat": 5}, 
      nutrition_points: ["益气固表", "低过敏"],
      constitution_fit: "适合特禀质体质，益气固表"
    },
    lunch: { 
      name: "米饭 + 清炒土豆丝 + 瘦肉丸汤", 
      calories: 650, 
      ingredients: [
        {"name": "大米", "amount": "150g"},
        {"name": "土豆", "amount": "200g"},
        {"name": "瘦肉", "amount": "50g"}
      ],
      nutrients: {"carbs": 80, "protein": 25, "fat": 18}, 
      nutrition_points: ["清淡饮食", "高蛋白"],
      constitution_fit: "适合特禀质体质，清淡饮食"
    },
    dinner: { 
      name: "山药粥 + 蒸南瓜", 
      calories: 420, 
      ingredients: [
        {"name": "山药", "amount": "100g"},
        {"name": "大米", "amount": "50g"},
        {"name": "南瓜", "amount": "150g"}
      ],
      nutrients: {"carbs": 70, "protein": 8, "fat": 5}, 
      nutrition_points: ["避免过敏", "低脂肪"],
      constitution_fit: "适合特禀质体质，避免过敏"
    },
    daily_summary: {
      ingredient_count: 9,
      nutrition_balance: "碳水63%、蛋白质16%、脂肪21%",
      key_benefits: ["益气固表", "清淡饮食", "避免过敏"]
    },
    advice: "饮食宜清淡、均衡，粗细搭配。严格避开过敏源（如海鲜、蚕豆等），少食辛辣腥膻发物。"
  }
};
