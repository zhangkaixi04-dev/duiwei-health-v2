# Plan: Implement "Dynamic Constitution Matrix" for Personalized Advice

This plan implements the "Constitution x Season x Scenario" matrix as specified, ensuring advice is personalized, quantifiable, and context-aware.

## 1. Data Foundation: `src/data/constitutionMatrix.js`
This file will be the "Brain" of the logic, containing the exact rules provided by the user.
- **Structure**:
  - `BASE_SCORES`: { yang_xu: 10, ping_he: 5, ... }
  - `SEASON_WEIGHTS`: { yang_xu: { sanfu: 3, sanjiu: 3, ... }, ... }
  - `SCENARIO_RULES`:
    - **Before Eating (Inquiry)**:
      - `taboo`: List of food properties/types (e.g., "Cold", "Raw", "Greasy").
      - `advice`: Template for warnings (e.g., "Strictly forbidden in Sanfu").
    - **After Eating (Remedy)**:
      - `remedy`: Specific actions (e.g., "Ginger Date Tea", "Moxa").
  - `FOOD_PROPERTIES`: A mapping of common foods to their properties (e.g., Watermelon -> Cold, Lamb -> Hot, Fried -> Greasy). **Crucial for linking food to taboos.**

## 2. Context Engines (The "Dynamic" Part)

### 2.1 Seasonal Engine (`getSeasonalPhase`)
- Implement logic to determine the specific phase:
  - **Sanfu (Dog Days)**: Approx. mid-July to mid-Aug.
  - **Sanjiu (Coldest Days)**: Approx. Jan.
  - **Meiyu (Plum Rain)**: Approx. June/July.
  - **Spring/Autumn/Winter**: Standard ranges.
- **Output**: Current phase (e.g., 'sanfu') + Coefficient (0-3).

### 2.2 Food Property Engine (`tagFood`)
- **Challenge**: The matrix relies on knowing if a food is "Cold", "Fa Wu", "Greasy", etc.
- **Solution**: Hybrid Approach.
  1.  **Local Regex**: Fast path for common items (e.g., Watermelon -> Cold, Seafood -> Fa Wu).
  2.  **LLM Fallback**: If local check fails, ask LLM: "Is this food Cold/Hot/Damp/Fa Wu?"
  3.  **Tags**: Return a set of tags `['cold', 'sweet']` to match against the `taboo` list.

### 2.3 Status Engine (`parseStatus`)
- Extract user status from input (e.g., "tired", "period", "headache") to adjust the final score.
- **Weight**: 15% (Inquiry) / 40% (Remedy).
- *Implementation*: Simple keyword matching for now (e.g., "tired" -> +2 risk for Qi Xu).

## 3. The Core Logic: `healthService.js` -> `analyze_diet`

### Refactored Flow:
1.  **Parse Input**: Identify Food + Quantity + Intent (Inquiry vs. Record).
2.  **Get Context**:
    - **User**: Constitution (Type + Base Score).
    - **Time**: Season (Phase + Weight).
    - **Food**: Properties (Cold/Hot/etc.).
    - **Status**: Current physical state (optional).
3.  **Calculate Risk Score**:
    - `Score = Base Score + Season Weight`.
    - Adjust based on Status (if any).
4.  **Scenario Branching**:
    - **Scenario A: Inquiry ("Can I eat?")**:
      - Check if `Food Property` intersects with `Constitution Taboo`.
      - If **Yes**:
        - High Score (>=13): "Strictly Forbidden" + Reason (Season/Constitution).
        - Med Score (10-12): "Eat Less/Caution".
        - Low Score (<10): "Moderate amount OK".
      - If **No**: "Suitable" + Benefit.
    - **Scenario B: Record ("I ate...")**:
      - Check violation.
      - If **Violation**:
        - Return `Remedy` from Matrix (e.g., "Drink Ginger Tea").
        - "Damage Control" advice.
      - If **Safe**: Positive feedback.

## 4. Verification & Testing
- **User Case**: "Yang Xu" asks about "Watermelon" in "Sanfu".
  - **Expect**: Risk Score 10+3=13 -> "Strictly Forbidden". Reason: "Sanfu + Yang Xu = Double Risk".
- **User Case**: "Yang Xu" *ate* "Watermelon" in "Sanfu".
  - **Expect**: Remedy "Drink Ginger Date Tea immediately".

## 5. Documentation
- Embed the "Golden Rules" table into comments for clarity.
