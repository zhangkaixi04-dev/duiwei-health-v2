# 营养概览统计逻辑优化 - 实现计划

## 任务概述
根据杨月欣《中国居民膳食营养素参考摄入量》优化营养概览的热量统计逻辑，并解决中餐合烹食物识别问题。

---

## [ ] Task 1: 实现杨月欣中国人基础代谢计算公式
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 研究并实现适用于中国人的BMR计算公式
  - 根据用户的年龄、性别、体重、身高计算基础代谢率
  - 集成活动系数计算目标热量
- **Success Criteria**:
  - 正确计算BMR值
  - 目标热量 = BMR × 活动系数
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证公式输入输出正确性
  - `human-judgement` TR-1.2: 检查计算结果是否合理
- **Notes**: 
  - 当前代码使用的是Harris-Benedict公式，需要确认是否需要调整为中国人特定版本
  - 活动系数：light(1.2), medium(1.55), heavy(1.725)

---

## [ ] Task 2: 完善三大营养素目标克数计算
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 确保三大营养素目标克数计算符合规格
  - 碳水目标(g) = (目标热量 × 55%) / 4
  - 蛋白质目标(g) = (目标热量 × 15%) / 4
  - 脂肪目标(g) = (目标热量 × 30%) / 9
- **Success Criteria**:
  - 三大营养素目标克数计算准确
  - 数值合理、可解释
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证公式计算正确性
  - `human-judgement` TR-2.2: 检查数值显示是否清晰

---

## [ ] Task 3: 完善食材种类统计逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 统计当天所有记录的food_name字段，去重后的数量
  - 确保正确从dailyLogs.diet中提取食物名称
  - 处理合烹食物的识别问题
- **Success Criteria**:
  - 食材种类统计准确
  - 去重逻辑正确
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证去重统计逻辑
  - `human-judgement` TR-3.2: 检查统计结果显示

---

## [ ] Task 4: 解决中餐合烹食物识别问题
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 提供中餐合烹食物（如番茄炒蛋、麻辣香锅）的识别解决方案
  - 方案一：建立合烹食物数据库，自动拆分营养素
  - 方案二：用户手动拆分输入（如"番茄炒蛋"可拆分为"番茄"、"鸡蛋"）
  - 方案三：智能识别关键词并估算
- **Success Criteria**:
  - 提供至少2种可行的解决方案
  - 合烹食物能够被正确记录和统计
- **Test Requirements**:
  - `programmatic` TR-4.1: 验证方案可行性
  - `human-judgement` TR-4.2: 检查用户体验是否友好
- **Notes**: 
  - 优先考虑实现用户友好的方案
  - 考虑添加合烹食物选项卡

---

## 修改文件清单
1. `/Users/bytedance/Desktop/duiwei_health_v2/src/components/ChatInterface.jsx` - WeeklyReportPanel组件
2. `/Users/bytedance/Desktop/duiwei_health_v2/src/components/personal/HealthReport.jsx` - 如有需要
3. `/Users/bytedance/Desktop/duiwei_health_v2/src/services/nutritionService.js` - 新建营养计算服务（可选）
4. `/Users/bytedance/Desktop/duiwei_health_v2/src/data/compositeFoods.js` - 新建合烹食物数据库（可选）

---

## 实现顺序
1. Task 1 → Task 2 → Task 3 → Task 4
2. 每个任务完成后进行测试验证
3. 最后进行集成测试和整体验证