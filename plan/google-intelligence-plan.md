# AMO AI: Google Intelligence Integration Plan

**Document Version:** 1.0
**Date:** October 26, 2024
**Author:** AI Systems Architect

---

## 1. Vision & Strategic Goal

To evolve AMO AI from a presentation generator into an **intelligent co-pilot for founders**. Our goal is to leverage Google's cutting-edge AI to automate, augment, and accelerate every stage of the pitch deck creation process—from initial strategy and content writing to visual design and data validation.

This integration will provide our users with a significant competitive advantage, enabling them to produce higher-quality, data-driven, and investor-ready pitches in a fraction of the time.

---

## 2. Core AI Agents

We will structure our AI capabilities around four distinct "agents," each powered by a specific set of Google's AI models and features. All agent logic will be securely hosted in Supabase Edge Functions.

| Agent Name | Primary Model(s) | Key Function | Real-World Benefit |
| :--- | :--- | :--- | :--- |
| **Content & Strategy Agent** | `gemini-2.5-pro`, `gemini-2.5-flash` | Acts as an expert copywriter and pitch coach. Analyzes, refines, and adapts the narrative of the deck. | Ensures the story is compelling, concise, and tailored to specific audiences (e.g., VCs, partners). |
| **Visual Design Agent** | `gemini-2.5-flash-image` | Acts as an in-house graphic designer. Generates a cohesive and professional visual identity for the deck. | Creates a polished, brand-aligned look without needing a designer, ensuring visual consistency. |
| **Interactive Editor Agent** | `gemini-2.5-flash` with Function Calling | Acts as an AI Copilot. Translates natural language commands into direct actions within the deck editor. | Dramatically speeds up the editing workflow, allowing founders to build and restructure decks conversationally. |
| **Market Research Agent** | `gemini-2.5-flash` with Grounding | Acts as an on-demand research assistant. Provides real-time, data-driven insights to strengthen claims. | Bolsters the pitch with current, verifiable data (market size, trends, competitor info), increasing credibility with investors. |

---

## 3. Phased Implementation Roadmap

We will implement these capabilities in a logical, phased approach to deliver value incrementally.

### Phase 1: Foundational Intelligence (Complete)
*   **Objective:** Establish the core AI-powered content generation workflow.
*   **Features:**
    *   **Deck Generation:** Use `gemini-2.5-pro` to create the initial 10-slide deck structure from user input (`create-deck-with-images` function).
    *   **Text Refinement:** Use `gemini-2.5-flash` to improve user-written content in the wizard (`refine-text` function).
    *   **Content Suggestions:** Use `gemini-2.5-flash` to suggest improvements to existing slide content in the editor (`generate-slide-suggestions` function).
*   **Status:** ✅ **Complete**. The backend Edge Functions are implemented and integrated.

### Phase 2: Advanced Visuals & Theming (In Progress)
*   **Objective:** Empower the **Visual Design Agent** to create cohesive, brand-aligned imagery.
*   **Features:**
    *   **AI Theme Brief:** Implement the `generate-visual-theme` function to convert a user's style description into a structured JSON "visual brief" (colors, keywords, mood).
    *   **Thematic Image Generation:** Update the `generate-slide-image` function to use the visual brief as context, ensuring all generated images for a deck share a consistent style.
*   **Status:** 🟡 **In Progress**. Frontend UI is complete; backend Edge Functions are being implemented.

### Phase 3: Interactive Command & Control (In Progress)
*   **Objective:** Launch the **Interactive Editor Agent** (AI Copilot) to enable conversational editing.
*   **Features:**
    *   **Function Calling Backend:** Implement the `invoke-editor-agent` Edge Function using Gemini's `tools` (Function Calling) feature. Define functions for `addSlide`, `deleteSlide`, and `updateSlideContent`.
    *   **Real-time UI Updates:** Ensure the frontend (`DeckEditor.tsx`) refreshes instantly and correctly after the agent performs an action.
*   **Status:** 🟡 **In Progress**. Frontend UI is complete; backend Edge Function is being implemented.

### Phase 4: Data-Driven Insights (Future)
*   **Objective:** Activate the **Market Research Agent** to ground the deck in real-world data.
*   **Features:**
    *   **"Find Data" Feature:** Add a feature to the AI Copilot that allows users to ask questions like, "What's the market size for fintech in North America?".
    *   **Grounding Integration:** Implement a new Edge Function that uses `gemini-2.5-flash` with the `googleSearch` tool.
    *   **Source Citation:** Display the source URLs returned by the grounding API to add credibility to the generated answers.

---

## 4. Technical Architecture

*   **Security First:** All Gemini API calls will be made exclusively from **Supabase Edge Functions**. The `GEMINI_API_KEY` will be stored as a Supabase secret and will never be exposed on the client-side.
*   **Frontend Client:** The React application (`geminiService.ts`) will act as a thin client, responsible only for invoking the Edge Functions and handling the UI state.
*   **Data Persistence:** All user data, decks, and slides will be stored in the Supabase PostgreSQL database, secured by Row-Level Security (RLS) policies.

---

## 5. Success Metrics

We will measure the success of this intelligence integration through the following KPIs:
1.  **User Engagement:** Track the number of calls to each AI-powered feature (e.g., text refinements, image generations, copilot commands).
2.  **Task Completion Rate:** Measure the percentage of users who successfully generate a full 10-slide deck.
3.  **Time-to-Value:** Analyze the average time it takes for a new user to create their first complete pitch deck. Our goal is to reduce this by over 75% compared to manual methods.
4.  **User Satisfaction (NPS):** Conduct surveys specifically asking about the usefulness and quality of the AI features.
5.  **Adoption of Advanced Features:** Monitor the usage of the AI Copilot and Thematic Visuals once launched.
