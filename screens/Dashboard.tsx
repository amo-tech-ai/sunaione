
import React from 'react';
import { Screen, Deck } from '../types';
import { ArrowRightIcon } from '../components/Icons';

interface DashboardProps {
    decks: Deck[];
    setCurrentScreen: (screen: Screen) => void;
    onSelectDeck: (deckId: string) => void;
}

const DeckCard: React.FC<{ deck: Deck, onSelect: (id: string) => void }> = ({ deck, onSelect }) => (
    <div onClick={() => onSelect(deck.id)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
        <div>
            <h3 className="font-bold text-lg text-sunai-dark">{deck.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
                {deck.slides.length} slides - Last edited: {new Date(deck.lastEdited).toLocaleDateString()}
            </p>
        </div>
        <div className="mt-6 text-sunai-orange font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Edit Deck <ArrowRightIcon className="w-4 h-4" />
        </div>
    </div>
);

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
    <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
        <h3 className="text-xl font-bold text-gray-800">No decks yet!</h3>
        <p className="text-gray-500 mt-2 mb-6">Ready to create your first pitch deck?</p>
        <button
            onClick={onCreate}
            className="bg-sunai-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all"
        >
            Create New Deck
        </button>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ decks, setCurrentScreen, onSelectDeck }) => {
    const handleCreateNew = () => {
        setCurrentScreen(Screen.Welcome);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-sunai-dark">My Decks</h1>
                    <p className="text-gray-600 mt-1">Manage your pitch decks or create a new one.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-sunai-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition-colors"
                >
                    + New Deck
                </button>
            </div>
            
            {decks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {decks.map(deck => (
                        <DeckCard key={deck.id} deck={deck} onSelect={onSelectDeck} />
                    ))}
                </div>
            ) : (
                <EmptyState onCreate={handleCreateNew} />
            )}
        </div>
    );
};

export default Dashboard;