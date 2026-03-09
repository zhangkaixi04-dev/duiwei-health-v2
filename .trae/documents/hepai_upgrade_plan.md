# Plan: Upgrade to Hepai AI Health Manager (合拍 AI 健康管家)

## Goal
Upgrade the existing "Duiwei Health V2.0" React web application into "Hepai AI Health Manager", a chat-centric intelligent agent focused on women's health (18-35). The app will simulate a WeChat Mini Program experience with a focus on long-term memory, proactive care, and strict compliance guardrails.

## Architecture & Navigation
- **Current**: Bottom Tab Navigation (Chat, Feed).
- **New**: 
  - **Home**: Full-screen Chat Interface (The core "Agent").
  - **Navigation**: Simplified. Access to "Personal Center" via a header icon or a minimal bottom bar (Chat | My).
  - **Platform**: Continue using React+Vite (Mobile Web) to simulate the Mini Program UX.

## Implementation Steps

### Phase 1: Structural & UI Overhaul
1. **Refactor Navigation (`Layout.jsx`, `App.jsx`)**
   - Transform the main view into a dedicated **Chat Home**.
   - Add a "Personal Center" entry point (e.g., Avatar icon in Top Bar).
   - Remove the old "Daily Feed" tab (merge its value into Chat Cards).

2. **Upgrade Chat Interface (`ChatInterface.jsx`)**
   - **Header**: Update branding to "合拍 (Hepai)". Add "My" icon.
   - **Message Area**: Optimize for text + rich cards (Snapshots).
   - **Input Area**: 
     - Add the **6 Shortcut Buttons** defined in PRD:
       1. 今日状态 (Today Status)
       2. 记饮食 (Diet)
       3. 记睡眠 (Sleep)
       4. 记排便 (Poop)
       5. 记月经 (Period)
       6. 周总结 (Weekly Summary)
   - **Interaction**: Clicking a shortcut immediately triggers the specific agent flow.

### Phase 2: Feature Pages
3. **Personal Center & Settings (`Profile.jsx`)**
   - Create a new page/modal for "Personal Center".
   - **Sections**:
     - User Info (Avatar, Nickname).
     - **Health Archives Entry**: View stored data (Sleep, Period, Diet, etc.).
     - **Reminder Settings Entry**: Go to Settings.
     - **Data Management**: Clear/Delete data.

4. **Reminder Settings (`Settings.jsx`)**
   - Create a settings view for "Light Reminders".
   - **Toggles**: 
     - Sleep Reminder (Time picker).
     - Body Status Reminder (Time picker).
     - Daily Snapshot Reminder (Time picker).
   - *Note*: Since this is a web app, these will be simulated (UI only) or use local notifications if supported/requested.

5. **Health Archives View**
   - Display the "Long-term Memory" data in a structured read-only format.
   - Show: Basic Info, Period Cycle, Sleep Habits, Diet Preferences, Constitution.

### Phase 3: Agent Intelligence & Logic
6. **Agent Logic Enhancement (`useAgent.js` or internal logic)**
   - **Shortcut Handlers**: 
     - "Today Status" -> Triggers "Daily Snapshot" card generation.
     - "Weekly Summary" -> Triggers "Weekly Report" card generation.
     - "Record [X]" -> Initiates specific data collection flow.
   - **Compliance Guardrails**: 
     - Implement `checkMedicalCompliance(text)` middleware.
     - Intercept keywords: "diagnosis", "prescription", "treatment", "drug", "hospital".
     - Return standard disclaimer: "这部分涉及医疗诊断，我无法为你判断..."
   - **Memory System**:
     - Ensure all chat inputs (Diet, Sleep, Period) are parsed and saved to `localStorage` (`hepai_health_profile`).

### Phase 4: Data Visualization (Rich Cards)
7. **Migrate Daily Feed to Chat Cards**
   - Convert the previous `DailyFeed` components into **Chat Widgets**.
   - **Daily Snapshot Card**: Shows Sleep + Status + Diet/Exercise summary.
   - **Weekly Report Card**: Shows trends (mocked or calculated from history).

## Technical Specifications
- **Framework**: React + Tailwind CSS.
- **Icons**: Lucide React.
- **State**: `localStorage` for persistence (simulating the "Long-term Memory").
- **Theme**: Keep Morandi colors (Green/Off-white/Coral).

## Verification
- Verify Chat Shortcuts trigger correct flows.
- Verify Medical Guardrails block restricted keywords.
- Verify Data Persistence in "Health Archives".
