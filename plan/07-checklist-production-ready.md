# Production Readiness Checklist & Verification Protocol

**Project:** AMO AI Pitch Deck Wizard
**Document Version:** 1.0
**Date:** October 26, 2024

This document outlines the end-to-end process for inspecting, diagnosing, fixing, and verifying issues to ensure the AMO AI application is 100% production-ready. It addresses the critical data loss bug and establishes a protocol for future development.

---

## Phase 1: Inspect & Identify Errors

This phase involves a deep analysis of the current application state to identify all potential issues, with a focus on critical red flags.

-   [ ] **Codebase Audit:**
    -   [ ] **State Management Review:** Analyze how `localDeck` and the server-fetched `deck` state interact in `DeckEditor.tsx`. Is there a single source of truth? *(`Red Flag Identified: Two sources of truth cause data overwrites.`)*
    -   [ ] **Component Prop Drilling:** Trace data flow from `App.tsx` down to `DeckEditor.tsx` and `AICopilot`. Are functions like `handleSave` and `refreshDeck` passed correctly?
    -   [ ] **API Service Layer (`deckService.ts`, `geminiService.ts`):** Confirm that all functions correctly handle asynchronous operations, promises, and error states.
    -   [ ] **Dependencies Check:** Review `package.json` (or equivalent `importmap`) for outdated or conflicting libraries.

-   [ ] **Behavioral Audit:**
    -   [ ] **Replicate the Bug:** Follow the exact user steps to trigger the data loss issue.
        1.  Load `DeckEditor`.
        2.  Make a local change to a slide's title or content (do not click "Save").
        3.  Use the AI Copilot to issue a command (e.g., "add a new slide").
        4.  Observe that the local change from step 2 is reverted after the Copilot finishes. *(`Failure Point Confirmed`)*
    -   [ ] **Network Tab Analysis:** Use browser developer tools to monitor network requests during the bug replication. Confirm that `invokeEditorAgent` is called, followed by a `getDeckById` (or equivalent) that fetches fresh data from the server.

-   [ ] **Production Readiness Check:**
    -   [ ] **Security:** Confirm all API keys (Supabase, Gemini) are handled server-side in Edge Functions and are not exposed on the client. *(Status: ✅ Verified Complete)*
    -   [ ] **Error Handling:** Does the UI provide clear feedback to the user if an API call fails?
    -   [ ] **Performance:** Are there any unnecessary re-renders or performance bottlenecks in the `DeckEditor`?

---

## Phase 2: Diagnose Root Cause

Compare expected behavior with the actual (buggy) behavior to pinpoint the exact failure mechanism.

-   [ ] **Expected Behavior:**
    1.  User edits a slide locally.
    2.  User invokes AI Copilot.
    3.  The application **first saves** the local, unsaved changes to the database.
    4.  The AI Copilot command is executed on the now-updated deck.
    5.  The UI refreshes, showing both the user's local change and the AI's change.

-   [ ] **Actual Behavior:**
    1.  User edits a slide locally (`localDeck` state is updated in the browser).
    2.  User invokes AI Copilot.
    3.  The AI Copilot command is executed on the **stale, server-side version** of the deck.
    4.  The `onCommandSuccess` callback (`refreshDeck`) is triggered.
    5.  `refreshDeck` fetches the latest version from the database, which **does not include the user's local edit**.
    6.  The `localDeck` state is overwritten with the server data, erasing the user's change.

-   [ ] **Root Cause Statement:**
    *The data loss occurs because the AI Copilot's action does not account for unsaved client-side state. The `invokeEditorAgent` operates on the database's version of the deck, and the subsequent forced refresh (`refreshDeck`) overwrites the user's local modifications before they can be persisted.*

---

## Phase 3: Implement & Fix

Provide the exact steps and code changes required to resolve the diagnosed issue.

-   [ ] **Identify Files to Change:**
    -   `screens/DeckEditor.tsx`: This is the only file that needs modification. The component orchestrates the interaction between local state, the save action, and the AI Copilot.

