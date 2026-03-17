# 每周洞察评分优化 - 实施计划

## 一、科学评判依据分析

### 1.1 睡眠模块（满分10分）
**科学依据**：
- **睡眠时长**：7-8小时（依据全因死亡率研究）
- **入睡时间**：23:00前（养肝黄金期）
- **易醒情况**：无易醒最佳

**评分维度与权重**：
| 维度 | 满分 | 权重 | 评分标准 |
|------|------|------|---------|
| 睡眠时长 | 4分 | 40% | 7-8h=4分，6-7h/8-9h=2分，<6h或>9h=0分 |
| 入睡时间 | 3分 | 30% | ≤23:00=3分，23:00-23:30=1.5分，>23:30=0分 |
| 易醒情况 | 3分 | 30% | 无易醒=3分，1个时段=1.5分，≥2个时段=0分 |

**评分公式**：
```
睡眠模块得分 = (睡眠时长得分 + 入睡时间得分 + 易醒情况得分)
睡眠模块等级：
- 优秀：8.5-10分
- 良好：7-8.4分
- 达标：5-6.9分
- 不达标：<5分
```

---

### 1.2 饮食模块（满分10分）
**科学依据**：
- **热量摄入**：目标热量的 85%-115%
- **三大营养素**：碳水50-65%、蛋白质10-15%、脂肪20-30%
- **日食材种类**：≥ 12种/天
- **周食材多样性**：≥ 25种/周
- **体质适配**：禁忌食物占比 ≤ 20%

**评分维度与权重**：
| 维度 | 满分 | 权重 | 评分标准 |
|------|------|------|---------|
| 热量摄入 | 2.5分 | 25% | 85-115%=2.5分，70-85%或115-130%=1.25分，<70%或>130%=0分 |
| 三大营养素 | 2.5分 | 25% | 3项达标=2.5分，2项达标=1.5分，1项达标=0.5分，0项=0分 |
| 日食材种类 | 2分 | 20% | ≥12种=2分，8-11种=1分，<8种=0分 |
| 周食材种类 | 1.5分 | 15% | ≥25种=1.5分，18-24种=0.75分，<18种=0分 |
| 体质适配 | 1.5分 | 15% | ≤20%禁忌=1.5分，20-40%=0.75分，>40%=0分 |

**评分公式**：
```
饮食模块得分 = (热量得分 + 营养素得分 + 日种类得分 + 周种类得分 + 体质适配得分)
饮食模块等级：
- 优秀：8.5-10分
- 良好：7-8.4分
- 达标：5-6.9分
- 不达标：<5分
```

---

### 1.3 运动模块（满分10分）
**科学依据**（WHO推荐）：
- **每周总时长**：≥ 150分钟中等强度有氧
- **运动频率**：3-5天/周（分散运动，而非一次性）
- **每次运动时长**：≥ 30分钟/次（推荐）

**评分维度与权重**：
| 维度 | 满分 | 权重 | 评分标准 |
|------|------|------|---------|
| 周总时长 | 4分 | 40% | ≥150分钟=4分，100-149分钟=2分，<100分钟=0分 |
| 运动频率 | 3.5分 | 35% | 3-5天=3.5分，2天或6天=1.75分，0-1天或7天=0分 |
| 平均每次时长 | 2.5分 | 25% | ≥30分钟=2.5分，20-29分钟=1.25分，<20分钟=0分 |

**评分公式**：
```
运动模块得分 = (周总时长得分 + 运动频率得分 + 平均每次时长得分)
运动模块等级：
- 优秀：8.5-10分
- 良好：7-8.4分
- 达标：5-6.9分
- 不达标：<5分
```

---

### 1.4 排便模块（满分10分）
**科学依据**（布里斯托大便分类法）：
- **排便频率**：1-2次/天
- **大便形状**：3-4型（香蕉状）
- **排便问题**：无便秘/腹泻

**评分维度与权重**：
| 维度 | 满分 | 权重 | 评分标准 |
|------|------|------|---------|
| 排便频率 | 3.5分 | 35% | 1-2次/天=3.5分，1次/2天或3次/天=1.75分，<1次/2天或>3次/天=0分 |
| 大便形状 | 4分 | 40% | 3-4型=4分，2型或5型=2分，1型或6-7型=0分 |
| 排便问题 | 2.5分 | 25% | 无问题=2.5分，轻微问题=1.25分，严重问题=0分 |

**评分公式**：
```
排便模块得分 = (排便频率得分 + 大便形状得分 + 排便问题得分)
排便模块等级：
- 优秀：8.5-10分
- 良好：7-8.4分
- 达标：5-6.9分
- 不达标：<5分
```

---

### 1.5 每周总分计算
```
每周总分 = (睡眠得分 + 饮食得分 + 运动得分 + 排便得分) / 4
```

**总分范围**：0-10分

