# UI 优化 - 实现计划

## [x] 任务 1：底部常用功能替换 - 记月经替换为记运动
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `ChatInterface.jsx` 中修改 `allShortcuts` 数组
  - 将 `id: 'period', label: '记月经'` 替换为运动快捷入口
  - 添加运动对应的图标和样式
- **Success Criteria**:
  - 底部常用功能中显示"记运动"而不是"记月经"
  - 点击"记运动"能正确触发运动记录功能
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证 shortcuts 数组中包含运动快捷入口 ✓
  - `human-judgement` TR-1.2: 检查 UI 显示正确，点击功能正常 ✓
- **Notes**: 保持其他快捷入口不变

## [x] 任务 2：删除每日推荐中的心情签到
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `DailyFeed.jsx` 中删除心情签到区块
  - 删除相关的状态和处理逻辑
- **Success Criteria**:
  - 每日推荐中不再显示心情签到区块
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证 DailyFeed 组件中没有心情签到相关代码 ✓
  - `human-judgement` TR-2.2: 检查 UI 中心情签到区块已删除 ✓
- **Notes**: 保留其他功能区块

## [x] 任务 3：今日状态内容替换为心情签到
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `ChatInterface.jsx` 中修改 `DailyStatusCard` 组件
  - 将原来的身体状态选项替换为心情选项（平静、开心、疲惫、焦虑、期待）
  - 更新对应的处理逻辑
- **Success Criteria**:
  - 点击"今日状态"快捷入口后，显示心情签到选项
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证 DailyStatusCard 组件内容已更新 ✓
  - `human-judgement` TR-3.2: 检查 UI 显示正确的心情选项，保存功能正常 ✓
- **Notes**: 保持组件的基本结构和交互方式
