# PRD: 合拍 AI 健康管家 (Hepai AI Health Manager)

## 1. 产品定位 (Product Positioning)
**合拍 (Hepai)** 是一款 AI 智能健康管家。
- **核心理念**: 顺时而食，因人制宜。
- **差异化优势**: 将中医九大体质理论与现代营养学深度融合，提供“比亲妈更懂你”的个性化健康建议。
- **交互形态**: 对话式 UI (Chat UI)，模拟微信聊天体验。

## 2. 核心功能 (Core Features)

### 2.1. 智能饮食分析 (Smart Diet Analysis)
**功能描述**: 用户输入食物（文字/语音/图片），AI 自动分析热量、营养并结合体质给出建议。

#### 2.1.1. 分析逻辑 (Analysis Logic)
系统采用 **“双层漏斗”** 分析机制：
1.  **第一层：本地规则引擎 (Local Rules)** - *高频、离线、快速*
    -   **数据源**: 本地 500+ 种常见食物营养库 (`src/data/foodLibrary.js`).
    -   **识别**: 自动提取食物名称与份量（如“200g 米饭”）。
    -   **定性**: 判断食物属性（寒凉/温热/辛辣/发物/油腻/甜腻）。
2.  **第二层：大模型推理 (LLM)** - *长尾、复杂、深度*
    -   调用 Doubao/Zhipu API 对未收录食物或复杂菜品进行分析。

#### 2.1.2. 体质匹配矩阵 (Constitution Matrix)
系统根据用户体质对同一食物给出不同反馈：

| 体质类型 | 核心禁忌 (Key Avoidance) | 推荐方向 (Recommendation) | 示例 (Example) |
| :--- | :--- | :--- | :--- |
| **阳虚质** | 忌生冷、寒凉、冰饮、水果过量 | 宜温补、姜茶、热食 | 吃冰激凌 -> 警告：伤阳气，建议喝姜茶补救 |
| **湿热质** | 忌辛辣、酒、油炸、热带水果(芒果/榴莲) | 宜清热、祛湿、绿豆、冬瓜 | 吃麻辣火锅 -> 警告：助湿生热，建议喝金银花茶 |
| **痰湿质** | 忌肥甘厚味、甜食、奶茶、滋腻 | 宜陈皮、普洱、清淡、运动 | 喝奶茶 -> 警告：生痰之源，建议快走30分钟 |
| **气虚质** | 忌耗气食物(萝卜/山楂)、生冷 | 宜甘温补气(鸡肉/山药)、易消化 | 吃生萝卜 -> 提示：破气，少吃 |
| **阴虚质** | 忌辛辣、烧烤、羊肉、姜蒜 | 宜滋阴、银耳、百合、梨 | 吃烧烤 -> 警告：伤阴助火，建议吃梨润燥 |
| **血瘀质** | 忌寒凉、冷饮、油腻 | 宜活血、山楂、醋、泡脚 | 喝冷饮 -> 警告：寒凝血瘀，建议泡脚 |
| **气郁质** | 忌刺激(浓茶/咖啡/烈酒) | 宜疏肝、花茶、柑橘类 | 喝浓茶 -> 提示：可能加重焦虑 |
| **特禀质** | 忌发物(海鲜/鹅/笋/酒) | 宜清淡、固表、观察过敏 | 吃海鲜 -> 提示：注意观察皮肤反应 |
| **平和质** | 忌过量、油腻、高糖 | 宜均衡、多样化 | 正常饮食 -> 鼓励：保持即可 |

#### 2.1.3. 体质矩阵评分公式 (Matrix Scoring Formula)

**核心逻辑：** 体质为基础参数、时令和场景为关键调节参数。

**1. 参数定义：**
- **体质底分 (Base Score)**: 先用九体质确定敏感度与容错率的固定底分，体质越特殊越难应需要悉心调理基础分越高（约占 20%）
- **时令风险 (Seasonal Risk)**: 识别当前季节及高危时段，叠加 0~3 分时令风险
- **食材风险 (Ingredient Risk)**: 根据食物属性（寒凉/温热/辛辣/发物/油腻等）评估风险
- **状态风险 (Status Risk)**: 用户当前身体状态（疲劳/疼痛/腹泻等）
- **食用量风险 (Quantity Risk)**: 单次摄入热量（>800kcal 为高风险）

**2. 九体质参数表：**

