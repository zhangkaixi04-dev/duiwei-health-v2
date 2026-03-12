# Plan: Implement Standardized TCM Constitution Matrix & Logic

This plan aims to implement a robust, quantifiable, and dynamic TCM constitution analysis system based on the user's "Constitution Matrix" specifications.

## 1. Create Constitution Matrix Data Source
Create a new file `src/data/constitutionMatrix.js` to centralize all static definitions and rules.
- **Base Scores**: Define the sensitivity score (5-11) for each constitution.
- **Seasonal Weights**: Define the +0/+1/+2/+3 coefficients for each constitution across 5 seasonal phases (Spring, Summer/Sanfu, Long Summer/Meiyu, Autumn, Winter/Sanjiu).
- **Diet Rules**: Define `suitable`, `taboo` (Before Eating), and `remedy` (After Eating) for each constitution.
- **Season Helper**: Implement `getCurrentSeason()` logic to map the current date to TCM seasons (Spring, Sanfu, Meiyu, Autumn, Sanjiu).

## 2. Refactor `healthService.js` -> `analyze_diet`
Update the diet analysis logic to strictly follow the "Two Core Scenarios" (Inquiry vs. Record) and the new weighting system.

### Step 2.1: Intent Detection
- Distinguish between **Inquiry** (Before Eating) and **Record** (After Eating) based on user input (e.g., "Can I eat..." vs "I ate...").

### Step 2.2: Context Calculation
- **Get Current Season**: Use the helper from `constitutionMatrix.js`.
- **Get Constitution Data**: Retrieve the user's constitution type and its corresponding Base Score and Seasonal Weight.
- **Calculate Risk Score**: `Total Risk = Base Score + Seasonal Weight`.

### Step 2.3: "Before Eating" Logic (Inquiry)
- **Goal**: Advice on feasibility and quantity.
- **Logic**:
  - Check if food is in `taboo` list.
  - If taboo + High Risk Score -> Strong Warning ("Strictly Forbidden").
  - If taboo + Low Risk Score -> Moderate Warning ("Eat Less").
  - If suitable -> Encourage.
- **Output**: Suitability rating, Reason (based on constitution + season), Advice.

### Step 2.4: "After Eating" Logic (Record)
- **Goal**: Remedial actions and damage control.
- **Logic**:
  - Check if the consumed food violates `taboo`.
  - If violation detected -> Provide specific `remedy` from the matrix (e.g., "Drink Ginger Date Tea" for Yang Xu eating cold).
  - If no violation -> Positive reinforcement.
- **Output**: Nutritional stats (existing) + Specific Remedy/Feedback.

## 3. Verify & Test
- **Test Case 1 (Yang Xu + Summer/Sanfu + Ice Cream)**:
  - **Inquiry**: Should return "Strictly Forbidden" (Base 10 + Season 3 = High Risk).
  - **Record**: Should return Remedy "Drink warm ginger water, apply heat to abdomen".
- **Test Case 2 (Ping He + Any Season)**:
  - Should return balanced advice with low sensitivity.

## 4. Documentation
- Ensure code comments reflect the "Golden Rules" and weighting logic for future maintenance.
