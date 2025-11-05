import React, { useState, useMemo, useRef } from 'react';
import { Deck } from '../types';
import { ArrowRightIcon, DocumentDuplicateIcon, SparklesIcon, SearchIcon, DotsVerticalIcon, TrashIcon } from '../components/Icons';
import OnboardingTour from '../components/OnboardingTour';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  decks: Deck[];
  onSelectDeck: (deckId: string, navigate: (path: string) => void) => void;
  onDeleteDeck: (deckId: string) => void;
  onDuplicateDeck: (deckId: string) => void;
}

const DeckCardMenu: React.FC<{ onDuplicate: () => void; onDelete: () => void; }> = ({ onDuplicate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                <DotsVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <button onClick={onDuplicate} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <DocumentDuplicateIcon className="w-4 h-4" /> Duplicate
                    </button>
                    <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <TrashIcon className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};


const DeckCard: React.FC<{ deck: Deck; onSelect: () => void; onDuplicate: () => void; onDelete: () => void; }> = ({ deck, onSelect, onDuplicate, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="bg-orange-100 text-amo-orange p-3 rounded-lg">
          <DocumentDuplicateIcon className="w-6 h-6" />
        </div>
        <div onClick={e => e.stopPropagation()}>
            <DeckCardMenu onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      </div>
      <div onClick={onSelect} className="flex-grow my-4 cursor-pointer">
        <h3 className="font-bold text-lg text-amo-dark group-hover:text-amo-orange transition-colors">{deck.name}</h3>
        <p className="text-sm text-gray-500 mt-1">Last edited: {new Date(deck.lastEdited).toLocaleDateString()}</p>
      </div>
       <button onClick={onSelect} className="text-sm font-semibold text-amo-orange flex items-center gap-1 cursor-pointer">
        Edit Deck <ArrowRightIcon className="w-4 h-4" />
       </button>
    </div>
  );
};

const EmptyState: React.FC<{ onStart: () => void; isSearchResult?: boolean; }> = ({ onStart, isSearchResult = false }) => (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200 col-span-full">
        <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-gray-800">{isSearchResult ? 'No decks found' : 'No pitch decks yet'}</h3>
        <p className="text-gray-500 mt-1 mb-4">{isSearchResult ? 'Try a different search term.' : 'Start by creating your first AI-powered presentation.'}</p>
        {!isSearchResult && (
            <button
                onClick={onStart}
                className="bg-amo-orange text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2 mx-auto"
            >
                <SparklesIcon className="w-5 h-5" /> Create New Deck
            </button>
        )}
    </div>
);

const tourSteps = [
    { title: 'Welcome to AMO AI!', content: 'This is your dashboard where you can manage all your pitch decks.' },
    { title: 'Create Your First Deck', content: 'Click here to start the guided wizard. The AI will help you craft the perfect pitch.' },
    { title: 'Manage Your Decks', content: 'Your created decks will appear here. You can edit, present, and share them anytime.' },
];

const Dashboard: React.FC<DashboardProps> = ({ decks, onSelectDeck, onDeleteDeck, onDuplicateDeck }) => {
  const [isTourOpen, setIsTourOpen] = useState(decks.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const navigate = useNavigate();

  const handleStartDeck = () => {
    navigate('/pitch-deck');
  };

  const filteredDecks = useMemo(() => 
    decks.filter(deck => 
        deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.lastEdited - a.lastEdited), 
  [decks, searchQuery]);

  const handleDeleteConfirm = () => {
      if(deckToDelete) {
          onDeleteDeck(deckToDelete.id);
          setDeckToDelete(null);
      }
  };
  
  return (
    <div>
        <OnboardingTour steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
        <Modal
            isOpen={!!deckToDelete}
            onClose={() => setDeckToDelete(null)}
            onConfirm={handleDeleteConfirm}
            title="Delete Deck"
            confirmText="Delete"
        >
            Are you sure you want to delete "{deckToDelete?.name}"? This action cannot be undone.
        </Modal>

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

        <div className="mb-6 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
                type="text"
                placeholder="Search decks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amo-orange"
            />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.length > 0 ? (
                filteredDecks.length > 0 ? (
                    filteredDecks.map(deck => (
                        <DeckCard 
                            key={deck.id} 
                            deck={deck} 
                            onSelect={() => onSelectDeck(deck.id, navigate)} 
                            onDuplicate={() => onDuplicateDeck(deck.id)}
                            onDelete={() => setDeckToDelete(deck)}
                        />
                    ))
                ) : (
                    <EmptyState onStart={handleStartDeck} isSearchResult={true} />
                )
            ) : (
                <EmptyState onStart={handleStartDeck} />
            )}
        </div>
    </div>
  );
};

export default Dashboard;
