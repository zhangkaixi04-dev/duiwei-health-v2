# Duiwei Health v2

This repository hosts two distinct applications: **Hepai (Health)** and **Cangzhen (Museum)**.

> **IMPORTANT**: Please read `PROJECT_RULES.md` before making any changes. The most critical rule is the **strict separation** of these two projects.

## Project Structure

- `src/cangzhen/`: Source code for the Cangzhen Museum app.
- `src/components/`: Shared components (careful with usage) and Hepai Health specific components.
- `src/services/`:
  - `healthService.js`: Backend logic for Hepai Health.
  - `cangzhenService.js`: Backend logic for Cangzhen Museum.

## Running the Project

```bash
npm run dev
```

## Deployment

The project is deployed on Vercel.