| 体质类型 | 底分 | 核心禁忌标签 | 高危季节 | 补救方案 |
| :--- | :--- | :--- | :--- | :--- |
| **特禀质** | 11 | fa_wu, seafood, bamboo_shoot, goose, processed, additives | 春、秋 | 停止食用、抗过敏处理、喝小米粥 |
| **阳虚质** | 10 | cold, raw, iced, greasy, fried, fatty | 三伏、三九 | 姜枣茶、热敷腹部、艾灸神阙穴 |
| **气虚质** | 10 | energy_draining, radish, hawthorn, betel_nut, mint, raw, cold | 春、秋 | 山药粥、黄芪水、静养 |
| **阴虚质** | 9 | spicy, hot, lamb, bbq, fried, litchi, hotpot | 秋 | 石斛水、银耳梨汤、麦冬茶 |
| **湿热质** | 8 | alcohol, sweet, fried, greasy, tropical_fruit, bbq | 三伏、梅雨 | 金银花露、绿豆汤、赤小豆水 |
| **痰湿质** | 8 | greasy, fatty, sweet, sticky, dairy, glutinous, cream | 梅雨 | 陈皮水、红豆薏米水、饭后快走 |
| **血瘀质** | 7 | cold, sour, astringent, fatty, ice, persimmon | 三九、冬 | 玫瑰花茶、红糖姜茶、温水泡脚 |
| **气郁质** | 7 | stimulant, coffee, strong_tea, alcohol, gas_producing, beans, sweet_potato | 春 | 逍遥丸（遵医嘱）、薄荷茶、户外快走 |
| **平和质** | 5 | extreme_cold, extreme_hot, binge_eating | 无 | 清淡饮食、正常休息 |

**3. 场景分流权重公式：**

按"未吃/咨询"和"已吃/补救"分流到两个权重公式：

- **未吃/咨询 (Inquiry Mode)**: 食材 35% + 体质 25% + 时令 25% + 状态 15%
- **已吃/补救 (Record Mode)**: 食材 30% + 状态 25% + 食用量 25% + 体质 15% + 时令 5%

**4. 禁忌优先原则 (Taboo First)：**
- **核心禁忌触发强制高风险**：如果食物触犯了体质的核心禁忌（如阳虚质吃油炸食品），直接设置风险分为 90 分（极高风险），忽略其他因素
- **咨询模式输出**：风险≥80 → "严禁食用"，风险≥60 → "不宜食用"，风险≤30 → "推荐"
- **记录模式输出**：风险≥80 → "需补救"，风险≥60 → "少吃"，风险≤30 → "优选"

### 2.2. 智能睡眠管理 (Smart Sleep)
- **多模态记录**: 支持手动输入（“昨晚11点睡7点起”）或设备同步（Mock）。
- **中医时钟分析**: 
  - **子时 (23-1点)**: 胆经当令，熬夜伤胆气（口苦/决断力差）。
  - **丑时 (1-3点)**: 肝经当令，易醒代表肝火旺/肝血虚。
  - **寅时 (3-5点)**: 肺经当令，早醒代表肺气不足。
- **反馈**: 针对入睡时间与易醒时段，推送穴位按摩或食疗建议。

### 2.3. 健康周报 (Weekly Report)
- **生成机制**: 每周一自动生成上周总结卡片。
- **核心指标**: 
  - 睡眠达标率 / 饮食规律分 / 运动频次 / 排便状态。
- **AI 洞察**: 
  - 关联分析（Correlation）: “监测到您周二熬夜，周三记录了‘精神不振’，建议今晚早睡补救。”
  - 趋势预警: “连续 3 天摄入高糖，体质有转湿热风险。”

### 2.4. 快捷指令系统 (Shortcut System)
为了提升记录效率，App 提供全局快捷操作：
- **记饮食**: 唤起输入框 + 拍照入口。
- **记睡眠**: 唤起时间选择器 + 感受评分。
- **记排便**: 唤起布里斯托(Bristol)分型选择器。
- **记经期**: 唤起日历与症状记录。
- **今日状态**: 快速选择身体感受（疲劳/精力充沛/胃胀等）。

### 2.5. 混合意图识别 (Hybrid Intent Recognition)
为了解决关键词匹配精度差的问题，系统采用 **Hybrid Mode（混合模式）** 意图识别：

#### 2.5.1. 三层识别架构
1. **Level 0: 快速路径 (Fast Path)** - 零延迟，正则匹配
   - 明确指令关键词立即识别：
     - "我要记饮食" → `diet_record`
     - "我要记睡眠" → `sleep_record`
     - "我要记排便" → `poop_record`
     - "我要记经期" → `period_record`