-   [ ] **Outline Correction Steps:**
    1.  The `AICopilot` component needs a way to trigger a save action *before* it sends its command to the backend.
    2.  Pass the `handleSave` function from `DeckEditor` down as a prop to the `AICopilot` component. A new prop, `onBeforeCommand`, will be used for this.
    3.  Inside `AICopilot`'s `handleSubmit` function, `await` the `onBeforeCommand` prop *before* calling `invokeEditorAgent`. This creates the correct sequence of operations: Save -> Execute AI Command -> Refresh.

-   [ ] **Code Implementation:**
    *   **In `screens/DeckEditor.tsx` (Parent Component):**
        ```diff
        --- a/screens/DeckEditor.tsx
        +++ b/screens/DeckEditor.tsx
        @@ -432,6 +432,7 @@
                         <AICopilot
                             deckId={localDeck.id}
                             onCommandSuccess={refreshDeck}
        +                    onBeforeCommand={handleSave}
                         />
                     </div>
                 </div>
        ```

    *   **In `screens/DeckEditor.tsx` (AICopilot Component Definition):**
        ```diff
        --- a/screens/DeckEditor.tsx
        +++ b/screens/DeckEditor.tsx
        @@ -87,10 +87,11 @@
 const AICopilot: React.FC<{
     deckId: string;
     onCommandSuccess: () => void;
+    onBeforeCommand: () => Promise<void>;
 }> = ({ deckId, onCommandSuccess, onBeforeCommand }) => {
     const [command, setCommand] = useState('');
     const [isLoading, setIsLoading] = useState(false);
@@ -104,7 +105,8 @@
         setError(null);
 
         try {
-            await invokeEditorAgent(deckId, command);
+            await onBeforeCommand(); // <-- CRITICAL FIX: Save local changes first.
+            await invokeEditorAgent(deckId, command); // Now execute the command on the saved state.
             onCommandSuccess();
             setCommand('');
         } catch (err) {
        ```

---

## Phase 4: Verify & Test

Confirm that the fix works as expected and has not introduced any regressions.

-   [ ] **Unit/Integration Test (Conceptual):**
    -   [ ] Write a test that simulates a component state change, calls the `AICopilot`'s submit handler, and asserts that the `handleSave` mock function was called *before* the `invokeEditorAgent` mock function.

-   [ ] **End-to-End Manual Verification:**
    1.  [ ] **Action:** Launch the updated application. Navigate to the `DeckEditor`.
    2.  [ ] **Action:** Change the title of the first slide to "TEST TITLE" but **do not** click the "Save" button.
    3.  [ ] **Action:** In the AI Copilot input, type "Add a new slide at the end called Final Thoughts". Submit the command.
    4.  [ ] **Verification:** Observe the application's behavior. The expected outcome is:
        -   A loading indicator appears.
        -   When it finishes, a new "Final Thoughts" slide appears at the end of the slide list.
        -   **Crucially, the title of the first slide remains "TEST TITLE".**
    5.  [ ] **Confirmation:** Reload the browser page entirely. The deck should reload from the database with both the "TEST TITLE" slide and the "Final Thoughts" slide present. This proves the changes were committed and saved correctly.

-   [ ] **Regression Testing:**
    -   [ ] **Test Case:** Use the AI Copilot *without* making any local changes.
    -   [ ] **Expected Result:** The command executes successfully without errors.
    -   [ ] **Test Case:** Make a local change and manually click "Save". Then use the AI Copilot.
    -   [ ] **Expected Result:** The command executes successfully.

## Phase 5: Commit & Deploy

Finalize the changes and document the fix.

-   [ ] **Version Control:**
    -   [ ] Create a descriptive commit message: `fix(editor): Prevent data loss by saving before AI Copilot command`.
    -   [ ] Push the changes to the main branch after code review.
-   [ ] **Deployment:**
    -   [ ] Trigger the production deployment pipeline.
    -   [ ] Monitor deployment logs for any errors.
-   [ ] **Final Verification (Post-Deployment):**
    -   [ ] Perform the manual end-to-end test from Phase 4 on the live production environment to provide absolute proof that the fix is active and correct.