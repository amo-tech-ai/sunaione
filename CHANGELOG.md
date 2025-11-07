# AMO AI - Product Changelog

This document provides a chronological summary of all major changes, improvements, and architectural decisions made throughout the lifecycle of the AMO AI Pitch Deck Wizard.

---

## v1.0 Production — October 26, 2024
*This release marks the launch of the fully-featured, secure, and intelligent AMO AI platform. It introduces a suite of advanced AI agents that transform the application from a simple generator into an interactive strategic co-pilot for founders.*

### AI Layer & Advanced Features
- **✨ NEW: Strategic Analyst Agent:** Implemented the `analyze-deck` Edge Function using **Gemini 2.5 Pro's 'Thinking' feature**. This provides users with a deep, strategic analysis of their deck, including a "Pitch Readiness Score" and actionable feedback.
- **✨ NEW: Interactive Editor Agent:** The "AI Copilot" is now fully powered by the `invoke-editor-agent` Edge Function, using **Gemini 2.5 Flash with Function Calling**. Users can now edit their decks conversationally with commands like "add a new slide" or "delete slide 3".
- **✨ NEW: Market Research Agent:** Implemented the `invoke-research-agent` Edge Function using **Gemini 2.5 Pro with Google Search Grounding**. The AI Copilot can now answer real-time questions and provide cited sources to strengthen deck content.
- **✨ NEW: Conversational Image Refinement:** Added the `refine-slide-image` Edge Function and corresponding UI in the `DeckEditor`. Users can now iteratively edit slide images with text prompts (e.g., "make the background color dark blue").
- **🎨 IMPROVEMENT: Visual Design Agent:** The visual agent is now complete. The `generate-visual-theme` function creates a detailed style brief, which is used by `generate-slide-image` to produce thematically consistent visuals for the entire deck.

### Bug Fixes
- **🐞 FIX (Critical):** Resolved a data-loss bug where local, unsaved changes in the `DeckEditor` were overwritten by the AI Copilot. The system now correctly saves the deck state before executing an AI command.

### Next Planned Phase (v1.1)
- **Workflow Visualization:** Introduce a new feature to auto-generate a Mermaid diagram that visualizes the user's pitch deck creation process, providing a unique "behind-the-scenes" asset.

---

## v0.5 Beta — October 2024
*This was the most significant architectural evolution of the project. The application was migrated from a client-side-only prototype to a secure, multi-user, and scalable platform on Supabase. This phase focused entirely on building a robust and secure foundation.*

### Backend & Supabase
- **🚀 MAJOR: Migrated to Supabase Backend:** The entire application backend is now powered by Supabase, including Authentication, PostgreSQL Database, and Storage.
- **🔐 SECURITY: Implemented Row-Level Security (RLS):** Created and enforced RLS policies on the `profiles`, `decks`, and `slides` tables to ensure users can only access their own data.
- **⚡️ NEW: Supabase Edge Functions:** All Gemini API calls were migrated from the client to secure, server-side Deno Edge Functions. This resolved the critical security vulnerability of exposing the API key.
- **⚙️ DATABASE: Schema Created:** Implemented the full database schema with `profiles`, `decks`, and `slides` tables, including foreign key relationships and a trigger to create user profiles on sign-up.

### Frontend
- **🔄 REFACTOR: Services Layer:** The `deckService` was refactored to use the Supabase client for all database operations, replacing the previous `localStorage` implementation. The `geminiService` was refactored into a thin client that securely invokes the new Edge Functions.
- **👤 NEW: Authentication:** Added the `AuthScreen.tsx` to handle user sign-up and login via Supabase Auth. All application routes are now protected.
- **🐞 FIX (Critical):** Resolved a React version conflict in `index.html` by removing the redundant React 19 import, stabilizing the application on React 18.

### Testing & Validation
- **🧪 NEW: RLS Test Protocol:** Established a testing protocol to verify that RLS policies correctly prevent unauthorized data access.

---

## v0.1 MVP — September 2024
*The initial version of AMO AI, built as a client-side prototype to validate the core user experience and the feasibility of the AI-powered workflow. This version was not secure or scalable but served as a crucial proof-of-concept.*

### Core Changes
- **🚀 NEW: Initial Application Setup:** Project initialized with React 18, Vite, and Tailwind CSS.
- **💾 DATA: Local Persistence:** All deck data was stored exclusively in the browser's `localStorage` via the initial `deckService.ts`.

### Frontend
- **✨ NEW: Core UI/UX:** Built the primary user-facing screens: `WizardSteps` for guided input, `DeckEditor` for slide manipulation, and `Dashboard` for managing decks.
- **🎨 STYLING: Theming System:** Implemented a theme system (`styles/templates.ts`) to support different visual styles for decks (Startup, Corporate, Creative).

### AI Layer
- **🧠 NEW: Gemini Integration (Client-Side):** Integrated the `@google/genai` library directly into the frontend. `geminiService.ts` contained all logic for calling the Gemini API.
- **⚠️ SECURITY FLAW:** The Gemini API key was exposed on the client-side, making this version unsuitable for production.

---

## Best Practices & Learnings Highlights

1.  **Security First, Always:** Migrating the Gemini API key from the client to a Supabase Edge Function was the single most important upgrade, moving the app from a vulnerable prototype to a secure product.
2.  **RLS is Non-Negotiable:** For any multi-tenant application, Supabase's Row-Level Security is the cornerstone of data privacy and must be implemented from day one.
3.  **Edge Functions for AI Logic:** Hosting AI logic in serverless functions provides security, scalability, and the ability to orchestrate complex, multi-step workflows.
4.  **Prototype the UI First:** Building the complete client-side experience with local storage first allowed for rapid iteration on the UI/UX before committing to a backend architecture.
5.  **Use the Right Model for the Job:** We successfully used different Gemini models for their strengths: `gemini-2.5-pro` for deep analysis, `gemini-2.5-flash` for fast and complex tasks like function calling, and `gemini-2.5-flash-image` for specialized visual generation.
6.  **Function Calling Unlocks Interactivity:** Gemini's `tools` (Function Calling) feature was the key to creating the "AI Copilot," transforming the editor from a static tool into a dynamic, conversational interface.
7.  **'Thinking' Unlocks Strategy:** The `thinkingBudget` feature in Gemini 2.5 Pro enabled the Strategic Analyst Agent, allowing us to offer deep, strategic insights rather than just surface-level content generation.
8.  **Grounding Adds Credibility:** Using the `googleSearch` tool for the Market Research Agent provided users with real-time, verifiable data, making their pitch decks significantly more compelling.
9.  **State Management is Critical:** The data-loss bug highlighted the importance of a clear and predictable state management strategy, especially when combining local user edits with asynchronous AI actions.
10. **Embrace a Thin-Client Architecture:** Keeping the frontend focused on UI/UX while abstracting all business and AI logic to the Supabase backend has resulted in a more robust, secure, and maintainable application.
