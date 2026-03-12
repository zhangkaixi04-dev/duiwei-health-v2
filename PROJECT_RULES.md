# Duiwei Health & Cangzhen Museum

This repository contains two independent projects:
1.  **Hepai Health (合拍健康)**: A health management app focusing on diet, exercise, and TCM constitution.
2.  **Cangzhen Museum (藏真博物馆)**: A soul/museum app focusing on daily inspiration and emotional well-being.

## 🚨 STRICT ARCHITECTURAL RULES (DO NOT VIOLATE)

### 1. Complete Isolation (Code & Logic)
- **THESE ARE TWO INDEPENDENT PROJECTS.**
- They **MUST NOT** link to each other.
- There should be **NO** "Switch App" button or navigation between them.
- They **MUST NOT** share service logic (e.g., `Cangzhen` components must never import `healthService`).
- They **MUST NOT** share state or context that implies they are the same app.

### 2. Service Separation
- **`src/services/healthService.js`**: ONLY for Hepai Health.
- **`src/services/cangzhenService.js`**: ONLY for Cangzhen Museum.
- Do not cross-import these services in the wrong project components.

### 3. Entry Points
- **Hepai Health**: Access via `/hepai` route.
- **Cangzhen Museum**: Access via `/cangzhen` route.
- The default route `/` is currently set to redirect to `/cangzhen` (per user request).
