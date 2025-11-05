import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Deck } from '../types';
import { ArrowRightIcon, DocumentDuplicateIcon, SparklesIcon, SearchIcon, DotsVerticalIcon, TrashIcon, LoaderIcon } from '../components/Icons';
import OnboardingTour from '../components/OnboardingTour';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { deckService } from '../services/deckService';

interface DashboardProps {
  initialDecks: Deck[];
  isLoading: boolean;
  error: string | null;
  onSelectDeck: (deckId: string, navigate: (path: string) => void) => void;
  onDeleteDeck: (deckId: string) => Promise<void>;
  onDuplicateDeck: (deckId: string) => Promise<void>;
}

const DeckCardMenu: React.FC<{ onDuplicate: () => void; onDelete: () => void; }> = ({ onDuplicate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
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

const LoadingState: React.FC = () => (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
        <LoaderIcon className="w-12 h-12 text-amo-orange animate-spin" />
        <p className="text-gray-600 mt-4 font-semibold">Loading your decks...</p>
    </div>
);

const tourSteps = [
    { title: 'Welcome to AMO AI!', content: 'This is your dashboard where you can manage all your pitch decks.' },
    { title: 'Create Your First Deck', content: 'Click here to start the guided wizard. The AI will help you craft the perfect pitch.' },
    { title: 'Manage Your Decks', content: 'Your created decks will appear here. You can edit, present, and share them anytime.' },
];

const Dashboard: React.FC<DashboardProps> = ({ initialDecks, isLoading: isLoadingInitial, error: initialError, onSelectDeck, onDeleteDeck, onDuplicateDeck }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const navigate = useNavigate();

  const [decks, setDecks] = useState<Deck[]>(initialDecks);
  const [isLoading, setIsLoading] = useState(isLoadingInitial);
  const [error, setError] = useState(initialError);
  
  // This effect synchronizes the state if the initial props change (e.g., after a full app refresh)
  useEffect(() => {
    setDecks(initialDecks);
    setIsLoading(isLoadingInitial);
    setError(initialError);
  }, [initialDecks, isLoadingInitial, initialError]);

  useEffect(() => {
    if (!isLoading && decks.length === 0 && !searchQuery) {
        setIsTourOpen(true);
    }
  }, [isLoading, decks, searchQuery]);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Effect for server-side searching
  useEffect(() => {
      // Don't run search on initial load if initialDecks are already provided
      if (debouncedSearchQuery === '' && initialDecks.length > 0) {
          setDecks(initialDecks);
          return;
      }
      
      const searchDecks = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const results = await deckService.getDecks(debouncedSearchQuery);
              setDecks(results);
          } catch (err) {
              setError("Could not search for decks. Please try again.");
          } finally {
              setIsLoading(false);
          }
      };

      searchDecks();
  }, [debouncedSearchQuery, initialDecks]); // Rerun when debounced query changes

  const handleStartDeck = () => {
    navigate('/pitch-deck');
  };

  const handleDeleteConfirm = async () => {
      if(deckToDelete) {
          await onDeleteDeck(deckToDelete.id);
          setDecks(prev => prev.filter(d => d.id !== deckToDelete!.id)); // Optimistic update
          setDeckToDelete(null);
      }
  };
  
  const handleDuplicate = async (deckId: string) => {
      await onDuplicateDeck(deckId);
      // After duplication, we might want to refresh the list to show the new deck
      const refreshedDecks = await deckService.getDecks();
      setDecks(refreshedDecks);
  };
  
  const hasDecksInitially = initialDecks.length > 0;
  
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
            {isLoading ? (
                <LoadingState />
            ) : error ? (
                 <div className="col-span-full text-center py-16 bg-red-50 text-red-700 rounded-xl">{error}</div>
            ) : decks.length > 0 ? (
                decks.map(deck => (
                    <DeckCard 
                        key={deck.id} 
                        deck={deck} 
                        onSelect={() => onSelectDeck(deck.id, navigate)} 
                        onDuplicate={() => handleDuplicate(deck.id)}
                        onDelete={() => setDeckToDelete(deck)}
                    />
                ))
            ) : (
                <EmptyState onStart={handleStartDeck} isSearchResult={!!searchQuery || !hasDecksInitially} />
            )}
        </div>
    </div>
  );
};

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default Dashboard;