# 藏真 (Cangzhen) Review Module - Feature Specification & Implementation Plan

## 1. Overview
The **Review Module** is a core component of the Cangzhen app, designed to help users reflect on their journey through "Ritualistic Data Visualization." It moves away from traditional charts and lists, adopting a **Museum/Gallery** metaphor with **Glassmorphism** aesthetics.

### Key Philosophy
- **Anti-Anxiety**: No red dots, no rush.
- **Ritual**: Unlocking memories feels like opening a time capsule.
- **Growth**: Visualizing progress as a growing garden or collection.

---

## 2. Functional Architecture

### 2.1 Weekly Review (周回顾)
*   **Concept**: "The Curator's Desk"
*   **State A: Current Week (Locked/Accumulating)**
    *   **Visual**: A mysterious, foggy glass box ("Mystery Box").
    *   **Interaction**:
        *   **Mouse Move**: A "Glass Press" light effect follows the cursor/finger, revealing glimpses of the content inside.
        *   **Content**: Floating glass bubbles representing different data dimensions (Sensation, Emotion, Creativity, Decision).
        *   **Text**: "布展中..." (Curating...) with a countdown to next Monday.
    *   **Data**: Real-time accumulation of the current week's records.
*   **State B: Past Weeks (Unlocked/Exhibit)**
    *   **Visual**: A clear, beautiful glass frame with a "Theme Keyword" (e.g., "Courage", "Healing").
    *   **Content**:
        *   **AI Summary**: A warm, second-person narrative summarizing the week's tone.
        *   **Trend Chart**: "New Collections" (daily record counts).
        *   **Word Cloud**: "Mind Shape" (emotional keywords).
    *   **Navigation**: Left/Right arrows to switch weeks.

### 2.2 Monthly Review (月回顾)
*   **Concept**: "Specimen Collection"
*   **Layout**: A double-column masonry/grid layout.
*   **Items**:
    *   Each month is a square glass block.
    *   **Future Months**: Faint, glass-like placeholders (Locked).
    *   **Past Months**:
        *   **Visual**: Colored Morandi gradients based on the month's mood.
        *   **Content**: Month Number, Keyword (e.g., "Sprout"), Record Count.
    *   **Expansion**: Clicking a month expands it into a detailed view (similar to Weekly Review but aggregated).

### 2.3 Yearly Review (年回顾)
*   **Concept**: "The Badge Wall & The Long River"
*   **Badge Wall (Top Section)**:
    *   **Logic**: Milestones based on total record count (1, 3, 7, 21, 50, 100).
    *   **Visual**:
        *   **Style**: Clear Glass Spheres (通透玻璃球) with high transparency.
        *   **Effect**: Realistic convexity with subtle rim lighting (thin white edge).
        *   **Core**: 
            *   **Center**: Concentrated radial gradient matching plant color (e.g., Green/Pink).
            *   **Ambient**: Warm yellow fill (`mix-blend-screen`) for sunlight effect.
            *   **Bottom**: Soft reflection of the plant's main color.
        *   **Highlight**: Sharp, realistic specular dot (Top-Left) + Soft secondary diffusion.
        *   **Background**: Tender Green/Yellow/Beige gradient (`from-[#E8F5E9] via-[#FDF6E3] to-[#F0E8DD]`).
    *   **Interaction**: Collapsible (Default: show top row; Expand: show all).
*   **365-Day Grid (Bottom Section)**:
    *   **Visual**: A grid of small glass beads.
    *   **State**:
        *   **Empty**: Faint trace.
        *   **Filled**: Glowing warm yellow bead (like a firefly).
    *   **Goal**: To light up the year, creating a "Galaxy of Memories."

---

## 3. Interaction & Animation Details

### 3.1 The "Seal" Ritual (Recording)
*   **Trigger**: User finishes writing and clicks "Seal This Moment" (封存此刻).
*   **Animation Sequence**:
    1.  **Stamp**: A "SEALED" stamp animates onto the card.
    2.  **Bloom**: A flower blooms briefly over the seal (0.5s).
    3.  **Standard Success**: A "Sealed Letter" view appears ("Safe in [Hall Name]") with a postmark (1.5s).
