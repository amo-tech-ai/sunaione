# AMO AI: System Architecture & Workflow Diagrams

This document provides a complete set of architectural diagrams for the AMO AI platform. It visualizes the relationships between all modules, data flows, and user journeys, serving as a technical reference for the entire system.

---

## 1️⃣ Summary

AMO AI is an intelligent, integrated platform designed to support startup founders. It combines a powerful AI-driven Pitch Deck Wizard with a suite of community and growth-oriented tools.

### Core Features
- **Authentication & Profiles:** Secure user management via Supabase Auth, with user profiles and Row-Level Security (RLS).
- **Pitch Deck Wizard:** A guided, multi-step process for inputting startup ideas.
- **Deck Editor & Dashboard:** A robust interface for managing, editing, and viewing generated pitch decks.
- **AI Content Generation:** Core text and image generation for slides using Gemini models.

### Advanced Features
- **Interactive AI Copilot:** Conversational deck editing using Gemini's Function Calling.
- **Strategic Analyst Agent:** Deep deck analysis and scoring using Gemini's 'Thinking' feature.
- **Market Research Agent:** Real-time data fetching with Google Search Grounding.
- **Thematic Visual Design:** Cohesive, brand-aligned image generation for entire decks.
- **Community Modules:** A full suite of tools including a Job Board, Perks Marketplace, and Events System.

---

## 2️⃣ Mermaid Diagrams

### System Overview
*File: `docs/diagrams/00-system-overview.mmd`*
<br/> This diagram shows the high-level architecture, illustrating how the user interacts with the frontend, which in turn communicates with the Supabase backend and the Gemini AI layer.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
graph LR
    subgraph User Interface
        UI[React/Vite Frontend]
    end

    subgraph Supabase Backend
        direction TB
        AUTH[Auth & RLS]
        DB[(Database: Postgres)]
        STORE[Storage]
        FN[Edge Functions]
    end
    
    subgraph Google AI
        GEMINI[Gemini API Models]
    end

    UI --> AUTH
    UI --> DB
    UI --> STORE
    UI --> FN

    FN --> GEMINI
    GEMINI --> FN

    FN --> DB
    FN --> STORE
```

### Auth & RLS Data Flow
*File: `docs/diagrams/01-auth-flow.mmd`*
<br/> This sequence diagram details the user sign-up process, the automatic profile creation via a database trigger, and how subsequent data requests are securely filtered by RLS policies.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
sequenceDiagram
    participant User
    participant Frontend
    participant SupabaseAuth as Auth
    participant SupabaseDB as Database
    
    User->>Frontend: Signs up with email/password
    Frontend->>SupabaseAuth: supabase.auth.signUp()
    SupabaseAuth->>SupabaseDB: INSERT into auth.users
    
    %% Trigger fires to create a public profile %%
    SupabaseDB->>SupabaseDB: TRIGGER: handle_new_user()
    SupabaseDB->>SupabaseDB: INSERT into public.profiles
    
    SupabaseAuth-->>Frontend: Returns session
    Frontend-->>User: Redirects to Dashboard
    
    User->>Frontend: Requests decks
    Frontend->>SupabaseDB: SELECT * FROM decks
    
    %% RLS policy is automatically enforced %%
    SupabaseDB->>SupabaseDB: POLICY: auth.uid() = user_id
    SupabaseDB-->>Frontend: Returns only user's decks
```

### Database ERD
*File: `docs/diagrams/02-database-erd.mmd`*
<br/> This Entity-Relationship Diagram shows the structure of the core database tables and their relationships.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
classDiagram
    direction RL
    class profiles {
      id (uuid)
      full_name (text)
      avatar_url (text)
    }
    class decks {
      id (uuid)
      user_id (uuid)
      name (text)
      template (text)
      visualThemeBrief (jsonb)
    }
    class slides {
      id (uuid)
      deck_id (uuid)
      title (text)
      content (text[])
      image (text)
      position (int)
    }
    class jobs {
      id (uuid)
      title (text)
      companyName (text)
      location (text)
    }
    class events {
      id (uuid)
      title (text)
      date (timestamp)
      location (text)
    }
    
    profiles "1" -- "0..*" decks : creates
    decks "1" -- "1..*" slides : contains
