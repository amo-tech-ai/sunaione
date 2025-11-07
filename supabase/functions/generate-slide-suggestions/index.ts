// supabase/functions/generate-slide-suggestions/index.ts
declare global {
  // FIX: Changed const to var to prevent redeclaration errors in a shared compilation context.
  var Deno: { env: { get: (key: string) => string | undefined; }; };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenAI, Type } from 'npm:@google/genai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { slide } = await req.json();
    if (!slide) throw new Error('Missing slide data in request body.');

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    const prompt = `
      Analyze the following pitch deck slide and suggest improvements.
      Original Title: "${slide.title}"
      Original Content:
      - ${slide.content.join('\n- ')}

      Suggest a more compelling title and more concise, impactful content.
      Return a single JSON object with two keys: "suggested_title" (string) and "suggested_content" (a single string with bullet points separated by newlines).
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const suggestion = JSON.parse(response.text);

    return new Response(JSON.stringify({ suggestion }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error in generate-slide-suggestions:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});