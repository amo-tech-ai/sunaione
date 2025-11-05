
import { Type, Modality } from "@google/genai";
import { Slide } from '../types';

// The Supabase client and calls have been removed and replaced with a mock implementation
// to allow the application to function without a live backend.

export const refineText = async (textToRefine: string, fieldName: string): Promise<string> => {
  console.log(`Mock refining text for field: ${fieldName}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI processing time
  return `${textToRefine} (AI Refined)`;
};

export interface SlideSuggestion {
    suggested_title: string;
    suggested_content: string; 
}

export const generateSlideSuggestions = async (slide: Slide): Promise<SlideSuggestion | null> => {
    console.log(`Mock generating suggestions for slide: ${slide.title}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI processing time
    
    // Don't suggest if content is too simple to avoid clutter
    if (slide.content.length === 1 && slide.content[0].length < 20) {
        return null;
    }

    return {
        suggested_title: `Enhanced: ${slide.title}`,
        suggested_content: slide.content.map(line => `• ${line}`).join('\n'),
    };
};


export const generateSlideImage = async (slideTitle: string, slideContent: string[]): Promise<string> => {
    console.log(`Mock generating image for slide: ${slideTitle}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate image generation time
    // Use a seed to get consistent placeholder images for the same title
    const seed = slideTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${seed}/500/300`;
};

// NOTE: generateDeck has been moved to a Supabase Edge Function (`create-deck-with-images`)
// and is now called directly from App.tsx. It is removed from this client-side service.