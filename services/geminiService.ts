import { Slide, VisualBrief, AnalysisResult, ResearchResult } from '../types';
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


export const generateSlideImage = async (slideTitle: string, slideContent: string[], visualBrief?: VisualBrief): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-slide-image', {
        body: { slideTitle, slideContent, visualBrief },
    });

    if (error) {
        console.error("Error generating slide image:", error);
        throw error;
    }

    if (!data.imageUrl) {
        throw new Error("Image generation failed: No image URL returned from the function.");
    }
    
    return data.imageUrl;
};

export const refineSlideImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('refine-slide-image', {
        body: { base64ImageData, mimeType, refinementPrompt: prompt },
    });

    if (error) {
        console.error("Error refining slide image:", error);
        throw error;
    }

    if (!data.newImageUrl) {
        throw new Error("Image refinement failed: No image URL returned from the function.");
    }
    
    return data.newImageUrl;
};


export const generateVisualTheme = async (themeDescription: string): Promise<VisualBrief> => {
    const { data, error } = await supabase.functions.invoke('generate-visual-theme', {
        body: { themeDescription },
    });

    if (error) {
        console.error("Error generating visual theme:", error);
        throw error;
    }
    
    if (!data.visualBrief) {
        console.error("Invalid response from generate-visual-theme", data);
        throw new Error("Could not generate a valid visual theme from the description.");
    }
    
    return data.visualBrief;
};

export const invokeEditorAgent = async (deckId: string, command: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('invoke-editor-agent', {
        body: { deckId, command },
    });

    if (error) {
        console.error("Error invoking editor agent:", error);
        throw error;
    }
};

export const analyzeDeck = async (deckId: string): Promise<AnalysisResult> => {
    const { data, error } = await supabase.functions.invoke('analyze-deck', {
        body: { deckId },
    });

    if (error) {
        console.error("Error analyzing deck:", error);
        throw new Error(`Strategic analysis failed: ${error.message}`);
    }
    
    if (!data.analysis) {
        console.error("Invalid response from analyze-deck", data);
        throw new Error("Could not get a valid analysis from the AI agent.");
    }
    
    return data.analysis;
};

export const invokeResearchAgent = async (query: string): Promise<ResearchResult> => {
    const { data, error } = await supabase.functions.invoke('invoke-research-agent', {
        body: { query },
    });

    if (error) {
        console.error("Error invoking research agent:", error);
        throw new Error(`Market research failed: ${error.message}`);
    }
    
    if (!data.result) {
        console.error("Invalid response from invoke-research-agent", data);
        throw new Error("Could not get a valid result from the research agent.");
    }

    return data.result;
};

export const generateWorkflowDiagram = async (deckId: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-workflow-diagram', {
        body: { deckId },
    });

    if (error) {
        console.error("Error generating workflow diagram:", error);
        throw new Error(`Diagram generation failed: ${error.message}`);
    }
    
    if (!data.diagramCode) {
        console.error("Invalid response from generate-workflow-diagram", data);
        throw new Error("Could not get a valid diagram from the AI agent.");
    }

    return data.diagramCode;
};


// The `generateDeck` function is handled by the `create-deck-with-images` Edge Function,
// which is invoked directly from App.tsx. It is no longer needed in this client-side service.