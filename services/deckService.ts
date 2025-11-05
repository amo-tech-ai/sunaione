import { Deck, Slide, TemplateID } from '../types';
import { supabase } from '../components/SupabaseClient';

// This service now interacts directly with the Supabase database.
// All operations are scoped to the authenticated user.

// Helper function to robustly map database objects to the Deck interface,
// preventing malformed data from reaching React components.
const mapDbDeckToDeck = (dbDeck: any): Deck => {
    // Handle potential snake_case from Supabase and different date formats
    const lastEditedValue = dbDeck.lastEdited || dbDeck.last_edited;
    const lastEdited = lastEditedValue ? new Date(lastEditedValue).getTime() : Date.now();

    const slides = (dbDeck.slides || []).map((slide: any): Slide => {
        let content: string[];
        if (Array.isArray(slide.content)) {
            // Ensure all elements are strings, filtering out nulls/undefineds
            content = slide.content.filter((item: any) => item !== null && item !== undefined).map(String);
        } else if (slide.content !== null && slide.content !== undefined) {
            content = [String(slide.content)];
        } else {
            content = [];
        }
        
        return {
            id: slide.id,
            title: slide.title || '',
            content,
            image: slide.image || slide.imageUrl || undefined,
        };
    }).sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
    
    return {
        id: dbDeck.id,
        name: dbDeck.name || 'Untitled Deck',
        lastEdited,
        template: (dbDeck.template || 'startup') as TemplateID,
        slides,
        visualThemeDescription: dbDeck.visualThemeDescription || dbDeck.visual_theme_description,
        visualThemeBrief: dbDeck.visualThemeBrief || dbDeck.visual_theme_brief,
    };
};


export const deckService = {
    async getDecks(searchQuery?: string): Promise<Deck[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");

        let query = supabase
            .from('decks')
            .select('*, slides(*)')
            .eq('user_id', session.user.id)
            .order('lastEdited', { ascending: false });
            
        if (searchQuery) {
            query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching decks:", error);
            throw error;
        }

        return (data || []).map(mapDbDeckToDeck);
    },

    async getDeckById(deckId: string): Promise<Deck | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('decks')
            .select('*, slides(*)')
            .eq('id', deckId)
            .eq('user_id', session.user.id)
            .single();

        if (error || !data) {
            console.error("Error fetching single deck:", error);
            return null;
        }

        return mapDbDeckToDeck(data);
    },

    async saveDeck(deckToSave: Deck): Promise<Deck> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");

        const { slides, ...deckData } = deckToSave;
        
        // Upsert the main deck record
        const { error: deckError } = await supabase
            .from('decks')
            .upsert({ ...deckData, user_id: session.user.id });

        if (deckError) throw deckError;

        // We need to delete slides that are no longer in the deck
        const slideIdsToKeep = slides.map(s => s.id).filter(Boolean);
        
        // Fix: The previous logic failed to delete slides if the user removed all of them.
        // This updated logic ensures that any slide in the database not present
        // in the current `slides` array is removed.
        const deleteQuery = supabase
            .from('slides')
            .delete()
            .eq('deck_id', deckToSave.id);

        if (slideIdsToKeep.length > 0) {
            deleteQuery.not('id', 'in', `(${slideIdsToKeep.join(',')})`);
        }

        const { error: deleteError } = await deleteQuery;
        if (deleteError) console.error("Error deleting old slides:", deleteError);


        // Upsert the slide records
        if (slides.length > 0) {
            const slideRecords = slides.map((slide, index) => ({
                ...slide,
                deck_id: deckToSave.id,
                user_id: session.user.id,
                position: index,
            }));
            
            const { error: slidesError } = await supabase
                .from('slides')
                .upsert(slideRecords);

            if (slidesError) throw slidesError;
        }

        return deckToSave;
    },

    async deleteDeck(deckId: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");

        // First, delete all associated slides to prevent orphaned data
        const { error: slidesError } = await supabase
            .from('slides')
            .delete()
            .eq('deck_id', deckId)
            .eq('user_id', session.user.id);

        if (slidesError) {
            console.error('Error deleting associated slides:', slidesError);
            throw slidesError;
        }

        // Then, delete the deck record itself
        const { error: deckError } = await supabase
            .from('decks')
            .delete()
            .eq('id', deckId)
            .eq('user_id', session.user.id);
            
        if (deckError) {
            console.error('Error deleting deck:', deckError);
            throw deckError;
        }
    },
    
    async duplicateDeck(deckId: string): Promise<Deck> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");

        const originalDeck = await this.getDeckById(deckId);
        if (!originalDeck) {
            throw new Error("Deck not found for duplication");
        }
        
        const newDeckId = `deck-${Date.now()}`;
        
        // Fix: Destructure slides from originalDeck to prevent attempting to insert them into the 'decks' table.
        const { slides, ...originalDeckData } = originalDeck;

        // Create the new deck record
        const { error: newDeckError } = await supabase
            .from('decks')
            .insert({
                ...originalDeckData,
                id: newDeckId,
                name: `${originalDeck.name} (Copy)`,
                lastEdited: new Date().getTime(),
                user_id: session.user.id,
            });

        if (newDeckError) throw newDeckError;

        // Create new slide records
        if (slides.length > 0) {
            const newSlides = slides.map((slide, index) => ({
                ...slide,
                id: undefined, // Let Supabase generate new UUID
                deck_id: newDeckId,
                user_id: session.user.id,
                position: index,
            }));

            const { error: slidesError } = await supabase.from('slides').insert(newSlides);

            if (slidesError) throw slidesError;
        }

        const finalDuplicatedDeck = await this.getDeckById(newDeckId);
        if (!finalDuplicatedDeck) throw new Error("Failed to fetch duplicated deck");

        return finalDuplicatedDeck;
    },
};