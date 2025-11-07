// supabase/functions/generate-slide-image/index.ts
declare global {
  // FIX: Changed const to var to prevent redeclaration errors in a shared compilation context.
  var Deno: { env: { get: (key: string) => string | undefined; }; };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenAI, Modality } from 'npm:@google/genai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { slideTitle, slideContent, visualBrief } = await req.json();
    if (!slideTitle || !slideContent) throw new Error('Missing slide title or content.');

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    let prompt = `
      Generate a professional and visually appealing image for a pitch deck slide.
      The image should be abstract and conceptual, suitable for a business presentation.
      Slide Title: "${slideTitle}"
      Slide Content: "${slideContent.join(', ')}"
    `;

    if (visualBrief) {
      prompt += `
        Adhere to this visual theme:
        - Style: ${visualBrief.style}
        - Mood: ${visualBrief.mood}
        - Keywords: ${visualBrief.keywords.join(', ')}
        - Color Palette: Use colors like ${visualBrief.colorPalette.join(', ')}
      `;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64Image = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64Image}`;
            return new Response(JSON.stringify({ imageUrl }), {
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                status: 200,
            });
        }
    }

    throw new Error("Image generation failed to return an image.");

  } catch (err) {
    console.error('Error in generate-slide-image:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});