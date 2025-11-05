import { Slide, VisualBrief } from '../types';
import { supabase } from '../components/SupabaseClient';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { deckService } from './deckService';

// This service is now a thin client that invokes Supabase Edge Functions.
// All Gemini API logic and keys are securely handled on the server-side.

export const refineText = async (textToRefine: string, fieldName: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('refine-text', {
    body: { text: textToRefine, fieldName },
  });

  if (error) {
    console.error(`Error refining text for ${fieldName}:`, error);
    throw error;
  }
  
  return data.refinedText;
};

export interface SlideSuggestion {
    suggested_title: string;
    suggested_content: string; 
}

export const generateSlideSuggestions = async (slide: Slide): Promise<SlideSuggestion | null> => {
    const { data, error } = await supabase.functions.invoke('generate-slide-suggestions', {
        body: { slide },
    });

    if (error) {
        console.error(`Error generating suggestions for slide "${slide.title}":`, error);
        throw error;
    }

    return data.suggestion;
};


export const generateSlideImage = async (slideTitle: string, slideContent: string[], visualBrief?: VisualBrief): Promise<string> => {
    // This function now calls the secure Supabase Edge Function 'generate-slide-image'.
    const { data, error } = await supabase.functions.invoke('generate-slide-image', {
        body: { slideTitle, slideContent, visualBrief },
    });

    if (error) {
        console.error("Error generating slide image via Edge Function:", error);
        throw new Error("Image generation failed.");
    }
    
    if (!data || !data.imageUrl) {
        console.error("Edge function did not return an imageUrl.", data);
        throw new Error("Image generation failed: No image data returned.");
    }
    
    // The function is expected to return a data URL (base64 string).
    return data.imageUrl;
};

export const generateVisualTheme = async (themeDescription: string): Promise<VisualBrief> => {
    // This function now calls the secure Supabase Edge Function 'generate-visual-theme'.
    const { data, error } = await supabase.functions.invoke('generate-visual-theme', {
        body: { themeDescription },
    });

    if (error) {
        console.error("Error generating visual theme via Edge Function:", error);
        throw new Error("Could not generate a valid visual theme from the description.");
    }
    
    if (!data || !data.visualBrief) {
        console.error("Edge function did not return a visualBrief.", data);
        throw new Error("Could not generate a valid visual theme from the description.");
    }
    
    return data.visualBrief as VisualBrief;
};

export const invokeEditorAgent = async (deckId: string, command: string): Promise<void> => {
  // NOTE: This implementation simulates the Supabase Edge Function 'invoke-editor-agent'
  // on the client-side. In a production environment, this entire logic block would reside
  // securely in the Edge Function, and the Gemini API key would be a server-side secret.
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  // 1. Define the tools (functions) the AI can call
  const addSlide: FunctionDeclaration = {
    name: 'addSlide',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The title of the new slide.' },
        content: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of bullet points for the slide content.' },
        position: { type: Type.INTEGER, description: 'The zero-based index where the new slide should be inserted. To add to the end, use the current slide count.' },
      },
      required: ['title', 'content', 'position'],
    },
  };

  const deleteSlide: FunctionDeclaration = {
    name: 'deleteSlide',
    parameters: {
      type: Type.OBJECT,
      properties: {
        position: { type: Type.INTEGER, description: 'The zero-based index of the slide to delete.' },
      },
      required: ['position'],
    },
  };
  
  const updateSlide: FunctionDeclaration = {
      name: 'updateSlide',
      parameters: {
          type: Type.OBJECT,
          properties: {
              position: { type: Type.INTEGER, description: 'The zero-based index of the slide to update.'},
              title: { type: Type.STRING, description: 'The new title for the slide. Only include if the title needs to be changed.' },
              content: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'The new content for the slide as an array of bullet points. Only include if the content needs to be changed.'}
          },
          required: ['position']
      }
  };

  // 2. Fetch current deck state for context
  const deck = await deckService.getDeckById(deckId);
  if (!deck) {
    throw new Error(`Deck with id ${deckId} not found.`);
  }

  const deckContext = deck.slides.map((s, i) => `Slide ${i} ("${s.title}")`).join('\n');
  const systemInstruction = `You are an AI assistant that helps users edit their pitch decks.
You can add, update, and delete slides by calling the provided functions.
The user will provide a command, and you will call the appropriate function to modify the deck.
The current deck has ${deck.slides.length} slides. Their titles and indices are:
${deckContext}
When adding a slide, determine the best position if the user is not specific.
When updating or deleting, identify the correct slide index based on the title or user's description (e.g., "the last slide", "the slide titled 'The Problem'").
Always use zero-based indexing for positions.
If the user asks to "change this slide", assume they mean the currently active slide if no other context is given.`;

  // 3. Call the Gemini model with the tools
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: command,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [addSlide, deleteSlide, updateSlide] }],
    }
  });

  if (!response.functionCalls || response.functionCalls.length === 0) {
    console.warn("AI did not call a function. It might have responded with text:", response.text);
    // In a real app, you might show this text to the user as an error or clarification.
    return;
  }

  // 4. Execute the function calls returned by the model
  let modifiedDeck = deck;
  for (const fc of response.functionCalls) {
    const { name, args } = fc;
    console.log(`Executing function: ${name} with args:`, args);

    // Basic validation to prevent out-of-bounds errors
    if (typeof args.position !== 'number' || args.position < 0) {
        console.error(`Invalid position argument: ${args.position}. Aborting function call.`);
        continue;
    }

    switch (name) {
      case 'addSlide':
        if (args.position > modifiedDeck.slides.length) {
            console.error(`Invalid position argument for addSlide: ${args.position}. Aborting function call.`);
            continue;
        }
        const newSlide: Slide = { title: (args.title as string) || 'New Slide', content: (args.content as string[]) || [] };
        modifiedDeck.slides.splice(args.position, 0, newSlide);
        break;
      case 'deleteSlide':
        if (args.position >= modifiedDeck.slides.length) {
            console.error(`Invalid position argument for deleteSlide: ${args.position}. Aborting function call.`);
            continue;
        }
        modifiedDeck.slides.splice(args.position, 1);
        break;
      case 'updateSlide':
        const slideToUpdate = modifiedDeck.slides[args.position];
        if (slideToUpdate) {
            if (args.title) slideToUpdate.title = args.title as string;
            if (args.content) slideToUpdate.content = args.content as string[];
            modifiedDeck.slides[args.position] = slideToUpdate;
        } else {
             console.error(`Slide at position ${args.position} not found for update.`);
        }
        break;
      default:
        console.warn(`Unknown function call received: ${name}`);
    }
  }

  // 5. Save the modified deck back to the database
  await deckService.saveDeck(modifiedDeck);
};


// The `generateDeck` function is handled by the `create-deck-with-images` Edge Function,
// which is invoked directly from App.tsx. It is no longer needed in this client-side service.