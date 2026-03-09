export const dietFallback = {
  "平和质": {
    breakfast: { name: "小米粥(250g) + 煮鸡蛋(1个) + 凉拌菠菜(150g)", calories: 400, carbs: 55, protein: 18, fat: 12, tag: "营养均衡" },
    lunch: { name: "杂粮饭(150g) + 清蒸鲈鱼(120g) + 西兰花炒木耳(200g)", calories: 750, carbs: 85, protein: 35, fat: 20, tag: "易消化" },
    dinner: { name: "红薯杂粮粥(200g) + 芹菜香干肉丝(150g)", calories: 500, carbs: 60, protein: 25, fat: 15, tag: "清淡养胃" },
    advice: "饮食宜清淡，粗细搭配，保持营养均衡，不偏食。"
  },
  "气虚质": {
    breakfast: { name: "山药小米粥(250g) + 鹌鹑蛋(3个)", calories: 420, carbs: 60, protein: 15, fat: 10, tag: "益气健脾" },
    lunch: { name: "黄芪炖鸡腿(去皮,150g) + 米饭(150g) + 香菇青菜(200g)", calories: 780, carbs: 90, protein: 40, fat: 25, tag: "补气养身" },
    dinner: { name: "南瓜粥(200g) + 清蒸鳕鱼(100g)", calories: 520, carbs: 65, protein: 30, fat: 12, tag: "易吸收" },
    advice: "宜食益气健脾的食物，如黄豆、白扁豆、鸡肉、香菇、大枣等。少食空心菜、生萝卜等耗气食物。"
  },
  "阳虚质": {
    breakfast: { name: "核桃黑米粥(250g) + 煎蛋(1个)", calories: 450, carbs: 50, protein: 15, fat: 20, tag: "温补肾阳" },
    lunch: { name: "羊肉炖萝卜(羊肉100g) + 馒头(1个) + 韭菜炒蛋(150g)", calories: 800, carbs: 80, protein: 35, fat: 35, tag: "温阳散寒" },
    dinner: { name: "生姜红薯粥(200g) + 虾仁豆腐(150g)", calories: 550, carbs: 70, protein: 25, fat: 15, tag: "暖胃安神" },
    advice: "宜食温阳食品，如羊肉、韭菜、生姜、核桃等。少食生冷寒凉食物，如西瓜、梨、冷饮。"
  },
  "阴虚质": {
    breakfast: { name: "百合银耳羹(250ml) + 全麦面包(2片) + 牛奶(200ml)", calories: 400, carbs: 60, protein: 15, fat: 10, tag: "滋阴润燥" },
    lunch: { name: "鸭肉冬瓜汤(鸭肉100g) + 米饭(150g) + 清炒莲藕(150g)", calories: 700, carbs: 85, protein: 30, fat: 20, tag: "滋阴清热" },
    dinner: { name: "皮蛋瘦肉粥(250g) + 凉拌黄瓜(150g)", calories: 480, carbs: 55, protein: 20, fat: 15, tag: "清热生津" },
    advice: "宜食滋阴润燥的食物，如鸭肉、百合、银耳、梨、黑芝麻。少食辛辣燥热之品，如羊肉、辣椒。"
  },
  "痰湿质": {
    breakfast: { name: "薏米红豆粥(250g) + 煮鸡蛋(1个)", calories: 380, carbs: 55, protein: 15, fat: 8, tag: "健脾利湿" },
    lunch: { name: "冬瓜排骨汤(排骨80g) + 糙米饭(150g) + 凉拌海带丝(150g)", calories: 650, carbs: 70, protein: 30, fat: 20, tag: "化痰降脂" },
    dinner: { name: "燕麦粥(200g) + 芹菜炒豆干(150g)", calories: 450, carbs: 50, protein: 20, fat: 15, tag: "清淡消脂" },
    advice: "宜食健脾利湿化痰的食物，如冬瓜、薏米、赤小豆、海带、萝卜。少食肥甘厚味、甜食、酒类。"
  },
  "湿热质": {
    breakfast: { name: "绿豆粥(250g) + 凉拌苦瓜(100g)", calories: 350, carbs: 60, protein: 8, fat: 5, tag: "清热祛湿" },
    lunch: { name: "米饭(150g) + 丝瓜炒肉片(肉50g) + 凉拌西红柿(1个)", calories: 680, carbs: 80, protein: 25, fat: 20, tag: "清热利尿" },
    dinner: { name: "荷叶粥(200g) + 蒜泥茄子(150g)", calories: 420, carbs: 55, protein: 10, fat: 15, tag: "清暑利湿" },
    advice: "宜食清热利湿的食物，如绿豆、苦瓜、冬瓜、丝瓜、芹菜。忌辛辣、滋补、油腻食物。"
  },
  "血瘀质": {
    breakfast: { name: "黑豆豆浆(250ml) + 全麦馒头(1个) + 煎蛋(1个)", calories: 420, carbs: 55, protein: 20, fat: 12, tag: "活血化瘀" },
    lunch: { name: "黑木耳炒肉片(肉80g) + 米饭(150g) + 山楂茶(1杯)", calories: 720, carbs: 80, protein: 30, fat: 25, tag: "行气活血" },
    dinner: { name: "红糖红枣粥(200g) + 醋溜白菜(200g)", calories: 480, carbs: 70, protein: 10, fat: 12, tag: "温通经脉" },
    advice: "宜食活血化瘀的食物，如黑木耳、山楂、醋、玫瑰花、桃仁。少食寒凉冷饮，以免血遇寒则凝。"
  },
  "气郁质": {
    breakfast: { name: "玫瑰花茶(1杯) + 全麦面包(2片) + 煎蛋(1个)", calories: 380, carbs: 45, protein: 15, fat: 12, tag: "疏肝解郁" },
    lunch: { name: "黄花菜炒肉(肉80g) + 荞麦面(150g) + 橙子(1个)", calories: 680, carbs: 75, protein: 25, fat: 20, tag: "理气宽中" },
    dinner: { name: "小米粥(200g) + 凉拌萝卜丝(150g)", calories: 400, carbs: 55, protein: 10, fat: 10, tag: "行气消滞" },
    advice: "宜食疏肝理气解郁的食物，如黄花菜、海带、山楂、玫瑰花、柑橘。少食辛辣、咖啡、浓茶。"
  },
  "特禀质": {
    breakfast: { name: "小米粥(250g) + 馒头(1个) + 煮青菜(150g)", calories: 380, carbs: 65, protein: 10, fat: 5, tag: "益气固表" },
    lunch: { name: "米饭(150g) + 清炒土豆丝(200g) + 瘦肉丸汤(肉50g)", calories: 650, carbs: 80, protein: 25, fat: 18, tag: "清淡饮食" },
    dinner: { name: "山药粥(200g) + 蒸南瓜(150g)", calories: 420, carbs: 70, protein: 8, fat: 5, tag: "避免过敏" },
    advice: "饮食宜清淡、均衡，粗细搭配。严格避开过敏源（如海鲜、蚕豆等），少食辛辣腥膻发物。"
  }
};
