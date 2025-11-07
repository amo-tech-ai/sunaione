// supabase/functions/generate-workflow-diagram/index.ts
// This function acts as a meta-agent, analyzing the deck creation process
// itself and generating a Mermaid diagram to visualize it.

declare global {
  var Deno: {
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenAI } from 'npm:@google/genai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-control-allow-origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { deckId } = await req.json(); // deckId is passed for context
    if (!deckId) {
      throw new Error('Missing deckId in request body.');
    }

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    // FIX: Escaped backticks around model names to prevent template literal syntax errors.
    const prompt = `
      You are an expert systems analyst for "AMO AI". Your task is to generate a detailed Mermaid diagram that visualizes the complete end-to-end workflow of the "AMO AI Pitch Deck Wizard" application.

      The diagram should be technically accurate, visually appealing, and use the AMO AI branding.

      **Workflow Stages & Components:**
      1.  **Start**: The process begins with User Input in a wizard.
      2.  **Content Agent**: A "Content & Strategy Agent" (\\\`gemini-2.5-pro\\\`) generates the initial deck text.
      3.  **Visual Agent**: A "Visual Design Agent" (\\\`gemini-2.5-flash\\\`) takes a user's style prompt and creates a structured "Visual Brief" (JSON). This brief is then used by the same agent with \\\`gemini-2.5-flash-image\\\` to generate thematically consistent images for all slides.
      4.  **Editor Agent**: The user interacts with an "Interactive Editor Agent" (\\\`gemini-2.5-flash\\\` with Function Calling) via an "AI Copilot" UI to make conversational edits. This is a key feedback loop.
      5.  **Analyst Agent**: The user can invoke a "Strategic Analyst Agent" (\\\`gemini-2.5-pro\\\` with 'Thinking') to get a "Pitch Readiness Score" and deep feedback.
      6.  **Database**: All data is stored securely in a "Supabase Database".
      7.  **End Product**: The final result is a "Polished Pitch Deck".

      **Mermaid Instructions:**
      - Use 'graph TD' (Top Down) syntax.
      - Use Font Awesome icons (e.g., 'fa:fa-user' for user, 'fa:fa-robot' for AI agents, 'fa:fa-database' for Supabase).
      - Group related AI agents in a subgraph.
      - Use styling to define colors: 'amo-orange' for AI processes and 'amo-teal' for data/user stages.
      - Show the flow of key data artifacts like the "Visual Brief".

      Return ONLY the Mermaid code block, starting with \\\`\\\`\\\`mermaid and ending with \\\`\\\`\\\`. Do not include any other text or explanation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    // Clean up the response to ensure it's just the Mermaid code
    let diagramCode = response.text.trim();
    if (diagramCode.startsWith('```mermaid')) {
        diagramCode = diagramCode.substring(9);
    }
    if (diagramCode.endsWith('```')) {
        diagramCode = diagramCode.slice(0, -3);
    }
    diagramCode = diagramCode.trim();

    return new Response(JSON.stringify({ diagramCode }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (err) {
    console.error('Error in generate-workflow-diagram:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});