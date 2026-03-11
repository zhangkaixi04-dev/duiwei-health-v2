# 项目总览：藏真与合拍 (Project Overview)

> **注意**: 本项目目前是一个包含两个独立产品的**演示集合 (Demo Monorepo)**。
> 在正式生产环境中，这两个产品应拆分为完全独立的代码仓库和部署域名。

## 1. 产品矩阵

### 1.1. 合拍 AI (Hepai AI)
*   **定位**: AI 驱动的女性精准健康管理专家。
*   **核心**: 中医体质 x 现代营养学。
*   **详细 PRD**: [PRD_Hepai.md](./PRD_Hepai.md)

### 1.2. 藏真 (Cangzhen)
*   **定位**: 极简主义的人生博物馆与心神疗愈空间。
*   **核心**: 仪式感记录 x 沉浸式回顾。
*   **详细 PRD**: [PRD_Cangzhen.md](./PRD_Cangzhen.md)

## 2. 技术架构 (Technical Architecture)

目前（演示阶段）采用单体仓库 + 双路由模式：

```
/src
  /cangzhen      <- 藏真 独立业务代码 (Pages, Components)
  /components    <- 合拍 业务代码 (目前混合在根目录，未来需迁移至 /hepai)
  /services      <- 共享服务层 (Storage, API)
  App.jsx        <- 路由分发中心
```

### 2.1. 独立性原则 (Separation Concerns)
为了支持未来的彻底分家，开发时需遵循：
1.  **UI 隔离**: 藏真组件不得引用合拍组件，反之亦然。
2.  **数据隔离**: 
    *   合拍数据存储于 `hepai_profile`, `hepai_logs`。
    *   藏真数据存储于 `cangzhen_memories`。
3.  **样式隔离**: 藏真使用独立的 CSS 变量 (`text-cangzhen-*`)，不依赖全局通用样式。

## 3. 部署方案
*   **演示环境**: 单个 Vercel/Netlify 实例，通过 `/cangzhen` 和 `/hepai` 路径访问。
*   **生产环境 (未来)**:
    *   `hepai.com` -> 部署 `src/hepai`
    *   `cangzhen.life` -> 部署 `src/cangzhen`
