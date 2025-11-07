// supabase/functions/invoke-research-agent/index.ts
declare global {
  var Deno: {
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenAI } from 'npm:@google/genai';

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
    const { query } = await req.json();
    if (!query) {
      throw new Error('Missing query in request body.');
    }

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    const prompt = `
      You are a Market Research Analyst for a startup founder.
      Your task is to answer the user's question based on real-time Google Search results.
      Provide a concise, direct answer. Do not use markdown.

      User's question: "${query}"
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const result = {
        answer: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

    return new Response(JSON.stringify({ result }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (err) {
    console.error('Error in invoke-research-agent:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});