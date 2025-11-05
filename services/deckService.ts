import { Deck, Slide } from '../types';
import { supabase } from '../components/SupabaseClient';

// This service now interacts directly with the Supabase database.
// All operations are scoped to the authenticated user.

export const deckService = {
    async getDecks(): Promise<Deck[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('decks')
            .select('*, slides(*)')
            .eq('user_id', session.user.id)
            .order('lastEdited', { ascending: false });

        if (error) {
            console.error("Error fetching decks:", error);
            throw error;
        }

        // The slides are nested; let's sort them by position
        return data.map(deck => ({
            ...deck,
            slides: deck.slides.sort((a: any, b: any) => a.position - b.position)
        }));
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

        if (error) {
            console.error("Error fetching single deck:", error);
            return null;
        }

        return {
            ...data,
            slides: data.slides.sort((a: any, b: any) => a.position - b.position)
        };
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

        const { error } = await supabase
            .from('decks')
            .delete()
            .eq('id', deckId)
            .eq('user_id', session.user.id);
            
        if (error) throw error;
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