2. **Level 1: 本地 Fallback (Local Fallback)** - 无网络依赖，正则模式匹配
   - 饮食记录：包含"吃了/喝了/早餐/午饭/晚餐" + 食物关键词 → `diet_record`
   - 饮食咨询：包含"能吃吗/可以吃吗/好不好" + 食物关键词 → `diet_inquiry`
   - 睡眠记录：包含"睡了/刚醒/昨晚" + 时间关键词 → `sleep_record`
   - 运动记录：包含"跑了/走了/运动了" + 时长/距离 → `exercise_record`

3. **Level 2: 大模型识别 (LLM Classification)** - 高精度，语义理解
   - 当快速路径和本地 Fallback 都无法明确识别时，调用 LLM 进行语义分析
   - 分类标签：
     - `diet_record`: 记录饮食（如："吃了两个苹果"）
     - `diet_inquiry`: 饮食咨询（如："阳虚能吃西瓜吗"）
     - `diet_summary`: 饮食复盘（如："今天吃了什么"）
     - `sleep_record`: 记录睡眠（如："昨晚11点睡的"）
     - `poop_record`: 记录排便（如："拉肚子了"）
     - `period_record`: 记录经期（如："大姨妈来了"）
     - `status_record`: 记录身体状态（如："头痛"）
     - `exercise_record`: 记录运动（如："跑了5公里"）
     - `chat`: 闲聊/其他（如："你好"、"谢谢"）

#### 2.5.2. 降级保障 (Fallback Guarantee)
- **LLM 失败时**：自动降级到本地 Fallback 逻辑
- **最终 Fallback**：如果检测到食物关键词但无法明确意图，默认识别为 `diet_record`

#### 2.5.3. 意图优先级 (Intent Priority)
- 问题优先：如果文本包含"吗/？/?"等疑问词，优先识别为咨询而非记录
- 明确指令优先：快速路径 > 本地 Fallback > LLM

## 3. 数据架构 (Data Schema)

### 3.1. 用户档案 (`userProfile`)
```json
{
  "basicInfo": {
    "gender": "female", // 'female' | 'male'
    "age": 25,
    "height": 165, // cm
    "weight": 50,  // kg
    "activity": "light", // 'light' | 'medium' | 'heavy'
    "constitution": {
      "type": "阳虚质",
      "desc": "阳气不足，失于温煦..."
    }
  },
  "settings": {
    "reminders": {
      "morning": "08:00",
      "night": "22:00"
    }
  }
}
```

### 3.2. 日志记录 (`dailyLogs`)
以日期为 Key 的稀疏数组：
```json
{
  "2023-10-27": {
    "diet": [
      { "name": "米饭", "cal": 200, "time": "12:30" },
      { "name": "红烧肉", "cal": 450, "time": "12:30" }
    ],
    "nutrition": { 
      "calories": 1500, 
      "nutrients": { "carb": 200, "protein": 60, "fat": 50 } 
    },
    "sleep": { 
      "duration": "7h30m", 
      "score": 85, 
      "wakePeriods": ["chou"] 
    },
    "exercise": { "type": "run", "duration": 30, "cal": 200 },
    "poop": { "shape": 4, "color": "yellow_brown" }
  }
}
```

### 3.3. 本地食物库 (`foodLibrary`)
位于 `src/data/foodLibrary.js`，包含 500+ 条数据：
```javascript
export const foodLibrary = {
  staples: [
    { name: "白米饭", unit: "碗", weight: 200, calories: 232, protein: 5.2, ... },
    ...
  ],
  fruits: [...],
  veggies: [...],
  proteins: [...],
  snacks: [...]
};
```

## 4. 界面设计 (UI Design)
- **风格**: 极简、现代、高效。
- **主色调**: 
  - 品牌色: 绿色 (Emerald-500) 代表健康。
  - 辅助色: 橙色 (饮食)、靛蓝 (睡眠)、玫瑰 (经期)。
- **核心页面**:
  - **Chat Home**: 所有交互的发生地。
  - **Dashboard**: 顶部折叠面板，展示“今日数据”与“周报”。
  - **Profile**: 个人信息与设置。

## 5. 技术栈 (Tech Stack)
- **前端**: React 18, Vite, Tailwind CSS.
- **图标**: Lucide React.
- **状态管理**: React Context + localStorage (Persistence).
- **AI**: 
  - NLP: Doubao (Volcengine Ark).
  - Vision: Zhipu GLM-4V.