```

### User Journey
*File: `docs/diagrams/03-user-journey.mmd`*
<br/> This diagram illustrates the primary path a new founder takes through the AMO AI platform, from landing on the homepage to creating and finalizing their first pitch deck.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
journey
    title Founder's Pitch Deck Journey
    section Onboarding
      Discover AMO AI: 5: User
      Sign Up / Login: 5: User, Auth
      Enter Dashboard: 4: User, App
    section Creation
      Start Pitch Wizard: 5: User
      Input Startup Idea: 4: User, Wizard
      Generate Deck with AI: 5: AI
    section Refinement
      Review & Edit in Editor: 5: User
      Use AI Copilot for Changes: 4: User, AI
      Analyze Deck with AI: 3: User, AI
    section Finalization
      Present Deck: 5: User
      Share with Investors: 4: User
```

### AI Flow for Deck Creation
*File: `docs/diagrams/04-ai-flow.mmd`*
<br/> This flowchart details the end-to-end process of generating a new pitch deck, from the user's initial input to the final storage of text and images.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
graph TD
    A[User Submits Wizard Data] --> B{Edge Function: create-deck-with-images};
    subgraph B
        C[1. Generate Text] --> D[2. Save to DB]
        D --> E[3. Generate Images] --> F[4. Update DB w/ Images]
    end
    C -- Prompt --> G[Gemini 2.5 Pro];
    G -- JSON: Slides --> C;
    E -- Prompts --> H[Gemini 2.5 Flash Image];
    H -- Base64 Images --> E;
    F --> I[Supabase DB: decks & slides];
    B --> J[Return Deck ID to Frontend];
    J --> K[User Redirected to Editor];
```

### Event Registration Sequence
*File: `docs/diagrams/05-event-registration.mmd`*
<br/> This diagram shows the atomic and secure process for a user registering for an event, handled by a hypothetical `register_for_event` function.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
sequenceDiagram
    participant User
    participant Frontend
    participant SupabaseDB as DB Function (register_for_event)
    
    User->>Frontend: Clicks "Register" for an event
    Frontend->>SupabaseDB: RPC('register_for_event', { event_id, user_id })
    activate SupabaseDB
    
    SupabaseDB->>SupabaseDB: Check event capacity
    SupabaseDB->>SupabaseDB: Add user to registrants table
    SupabaseDB->>SupabaseDB: Decrement event spots
    
    deactivate SupabaseDB
    SupabaseDB-->>Frontend: Returns success/failure
    Frontend-->>User: Shows "Registered" or "Error"
```

### Jobs & Applications Flow
*File: `docs/diagrams/06-jobs-flow.mmd`*
<br/> This flowchart shows the two main paths for the Job Board: a company posting a new job and a candidate applying for it.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
graph TD
    subgraph Employer Flow
        A[Post a Job Form] --> B{Submit Job Details};
        B --> C[Admin Review];
        C --> D[(Supabase DB: jobs)];
        D --> E[Job is Live];
    end

    subgraph Applicant Flow
        F[Browse Job Board] --> G{Select Job};
        G --> H[Apply Screen];
        H --> I{Submit Application};
        I --> J[(Supabase DB: applications)];
        J --> K[Employer is Notified];
    end

    E --> F;
```

### Advanced AI Feedback Loop (Image Refinement)
*File: `docs/diagrams/07-ai-feedback-loop.mmd`*
<br/> This diagram illustrates the advanced, iterative workflow for conversational image refinement, where the user can fine-tune visuals in a loop.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FBF8F5', 'primaryTextColor': '#1A1A1A', 'primaryBorderColor': '#E87C4D', 'lineColor': '#1A1A1A'}}}%%
graph TD
    A[User sees generated image in Editor] --> B{Types 'Make it blue'};
    B --> C[Edge Function: refine-slide-image];
    C -- Sends image + prompt --> D[Gemini 2.5 Flash Image];
    D -- Returns new blue image --> C;
    C -- Returns new image URL --> E[Frontend updates UI];
    E --> A;
    A -- Loop --> F((Happy with result));
```
