// supabase/functions/invoke-editor-agent/index.ts
// This Edge Function acts as the backend for the AI Copilot, using Gemini's
// function calling to translate natural language commands into database operations.

// FIX: The original Deno types reference was invalid, causing TypeScript errors.
// This global declaration makes the Deno namespace available to TypeScript,
// resolving errors for Deno.env.get(). The Supabase Edge Function runtime
// provides the actual Deno object at execution.
declare global {
  // FIX: Changed const to var to prevent redeclaration errors in a shared compilation context.
  var Deno: {
    env: {
      get: (key: string) => string | undefined;
    };
  };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenAI, FunctionDeclaration, Type } from 'npm:@google/genai';

// --- Define the tools (functions) that the Gemini model can call ---

const addSlide: FunctionDeclaration = {
  name: 'addSlide',
  description: 'Adds a new slide to the deck at a specific position.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title for the new slide.',
      },
      content: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'An array of strings, where each string is a bullet point for the slide content. Can be empty.',
      },
      position: {
        type: Type.INTEGER,
        description: 'The 1-based index where the new slide should be inserted. For example, use 1 for the beginning, or a number greater than the last slide to append to the end.',
      },
    },
    required: ['title', 'position'],
  },
};

const deleteSlide: FunctionDeclaration = {
  name: 'deleteSlide',
  description: 'Deletes a slide from the deck at a specific position.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      position: {
        type: Type.INTEGER,
        description: 'The 1-based index of the slide to delete.',
      },
    },
    required: ['position'],
  },
};

const updateSlideContent: FunctionDeclaration = {
  name: 'updateSlideContent',
  description: 'Updates the title or content of an existing slide.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      position: {
        type: Type.INTEGER,
        description: 'The 1-based index of the slide to update.',
      },
      newTitle: {
        type: Type.STRING,
        description: 'The new title for the slide. If not provided, the title will not be changed.',
      },
      newContent: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'The new bullet points for the slide content. If not provided, the content will not be changed.',
      },
    },
    required: ['position'],
  },
};


serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { deckId, command } = await req.json();
    if (!deckId || !command) {
      throw new Error('Missing deckId or command in request body.');
    }

    // --- Initialize Supabase Admin Client and Gemini Client ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' });

    // --- Get User ID from Authorization header ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // --- Fetch current deck state for context ---
    const { data: slides, error: fetchError } = await supabaseAdmin
      .from('slides')
      .select('*')
      .eq('deck_id', deckId)
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (fetchError) throw fetchError;

    const slideContext = slides.map(s => `${s.position + 1}. ${s.title}`).join('\n');
    const totalSlides = slides.length;

    // --- Construct the prompt for Gemini ---
    const prompt = `
      You are an AI assistant that modifies a slide deck for a user.
      Your task is to understand the user's command and call the correct function to modify the deck.
      The slide positions are 1-based.

      Current slides in the deck (total of ${totalSlides}):
      ${slideContext || '(No slides in the deck yet)'}

      User's command: "${command}"
    `;
    
    // --- Call Gemini with function calling tools ---
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [addSlide, deleteSlide, updateSlideContent] }],
      },
    });

    if (!response.functionCalls || response.functionCalls.length === 0) {
      throw new Error("I'm sorry, I couldn't understand that command. Please try rephrasing it.");
    }
    
    // --- Process the function calls from Gemini's response ---
    for (const call of response.functionCalls) {
      const { name, args } = call;
      console.log(`Executing function: ${name}`, args);

      switch (name) {
        case 'addSlide': {
          let { title, content, position } = args;
          // Gemini provides 1-based position, convert to 0-based index
          let insertIndex = Math.max(0, Math.min(position - 1, slides.length));
          
          const newSlide = {
            user_id: user.id,
            deck_id: deckId,
            title,
            content: content || [],
          };
          
          slides.splice(insertIndex, 0, newSlide);

          // Re-assign positions and upsert all slides to ensure integrity
          const slidesToUpsert = slides.map((slide, index) => ({...slide, position: index}));
          
          const { error } = await supabaseAdmin.from('slides').upsert(slidesToUpsert);
          if (error) throw new Error(`Failed to add slide: ${error.message}`);
          break;
        }

        case 'deleteSlide': {
          let { position } = args;
          const deleteIndex = position - 1; // Convert 1-based to 0-based

          if (deleteIndex < 0 || deleteIndex >= slides.length) {
            throw new Error(`Invalid slide position ${position}. There are only ${slides.length} slides.`);
          }
          
          const slideToDelete = slides[deleteIndex];
          
          // Delete the specific slide record first
          if(slideToDelete.id) {
            const { error: deleteError } = await supabaseAdmin.from('slides').delete().eq('id', slideToDelete.id);
            if (deleteError) throw new Error(`Failed to delete slide record: ${deleteError.message}`);
          }
          
          // Then update positions of the rest
          slides.splice(deleteIndex, 1);
          const slidesToUpsert = slides.map((slide, index) => ({...slide, position: index}));
          if(slidesToUpsert.length > 0) {
            const { error: updateError } = await supabaseAdmin.from('slides').upsert(slidesToUpsert);
            if (updateError) throw new Error(`Failed to re-order slides after deletion: ${updateError.message}`);
          }

          break;
        }

        case 'updateSlideContent': {
          let { position, newTitle, newContent } = args;
          const updateIndex = position - 1; // Convert 1-based to 0-based

          if (updateIndex < 0 || updateIndex >= slides.length) {
            throw new Error(`Invalid slide position ${position}. There are only ${slides.length} slides.`);
          }
          
          const slideToUpdate = slides[updateIndex];
          const updatePayload: { title?: string; content?: string[] } = {};
          if (newTitle) updatePayload.title = newTitle;
          if (newContent) updatePayload.content = newContent;

          const { error } = await supabaseAdmin
            .from('slides')
            .update(updatePayload)
            .eq('id', slideToUpdate.id);
            
          if (error) throw new Error(`Failed to update slide: ${error.message}`);
          break;
        }

        default:
          console.warn(`Unknown function call: ${name}`);
      }
    }
    
    // --- Finally, update the deck's lastEdited timestamp ---
    await supabaseAdmin
        .from('decks')
        .update({ lastEdited: new Date().toISOString() })
        .eq('id', deckId);


    // --- Return a success response ---
    return new Response(JSON.stringify({ success: true, message: 'Deck updated successfully.' }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (err) {
    console.error('Error in invoke-editor-agent:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});