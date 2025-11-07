// supabase/functions/generate-visual-theme/index.ts
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
    const { themeDescription } = await req.json();
    if (!themeDescription) throw new Error('Missing theme description.');

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    const prompt = `
      Based on the user's description of a visual style, generate a detailed visual brief for a pitch deck.
      User's description: "${themeDescription}"
      
      Return a single JSON object with the following keys:
      - "style": A short, descriptive name for the style (e.g., 'Minimalist & Clean').
      - "colorPalette": An array of 5 hex color codes that match the theme.
      - "keywords": An array of 5 relevant visual keywords (e.g., 'data', 'growth', 'abstract').
      - "mood": A short string describing the feeling of the theme (e.g., 'Professional and trusting').
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING },
                    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    mood: { type: Type.STRING },
                },
            },
        },
    });

    const visualBrief = JSON.parse(response.text);

    return new Response(JSON.stringify({ visualBrief }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error in generate-visual-theme:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});