*   **Milestone Surprise**:
    *   If a milestone (1, 3, 7, 21...) is reached:
    *   **Delay**: Wait 5 seconds after the standard feedback (to ensure user sees the "success" state first).
    *   **Reveal**: A modal fades in -> Glowing Light -> Glass Sphere appears -> Plant grows inside.
    *   **Text**: "Badge Unlocked: [Plant Name] - [Flower Language]."

### 3.2 Navigation
*   **Tabs**: Weekly / Monthly / Yearly (Pill-shaped glass toggle).
*   **Gestures**: Horizontal swipe for Weekly; Vertical scroll for Monthly/Yearly.

---

## 4. Data Structures (Mock & Real)

### 4.1 Local Storage Schema (`cangzhen_memories`)
```json
[
  {
    "id": 1709923401234,
    "date": "3/9/2026",
    "content": "Today I felt...",
    "hall": "emotion", // sensation, emotion, inspiration, wanxiang
    "tags": ["calm", "rain"]
  }
]
```

### 4.2 Badge Logic (Hardcoded Rules)
| Count | Badge Name | Plant (EN/CN) | Meaning | Color (Core) |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 初见·萌芽 | Snowdrop / 雪滴花 | 希望 | #D6CEAB |
| 3 | 坚持·苏醒 | Rosemary / 迷迭香 | 回忆 | #A0C4A0 |
| 7 | 习惯·破土 | Lily / 铃兰 | 幸福归来 | #F4D0D8 |
| 21 | 蜕变·绽放 | Lotus / 睡莲 | 悟性 | #C4BAD0 |

---

## 5. Technical Stack & Dependencies
*   **Framework**: React 18
*   **Styling**: Tailwind CSS (Custom classes: `glass`, `glass-convex`, `glass-concave`, `animate-float`, `animate-pulse-slow`).
*   **Icons**: `lucide-react` (Feather icons).
*   **State Management**: `useState`, `useEffect`, `useMemo` (Local state + localStorage).

## 6. Known Issues & Future Optimization
*   **Performance**: The "Glass Press" effect uses `onMouseMove` which triggers frequent re-renders. Consider using CSS variables or `requestAnimationFrame` optimization if lag occurs on mobile.
*   **Data Persistence**: Currently relies on `localStorage`. Needs migration to a backend database for multi-device sync.
*   **Accessibility**: Glassmorphism can have low contrast. Ensure text colors meet WCAG standards (currently using dark gray on glass).

---

## 7. Deployment & Preview Guide (Added 2026-03-10)

### 7.1 Mobile Preview (Local Network)
To preview on a mobile device connected to the same Wi-Fi:
1.  **Expose Host**: Run `npm run dev -- --host` in the terminal.
2.  **Find IP**: Look for the "Network" URL in the terminal output (e.g., `http://192.168.1.5:5173`).
3.  **Access**: Open that URL in your mobile browser.

### 7.2 Production Build (Online Deployment)
To deploy to the internet (e.g., Vercel, Netlify):
1.  **Build**: Run `npm run build`. This creates a `dist` folder with static files.
2.  **Deploy**:
    *   **Vercel (Recommended)**: Install Vercel CLI (`npm i -g vercel`) and run `vercel`. Follow the prompts.
    *   **Static Hosting**: Upload the contents of the `dist` folder to any static file host.

---

## 8. Recent Updates (2026-03-11)

### 8.1 Home Page (首页) - Glass Greenhouse Interaction
*   **Door Logic**:
    *   **Interaction**: Click to Open -> Door Animation (3D Rotate Y) -> Modal Popup (Daily Inspiration) -> User Clicks "Accept" -> Modal Closes & Placeholder Replaced.
    *   **Persistence**: `localStorage.getItem('cangzhen_daily_opened')`. Resets daily.
    *   **Visuals**: High-quality glass texture, transparent with "Pale Goose Yellow" inner light (`radial-gradient`), rippling light effect.
*   **Data Integration**:
    *   **Stats**: Top bar shows "Total Collection" and "Weekly New" from `cangzhen_memories`.
    *   **Pavilions**: Greenhouse icons reflect real counts per hall.

### 8.2 Design Refinements
*   **Badges**: Improved glass texture (frosted feel), white bottom glow, removed dirty shadows.
*   **Modal**: Switched to "Crystal Glass" style (transparent, blur-xl, white border) from solid card.

*Last Updated: 2026-03-11*
