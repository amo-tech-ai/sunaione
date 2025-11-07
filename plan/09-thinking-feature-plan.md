# AMO AI: Gemini 2.5 'Thinking' Feature Integration Plan

**Document Version:** 1.0
**Date:** October 26, 2024
**Author:** AI Systems Architect

---

## 1. Vision: From Generator to Strategic Partner

The Gemini 2.5 series' internal "thinking" process allows the model to perform complex, multi-step reasoning before delivering an answer. This capability is the key to evolving AMO AI from a tool that *builds* decks to an intelligent partner that *analyzes and strengthens* a founder's entire strategy.

Our vision is to introduce a new **Strategic Analyst Agent** that leverages this thinking process to provide deep, actionable insights that would typically require an experienced advisor or co-founder.

**Target Models:** `gemini-2.5-pro` (for deep analysis), `gemini-2.5-flash` (for faster, complex tasks).

---

## 2. The Strategic Analyst Agent

This new agent will specialize in tasks that require understanding the entire context of a pitch deck, identifying logical gaps, and generating strategic recommendations. It will be invoked for tasks where a simple, immediate answer is insufficient.

**Key AI Feature:** `config: { thinkingConfig: { thinkingBudget: ... } }`

-   A **high `thinkingBudget` (e.g., 16384 on `gemini-2.5-pro`)** will be used for deep, comprehensive analyses that can take more time but yield richer insights.
-   A **lower budget or `thinkingBudget: 0`** will be used for tasks that require complex reasoning but need to be faster, or where latency is critical.

---

## 3. Use Cases & Real-World Examples

Here are the high-value features this agent will unlock:

| Use Case | AI Task & `thinkingBudget` | Real-World Example for a Founder | Benefit |
| :--- | :--- | :--- | :--- |
| **Full-Deck Analysis & Scoring** | The AI will read all 10 slides, analyze the narrative flow, check for consistency, and identify weak arguments. It will then produce a detailed report with a "Pitch Readiness Score." <br/>*(`gemini-2.5-pro`, high budget)* | A founder finishes their deck and clicks "Analyze My Pitch." The AI returns a report: "Your 'Problem' slide is strong, but your 'Traction' slide lacks quantifiable metrics. The connection between your 'Business Model' and 'The Ask' is unclear. Suggestion: Add a chart showing user growth and specify that 50% of the funding will go to user acquisition." | **Uncovers blind spots.** Provides an objective, expert-level review to catch weaknesses before an investor does. |
| **Investor Matching** | The agent analyzes the deck's content (market, stage, industry, ask) and generates a list of 5 potential VC firms or angel investors whose investment thesis aligns with the startup. <br/>*(`gemini-2.5-pro`, high budget)* | A founder with a B2B SaaS startup asks, "Find investors for me." The AI analyzes the deck and returns: "1. Insight Partners: Focus on ScaleUp SaaS. 2. Bessemer Venture Partners: Strong B2B cloud portfolio. 3. Y Combinator: Ideal for your early stage." It includes a reason for each match. | **Saves weeks of research.** Provides a targeted, actionable list of potential investors, dramatically accelerating the fundraising process. |
| **Automated Pitch Practice (Q&A)** | The agent assumes the persona of a critical VC and asks challenging questions based on the deck's content. It can ask follow-up questions based on the user's answers. <br/>*(`gemini-2.5-flash`, medium budget)* | A user enters a "Pitch Practice" mode. The AI asks, "You claim a $50B TAM on slide 4. How did you calculate that, and what's your realistic plan to capture the first 1%?" If the user answers, the AI asks a follow-up: "You mentioned a direct sales model; how will that scale cost-effectively?" | **Builds confidence and preparedness.** Simulates a real investor meeting, helping founders anticipate tough questions and refine their answers. |
| **Market Expansion Strategy** | The agent analyzes the current business model and target audience, then suggests 2-3 adjacent markets or new revenue streams that the founder may not have considered. <br/>*(`gemini-2.5-pro`, high budget)* | A founder of a meal-kit delivery service asks for growth ideas. The AI analyzes their model and suggests: "1. Corporate Wellness Programs: Partner with companies to offer healthy meal kits as an employee perk. 2. B2B Ingredient Supply: Use your supply chain to sell bulk ingredients to local restaurants." | **Sparks strategic innovation.** Acts as a virtual brainstorming partner to identify new growth vectors and opportunities. |

---

## 4. Implementation Plan

1.  **Backend (Supabase Edge Functions):**
    *   Create a new Edge Function: `analyze-deck`.
    *   This function will accept a `deckId` and a `taskType` (e.g., 'FULL_ANALYSIS', 'INVESTOR_MATCH').
    *   It will fetch the full deck content from the database.
    *   It will then call the appropriate Gemini 2.5 model with a carefully crafted prompt and a specified `thinkingBudget` based on the `taskType`.

2.  **Frontend (UI/UX):**
    *   Introduce a new "Analysis" or "Insights" tab/button within the `DeckEditor`.
    *   This view will present the different strategic analysis options (e.g., "Get Pitch Score," "Find Investors").
    *   When a user clicks an option, it will invoke the `analyze-deck` Edge Function.
    *   The UI must handle a loading state, as these "thinking" tasks may take longer than simple text generation. A progress indicator or message like "AI is analyzing your strategy..." is crucial.
    *   The results will be displayed in a clean, readable format (e.g., a scorecard, a list of investors, a chat interface for Q&A).

By implementing the Strategic Analyst Agent, AMO AI will provide unparalleled value, becoming an essential tool for not just creating, but strategically perfecting a founder's pitch.
