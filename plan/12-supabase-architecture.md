# AMO AI: Supabase Backend Architecture

**Document Version:** 1.0
**Date:** October 26, 2024
**Author:** AI Systems Architect

---

## 1. Overview

This document serves as the single source of truth for the entire Supabase backend supporting the AMO AI application. It provides a complete reference for the database schema, security policies, and serverless functions that power the platform's features, from user authentication to advanced AI agent capabilities.

The architecture is designed to be secure, scalable, and maintainable, with a clear separation of concerns between the database structure and the serverless business logic.

---

## 2. Database Schema

This section details the required SQL schema for the Supabase PostgreSQL database. These tables are essential for user data, deck persistence, and enabling the AI agents to function correctly.

### Table: `profiles`
Stores public user data, linked to Supabase's built-in `auth.users` table.

```sql
-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Set up Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
```

### Table: `decks`
Stores the main information for each pitch deck created by a user.

```sql
-- Create the decks table
CREATE TABLE public.decks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  "lastEdited" timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  template text NOT NULL DEFAULT 'startup'::text,
  "visualThemeDescription" text,
  "visualThemeBrief" jsonb,
  CONSTRAINT decks_pkey PRIMARY KEY (id)
);

-- Set up Row Level Security for decks
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decks."
ON public.decks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks."
ON public.decks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks."
ON public.decks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks."
ON public.decks FOR DELETE
USING (auth.uid() = user_id);
```

### Table: `slides`
Stores the individual slides that belong to a deck.

```sql
-- Create the slides table
CREATE TABLE public.slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  content text[],
  image text,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT slides_pkey PRIMARY KEY (id)
);

-- Set up Row Level Security for slides
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view the slides of their own decks."
ON public.slides FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create slides for their own decks."
ON public.slides FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update slides for their own decks."
ON public.slides FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete slides from their own decks."
ON public.slides FOR DELETE
USING (auth.uid() = user_id);
```

---

## 3. Triggers & Functions

This section details automated database functions and triggers.

### Function: `handle_new_user()`
This trigger function automatically creates a profile entry in the `public.profiles` table whenever a new user signs up via Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Create the trigger to execute the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 4. Edge Functions (AI Agents)

This section documents all the serverless Edge Functions that contain our core AI logic. All Gemini API calls are made exclusively from these functions to ensure security and scalability.

| Function Name | Agent Role | Gemini Model(s) | Description |
| :--- | :--- | :--- | :--- |
| `create-deck-with-images` | Content & Visual Agent | `gemini-2.5-pro`, `gemini-2.5-flash-image` | Orchestrates the entire initial deck creation process. It first generates the 10-slide text content and then generates a unique, context-aware image for each slide. |
| `refine-text` | Content Agent | `gemini-2.5-flash` | Acts as an expert copywriter. It takes user-provided text from the wizard and refines it to be more concise, professional, and impactful for a pitch deck. |
| `generate-slide-suggestions` | Content Agent | `gemini-2.5-flash` | Analyzes an existing slide's content and suggests improvements for the title and bullet points to enhance clarity and impact. |
| `generate-slide-image` | Visual Agent | `gemini-2.5-flash-image` | Generates a single, professional image for a slide based on its content and an optional visual theme brief to ensure stylistic consistency. |
| `generate-visual-theme` | Visual Agent | `gemini-2.5-flash` | Takes a user's high-level description of a visual style (e.g., "dark and futuristic") and generates a structured JSON "visual brief" with a color palette, keywords, and mood. |
| `invoke-editor-agent` | Interactive Editor Agent | `gemini-2.5-flash` | The core of the "AI Copilot." It uses Gemini's **Function Calling** feature to translate a user's natural language commands (e.g., "delete slide 3") into specific database operations. |
| `analyze-deck` | Strategic Analyst Agent | `gemini-2.5-pro` | Performs a deep, holistic analysis of the entire deck. It uses the **'Thinking'** feature (`thinkingBudget`) to evaluate narrative flow, identify strategic weaknesses, and provide a "Pitch Readiness Score." |
| `invoke-research-agent` | Market Research Agent | `gemini-2.5-pro` | Answers user questions by grounding its response in real-time Google Search results. It provides concise answers and cites its sources, adding data-driven credibility to the deck. |
