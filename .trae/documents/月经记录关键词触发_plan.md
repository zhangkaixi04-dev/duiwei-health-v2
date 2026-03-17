# 月经记录关键词触发 - 实现计划

## [ ] 任务 1：在全局命令列表中添加月经相关关键词
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在两处全局命令中断列表中添加月经相关关键词
  - 第一处：1867行的全局中断检查
  - 第二处：1918行的全局中断检查
  - 添加关键词："月经"、"经期"、"大姨妈"、"我要记月经"
- **Success Criteria**:
  - 包含月经关键词的文本能正确中断其他流程
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证关键词已添加到两个全局中断检查中
  - `human-judgement` TR-1.2: 检查"我要记月经"能中断其他流程

## [ ] 任务 2：在快速路径中添加月经记录触发逻辑
- **Priority**: P0
- **Depends On**: 任务1
- **Description**: 
  - 在快速路径关键词匹配中添加月经记录的触发
  - 参考现有的"我要记饮食"、"我要记睡眠"等模式
  - 匹配到相关关键词时，直接设置 `nextStep = 'period_record'` 并返回相应提示
- **Success Criteria**:
  - 输入"月经记录"、"我要记月经"、"记经期"、"大姨妈来了"等关键词时能触发月经记录卡片
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证快速路径中添加了月经记录逻辑
  - `human-judgement` TR-2.2: 测试多个关键词都能正确触发
  - `human-judgement` TR-2.3: 验证触发后显示正确的提示文本

## [ ] 任务 3：测试验证所有功能
- **Priority**: P0
- **Depends On**: 任务2
- **Description**: 
  - 测试各种关键词组合
  - 确保与现有功能不冲突
  - 验证从其他流程切换到月经记录流程正常
- **Success Criteria**:
  - 所有测试用例都能正常工作
- **Test Requirements**:
  - `human-judgement` TR-3.1: 测试"月经记录"触发
  - `human-judgement` TR-3.2: 测试"我要记月经"触发
  - `human-judgement` TR-3.3: 测试"记经期"触发
  - `human-judgement` TR-3.4: 测试"大姨妈来了"触发
  - `human-judgement` TR-3.5: 验证从其他流程切换正常
