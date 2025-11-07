// supabase/functions/analyze-deck/index.ts
// This Edge Function is the Strategic Analyst Agent. It uses Gemini 2.5 Pro's
// 'thinking' capability to perform a deep, holistic analysis of a pitch deck.

declare global {
  var Deno: {
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenAI, Type } from 'npm:@google/genai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { deckId } = await req.json();
    if (!deckId) {
      throw new Error('Missing deckId in request body.');
    }

    // --- Initialize Supabase Admin Client and Gemini Client ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    // --- Get User ID from Authorization header ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    // --- Fetch full deck state for analysis ---
    const { data: slides, error: fetchError } = await supabaseAdmin
      .from('slides')
      .select('title, content')
      .eq('deck_id', deckId)
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (fetchError) throw fetchError;
    if (!slides || slides.length === 0) {
        throw new Error("Deck has no content to analyze.");
    }
    
    const deckContentForAnalysis = slides.map((s, i) => `
      Slide ${i + 1}: ${s.title}
      Content:
      - ${s.content.join('\n- ')}
    `).join('\n---\n');

    // --- Construct the prompt for the Strategic Analyst Agent ---
    const prompt = `
      You are an expert VC pitch deck analyst. Your task is to perform a deep, strategic analysis of the following pitch deck content.
      Think step-by-step to evaluate the narrative flow, clarity, consistency, and potential weaknesses.

      **Pitch Deck Content:**
      ${deckContentForAnalysis}

      **Analysis Instructions:**
      1.  **Pitch Readiness Score:** Calculate a score from 0 to 100 representing how "investor-ready" this deck is. A score below 60 is poor, 60-80 is average, and above 80 is excellent.
      2.  **Executive Summary:** Write a brief, 2-3 sentence summary of the pitch and your overall impression.
      3.  **Key Insights:** Provide a list of actionable feedback points. For each point, identify if it's a 'Strength', 'Weakness', or 'Suggestion'. Link each insight to a specific slide number and title. Be critical and constructive. Identify missing information, logical gaps, or unclear statements.

      Return a single, valid JSON object with the following structure:
      {
        "pitch_readiness_score": number,
        "executive_summary": string,
        "key_insights": [
          {
            "category": "Strength" | "Weakness" | "Suggestion",
            "slide_number": number,
            "slide_title": string,
            "feedback": string
          }
        ]
      }
    `;
    
    // --- Call Gemini with a high thinking budget ---
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // Allocate significant thinking time for deep analysis
        thinkingConfig: { thinkingBudget: 16384 },
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                pitch_readiness_score: { type: Type.INTEGER },
                executive_summary: { type: Type.STRING },
                key_insights: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            slide_number: { type: Type.INTEGER },
                            slide_title: { type: Type.STRING },
                            feedback: { type: Type.STRING },
                        }
                    }
                }
            }
        }
      },
    });

    const analysis = JSON.parse(response.text);

    return new Response(JSON.stringify({ analysis }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (err) {
    console.error('Error in analyze-deck:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});