**总分等级**：
- 优秀：8.5-10分
- 良好：7-8.4分
- 达标：5-6.9分
- 需改善：<5分

---

## 二、实施任务分解

### [ ] Task 1: 创建评分服务模块
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 创建 `src/services/scoringService.js`
  - 实现各模块权重评分计算函数
  - 实现周数据聚合函数
  - 实现总分计算和等级判定
- **Success Criteria**:
  - 服务模块能独立运行
  - 所有评分函数有明确的输入输出
- **Test Requirements**:
  - `programmatic` TR-1.1: 能正确计算单个模块权重得分
  - `programmatic` TR-1.2: 能正确聚合7天数据
  - `programmatic` TR-1.3: 总分计算正确（0-10分）
  - `programmatic` TR-1.4: 等级判定正确

---

### [ ] Task 2: 实现睡眠模块权重评分逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `calculateSleepScore(dayData)` 函数
  - 按权重计算3个维度得分并求和
  - 返回睡眠模块得分和等级
  - 计算周睡眠模块平均得分
- **Success Criteria**:
  - 能正确按权重计算睡眠模块得分
  - 能正确判定模块等级
- **Test Requirements**:
  - `programmatic` TR-2.1: 睡眠7.5h、22:30入睡、无易醒 → 10分（优秀）
  - `programmatic` TR-2.2: 睡眠6.5h、23:15入睡、1个易醒 → 5分（达标）
  - `programmatic` TR-2.3: 睡眠5h、0:00入睡、2个易醒 → 0分（不达标）
  - `programmatic` TR-2.4: 7天平均8分 → 周睡眠模块8分

---

### [ ] Task 3: 实现饮食模块权重评分逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `calculateDietScore(dayData, weekData, userProfile)` 函数
  - 按权重计算5个维度得分并求和
  - 返回饮食模块得分和等级
  - 计算周饮食模块平均得分
- **Success Criteria**:
  - 能正确按权重计算饮食模块得分
  - 能正确判定模块等级
- **Test Requirements**:
  - `programmatic` TR-3.1: 热量95%、3项营养素达标、15种、周28种、禁忌10% → 10分（优秀）
  - `programmatic` TR-3.2: 热量80%、2项营养素达标、10种、周20种、禁忌30% → 5分（达标）
  - `programmatic` TR-3.3: 热量60%、0项营养素达标、5种、周15种、禁忌50% → 0分（不达标）
  - `programmatic` TR-3.4: 7天平均7分 → 周饮食模块7分

---

### [ ] Task 4: 实现运动模块权重评分逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `calculateExerciseScore(weekData)` 函数
  - 按权重计算3个维度得分并求和
  - 返回运动模块得分和等级
  - 计算周运动模块得分（周维度，不是日维度）
- **Success Criteria**:
  - 能正确按权重计算运动模块得分
  - 能正确判定模块等级
- **Test Requirements**:
  - `programmatic` TR-4.1: 周160分钟、4天、平均40分钟 → 10分（优秀）
  - `programmatic` TR-4.2: 周120分钟、2天、平均60分钟 → 3.75分（不达标）
  - `programmatic` TR-4.3: 周80分钟、3天、平均27分钟 → 3.25分（不达标）
  - `programmatic` TR-4.4: 周50分钟、1天、平均50分钟 → 0分（不达标）

---

### [ ] Task 5: 实现排便模块权重评分逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现 `calculatePoopScore(dayData)` 函数
  - 按权重计算3个维度得分并求和
  - 返回排便模块得分和等级
  - 计算周排便模块平均得分
- **Success Criteria**:
  - 能正确按权重计算排便模块得分
  - 能正确判定模块等级
- **Test Requirements**:
  - `programmatic` TR-5.1: 1次/天、4型、无问题 → 10分（优秀）
  - `programmatic` TR-5.2: 1次/2天、2型、轻微问题 → 5分（达标）
  - `programmatic` TR-5.3: <1次/3天、1型、严重问题 → 0分（不达标）
  - `programmatic` TR-5.4: 7天平均9分 → 周排便模块9分

---

### [ ] Task 6: 整合所有模块计算每周总分
- **Priority**: P0
- **Depends On**: Tasks 2, 3, 4, 5
- **Description**:
  - 实现 `calculateWeeklyScore(weekData, userProfile)` 函数
  - 聚合4个模块权重得分
  - 计算平均值作为总分
  - 判定总分等级
  - 返回完整的评分报告（含各模块得分、等级、详细维度）
- **Success Criteria**:
  - 能正确计算每周总分（0-10分）
  - 返回数据包含各模块得分和等级
- **Test Requirements**:
  - `programmatic` TR-6.1: 睡眠8分、饮食7分、运动6分、排便9分 → 总分7.5分（良好）
  - `programmatic` TR-6.2: 所有模块10分 → 总分10分（优秀）
  - `programmatic` TR-6.3: 所有模块0分 → 总分0分（需改善）
  - `programmatic` TR-6.4: 总分6.5分 → 等级为达标

