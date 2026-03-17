# 健康洞察优化 - 实现计划

## [ ] 任务 1：每日推荐 - 删除今日营养概览模块
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `DailyFeed.jsx` 中删除"今日营养概览"区块
  - 保留营养数据的计算逻辑（供后续今日洞察使用）
- **Success Criteria**:
  - 每日推荐中不再显示营养概览模块
  - 美味推荐模块保持完整显示
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证 DailyFeed 中没有营养概览相关代码 ✓
  - `human-judgement` TR-1.2: 检查 UI 中营养概览区块已删除 ✓

## [ ] 任务 2：每日推荐 - 补充美味推荐的具体逻辑
- **Priority**: P0
- **Depends On**: 任务1
- **Description**: 
  - 优化美味推荐的展示逻辑
  - 确保早/中/晚餐的标签和图标正确显示
  - 优化布局和视觉效果
- **Success Criteria**:
  - 美味推荐清晰展示三餐内容
  - 显示热量和标签信息
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证美味推荐渲染逻辑正确
  - `human-judgement` TR-2.2: 检查 UI 显示清晰美观

## [ ] 任务 3：每日推荐 - 美味推荐增加采纳按钮
- **Priority**: P0
- **Depends On**: 任务2
- **Description**: 
  - 为每一顿餐（早/中/晚）添加"采纳"按钮
  - 点击采纳后，自动将该餐的营养数据记录到今日饮食记录中
  - 提高记录效率
- **Success Criteria**:
  - 每一餐都有明显的"采纳"按钮
  - 点击后正确记录营养数据
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证采纳按钮点击后正确调用存储服务
  - `human-judgement` TR-3.2: 检查按钮位置和交互体验良好

## [ ] 任务 4：健康洞察 - 改名和Tab化
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 将"健康周报"改名为"健康洞察"
  - 修改顶部Tab的标签文字
  - 重构 WeeklyReportPanel 组件，支持两个Tab切换
- **Success Criteria**:
  - 顶部Tab显示"今日洞察"和"本周洞察"
  - 可以在两个Tab之间切换
- **Test Requirements**:
  - `programmatic` TR-4.1: 验证Tab切换逻辑正确
  - `human-judgement` TR-4.2: 检查Tab UI和交互体验

## [ ] 任务 5：今日洞察 - 营养概览模块
- **Priority**: P0
- **Depends On**: 任务4
- **Description**: 
  - 在今日洞察Tab中添加营养概览模块
  - 复用原来每日推荐中的营养概览代码
  - 显示热量摄入进度、营养素分布、食材种类等
- **Success Criteria**:
  - 今日洞察中显示完整的营养概览
  - 数据准确反映当日记录
- **Test Requirements**:
  - `programmatic` TR-5.1: 验证营养数据计算和显示正确
  - `human-judgement` TR-5.2: 检查UI与原来的营养概览一致

## [ ] 任务 6：今日洞察 - 运动统计模块
- **Priority**: P0
- **Depends On**: 任务5
- **Description**: 
  - 在今日洞察Tab中添加运动统计模块
  - 显示今日运动时长、消耗热量、运动类型等
  - 可视化进度展示
- **Success Criteria**:
  - 今日洞察中显示完整的运动统计
  - 数据准确反映当日运动记录
- **Test Requirements**:
  - `programmatic` TR-6.1: 验证运动数据读取和计算正确
  - `human-judgement` TR-6.2: 检查运动统计UI清晰直观

## [ ] 任务 7：今日洞察 - 总结与明日建议模块
- **Priority**: P0
- **Depends On**: 任务6
- **Description**: 
  - 在今日洞察Tab中添加总结与建议模块
  - 分析：吃的够不够、对不对、好不好
  - 分析：运动够不够、对不对
  - 给出明日调整建议
- **Success Criteria**:
  - 显示清晰的今日总结
  - 给出具体可行的明日建议
- **Test Requirements**:
  - `programmatic` TR-7.1: 验证总结逻辑基于真实数据
  - `human-judgement` TR-7.2: 检查建议内容具体实用

## [ ] 任务 8：本周洞察 - 保持现有内容
- **Priority**: P0
- **Depends On**: 任务4
- **Description**: 
  - 将原来的周报内容移到本周洞察Tab
  - 保持现有的所有功能和展示
- **Success Criteria**:
  - 本周洞察Tab中显示完整的周报内容
  - 所有现有功能正常工作
- **Test Requirements**:
  - `programmatic` TR-8.1: 验证原有周报功能完整保留
  - `human-judgement` TR-8.2: 检查UI与原有周报一致

## [ ] 任务 9：PRD更新 - 添加新需求
- **Priority**: P1
- **Depends On**: 任务1-8
- **Description**: 
  - 更新 PRD_Hepai.md
  - 添加健康洞察的新需求描述
  - 更新数据流程图和功能说明
- **Success Criteria**:
  - PRD中包含完整的健康洞察需求说明
  - 与实现保持一致
- **Test Requirements**:
  - `programmatic` TR-9.1: 验证PRD文档已更新
  - `human-judgement` TR-9.2: 检查PRD内容清晰完整
