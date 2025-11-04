
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DeckData, Slide } from '../types';

// This is a placeholder. In a real environment, this would be set securely.
const API_KEY = process.env.API_KEY; 

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const refineText = async (textToRefine: string, fieldName: string): Promise<string> => {
  if (!API_KEY) return `(AI Offline) Refined text for ${fieldName}: ${textToRefine}`;
  try {
    const prompt = `You are an expert startup pitch consultant. Refine the following text for a "${fieldName}" section to be more clear, concise, and compelling for an investor. Keep the core meaning intact but improve the language. Return only the refined text, without any introductory phrases.

Text to refine: "${textToRefine}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error refining text:", error);
    return textToRefine; // Return original text on error
  }
};

const getFallbackDeck = (deckData: DeckData): Slide[] => [
    { title: `${deckData.companyName || 'Startup'}`, content: ["Welcome to your pitch deck."] },
    { title: "Problem", content: [deckData.problem] },
    { title: "Solution", content: [deckData.solution] },
    { title: "Market Size", content: [deckData.targetAudience] },
    { title: "Business Model", content: [deckData.businessModel] },
    { title: "Go-To-Market", content: ["Our go-to-market strategy focuses on digital marketing and strategic partnerships."] },
    { title: "Competition", content: ["We differentiate ourselves through our unique technology and user-focused design."] },
    { title: "Traction", content: [deckData.traction] },
    { title: "Team", content: [deckData.teamMembers] },
    { title: "The Ask", content: [`We are seeking ${deckData.fundingAmount} to fund: ${deckData.useOfFunds}`] }
];


export const generateDeck = async (deckData: DeckData): Promise<Slide[]> => {
  if (!API_KEY) {
    return getFallbackDeck(deckData);
  }
  try {
    const prompt = `You are an AI pitch deck generator. Based on the following startup information, create a 10-slide pitch deck.
    
    Startup Information:
    - Company Name: ${deckData.companyName}
    - Problem: ${deckData.problem}
    - Solution: ${deckData.solution}
    - Target Audience: ${deckData.targetAudience}
    - Business Model: ${deckData.businessModel}
    - Key Traction: ${deckData.traction}
    - Team: ${deckData.teamMembers}
    - Funding Amount: ${deckData.fundingAmount}
    - Use of Funds: ${deckData.useOfFunds}
    
    Generate content for the following 10 slides:
    1. Title Slide (Company Name and tagline)
    2. The Problem
    3. Our Solution
    4. Market Size & Opportunity (Based on Target Audience)
    5. Business Model
    6. Go-To-Market Strategy (Infer a plausible strategy from the product and market)
    7. Competitive Landscape (Infer potential competitors and differentiation from the problem/solution)
    8. Key Traction
    9. The Team
    10. The Ask (Based on Funding Amount and Use of Funds)
    
    For each slide, provide a 'title' and 'content'. The 'content' should be an array of short, concise bullet points (strings), written in a confident and professional tone suitable for investors. Each bullet point should be a separate string in the array. Do not create a 'Thank you' or 'Contact' slide.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                },
                required: ["title", "content"],
              },
            },
          },
        },
      },
    });

    const jsonResponse = JSON.parse(response.text);
    if (jsonResponse.slides && jsonResponse.slides.length > 0) {
       return jsonResponse.slides.map((slide: any) => ({
          ...slide,
          content: Array.isArray(slide.content) && slide.content.length > 0 ? slide.content : [String(slide.content || "Default content.")]
      }));
    }
    return getFallbackDeck(deckData);


  } catch (error) {
    console.error("Error generating deck:", error);
    return getFallbackDeck(deckData);
  }
};

export const rewriteSlideContent = async (originalContent: string): Promise<string> => {
    if (!API_KEY) return `(AI Offline) Rewritten content: ${originalContent}`;
    try {
        const prompt = `You are an expert startup pitch consultant. Rewrite the following slide content to be more impactful and persuasive for investors. Return only the rewritten content.

Original content: "${originalContent}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error rewriting slide content:", error);
        return originalContent;
    }
};

export const generateSlideImage = async (slideTitle: string, slideContent: string[]): Promise<string> => {
    if (!API_KEY) {
      // Return a placeholder image URL
      const width = Math.floor(Math.random() * 20) + 480; // 480-500
      const height = Math.floor(Math.random() * 20) + 280; // 280-300
      return `https://picsum.photos/${width}/${height}`;
    }
    try {
        const contentString = slideContent.join(' ');
        const prompt = `Generate a compelling, abstract visual for a startup pitch deck slide. The image should be a sophisticated and symbolic representation of the concept below, avoiding literal interpretations.

Embrace one of the following artistic styles:
- Geometric Abstraction: Use clean lines, shapes, and a balanced composition.
- Conceptual Line Art: A single, continuous line that forms a powerful metaphor.
- Modern Swiss Design: Clean typography, grids, and stark, impactful visuals.
- Data-Inspired Art: An artistic interpretation of data, growth, or networks.
- Isometric Illustration: A clean, 3D-like representation of an abstract concept.

The color palette must be minimal and professional, primarily using shades of grey, white, and a single, bold accent of orange (#E87C4D). The final image must be clean, modern, and memorable.

Concept: "${slideTitle} - ${contentString}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        throw new Error("No image data returned from API.");
    } catch (error) {
        console.error("Error generating slide image:", error);
        const width = 500;
        const height = 300;
        return `https://picsum.photos/${width}/${height}`;
    }
};