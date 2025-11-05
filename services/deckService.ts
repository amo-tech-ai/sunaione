import { Deck } from '../types';

// --- In-memory Mock Store ---
// The Supabase client has been removed to fix connection errors.
// This mock store simulates a database for the duration of the user session.

const MOCK_DECKS: Deck[] = [
    {
        id: 'deck-1-start',
        name: 'Project Innovate Pitch',
        template: 'startup',
        lastEdited: new Date('2024-10-25T10:00:00Z').getTime(),
        slides: [
            { title: 'Introduction', content: ['Welcome to Project Innovate!', 'Changing the world, one line of code at a time.'], image: 'https://source.unsplash.com/random/800x600/?startup,tech' },
            { title: 'The Problem', content: ['The market has a significant gap.', 'Existing solutions are slow and expensive.'] },
            { title: 'Our Solution', content: ['A revolutionary new platform.', 'Faster, cheaper, and more efficient.'] },
        ],
    },
    {
        id: 'deck-2-corp',
        name: 'Q4 Corporate Strategy',
        template: 'corporate',
        lastEdited: new Date('2024-10-26T14:30:00Z').getTime(),
        slides: [
            { title: 'Q3 Performance Review', content: ['Met all key performance indicators.', 'Exceeded revenue targets by 15%.'] },
            { title: 'Q4 Strategic Goals', content: ['Expand into the European market.', 'Launch two new product features.'] },
        ],
    },
];

let decksStore: Deck[] = JSON.parse(JSON.stringify(MOCK_DECKS)); // Deep copy for a fresh start on reload

export const deckService = {
    async getDecks(): Promise<Deck[]> {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
        return [...decksStore].sort((a, b) => b.lastEdited - a.lastEdited);
    },

    async saveDeck(deckToSave: Deck): Promise<Deck> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = decksStore.findIndex(d => d.id === deckToSave.id);
        if (index !== -1) {
            decksStore[index] = { ...deckToSave };
        } else {
            decksStore.push({ ...deckToSave });
        }
        return deckToSave;
    },

    async deleteDeck(deckId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        decksStore = decksStore.filter(d => d.id !== deckId);
    },
    
    async duplicateDeck(deckId: string): Promise<Deck> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const originalDeck = decksStore.find(d => d.id === deckId);
        if (!originalDeck) {
            throw new Error("Deck not found for duplication");
        }
        const duplicatedDeck: Deck = {
            ...JSON.parse(JSON.stringify(originalDeck)),
            id: `deck-${Date.now()}`,
            name: `${originalDeck.name} (Copy)`,
            lastEdited: Date.now(),
        };
        decksStore.push(duplicatedDeck);
        return duplicatedDeck;
    },

    // New method for App.tsx to add a fully formed deck to the mock store
    async addDeck(newDeck: Deck): Promise<Deck> {
        await new Promise(resolve => setTimeout(resolve, 100));
        decksStore.push(newDeck);
        return newDeck;
    }
};