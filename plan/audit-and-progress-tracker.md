# Gemini API Integration Audit & Strategic Roadmap

This document provides a complete audit of the AMO AI "Pitch Deck Wizard" application's use of the Gemini API. It outlines the current implementation status, identifies strategic opportunities for improvement, and defines a prioritized roadmap for the next development cycle.

**Auditor:** AI Systems & Product Strategy Auditor
**Date:** October 26, 2024

---

### ✅ **Overall Summary Status**

- **Text Generation (`gemini-2.5-flash`, `gemini-2.5-pro`):** ✅ **Fully Implemented**
  - The core text generation features for deck creation, refinement, and rewriting are correctly implemented and functional. The service layer is well-defined.

- **Image Generation/Editing (`gemini-2.5-flash-image`):** ⚙️ **Partially Implemented**
  - The application successfully generates images for individual slides. However, it lacks thematic consistency and advanced editing capabilities, representing a significant area for improvement.

- **Function Calling / Tools:** 🚧 **Missing**
  - This is the most critical gap in the current architecture. The application does not use function calling, limiting its potential for building interactive, agent-based workflows that can manipulate application state or data.

---

### 📊 **Detailed Feature Analysis**

| Gemini Feature           | Current Usage                                                                                                                              | Potential Improvement                                                                                                                                                                | Real-World Example                                                                                                                                                                                                                                                        | Workflow Integration Context                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Text Generation**      | <ul><li>`generateDeck`: Creates the initial 10-slide structure.</li><li>`refineText`: Enhances user input during the wizard.</li><li>`rewriteSlideContent`: Rewrites text for existing slides in the editor.</li></ul> | <ul><li>**Generate Speaker Notes:** Create notes for each slide to help the user present.</li><li>**Audience Adaptation:** Generate different versions of content tailored to specific audiences (e.g., VCs vs. technical partners).</li><li>**Executive Summary:** Create a one-page summary from the full deck.</li></ul> | A founder needs to prepare for a 3-minute demo day pitch. They click an "Adapt for Demo Day" button. The AI generates concise speaker notes and shortens the content on each slide, focusing on the most impactful metrics and statements.                                         | Add "Generate Speaker Notes" and "Adapt Content" buttons within the `DeckEditor`'s "Edit Content" panel. This would call a new `geminiService` function.                                                                |
| **Image Generation/Edit**  | <ul><li>`generateSlideImage`: Creates a single, abstract image based on the title and content of the *currently active slide*.</li></ul>        | <ul><li>**Thematic Consistency:** Generate a cohesive set of visuals for the *entire deck* based on a chosen style (e.g., "minimalist", "bold", "tech-focused").</li><li>**In-Editor Editing:** Allow users to provide text prompts to edit an existing image (e.g., "change the accent color to blue").</li><li>**Content-Aware Mockups:** Generate UI mockups or charts based on slide content.</li></ul> | A user creating a deck for a fintech app selects a "Modern & Clean" theme. A `VisualAssetAgent` generates a full set of 10 background images and illustrations that share a consistent color palette and style, which are then applied to each slide automatically. | Introduce a "Visual Theme" step in the `Wizard` or a "Generate Theme" button in the `DeckEditor`. The `generateSlideImage` function should be refactored to accept thematic context.                                          |
| **Function Calling / Tools** | <ul><li>*Not implemented.*</li></ul>                                                                                                      | <ul><li>**Interactive Editing:** Allow users to edit the deck via natural language commands.</li><li>**Data Integration:** Connect to a user's profile (in Supabase) to automatically populate the "Team" slide.</li><li>**State Management:** Use functions to directly add, delete, or reorder slides in the application's state.</li></ul> | In the `DeckEditor`, a user types into a chat input: "Add a new slide after 'The Problem' and title it 'Market Opportunity'. Add a bullet point that says the TAM is $50B." An agent uses function calls (`addSlide`, `updateSlideContent`, `saveDeck`) to execute this command. | Integrate a new "AI Copilot" chat interface within the `DeckEditor`. This would be the primary interface for an agent that uses function calling to interact with the `deckService` and, eventually, the Supabase backend. |

---

### 🚀 **Next 3 Priority Items: Strategic Roadmap**

Based on this audit, the following three initiatives are recommended to maximize the value of the Gemini API and significantly enhance the product's competitive advantage.

**1. Priority 1: Implement Function Calling to Create a `SlideEditorAgent`**
   - **Impact:** High - This is a foundational change that enables all future interactive AI features.
   - **Effort:** Medium
   - **Action Items:**
     - Define a set of functions that map to `deckService.ts` operations (e.g., `createSlide(title, position)`, `deleteSlide(slideIndex)`, `updateSlideContent(slideIndex, newContent)`).
     - Create a new `SlideEditorAgent` service that uses `ai.models.generateContent` with the `tools` parameter configured with your function declarations.
     - Build a simple chat or command interface in `DeckEditor.tsx` where users can issue commands to the agent.
     - The agent's response will include a `functionCall` which your application will execute, updating the deck state and re-rendering the UI.

**2. Priority 2: Evolve Image Generation with a `VisualAssetAgent`**
   - **Impact:** High - Moves from generic visuals to a powerful, brand-aligned design tool.
   - **Effort:** Medium
   - **Action Items:**
     - Add a "Describe Your Visual Style" input field in the `WizardSteps.tsx`.
     - Create a `VisualAssetAgent` that takes the deck's topic and the user's style description to generate a consistent visual theme (e.g., color palette, style keywords).
     - Refactor `generateSlideImage` to accept this thematic context in its prompt, ensuring all generated images are cohesive.
     - Implement a "Generate All Visuals" button in `DeckEditor.tsx` that iterates through all slides and populates them with thematically-aligned images.

**3. Priority 3: Begin Supabase Backend Integration with Edge Functions**
   - **Impact:** High - Crucial for security, scalability, and enabling user accounts.
   - **Effort:** High
   - **Action Items:**
     - **(Completed in Plan):** Design the Supabase schema (`profiles`, `decks`, `slides`).
     - Create Supabase Edge Functions (e.g., `generate-deck`, `refine-text`) that take user data as input.
     - **Crucially, move all `geminiService.ts` logic into these Edge Functions.** The Gemini API key must be stored as a Supabase secret and never exposed on the client.
     - Refactor the frontend `geminiService.ts` to be a thin client that simply invokes these Edge Functions using the Supabase client library.
     - Begin replacing `deckService.ts` calls with Supabase database calls to persist user decks.

By completing this roadmap, AMO AI will evolve from a simple generator into a sophisticated, agent-driven platform that offers a truly intelligent and interactive deck creation experience.
