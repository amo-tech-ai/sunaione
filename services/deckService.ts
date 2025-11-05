import { Deck, DeckData } from '../types';

// --- Simulation of a backend API using localStorage ---

const FAKE_LATENCY = 300; // ms

const getDecks = async (): Promise<Deck[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const savedDecks = localStorage.getItem('amo_decks');
            resolve(savedDecks ? JSON.parse(savedDecks) : []);
        }, FAKE_LATENCY);
    });
};

const saveAllDecks = async (decks: Deck[]): Promise<void> => {
     return new Promise(resolve => {
        setTimeout(() => {
            localStorage.setItem('amo_decks', JSON.stringify(decks));
            resolve();
        }, FAKE_LATENCY);
    });
}

export const deckService = {
    async getDecks(): Promise<Deck[]> {
        return getDecks();
    },

    async saveDeck(deckToSave: Deck): Promise<Deck> {
        const decks = await getDecks();
        const deckIndex = decks.findIndex(d => d.id === deckToSave.id);
        if (deckIndex > -1) {
            decks[deckIndex] = deckToSave;
        } else {
            decks.push(deckToSave);
        }
        await saveAllDecks(decks);
        return deckToSave;
    },

    async createDeck(newDeck: Deck): Promise<Deck> {
        const decks = await getDecks();
        decks.push(newDeck);
        await saveAllDecks(decks);
        return newDeck;
    },

    async deleteDeck(deckId: string): Promise<void> {
        let decks = await getDecks();
        decks = decks.filter(d => d.id !== deckId);
        await saveAllDecks(decks);
    },
    
    async duplicateDeck(deckId: string): Promise<Deck> {
        const decks = await getDecks();
        const deckToDuplicate = decks.find(d => d.id === deckId);
        if (!deckToDuplicate) {
            throw new Error("Deck not found");
        }
        const duplicatedDeck: Deck = {
            ...deckToDuplicate,
            id: `deck-${Date.now()}`,
            name: `${deckToDuplicate.name} (Copy)`,
            lastEdited: Date.now(),
        };
        decks.push(duplicatedDeck);
        await saveAllDecks(decks);
        return duplicatedDeck;
    }
};
