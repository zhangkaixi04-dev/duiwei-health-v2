# Tasks

- [x] Task 1: Personal Center Subpages - Implement dedicated pages for Profile, Health Report, Questionnaire, and Manual Entry.
  - [x] SubTask 1.1: Refactor `PersonalCenter.jsx` to support navigation/sub-routes (e.g., using `activeTab`).
  - [x] SubTask 1.2: Implement `HealthProfile` component.
    - **Constraint**: Do not display Age and Gender.
    - **Constraint**: Support reading/editing Height, Weight, Allergies, Medical History.
  - [x] SubTask 1.3: Implement `HealthReport` component with mock charts for weight, sleep, and constitution trends.
  - [x] SubTask 1.4: Implement `QuestionnaireWrapper` to reuse or embed the 72-question logic within Personal Center.
  - [x] SubTask 1.5: Implement `ManualEntry` form for selecting constitution types.
    - **Constraint**: Saving this manual entry creates an "Activation Archive" (baseline record).
    - **Constraint**: Future logic prioritizes this record until a new assessment updates it.

- [x] Task 2: Real AI Diet Analysis - Connect AI to generate personalized meal plans.
  - [x] SubTask 2.1: Implement `healthService.generate_meal_plan` to fetch real meal suggestions from Doubao/Zhipu AI based on user TDEE.
  - [x] SubTask 2.2: Update `DailyFeed` to display AI-generated meal plans instead of static mock data.
  - [x] SubTask 2.3: Ensure meal plans respect user allergies/dislikes (if any).

- [x] Task 3: Long-term Memory & Structured Storage - Enhance data persistence.
  - [x] SubTask 3.1: Define structured storage schema for `userProfile` (basic info, constitution, medical history) and `healthRecords` (daily logs).
  - [x] SubTask 3.2: Implement utility functions to save/load/query historical records efficiently.
  - [x] SubTask 3.3: Update `ChatInterface` to inject relevant historical context into AI prompts.

- [ ] Task 4: Medical Guardrails - Implement sensitive word filtering.
  - [ ] SubTask 4.1: Define a list of restricted medical keywords (e.g., specific diseases, diagnosis terms).
  - [ ] SubTask 4.2: Implement `useAgent` middleware to intercept user input containing restricted keywords.
  - [ ] SubTask 4.3: Display appropriate disclaimer messages when medical topics are detected.

# Task Dependencies
- Task 2 depends on Task 3 (structured profile data).
- Task 1.2 depends on Task 3 (profile schema).
