# Project Status and Roadmap Spec

## Why
To provide a clear overview of the current project status (implemented features) and outline the roadmap for the next phase of development, ensuring alignment with the user's vision of a "Personalized AI Health Assistant".

## Current Status (Implemented Features)
- **Core Chat Interface**: A full-screen, immersive chat interface with rich media cards.
- **AI Integration**: Integrated Doubao (Volcengine Ark) and Zhipu AI (GLM-4V) for general health consultation and diet analysis.
- **Health Tracking**:
  - **Quick Records**: Shortcuts for diet, sleep, bowel movements, menstruation, and weekly summary.
  - **AI Tongue Diagnosis**: Upload tongue photos for AI analysis of constitution (Mock/API).
  - **TCM Constitution Assessment**: Built-in 72-question assessment logic with radar chart visualization.
  - **Diet & Exercise**: Calorie calculation, nutrient tracking, and TCM-based exercise recommendations (e.g., Baduanjin).
- **User Center & Persistence**:
  - **Long-term Memory**: LocalStorage-based persistence for user profile, chat history, and health records.
  - **Personal Center**: View health profile, settings, and debug options.
- **Dashboard**: "Daily Health Dashboard" with dynamic calorie tracking, mood check-in, and exercise inspiration.

## What Changes (Roadmap)
The following features are planned for the next phase:

### 1. Personal Center Subpages (Deep Dive)
- **Health Profile**: A detailed page to view and edit basic info, allergies, and medical history.
- **Health Report (Trends)**: A visualization page for health trends over time (weight, sleep, constitution score).
- **Questionnaire Integration**: Embed the 72-question assessment flow directly within the Personal Center.
- **Manual Entry**: Allow users to manually input their constitution type if they already know it.

### 2. Real AI Diet Analysis & Meal Planning
- **Real-time Analysis**: Replace mock data in "Delicious Recommendations" with real AI-generated meal plans based on user's TDEE and constitution.
- **Smart Adjustments**: AI suggests meals that balance the user's daily nutrient intake.

### 3. Long-term Memory & Context
- **Structured Storage**: Enhance `localStorage` structure to support efficient retrieval of historical data (e.g., "What did I eat last Tuesday?").
- **Context Injection**: Ensure the AI agent always has access to the user's latest profile and recent records during chat.

### 4. Medical Guardrails
- **Sensitive Word Filtering**: Implement strict filtering for medical keywords to prevent the AI from giving unauthorized medical advice.
- **Disclaimer**: Automatically append disclaimers when health-related topics are discussed.

## Impact
- **Affected Specs**: `ChatInterface`, `PersonalCenter`, `DailyFeed`, `healthService`.
- **Affected Code**: `src/components/*`, `src/services/*`, `src/utils/*`.

## ADDED Requirements
### Requirement: Health Profile Page
The system SHALL provide a dedicated page for users to view and edit their comprehensive health profile, including:
- Basic Info (Height, Weight) - **Note**: Age and Gender are removed from display as per user request.
- Allergies & Dietary Restrictions
- Medical History

### Requirement: Health Trends Report
The system SHALL provide a "Health Report" page that visualizes:
- Weight changes over time (Line Chart)
- Sleep duration and quality trends (Bar/Line Chart)
- Constitution score improvements (Radar/Line Chart)

### Requirement: Embedded Questionnaire
The system SHALL allow users to take the 72-question TCM assessment without leaving the Personal Center, with progress saving.

### Requirement: Manual Constitution Entry
The system SHALL allow users to manually select their constitution type (Main + Secondary).
- **Activation Archive**: Upon manual entry, the system SHALL save this as an initial "activation" record in the health history.
- **Subsequent Reads**: Future logic SHALL prioritize reading this activated record unless a new assessment is taken.

### Requirement: AI Meal Planning
The system SHALL use the connected AI service to generate 3 specific meal recommendations (Breakfast, Lunch, Dinner) for the "Delicious Recommendations" module, replacing static mock data.

## MODIFIED Requirements
### Requirement: Personal Center Navigation
**Modification**: The Personal Center main view will now serve as a hub, navigating to specific sub-pages (Profile, Report, Questionnaire) instead of displaying everything inline or via simple toggles.
