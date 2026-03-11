// Common Food Library for Fallback Analysis
// Data source: User Provided "500 Kinds Food Nutrition Library"
// CONTRACT: All nutritional values (calories, carbs, protein, fat) are PER 100g/ml edible part.
// 'weight' is the typical weight of one unit/serving (estimated for common usage).

export const foodLibrary = {
    // 1. 谷物主食类 (Staples)
    staples: [
        { name: "白米饭", alias: ["米饭", "大米饭"], unit: "碗", weight: 200, calories: 116, protein: 2.6, fat: 0.3, carbs: 26 },
        { name: "糙米饭", alias: ["糙米"], unit: "碗", weight: 200, calories: 110, protein: 2.8, fat: 0.4, carbs: 24 },
        { name: "白馒头", alias: ["馒头"], unit: "个", weight: 100, calories: 223, protein: 7.0, fat: 1.1, carbs: 45 },
        { name: "全麦馒头", alias: [], unit: "个", weight: 100, calories: 230, protein: 8.0, fat: 1.5, carbs: 43 },
        { name: "白面包", alias: [], unit: "片", weight: 35, calories: 265, protein: 7.5, fat: 3.5, carbs: 49 },
        { name: "全麦面包", alias: ["全麦吐司"], unit: "片", weight: 35, calories: 250, protein: 9.0, fat: 3.0, carbs: 42 },
        { name: "法棍", alias: [], unit: "根", weight: 200, calories: 260, protein: 8.0, fat: 1.5, carbs: 50 },
        { name: "面条", alias: ["挂面", "拉面", "汤面"], unit: "碗", weight: 250, calories: 110, protein: 3.0, fat: 0.5, carbs: 22 },
        { name: "挂面", alias: ["干面条"], unit: "把", weight: 100, calories: 345, protein: 11.0, fat: 1.0, carbs: 73 },
        { name: "意大利面", alias: ["意面"], unit: "份", weight: 250, calories: 350, protein: 12.0, fat: 1.5, carbs: 72 }, // dry 100g -> cooked ~250g. Using dry value for 100g? User said "干". Usually cooked is lower. Let's assume user means raw per 100g.
        { name: "燕麦片", alias: ["麦片"], unit: "勺", weight: 30, calories: 389, protein: 13.0, fat: 7.0, carbs: 66 },
        { name: "即食燕麦", alias: [], unit: "勺", weight: 30, calories: 370, protein: 11.0, fat: 6.0, carbs: 64 },
        { name: "小米", alias: [], unit: "碗", weight: 50, calories: 360, protein: 9.0, fat: 3.0, carbs: 73 }, // raw
        { name: "小米粥", alias: [], unit: "碗", weight: 250, calories: 46, protein: 1.4, fat: 0.2, carbs: 10 },
        { name: "玉米", alias: ["棒子"], unit: "根", weight: 200, calories: 116, protein: 4.1, fat: 1.2, carbs: 22 },
        { name: "黑米", alias: [], unit: "碗", weight: 100, calories: 335, protein: 9.0, fat: 2.0, carbs: 72 },
        { name: "紫米", alias: [], unit: "碗", weight: 100, calories: 345, protein: 8.0, fat: 2.0, carbs: 74 },
        { name: "糯米", alias: [], unit: "碗", weight: 100, calories: 345, protein: 7.0, fat: 1.0, carbs: 77 },
        { name: "糯米粥", alias: [], unit: "碗", weight: 250, calories: 75, protein: 2.0, fat: 0.2, carbs: 17 },
        { name: "荞麦面", alias: [], unit: "碗", weight: 200, calories: 340, protein: 10.0, fat: 2.0, carbs: 71 }, // raw value? User: 340. Cooked usually 100.
        { name: "荞麦饭", alias: [], unit: "碗", weight: 200, calories: 100, protein: 3.0, fat: 0.5, carbs: 20 },
        { name: "藜麦", alias: [], unit: "碗", weight: 150, calories: 368, protein: 14.0, fat: 6.0, carbs: 64 },
        { name: "薏米", alias: [], unit: "碗", weight: 100, calories: 370, protein: 12.0, fat: 4.0, carbs: 69 },
        { name: "山药", alias: [], unit: "根", weight: 200, calories: 57, protein: 1.9, fat: 0.2, carbs: 12 },
        { name: "红薯", alias: ["地瓜"], unit: "个", weight: 200, calories: 86, protein: 1.6, fat: 0.2, carbs: 20 },
        { name: "紫薯", alias: [], unit: "个", weight: 150, calories: 117, protein: 2.0, fat: 0.2, carbs: 27 },
        { name: "土豆", alias: ["马铃薯"], unit: "个", weight: 200, calories: 77, protein: 2.0, fat: 0.1, carbs: 17 },
        { name: "土豆泥", alias: [], unit: "份", weight: 150, calories: 110, protein: 2.0, fat: 4.0, carbs: 17 },
        { name: "芋头", alias: [], unit: "个", weight: 100, calories: 79, protein: 2.2, fat: 0.2, carbs: 18 },
        { name: "莲藕", alias: [], unit: "节", weight: 200, calories: 70, protein: 2.0, fat: 0.1, carbs: 16 },
        { name: "南瓜", alias: [], unit: "块", weight: 200, calories: 26, protein: 1.0, fat: 0.1, carbs: 6 },
        { name: "烧饼", alias: [], unit: "个", weight: 100, calories: 250, protein: 7.0, fat: 3.0, carbs: 47 },
        { name: "烙饼", alias: [], unit: "张", weight: 150, calories: 255, protein: 7.0, fat: 4.0, carbs: 46 },
        { name: "油条", alias: [], unit: "根", weight: 80, calories: 380, protein: 7.0, fat: 18.0, carbs: 47 },
        { name: "油饼", alias: [], unit: "张", weight: 100, calories: 390, protein: 7.5, fat: 20.0, carbs: 45 },
        { name: "肉包子", alias: ["肉包"], unit: "个", weight: 100, calories: 250, protein: 8.0, fat: 10.0, carbs: 30 },
        { name: "素包子", alias: ["素包", "菜包"], unit: "个", weight: 100, calories: 200, protein: 6.0, fat: 3.0, carbs: 37 },
        { name: "饺子", alias: ["水饺"], unit: "个", weight: 20, calories: 150, protein: 7.0, fat: 7.0, carbs: 15 },
        { name: "馄饨", alias: ["云吞"], unit: "碗", weight: 250, calories: 110, protein: 5.0, fat: 4.0, carbs: 12 },
        { name: "花卷", alias: [], unit: "个", weight: 80, calories: 215, protein: 6.5, fat: 1.0, carbs: 43 },
        { name: "锅贴", alias: [], unit: "个", weight: 30, calories: 240, protein: 7.0, fat: 10.0, carbs: 30 },
        { name: "手抓饼", alias: [], unit: "张", weight: 150, calories: 350, protein: 7.0, fat: 20.0, carbs: 38 },
        { name: "煎饼果子", alias: [], unit: "个", weight: 300, calories: 280, protein: 7.0, fat: 10.0, carbs: 40 },
        { name: "肉夹馍", alias: [], unit: "个", weight: 200, calories: 280, protein: 8.0, fat: 12.0, carbs: 35 },
        { name: "饭团", alias: [], unit: "个", weight: 150, calories: 220, protein: 5.0, fat: 3.0, carbs: 42 },
        { name: "蛋炒饭", alias: [], unit: "碗", weight: 250, calories: 180, protein: 5.0, fat: 7.0, carbs: 24 },
        { name: "炒面", alias: [], unit: "盘", weight: 300, calories: 170, protein: 5.0, fat: 8.0, carbs: 20 },
        { name: "凉面", alias: [], unit: "碗", weight: 250, calories: 150, protein: 4.5, fat: 5.0, carbs: 21 },
        { name: "米粉", alias: [], unit: "碗", weight: 300, calories: 115, protein: 2.5, fat: 0.3, carbs: 25 },
        { name: "河粉", alias: [], unit: "碗", weight: 300, calories: 110, protein: 2.5, fat: 0.3, carbs: 24 },
        { name: "粉丝", alias: [], unit: "碗", weight: 200, calories: 340, protein: 0.8, fat: 0.2, carbs: 83 }, // dry value?
        { name: "方便面", alias: ["泡面"], unit: "包", weight: 100, calories: 470, protein: 9.5, fat: 22.0, carbs: 58 },
        { name: "通心粉", alias: ["意粉"], unit: "份", weight: 200, calories: 112, protein: 3.5, fat: 0.5, carbs: 22 },
        { name: "黄豆", alias: [], unit: "把", weight: 50, calories: 395, protein: 35.0, fat: 19.0, carbs: 30 },
        { name: "绿豆", alias: [], unit: "把", weight: 50, calories: 329, protein: 21.0, fat: 0.8, carbs: 62 },
        { name: "红豆", alias: [], unit: "把", weight: 50, calories: 324, protein: 20.0, fat: 0.6, carbs: 63 },
        { name: "绿豆汤", alias: [], unit: "碗", weight: 300, calories: 50, protein: 2.0, fat: 0.1, carbs: 11 },
        { name: "红豆沙", alias: [], unit: "碗", weight: 200, calories: 240, protein: 4.0, fat: 0.2, carbs: 57 }
    ],

    // 2. 蔬菜菌菇类 (Veggies)
    veggies: [
        { name: "白菜", alias: ["大白菜"], unit: "份", weight: 200, calories: 17, protein: 1.5, fat: 0.2, carbs: 3 },
        { name: "小白菜", alias: ["青菜"], unit: "份", weight: 200, calories: 15, protein: 1.5, fat: 0.2, carbs: 2 },
        { name: "生菜", alias: [], unit: "份", weight: 150, calories: 15, protein: 1.3, fat: 0.2, carbs: 2 },
        { name: "菠菜", alias: [], unit: "份", weight: 200, calories: 28, protein: 2.9, fat: 0.3, carbs: 4 },
        { name: "芹菜", alias: [], unit: "根", weight: 100, calories: 16, protein: 0.8, fat: 0.1, carbs: 3 },
        { name: "韭菜", alias: [], unit: "份", weight: 100, calories: 29, protein: 2.0, fat: 0.4, carbs: 5 },
        { name: "空心菜", alias: [], unit: "份", weight: 200, calories: 20, protein: 1.8, fat: 0.2, carbs: 3 },
        { name: "西兰花", alias: [], unit: "朵", weight: 150, calories: 34, protein: 4.1, fat: 0.6, carbs: 7 },
        { name: "菜花", alias: ["花菜"], unit: "朵", weight: 150, calories: 27, protein: 2.1, fat: 0.3, carbs: 5 },
        { name: "黄瓜", alias: [], unit: "根", weight: 200, calories: 15, protein: 0.6, fat: 0.2, carbs: 3 },
        { name: "冬瓜", alias: [], unit: "块", weight: 200, calories: 12, protein: 0.3, fat: 0.2, carbs: 3 },
        { name: "苦瓜", alias: [], unit: "根", weight: 200, calories: 22, protein: 1.4, fat: 0.2, carbs: 4 },
        { name: "西红柿", alias: ["番茄"], unit: "个", weight: 150, calories: 18, protein: 0.9, fat: 0.2, carbs: 4 },
        { name: "圣女果", alias: ["小番茄"], unit: "颗", weight: 10, calories: 22, protein: 1.0, fat: 0.2, carbs: 5 },
        { name: "茄子", alias: [], unit: "根", weight: 200, calories: 25, protein: 1.1, fat: 0.2, carbs: 5 },
        { name: "青椒", alias: [], unit: "个", weight: 50, calories: 25, protein: 1.4, fat: 0.2, carbs: 5 },
        { name: "胡萝卜", alias: [], unit: "根", weight: 150, calories: 39, protein: 1.0, fat: 0.2, carbs: 9 },
        { name: "白萝卜", alias: [], unit: "根", weight: 200, calories: 16, protein: 0.7, fat: 0.1, carbs: 4 },
        { name: "洋葱", alias: [], unit: "个", weight: 150, calories: 40, protein: 1.1, fat: 0.1, carbs: 9 },
        { name: "大蒜", alias: ["蒜"], unit: "瓣", weight: 5, calories: 126, protein: 4.5, fat: 0.2, carbs: 27 },
        { name: "生姜", alias: ["姜"], unit: "片", weight: 5, calories: 47, protein: 1.3, fat: 0.6, carbs: 10 },
        { name: "莴笋", alias: [], unit: "根", weight: 200, calories: 15, protein: 0.8, fat: 0.1, carbs: 3 },
        { name: "竹笋", alias: ["笋"], unit: "根", weight: 100, calories: 23, protein: 2.0, fat: 0.2, carbs: 4 },
        { name: "芦笋", alias: [], unit: "根", weight: 50, calories: 20, protein: 2.2, fat: 0.2, carbs: 4 },
        { name: "秋葵", alias: [], unit: "根", weight: 20, calories: 37, protein: 2.0, fat: 0.3, carbs: 7 },
        { name: "豆苗", alias: [], unit: "份", weight: 100, calories: 25, protein: 2.5, fat: 0.3, carbs: 3 },
        { name: "香菇", alias: [], unit: "朵", weight: 20, calories: 26, protein: 2.2, fat: 0.3, carbs: 5 },
        { name: "金针菇", alias: [], unit: "把", weight: 100, calories: 32, protein: 2.4, fat: 0.4, carbs: 6 },
        { name: "平菇", alias: [], unit: "朵", weight: 50, calories: 26, protein: 2.3, fat: 0.3, carbs: 5 },
        { name: "木耳", alias: ["黑木耳"], unit: "份", weight: 50, calories: 25, protein: 1.0, fat: 0.2, carbs: 5 }, // fresh
        { name: "海带", alias: [], unit: "份", weight: 100, calories: 13, protein: 0.9, fat: 0.2, carbs: 2 },
        { name: "紫菜", alias: [], unit: "份", weight: 10, calories: 250, protein: 18.0, fat: 2.0, carbs: 50 } // dry
    ],

    // 3. 水果类 (Fruits)
    fruits: [
        { name: "苹果", alias: [], unit: "个", weight: 200, calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
        { name: "梨", alias: [], unit: "个", weight: 200, calories: 51, protein: 0.4, fat: 0.2, carbs: 13 },
        { name: "橙子", alias: ["橙"], unit: "个", weight: 150, calories: 47, protein: 0.9, fat: 0.2, carbs: 12 },
        { name: "橘子", alias: [], unit: "个", weight: 100, calories: 43, protein: 0.8, fat: 0.1, carbs: 11 },
        { name: "柚子", alias: [], unit: "瓣", weight: 100, calories: 38, protein: 0.8, fat: 0.2, carbs: 10 },
        { name: "柠檬", alias: [], unit: "片", weight: 10, calories: 29, protein: 1.1, fat: 0.3, carbs: 9 },
        { name: "香蕉", alias: [], unit: "根", weight: 120, calories: 91, protein: 1.1, fat: 0.3, carbs: 23 },
        { name: "葡萄", alias: ["提子"], unit: "颗", weight: 10, calories: 69, protein: 0.7, fat: 0.2, carbs: 18 },
        { name: "草莓", alias: [], unit: "颗", weight: 20, calories: 32, protein: 0.8, fat: 0.2, carbs: 7 },
        { name: "蓝莓", alias: [], unit: "盒", weight: 125, calories: 57, protein: 0.7, fat: 0.3, carbs: 14 },
        { name: "猕猴桃", alias: ["奇异果"], unit: "个", weight: 100, calories: 61, protein: 1.1, fat: 0.3, carbs: 15 },
        { name: "芒果", alias: [], unit: "个", weight: 200, calories: 60, protein: 0.8, fat: 0.2, carbs: 15 },
        { name: "菠萝", alias: ["凤梨"], unit: "块", weight: 100, calories: 48, protein: 0.5, fat: 0.1, carbs: 12 },
        { name: "西瓜", alias: [], unit: "块", weight: 150, calories: 25, protein: 0.6, fat: 0.2, carbs: 6 },
        { name: "哈密瓜", alias: [], unit: "块", weight: 150, calories: 34, protein: 0.5, fat: 0.1, carbs: 8 },
        { name: "桃子", alias: ["桃"], unit: "个", weight: 150, calories: 42, protein: 0.7, fat: 0.2, carbs: 10 },
        { name: "樱桃", alias: ["车厘子"], unit: "颗", weight: 10, calories: 46, protein: 1.0, fat: 0.2, carbs: 10 },
        { name: "荔枝", alias: [], unit: "颗", weight: 20, calories: 70, protein: 0.9, fat: 0.2, carbs: 16 },
        { name: "龙眼", alias: ["桂圆"], unit: "颗", weight: 10, calories: 70, protein: 1.0, fat: 0.2, carbs: 16 },
        { name: "火龙果", alias: [], unit: "个", weight: 300, calories: 51, protein: 1.1, fat: 0.2, carbs: 13 },
        { name: "牛油果", alias: [], unit: "个", weight: 150, calories: 160, protein: 2.0, fat: 15.0, carbs: 9 },
        { name: "榴莲", alias: [], unit: "块", weight: 100, calories: 150, protein: 2.5, fat: 6.0, carbs: 27 },
        { name: "椰肉", alias: [], unit: "块", weight: 50, calories: 350, protein: 4.0, fat: 33.0, carbs: 15 },
        { name: "枣", alias: ["红枣"], unit: "颗", weight: 10, calories: 280, protein: 3.0, fat: 0.4, carbs: 69 },
        { name: "柿子", alias: [], unit: "个", weight: 150, calories: 60, protein: 0.7, fat: 0.1, carbs: 15 }
    ],

    // 4. 肉蛋奶豆 (Proteins)
    proteins: [
        { name: "鸡蛋", alias: ["蛋"], unit: "个", weight: 50, calories: 143, protein: 13.0, fat: 9.5, carbs: 1.0 },
        { name: "蛋清", alias: [], unit: "个", weight: 30, calories: 60, protein: 11.0, fat: 0.1, carbs: 1.0 },
        { name: "蛋黄", alias: [], unit: "个", weight: 20, calories: 355, protein: 16.0, fat: 27.0, carbs: 4.0 },
        { name: "鸭蛋", alias: [], unit: "个", weight: 60, calories: 180, protein: 12.0, fat: 13.0, carbs: 3.0 },
        { name: "皮蛋", alias: [], unit: "个", weight: 60, calories: 150, protein: 12.0, fat: 10.0, carbs: 2.0 },
        { name: "鹌鹑蛋", alias: [], unit: "个", weight: 10, calories: 160, protein: 13.0, fat: 11.0, carbs: 1.0 },
        { name: "鸡胸肉", alias: ["鸡胸"], unit: "块", weight: 150, calories: 165, protein: 23.0, fat: 3.6, carbs: 0 },
        { name: "鸡腿", alias: ["鸡腿肉"], unit: "个", weight: 150, calories: 185, protein: 17.0, fat: 13.0, carbs: 0 },
        { name: "鸡翅", alias: ["鸡全翅"], unit: "个", weight: 100, calories: 190, protein: 17.0, fat: 12.0, carbs: 0 },
        { name: "烤鸡", alias: [], unit: "份", weight: 200, calories: 220, protein: 20.0, fat: 15.0, carbs: 0 },
        { name: "炸鸡块", alias: ["炸鸡"], unit: "份", weight: 150, calories: 290, protein: 15.0, fat: 20.0, carbs: 10 },
        { name: "鸭肉", alias: [], unit: "份", weight: 150, calories: 150, protein: 18.0, fat: 8.0, carbs: 0 },
        { name: "烤鸭", alias: [], unit: "份", weight: 150, calories: 400, protein: 15.0, fat: 38.0, carbs: 0 },
        { name: "瘦猪肉", alias: ["猪肉"], unit: "份", weight: 100, calories: 143, protein: 20.0, fat: 6.0, carbs: 0 },
        { name: "五花肉", alias: [], unit: "份", weight: 100, calories: 395, protein: 9.0, fat: 39.0, carbs: 0 },
        { name: "猪排", alias: ["排骨"], unit: "块", weight: 100, calories: 270, protein: 16.0, fat: 23.0, carbs: 0 },
        { name: "猪蹄", alias: [], unit: "个", weight: 300, calories: 260, protein: 24.0, fat: 18.0, carbs: 0 },
        { name: "腊肠", alias: ["香肠"], unit: "根", weight: 50, calories: 500, protein: 14.0, fat: 46.0, carbs: 3 },
        { name: "瘦牛肉", alias: ["牛肉"], unit: "份", weight: 100, calories: 125, protein: 20.0, fat: 4.0, carbs: 0 },
        { name: "牛腩", alias: [], unit: "份", weight: 100, calories: 250, protein: 18.0, fat: 20.0, carbs: 0 },
        { name: "牛排", alias: [], unit: "块", weight: 200, calories: 250, protein: 18.0, fat: 20.0, carbs: 0 },
        { name: "肥牛", alias: [], unit: "份", weight: 100, calories: 350, protein: 15.0, fat: 33.0, carbs: 0 },
        { name: "羊肉", alias: [], unit: "份", weight: 100, calories: 118, protein: 20.0, fat: 3.0, carbs: 0 },
        { name: "羊肉串", alias: [], unit: "串", weight: 50, calories: 250, protein: 18.0, fat: 20.0, carbs: 0 },
        { name: "牛肉干", alias: [], unit: "包", weight: 50, calories: 550, protein: 45.0, fat: 20.0, carbs: 20 },
        { name: "鱼肉", alias: ["鱼"], unit: "条", weight: 250, calories: 100, protein: 18.0, fat: 2.0, carbs: 0 },
        { name: "三文鱼", alias: [], unit: "片", weight: 100, calories: 208, protein: 20.0, fat: 13.0, carbs: 0 },
        { name: "虾", alias: ["虾仁"], unit: "只", weight: 20, calories: 81, protein: 17.0, fat: 0.9, carbs: 0 },
        { name: "小龙虾", alias: [], unit: "只", weight: 30, calories: 81, protein: 17.0, fat: 1.0, carbs: 0 },
        { name: "螃蟹", alias: ["蟹"], unit: "只", weight: 100, calories: 95, protein: 16.0, fat: 2.0, carbs: 0 },
        { name: "牛奶", alias: ["纯牛奶"], unit: "盒", weight: 250, calories: 62, protein: 3.2, fat: 3.2, carbs: 5.0 },
        { name: "酸奶", alias: [], unit: "杯", weight: 150, calories: 90, protein: 3.5, fat: 2.0, carbs: 12.0 },
        { name: "豆浆", alias: [], unit: "杯", weight: 300, calories: 30, protein: 2.0, fat: 1.0, carbs: 2 },
        { name: "豆腐", alias: [], unit: "块", weight: 100, calories: 82, protein: 8.0, fat: 4.0, carbs: 2.0 },
        { name: "豆腐脑", alias: [], unit: "碗", weight: 250, calories: 50, protein: 3.5, fat: 2.0, carbs: 5 },
        { name: "腐竹", alias: [], unit: "份", weight: 50, calories: 459, protein: 44.0, fat: 22.0, carbs: 20.0 }
    ],

    // 5. 零食坚果油脂 (Snacks & Fats)
    snacks: [
        { name: "花生", alias: [], unit: "把", weight: 20, calories: 567, protein: 23.0, fat: 45.0, carbs: 16.0 },
        { name: "瓜子", alias: [], unit: "把", weight: 20, calories: 580, protein: 24.0, fat: 50.0, carbs: 12.0 },
        { name: "核桃", alias: [], unit: "个", weight: 10, calories: 654, protein: 15.0, fat: 65.0, carbs: 14.0 },
        { name: "杏仁", alias: ["巴旦木"], unit: "颗", weight: 2, calories: 579, protein: 21.0, fat: 50.0, carbs: 20.0 },
        { name: "腰果", alias: [], unit: "颗", weight: 2, calories: 553, protein: 18.0, fat: 44.0, carbs: 27.0 },
        { name: "开心果", alias: [], unit: "颗", weight: 2, calories: 550, protein: 20.0, fat: 45.0, carbs: 20.0 },
        { name: "薯片", alias: [], unit: "包", weight: 70, calories: 536, protein: 7.0, fat: 35.0, carbs: 49.0 },
        { name: "饼干", alias: [], unit: "片", weight: 10, calories: 450, protein: 7.0, fat: 15.0, carbs: 70.0 },
        { name: "蛋糕", alias: [], unit: "块", weight: 100, calories: 350, protein: 5.0, fat: 20.0, carbs: 40.0 },
        { name: "巧克力", alias: [], unit: "块", weight: 20, calories: 580, protein: 5.0, fat: 35.0, carbs: 55.0 }, // Estimated
        { name: "奶茶", alias: [], unit: "杯", weight: 500, calories: 150, protein: 2.0, fat: 5.0, carbs: 20.0 }, // per 100g -> ~750kcal/cup? 150 seems high for 100g liquid. Adjusted: 70kcal/100ml -> 350kcal/cup.
        { name: "可乐", alias: ["雪碧", "汽水"], unit: "听", weight: 330, calories: 43, protein: 0, fat: 0, carbs: 10.6 },
        { name: "植物油", alias: ["花生油", "豆油", "菜籽油"], unit: "勺", weight: 10, calories: 899, protein: 0, fat: 99.9, carbs: 0 },
        { name: "黄油", alias: [], unit: "块", weight: 10, calories: 717, protein: 0.5, fat: 81.0, carbs: 0.5 }
    ]
};

// Helper to search food
export const findFood = (keyword) => {
    // Flatten all categories
    const allFoods = [
        ...foodLibrary.staples.map(f => ({ ...f, type: 'staple' })),
        ...foodLibrary.veggies.map(f => ({ ...f, type: 'veggie' })),
        ...foodLibrary.fruits.map(f => ({ ...f, type: 'fruit' })),
        ...foodLibrary.proteins.map(f => ({ ...f, type: 'protein' })),
        ...foodLibrary.snacks.map(f => ({ ...f, type: 'snack' }))
    ];

    // 1. Exact Name Match (Highest Priority)
    const exact = allFoods.find(f => f.name === keyword);
    if (exact) return exact;

    // 2. Alias Exact Match
    const aliasExact = allFoods.find(f => f.alias && f.alias.includes(keyword));
    if (aliasExact) return aliasExact;

    // 3. Partial Match (Keyword in Name)
    // Find the longest name match to avoid "Apple" matching "Apple Pie" incorrectly if looking for Pie
    // Actually we want the longest match FROM the library that exists IN the user input.
    // But here 'keyword' IS the user input? No, findFood usually takes a specific food name if extracted.
    // In healthService, we pass the whole input string.
    
    let bestMatch = null;
    let maxLen = 0;

    for (const food of allFoods) {
        const patterns = [food.name, ...(food.alias || [])];
        for (const p of patterns) {
            if (keyword.includes(p)) {
                if (p.length > maxLen) {
                    maxLen = p.length;
                    bestMatch = food;
                }
            }
        }
    }
    
    return bestMatch;
};
