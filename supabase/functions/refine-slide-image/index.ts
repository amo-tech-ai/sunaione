// supabase/functions/refine-slide-image/index.ts
declare global {
  var Deno: { env: { get: (key: string) => string | undefined; }; };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenAI, Modality } from 'npm:@google/genai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { base64ImageData, mimeType, refinementPrompt } = await req.json();
    if (!base64ImageData || !mimeType || !refinementPrompt) {
        throw new Error('Missing base64ImageData, mimeType, or refinementPrompt in request body.');
    }

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: `Edit this image based on the following instruction: "${refinementPrompt}"` },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64Image = part.inlineData.data;
            const newImageUrl = `data:${part.inlineData.mimeType};base64,${base64Image}`;
            return new Response(JSON.stringify({ newImageUrl }), {
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                status: 200,
            });
        }
    }

    throw new Error("Image refinement failed to return an image.");

  } catch (err) {
    console.error('Error in refine-slide-image:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});