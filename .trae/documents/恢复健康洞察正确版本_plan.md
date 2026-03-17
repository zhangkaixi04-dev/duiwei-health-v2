# 恢复健康洞察正确版本 - 实施计划

## 需求说明
- 恢复健康洞察（包括今日洞察和本周洞察）的正确版本
- 保留经期记录的卫生巾描述版本（科学衡量标准）

## 当前问题
- 代码被改乱了，需要恢复到正确的状态

---

## [ ] 任务 1: 先保存经期记录的修改，然后恢复所有文件到Git原始状态
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 先保存ChatInterface.jsx中PeriodRecordCard的修改（卫生巾描述）
  - 使用git restore恢复所有其他文件到原始状态
- **Success Criteria**:
  - 所有文件（除了ChatInterface.jsx中的PeriodRecordCard）恢复到git原始状态
  - 经期记录的卫生巾描述版本被保留
- **Test Requirements**:
  - `programmatic` TR-1.1: git status显示只有ChatInterface.jsx被修改
  - `human-judgement` TR-1.2: 验证PeriodRecordCard组件包含卫生巾使用量描述
- **Notes**: 先读取当前PeriodRecordCard的代码保存下来

---

## [ ] 任务 2: 验证健康洞察（今日洞察+本周洞察）是否正常
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 验证HealthReport.jsx是否包含今日洞察和本周洞察
  - 验证ChatInterface.jsx是否正确使用健康洞察组件
- **Success Criteria**:
  - 健康洞察页面正常显示今日洞察和本周洞察
- **Test Requirements**:
  - `human-judgement` TR-2.1: 点击"健康洞察"tab能看到今日洞察和本周洞察内容
  - `programmatic` TR-2.2: 浏览器控制台无错误

---

## [ ] 任务 3: 验证经期记录的卫生巾描述版本
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 验证PeriodRecordCard组件显示卫生巾使用量作为科学衡量标准
- **Success Criteria**:
  - 经期记录显示三个选项：少量(1-2片)、中量(3-5片)、多量(6片以上)
- **Test Requirements**:
  - `human-judgement` TR-3.1: 触发经期记录卡片，验证显示卫生巾使用量描述
  - `programmatic` TR-3.2: 点击不同选项能正常选择

---

## [ ] 任务 4: 完整功能测试
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 测试所有核心功能：聊天、记录饮食、记录睡眠、记录排便、记录月经、健康洞察
- **Success Criteria**:
  - 所有功能正常工作，无错误
- **Test Requirements**:
  - `human-judgement` TR-4.1: 完整走一遍用户流程，验证所有功能正常
  - `programmatic` TR-4.2: 浏览器控制台无任何错误
