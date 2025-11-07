
# Gemini Intelligence Integration & 'Thinking' Feature Implementation

**Task Name**: Implement the Strategic Analyst Agent using Gemini 2.5 'Thinking'

**Purpose**:  
> To evolve AMO AI from a content generator into a strategic co-pilot. This will be achieved by integrating Gemini 2.5's "thinking" capabilities to create a **Strategic Analyst Agent** that provides deep, actionable insights on a user's pitch deck, covering strategic narrative, investor alignment, and market positioning.

**Success Criteria**:  
> - **Agent Functionality:** The `Strategic Analyst Agent` is successfully implemented as a Supabase Edge Function and is callable from the `DeckEditor`.
> - **Performance:** All agent tasks complete successfully, with clear loading state indicators in the UI to manage user expectations for longer "thinking" times.
> - **Quality of Insights:** For a test suite of 5 diverse pitch decks, the agent's "Full-Deck Analysis" achieves a >90% score on relevance and actionability as rated by a human reviewer.
> - **Production Readiness:** The feature passes all checks in the "Production Readiness Checklist" section below, including security, error handling, and monitoring.

**Dependencies**:  
- **APIs:** Google Gemini API (for `gemini-2.5-pro`), Supabase Edge Functions, Supabase Database API.
- **Data Sources:** User's complete deck data (all slides) stored in the Supabase `decks` and `slides` tables.
- **Approvals:** Final UI/UX review for the new "Analysis" panel in the `DeckEditor`.

---

## 1. Inputs & Resources  
- **Data**:
  - A collection of 5-10 sample pitch decks of varying quality and industry to be used for testing and validation.
- **Tools/Services**:   
  - Supabase Project (DB, Auth, Edge Functions)
  - Google AI Studio (for prompt engineering and testing)
  - Deno Runtime Environment for Edge Functions
- **Stakeholders**: 
  - Product Lead (for reviewing the quality of AI-generated insights)
  - Lead Frontend Engineer (for UI integration)

## 2. Steps  
1. **Init: Backend Setup**  
   - **Checklist**:
     - [ ] Create a new Supabase Edge Function named `analyze-deck`.
     - [ ] Add the `GEMINI_API_KEY` to the environment variables for this function.
     - [ ] Establish Supabase Admin client within the function to allow secure data access.
     - [ ] Implement CORS and authentication checks.

2. **Implement: Agent Logic**  
   - **Task Flow**: Fetch Deck Data → Construct Prompt → Call Gemini → Process Response → Return Result.
   - The `analyze-deck` function will accept a `deckId` and `taskType` (`FULL_ANALYSIS`, `INVESTOR_MATCH`, etc.).
   - Based on `taskType`, construct a detailed prompt for `gemini-2.5-pro`.
   - Set the `thinkingConfig.thinkingBudget` appropriately for the task (e.g., high for `FULL_ANALYSIS`, medium for `INVESTOR_MATCH`).
   - Parse the JSON response from Gemini.

3. **Implement: Frontend Integration**
   - Create a new "Analysis" tab or section within the `DeckEditor.tsx`.
   - Add UI elements (buttons) to trigger each analysis task (e.g., "Analyze My Pitch," "Find Investors").
   - On button click, call the `analyze-deck` Edge Function via a new method in `geminiService.ts`.
   - Implement robust loading and empty states. Display a message like "The AI is analyzing your strategy. This may take up to 30 seconds."
   - Render the returned analysis in a clean, readable format (e.g., a scorecard component, a list of cards for investors).

4. **Error handling**  
   - **On Gemini API Failure (e.g., 500, 429):** The Edge Function should catch the error, log it, and return a user-friendly error message to the frontend (e.g., "The AI analyst is currently unavailable. Please try again later.").
   - **On Timeout:** Implement a timeout for the Edge Function. If the Gemini API takes too long, return a specific error message.

5. **Logging**  
   - Log every invocation of the `analyze-deck` function, including `deckId`, `userId`, `taskType`, and the duration of the Gemini API call.
   - Log any errors encountered during the process for debugging.

## 3. Testing & Validation  
- **Unit**: 
  - Test the prompt construction logic to ensure it correctly incorporates all slide data.
  - Test the response parsing logic with mock Gemini API outputs (valid, invalid, and empty JSON).
- **Integration**: 
  - **Happy Path:** Test the full end-to-end flow: user clicks "Analyze" button in UI -> Edge Function is called -> Gemini responds -> UI displays the analysis correctly.
  - **Failure Path:** Test the UI's response when the Edge Function returns an error (e.g., API key invalid, prompt blocked). Ensure a graceful error message is shown.
- **Metrics**: 
  - **Success Rate:** >99% of valid requests should complete without errors.
  - **Latency:** Average response time for a "Full-Deck Analysis" should be under 45 seconds.

## 4. Troubleshooting  
| Symptom | Cause | Fix |
|---|---|---|
| Analysis takes too long or times out | `thinkingBudget` is too high for the model/task, or the prompt is overly complex. | Lower the `thinkingBudget` in the Edge Function or simplify the prompt. |
| AI returns irrelevant or poor-quality insights | The prompt lacks sufficient context or clear instructions. | Refine the prompt in the Edge Function. Add more examples or constraints. |
| UI shows a generic error | The Edge Function failed unexpectedly. | Check the Supabase Edge Function logs for detailed error messages. |
| Agent fails to analyze specific decks | The deck data being fetched is incomplete or malformed. | Verify the database query in the Edge Function and check the integrity of the data in the `slides` table. |

---

## ✔️ Production Readiness Checklist  
- [ ] **Security**: The Gemini API key is stored exclusively as a Supabase environment variable and is never exposed to the client.
- [ ] **Security**: The `analyze-deck` Edge Function validates the user's JWT to ensure they can only analyze their own decks.
- [ ] **UI/UX**: The UI clearly communicates that the analysis is a time-intensive "thinking" process. A loading spinner with an explanatory message is present.
- [ ] **UI/UX**: The UI handles and displays potential error states gracefully.
- [ ] **Scalability**: The `thinkingBudget` is optimized to balance insight quality with response time and cost.
- [ ] **Monitoring**: The Edge Function has logging implemented to track usage, performance, and errors.
- [ ] **Cost Management**: An alert is configured to monitor Gemini API costs associated with the `gemini-2.5-pro` model.
- [ ] **Final Review**: The quality of AI-generated insights has been manually reviewed and approved by the Product Lead.
