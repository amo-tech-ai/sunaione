import { Slide } from '../types';
import { supabase } from '../components/SupabaseClient';

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


export const generateSlideImage = async (slideTitle: string, slideContent: string[]): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-slide-image', {
        body: { slideTitle, slideContent },
    });
    
    if (error) {
        console.error(`Error generating image for slide "${slideTitle}":`, error);
        throw error;
    }
    
    // The Edge Function is expected to return a URL, e.g., from Supabase Storage.
    return data.imageUrl;
};

export const invokeEditorAgent = async (deckId: string, command: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('invoke-editor-agent', {
    body: { deckId, command },
  });

  if (error) {
    console.error(`Error invoking editor agent for deck ${deckId}:`, error);
    throw error;
  }

  // The function doesn't need to return data, as we'll refetch the deck state
  // on the client for simplicity and to ensure data consistency.
};


// The `generateDeck` function is handled by the `create-deck-with-images` Edge Function,
// which is invoked directly from App.tsx. It is no longer needed in this client-side service.