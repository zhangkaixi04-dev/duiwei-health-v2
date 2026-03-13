# 藏真验收问题修复计划 (Cangzhen QA Fix Plan)

## 问题清单 (Issue List)

### [ ] Task 1: 数据安全 - 确保仅当前登录用户可见自己的内容
- **Priority**: P0 (Critical)
- **Depends On**: None
- **Description**: 
  - Museum.jsx 目前直接从 localStorage 读取 `cangzhen_memories`，没有基于用户 ID 过滤
  - 需要确保数据安全，未登录时不能看，登录后只能看自己的内容
- **Success Criteria**:
  - 未登录状态下，Museum 页面显示空状态
  - 登录用户只能看到自己上传的记录
  - 本地存储或数据库存储时关联 user_id
- **Test Requirements**:
  - `programmatic` TR-1.1: 未登录时，localStorage 读取过滤
  - `programmatic` TR-1.2: 登录后，数据通过 user_id 隔离
  - `human-judgement` TR-1.3: 视觉上确认只有自己的内容显示

### [ ] Task 2: 记录页交互优化 - 强化"选馆→封存"流程
- **Priority**: P1 (High)
- **Depends On**: None
- **Description**: 
  - 现在"封存"按钮在未选馆时虽然禁用，但用户体验不清晰
  - 需要增强引导：未选馆时点击给出提示，或者视觉上引导用户先选馆
- **Success Criteria**:
  - 用户未选择展馆时，封存按钮有明显的提示状态
  - 点击禁用的封存按钮时，给出友好提示（如"请先选择一个展馆"）
  - 展馆选择有更明显的视觉反馈
- **Test Requirements**:
  - `human-judgement` TR-2.1: 交互流程清晰，用户知道需要先选馆
  - `programmatic` TR-2.2: 错误处理逻辑完善

### [ ] Task 3: 文案优化 - "未同步"改为"未登录"
- **Priority**: P1 (High)
- **Depends On**: None
- **Description**: 
  - AuthStatus 组件右上角文字目前是"未同步"
  - 需要改为"未登录"更准确
- **Success Criteria**:
  - 未登录状态下显示"未登录"
  - 已登录状态显示用户邮箱和状态
- **Test Requirements**:
  - `human-judgement` TR-3.1: 文案显示正确

### [ ] Task 4: 路由修复 - 记录完成后跳转到博物馆
- **Priority**: P1 (High)
- **Depends On**: None
- **Description**: 
  - Record.jsx 中点击"去博物馆看看"目前跳转到 `/museum`
  - 藏真的根路径是 `/cangzhen`，所以正确路径应该是 `/cangzhen/museum`
- **Success Criteria**:
  - 记录完成后点击"去博物馆看看"能正确跳转到博物馆页面
  - 博物馆页面正确加载
- **Test Requirements**:
  - `programmatic` TR-4.1: 路由跳转路径正确
  - `human-judgement` TR-4.2: 页面跳转后正常显示

## 实施顺序 (Implementation Order)
1. Task 3 (文案优化) - 最简单，优先改
2. Task 4 (路由修复) - 简单直接
3. Task 2 (交互优化) - 需要设计交互
4. Task 1 (数据安全) - 最复杂，需要仔细处理
