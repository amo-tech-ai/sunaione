
import React, { useState } from 'react';
import { Screen, Deck } from '../types';
import { ArrowRightIcon, DocumentDuplicateIcon, SparklesIcon } from '../components/Icons';
import OnboardingTour from '../components/OnboardingTour';

interface DashboardProps {
  decks: Deck[];
  setCurrentScreen: (screen: Screen) => void;
  onSelectDeck: (deckId: string) => void;
}

const DeckCard: React.FC<{ deck: Deck; onSelect: () => void; }> = ({ deck, onSelect }) => {
  return (
    <div onClick={onSelect} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="bg-orange-100 text-amo-orange p-3 rounded-lg">
          <DocumentDuplicateIcon className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">{deck.slides.length} slides</span>
      </div>
      <div className="flex-grow my-4">
        <h3 className="font-bold text-lg text-amo-dark group-hover:text-amo-orange transition-colors">{deck.name}</h3>
        <p className="text-sm text-gray-500 mt-1">Last edited: {new Date(deck.lastEdited).toLocaleDateString()}</p>
      </div>
      <div className="text-sm font-semibold text-amo-orange flex items-center gap-1">
        Edit Deck <ArrowRightIcon className="w-4 h-4" />
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ onStart: () => void; }> = ({ onStart }) => (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
        <DocumentDuplicateIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-gray-800">No pitch decks yet</h3>
        <p className="text-gray-500 mt-1 mb-4">Start by creating your first AI-powered presentation.</p>
        <button
            onClick={onStart}
            className="bg-amo-orange text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2 mx-auto"
        >
            <SparklesIcon className="w-5 h-5" /> Create New Deck
        </button>
    </div>
);

const tourSteps = [
    { title: 'Welcome to AMO AI!', content: 'This is your dashboard where you can manage all your pitch decks.' },
    { title: 'Create Your First Deck', content: 'Click here to start the guided wizard. The AI will help you craft the perfect pitch.' },
    { title: 'Manage Your Decks', content: 'Your created decks will appear here. You can edit, present, and share them anytime.' },
];

const Dashboard: React.FC<DashboardProps> = ({ decks, setCurrentScreen, onSelectDeck }) => {
  const [isTourOpen, setIsTourOpen] = useState(decks.length === 0);

  const handleStartDeck = () => {
    setCurrentScreen(Screen.Welcome);
  };
  
  return (
    <div>
        <OnboardingTour steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-amo-dark">My Pitch Decks</h1>
                <p className="text-gray-600 mt-1">Manage, edit, and present your startup stories.</p>
            </div>
            <button 
                onClick={handleStartDeck}
                className="bg-amo-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition-colors flex items-center gap-2 mt-4 md:mt-0"
            >
                <SparklesIcon className="w-5 h-5" /> New Deck
            </button>
        </div>
        
        {decks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {decks.map(deck => (
                    <DeckCard key={deck.id} deck={deck} onSelect={() => onSelectDeck(deck.id)} />
                ))}
            </div>
        ) : (
            <EmptyState onStart={handleStartDeck} />
        )}
    </div>
  );
};

export default Dashboard;