---

### [ ] Task 7: 更新 WeeklyReportCard 使用新评分
- **Priority**: P1
- **Depends On**: Task 6
- **Description**:
  - 修改 `WeeklyReportCard` 组件
  - 调用新的评分服务
  - 展示总分（0-10分）及等级
  - 展示各模块得分详情及等级
  - 展示各模块关键维度得分
- **Success Criteria**:
  - 健康分显示为0-10分及对应等级
  - 各模块得分和等级正确显示
- **Test Requirements**:
  - `human-judgment` TR-7.1: UI显示清晰，易于理解
  - `human-judgment` TR-7.2: 各模块得分展示合理
  - `human-judgment` TR-7.3: 等级标识清晰（优秀/良好/达标/不达标）

---

### [ ] Task 8: 测试并验证完整流程
- **Priority**: P1
- **Depends On**: Task 7
- **Description**:
  - 端到端测试完整流程
  - 验证各种边界情况
  - 验证数据存储和读取
- **Success Criteria**:
  - 所有测试用例通过
  - 评分逻辑稳定可靠
- **Test Requirements**:
  - `programmatic` TR-8.1: 完整流程无错误
  - `human-judgment` TR-8.2: 用户体验流畅

---

## 三、数据结构设计

### 3.1 每日数据结构
```javascript
{
  date: '2023-10-23',
  sleep: {
    duration: 7.5,      // 小时
    sleepTime: '22:30', // 入睡时间
    wakeTime: '06:00',  // 起床时间
    wakePeriods: [],     // 易醒时段
    scoreBreakdown: {    // 得分明细
      durationScore: 4,
      bedtimeScore: 3,
      wakePeriodsScore: 3
    },
    totalScore: 10,
    grade: '优秀'
  },
  diet: {
    items: [...],       // 食物列表
    nutrition: {
      calories: 1800,
      targetCalories: 2000,
      nutrients: { carb: 220, protein: 70, fat: 55 }
    },
    foodVariety: 15,    // 当日食材种类
    tabooRatio: 0.1,     // 禁忌食物占比
    scoreBreakdown: {
      caloriesScore: 2.5,
      nutrientsScore: 2.5,
      dailyVarietyScore: 2,
      weeklyVarietyScore: 1.5,
      constitutionScore: 1.5
    },
    totalScore: 10,
    grade: '优秀'
  },
  exercise: {
    type: 'jogging',
    duration: 30,       // 分钟
    calories: 280
  },
  poop: {
    frequency: 1,       // 次数/天
    shape: 4,           // 布里斯托分型 1-7
    hasIssue: false,    // 是否有问题
    issueSeverity: 'none', // 问题严重程度
    scoreBreakdown: {
      frequencyScore: 3.5,
      shapeScore: 4,
      issueScore: 2.5
    },
    totalScore: 10,
    grade: '优秀'
  }
}
```

### 3.2 周数据结构
```javascript
{
  startDate: '2023-10-23',
  endDate: '2023-10-29',
  days: [ /* 7天的每日数据 */ ],
  exercise: {
    totalDuration: 160,   // 周总时长（分钟）
    daysWithExercise: 4,   // 运动天数
    averageDuration: 40    // 平均每次时长
  },
  diet: {
    weeklyFoodVariety: 28  // 周累计食材种类
  }
}
```

### 3.3 评分结果结构
```javascript
{
  totalScore: 7.5,           // 每周总分 0-10
  totalGrade: '良好',         // 总分等级
  moduleScores: {
    sleep: {
      score: 8.0,            // 睡眠模块得分
      grade: '良好',          // 睡眠模块等级
      details: {             // 每天详情
        avgDurationScore: 3.5,
        avgBedtimeScore: 2.5,
        avgWakePeriodsScore: 2.0
      }
    },
    diet: {
      score: 7.0,
      grade: '良好',
      details: {
        avgCaloriesScore: 2.0,
        avgNutrientsScore: 2.0,
        avgDailyVarietyScore: 1.5,
        weeklyVarietyScore: 1.5,
        avgConstitutionScore: 1.0
      }
    },
    exercise: {
      score: 6.0,
      grade: '达标',
      details: {
        totalDurationScore: 3.0,
        frequencyScore: 3.5,
        avgSessionDurationScore: 2.5
      }
    },
    poop: {
      score: 9.0,
      grade: '优秀',
      details: {
        avgFrequencyScore: 3.0,
        avgShapeScore: 3.5,
        avgIssueScore: 2.5
      }
    }
  }
}
```

---

## 四、文件修改清单

### 新增文件
- `src/services/scoringService.js` - 评分服务模块

### 修改文件
- `src/components/ChatInterface.jsx` - 更新 `generateWeeklyReport` 函数和 `WeeklyReportCard` 组件
