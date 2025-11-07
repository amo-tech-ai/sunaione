// supabase/functions/create-deck-with-images/index.ts
// This function orchestrates the entire deck creation process.
declare global {
  // FIX: Changed const to var to prevent redeclaration errors in a shared compilation context.
  var Deno: { env: { get: (key: string) => string | undefined; }; };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenAI, Modality, Type } from 'npm:@google/genai';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { deckData } = await req.json();
    if (!deckData) throw new Error('Missing deckData in request body.');

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    // 1. Generate Deck Content
    const deckPrompt = `
      Create a 10-slide pitch deck for a startup.
      Based on this data: ${JSON.stringify(deckData, null, 2)}.
      Return a JSON object with a single key "slides", which is an array of slide objects.
      Each slide object should have "title" (string) and "content" (array of strings for bullet points).
    `;
    const contentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: deckPrompt,
        config: { responseMimeType: 'application/json' }
    });
    const { slides: generatedSlides } = JSON.parse(contentResponse.text);

    // 2. Save Initial Deck and Slides to DB
    const { data: deck, error: deckError } = await supabaseAdmin
      .from('decks')
      .insert({ name: deckData.companyName, user_id: user.id, template: deckData.template, lastEdited: new Date().toISOString() })
      .select()
      .single();
    if (deckError) throw deckError;

    const slideRecords = generatedSlides.map((slide: any, index: number) => ({
      ...slide,
      deck_id: deck.id,
      user_id: user.id,
      position: index,
    }));
    const { data: savedSlides, error: slidesError } = await supabaseAdmin.from('slides').insert(slideRecords).select();
    if (slidesError) throw slidesError;

    // 3. Generate an image for each slide
    const imagePromises = savedSlides.map(async (slide) => {
        const imagePrompt = `Create a visually appealing, professional image for a pitch deck slide titled "${slide.title}". The content is: "${slide.content.join(', ')}". Style: Abstract, clean, modern.`;
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Image = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64Image}`;
                // 4. Update the slide with the image URL
                await supabaseAdmin.from('slides').update({ image: imageUrl }).eq('id', slide.id);
            }
        }
    });

    await Promise.allSettled(imagePromises);

    return new Response(JSON.stringify({ deckId: deck.id }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error in create-deck-with-images:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});