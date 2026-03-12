# PRD: 藏真 - 人生博物馆 (Cangzhen: The Museum of Life)

## 1. 产品定位 (Product Positioning)
**藏真 (Cangzhen)** 是一款极简主义的“心神”疗愈应用。
- **核心隐喻**: 将人生经历视为一座博物馆，每一次记录都是一次“封存”。
- **目标用户**: 追求精神世界富足、需要情绪出口的高敏感人群 (HSP)。
- **设计哲学**: 反效率、慢交互、仪式感。

## 2. 核心功能 (Core Features)

### 2.1. 四大展馆 (The Four Halls)
用户的所有记录（Memory）必须归属于以下四个展馆之一：

#### 2.1.1. 感知馆 (Sensation Hall)
- **定义**: 记录五感（视觉、听觉、嗅觉、味觉、触觉）的细腻瞬间。
- **示例**: “雨后泥土的腥味”、“早晨第一缕阳光打在窗帘上的光斑”。
- **色彩**: 米色/大地色 (#D6CEAB).

#### 2.1.2. 情绪馆 (Emotion Hall)
- **定义**: 记录当下的真实情绪，无论是喜悦还是焦虑。
- **示例**: “被误解后的委屈”、“完成任务后的如释重负”。
- **色彩**: 柔和绿 (#A0C4A0).

#### 2.1.3. 灵感馆 (Inspiration Hall)
- **定义**: 捕捉稍纵即逝的想法、脑洞或创意。
- **示例**: “如果云是棉花糖做的”、“一个关于时间的短篇小说构思”。
- **色彩**: 淡紫色 (#C4BAD0).

#### 2.1.4. 万象馆 (Wanxiang Hall)
- **定义**: 记录人生中的重大决策、承诺或深刻的顿悟。
- **示例**: “决定辞职去旅行”、“答应自己每天早睡”。
- **色彩**: 暖灰色 (#E0D8C8).

### 2.2. 封存仪式 (Sealing Ritual)
**藏真**不使用“发布”或“保存”这样的词汇，而是**“封存 (Seal)”**。
- **交互流程**:
  1.  **书写/上传**: 输入文字或图片（拍立得风格）。
  2.  **选择展馆**: 决定这份记忆的归属。
  3.  **按下封印**: 长按或点击“封存”按钮。
  4.  **动画反馈**: 
      - 屏幕模糊 (Blur)，聚焦于中心的印章。
      - 盖下 "SEALED" 红色印章。
      - 随机绽放一朵花（见 2.3）。

### 2.3. 徽章与成就 (Badges & Milestones)
为了鼓励持续记录，系统设有隐性的成就系统：
- **初见玫瑰**: 第 1 次封存。
- **坚持百合**: 第 3 次封存。
- **希望向日葵**: 第 7 次封存。
- **展示**: 用户可以在“徽章墙”查看已收集的植物。

### 2.4. 每日推荐 (Daily Recommendation)
- **功能**: 每天早晨推送 4 条微行动建议（每个展馆一条）。
- **内容库**: 由人工精选的 80+ 条治愈系任务（如“去摸摸树皮的纹理”）。
- **AI 迭代**: 系统会根据用户的记录偏好，微调推荐的文案风格（温柔/理性/活泼）。

### 2.5. 沉浸式浏览 (Immersive Browsing)
- **博物馆视图**: 3D 视差滚动的卡片流。
- **回顾**: 点击卡片可查看详情，支持生成分享图。

## 3. 界面设计 (UI Design)
- **风格**: 拟物化 (Skeuomorphism) + 新拟态 (Neumorphism)。
- **材质**: 磨砂玻璃、粗糙纸张、凸版印刷。
- **字体**: 衬线体 (Serif) 为主，强调文学感。
- **动效**: 缓慢、优雅、流畅（如花朵绽放的帧动画）。

## 4. 数据架构 (Data Schema)

### 4.1. 记忆实体 (`Memory`)
```json
{
  "id": 1698374829102,
  "date": "2023-10-27",
  "content": "今天看见了一朵很像兔子的云。",
  "image": "data:image/jpeg;base64,...", // Base64
  "hall": "inspiration", // 'sensation' | 'emotion' | 'inspiration' | 'wanxiang'
  "tags": ["云", "天空"]
}
```

### 4.2. 每日推荐缓存 (`DailyRec`)
```json
{
  "date": "2023-10-27",
  "tasks": {
    "sensation": "闭上眼，听一分钟窗外的声音。",
    "emotion": "给镜子里的自己一个微笑。",
    "inspiration": "用左手写下你的名字。",
    "wanxiang": "做一件一直想做但不敢做的小事。"
  }
}
```

## 5. 技术栈 (Tech Stack)
- **前端**: React 18, Vite, Tailwind CSS.
- **动画**: CSS Keyframes, Framer Motion (可选).
- **存储**: localStorage (纯本地，保护隐私).
- **图标**: Lucide React.

## 6. 质量保证与开发规范 (QA & Development Guidelines)
**【AI 必读】为防止代码回归和页面崩溃，每次修改代码必须严格执行以下自查流程：**

### 6.1. 重构安全规范 (Refactoring Safety)
1.  **变量重命名 (Strict Renaming)**:
    -   严禁只修改定义而不修改引用。
    -   修改变量名后，**必须**使用 `grep` 或全局搜索旧变量名，确保无残留。
    -   *案例教训*: `localMemories` -> `rawMemories` 重命名不彻底导致 ReferenceError。
2.  **状态初始化 (State Initialization)**:
    -   所有 `useState` 必须有安全的初始值（如 `[]`, `null`, `{}`），严禁 `undefined`。
    -   在 `useEffect` 或渲染逻辑中，使用前必须判空（如 `if (!data) return null`）。

### 6.2. 页面防崩机制 (Crash Prevention)
1.  **错误边界 (Error Boundaries)**:
    -   所有核心页面（如 `Review.jsx`, `Museum.jsx`, `ChatInterface.jsx`）**必须**包裹在 `ErrorBoundary` 组件内。
    -   禁止移除现有的 ErrorBoundary 代码。
2.  **空数据兜底 (Empty State Handling)**:
    -   页面必须处理 `data = []` 或 `data = null` 的情况，显示友好的 Empty State，而不是白屏或报错。
    -   *检查点*: `map` 函数前必须检查数组是否为 Array (`Array.isArray(data) && data.map(...)`)。

### 6.3. 组件完整性 (Component Integrity)
1.  **导入/导出检查**:
    -   引用组件（如 `FlowerIcons`）前，确认该组件已正确 `export`。
    -   修改组件 props 接口时，必须同步修改所有调用处。
2.  **样式隔离**:
    -   使用 Tailwind 类名时，注意不要破坏全局布局（如 `h-screen`, `overflow-hidden`）。

### 6.4. 提交前自查清单 (Pre-commit Checklist)
每次 `git commit` 前，AI 必须自问：
- [ ] 我是否修改了变量名？如果是，是否搜索了所有引用？
- [ ] 我是否删除了关键逻辑（如 ErrorBoundary）？
- [ ] 新增的代码在 `data` 为空时会报错吗？
- [ ] 我是否验证了修改对现有功能的影响（回归测试）？
