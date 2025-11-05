import React, { useState, useEffect } from 'react';
import { Deck, Slide } from '../types';
import { SparklesIcon, EyeIcon, UserCircleIcon, LoaderIcon, SaveIcon, PlusIcon, CheckCircleIcon, XMarkIcon, PaperAirplaneIcon, PaletteIcon } from '../components/Icons';
import { templateStyles } from '../styles/templates';
import { generateSlideImage, generateSlideSuggestions, invokeEditorAgent, generateVisualTheme } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { deckService } from '../services/deckService';

interface DeckEditorProps {
    deck: Deck;
    setDeck: (deck: Deck | null) => void;
}

const Toast: React.FC<{ message: string; show: boolean; }> = ({ message, show }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-amo-dark text-white py-3 px-6 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-up z-50">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <span className="font-semibold">{message}</span>
        </div>
    );
};

const SuggestionBox: React.FC<{
    suggestion: string;
    onAccept: () => void;
    onReject: () => void;
}> = ({ suggestion, onAccept, onReject }) => {
    return (
        <div className="my-4 p-4 bg-orange-50 border-l-4 border-amo-orange rounded-r-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-amo-dark flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-amo-orange" />
                        AI Suggestion
                    </h4>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{suggestion}</p>
                </div>
                <button onClick={onReject} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4 flex justify-end gap-3">
                <button onClick={onReject} className="text-sm font-semibold text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200">Reject</button>
                <button onClick={onAccept} className="text-sm font-semibold text-white bg-green-600 px-3 py-1 rounded-md hover:bg-green-700">Accept</button>
            </div>
        </div>
    );
};

const AICopilot: React.FC<{
    deckId: string;
    onCommandSuccess: () => void;
}> = ({ deckId, onCommandSuccess }) => {
    const [command, setCommand] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await invokeEditorAgent(deckId, command);
            onCommandSuccess();
            setCommand('');
        } catch (err) {
            console.error(err);
            setError("Sorry, I couldn't complete that command. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-amo-dark mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-amo-orange" />
                AI Copilot
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                Edit your deck with natural language. Try: "Add a new slide about our team" or "Change the title of this slide to 'Our Vision'".
            </p>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Tell me what to do..."
                        disabled={isLoading}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amo-orange"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !command.trim()}
                        aria-label={isLoading ? "Processing command" : "Submit command"}
                        className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-amo-dark hover:bg-black text-white disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};


const DeckEditor: React.FC<DeckEditorProps> = ({ deck, setDeck }) => {
    const [localDeck, setLocalDeck] = useState<Deck>(deck);
    const [activeSlide, setActiveSlide] = useState(0);
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [suggestions, setSuggestions] = useState<Record<number, { title?: string; content?: string }>>({});
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
    const navigate = useNavigate();

    // Sync local state if the incoming deck prop changes
    useEffect(() => {
        setLocalDeck(deck);
    }, [deck]);
    
    // Generate all suggestions on deck load
    useEffect(() => {
        const generateAllSuggestions = async () => {
            if (!localDeck || !localDeck.slides) return;
            setIsLoadingSuggestions(true);
            const allSuggestions: Record<number, { title?: string; content?: string }> = {};

            const suggestionPromises = localDeck.slides.map(async (slide, index) => {
                const suggestion = await generateSlideSuggestions(slide);
                if (suggestion) {
                    const slideSuggestions: { title?: string; content?: string } = {};
                    const originalContentStr = slide.content.join('\n');
                    
                    if (suggestion.suggested_title && suggestion.suggested_title.trim().toLowerCase() !== slide.title.trim().toLowerCase()) {
                        slideSuggestions.title = suggestion.suggested_title.trim();
                    }
                    if (suggestion.suggested_content && suggestion.suggested_content.trim().toLowerCase() !== originalContentStr.trim().toLowerCase()) {
                        slideSuggestions.content = suggestion.suggested_content.trim();
                    }
                    
                    if (Object.keys(slideSuggestions).length > 0) {
                        allSuggestions[index] = slideSuggestions;
                    }
                }
            });

            await Promise.all(suggestionPromises);
            setSuggestions(allSuggestions);
            setIsLoadingSuggestions(false);
        };

        generateAllSuggestions();
    }, [localDeck.id]); // Re-run if a different deck is loaded

    const handleSave = async () => {
        await setDeck({ ...localDeck, lastEdited: Date.now() });
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    }

    if (!localDeck) {
        return <div className="p-8">Error: No deck loaded.</div>;
    }
    
    const style = templateStyles[localDeck.template || 'startup'];

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateSlide(activeSlide, { title: e.target.value });
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value.split('\n');
        updateSlide(activeSlide, { content: newContent });
    };

    const handleThemeDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalDeck(prev => ({ ...prev, visualThemeDescription: e.target.value }));
    };

    const updateSlide = (index: number, newSlideData: Partial<Slide>) => {
        const newSlides = [...localDeck.slides];
        newSlides[index] = { ...newSlides[index], ...newSlideData, imageLoading: newSlideData.image === undefined ? newSlides[index].imageLoading : false };
        setLocalDeck({ ...localDeck, slides: newSlides });
    };
    
    const handleAcceptSuggestion = (field: 'title' | 'content') => {
        const suggestionText = suggestions[activeSlide]?.[field];
        if (!suggestionText) return;

        if (field === 'title') {
            updateSlide(activeSlide, { title: suggestionText });
        } else {
            updateSlide(activeSlide, { content: suggestionText.split('\n') });
        }

        // Remove the suggestion after accepting
        setSuggestions(prev => {
            const newSlideSuggestions = { ...prev[activeSlide] };
            delete newSlideSuggestions[field];
            return { ...prev, [activeSlide]: newSlideSuggestions };
        });
    };

    const handleRejectSuggestion = (field: 'title' | 'content') => {
        // Remove the suggestion after rejecting
        setSuggestions(prev => {
            const newSlideSuggestions = { ...prev[activeSlide] };
            delete newSlideSuggestions[field];
            return { ...prev, [activeSlide]: newSlideSuggestions };
        });
    };
    
    const handleGenerateImage = async () => {
        const slide = localDeck.slides[activeSlide];
        updateSlide(activeSlide, { imageLoading: true });
        try {
            const imageUrl = await generateSlideImage(slide.title, slide.content, localDeck.visualThemeBrief);
            updateSlide(activeSlide, { image: imageUrl, imageLoading: false });
        } catch (error) {
            console.error("Error generating image:", error);
            updateSlide(activeSlide, { imageLoading: false }); // Reset loading state on error
        }
    };

    const handleGenerateThemeAndVisuals = async () => {
        if (!localDeck.visualThemeDescription) return;
        setIsGeneratingTheme(true);

        const loadingSlides = localDeck.slides.map(s => ({ ...s, imageLoading: true }));
        setLocalDeck(prev => ({ ...prev, slides: loadingSlides }));

        try {
            const brief = await generateVisualTheme(localDeck.visualThemeDescription);
            setLocalDeck(prev => ({ ...prev, visualThemeBrief: brief }));

            const imagePromises = localDeck.slides.map((slide, index) => 
                generateSlideImage(slide.title, slide.content, brief)
                    .then(imageUrl => ({ index, imageUrl }))
                    .catch(error => ({ index, error })) 
            );

            const results = await Promise.all(imagePromises);

            setLocalDeck(prev => {
                const newSlides = [...prev.slides];
                results.forEach(result => {
                    if ('imageUrl' in result) {
                        newSlides[result.index].image = result.imageUrl;
                    } else {
                        console.error(`Failed to generate image for slide ${result.index}:`, result.error);
                    }
                    newSlides[result.index].imageLoading = false;
                });
                return { ...prev, slides: newSlides };
            });

        } catch (error) {
            console.error("Error generating theme and visuals:", error);
            const resetSlides = localDeck.slides.map(s => ({ ...s, imageLoading: false }));
            setLocalDeck(prev => ({ ...prev, slides: resetSlides }));
        } finally {
            setIsGeneratingTheme(false);
        }
    };

    const handleAddSlide = () => {
        const newSlide: Slide = {
            title: 'New Slide',
            content: ['Add your content here.'],
        };
        const newSlides = [...localDeck.slides, newSlide];
        setLocalDeck({ ...localDeck, slides: newSlides });
        setActiveSlide(newSlides.length - 1);
    };

    const refreshDeck = async () => {
        const refreshedDeck = await deckService.getDeckById(deck.id);
        if (refreshedDeck) {
            setLocalDeck(refreshedDeck);
            // Ensure active slide is not out of bounds after a delete
            if (activeSlide >= refreshedDeck.slides.length) {
                setActiveSlide(Math.max(0, refreshedDeck.slides.length - 1));
            }
        }
    };

    const currentSlide = localDeck.slides[activeSlide];
    const currentSuggestions = suggestions[activeSlide] || {};

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
            <Toast message="Deck saved successfully!" show={showSaveToast} />
            {/* Sidebar for slide thumbnails */}
            <aside className="w-full lg:w-64 bg-white p-4 flex flex-col overflow-y-auto border-b lg:border-r lg:border-b-0 border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-amo-dark">{localDeck.name}</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-amo-orange">Exit</button>
                </div>
                <div className="space-y-2 flex-grow">
                    {localDeck.slides.map((slide, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`relative p-2 rounded-lg cursor-pointer border-2 ${activeSlide === index ? style.accentBorder : 'border-transparent'} ${style.accentBgLight}`}
                        >
                            <p className={`text-sm font-semibold ${style.header}`}>{index + 1}. {slide.title}</p>
                             {suggestions[index] && (Object.keys(suggestions[index]).length > 0) && (
                                <div title="AI suggestions available" className="absolute top-2 right-2">
                                    <SparklesIcon className="w-4 h-4 text-amo-orange" />
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <button onClick={handleAddSlide} className="w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                        <PlusIcon className="w-4 h-4" /> Add Slide
                    </button>
                </div>
            </aside>

            {/* Main slide editor */}
            <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4 mb-4">
                    <button 
                        onClick={() => alert('Share functionality is coming soon!')}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base">
                        <UserCircleIcon className="w-5 h-5"/> Share
                    </button>
                    <button 
                        onClick={() => navigate(`/dashboard/decks/${localDeck.id}/present`)}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base">
                        <EyeIcon className="w-5 h-5"/> Present
                    </button>
                     <button 
                        onClick={handleSave}
                        className="bg-amo-orange text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2 text-sm sm:text-base">
                        <SaveIcon className="w-5 h-5"/> Save to AI Studio
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Slide preview */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8 flex flex-col justify-center items-center">
                         <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 mb-4">
                            {currentSlide.imageLoading ? (
                                <LoaderIcon className="w-8 h-8 text-amo-orange animate-spin" />
                            ) : currentSlide.image ? (
                                <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <div className="aspect-video w-full bg-gray-50 rounded-lg flex flex-col justify-center p-4 sm:p-8">
                                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-6 ${style.header}`}>{currentSlide.title}</h1>
                                    <ul className="space-y-3">
                                        {currentSlide.content.map((point, i) => (
                                            <li key={i} className={`flex items-start gap-3 text-base sm:text-lg ${style.body}`}>
                                                <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${style.bullet}`}></span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button onClick={handleGenerateImage} disabled={currentSlide.imageLoading || isGeneratingTheme} className="w-full bg-amo-dark text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700">
                            {currentSlide.imageLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                            {currentSlide.imageLoading ? 'Generating...' : currentSlide.image ? 'Regenerate Image' : 'Generate Image with AI'}
                        </button>
                    </div>
                    
                    {/* Editing controls */}
                    <div className="flex flex-col gap-8">
                         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-amo-dark mb-4 flex items-center gap-2">
                                Edit Content
                                {isLoadingSuggestions && (
                                    <span className="text-sm font-normal text-gray-500 flex items-center gap-1">
                                        <LoaderIcon className="w-4 h-4 animate-spin" />
                                        Generating suggestions...
                                    </span>
                                )}
                            </h3>
                            
                            <div className="relative mb-4">
                                <label htmlFor="slide-title" className="block text-sm font-medium text-gray-700 mb-1">Slide Title</label>
                                <input
                                    id="slide-title"
                                    type="text"
                                    value={currentSlide.title}
                                    onChange={handleTitleChange}
                                    className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange focus:border-transparent transition"
                                />
                            </div>
                            
                            {currentSuggestions.title && (
                                <SuggestionBox suggestion={currentSuggestions.title} onAccept={() => handleAcceptSuggestion('title')} onReject={() => handleRejectSuggestion('title')} />
                            )}

                            <div className="relative">
                                <label htmlFor="slide-content" className="block text-sm font-medium text-gray-700 mb-1">Slide Content</label>
                                <textarea
                                    id="slide-content"
                                    value={currentSlide.content.join('\n')}
                                    onChange={handleContentChange}
                                    className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange focus:border-transparent transition"
                                    placeholder="Enter each bullet point on a new line."
                                />
                            </div>
                            
                            {currentSuggestions.content && (
                                <SuggestionBox suggestion={currentSuggestions.content} onAccept={() => handleAcceptSuggestion('content')} onReject={() => handleRejectSuggestion('content')} />
                            )}
                        </div>

                         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-amo-dark mb-4 flex items-center gap-2">
                                <PaletteIcon className="w-6 h-6 text-amo-orange" />
                                Visual Theme
                            </h3>
                            <label htmlFor="theme-description" className="block text-sm font-medium text-gray-700 mb-1">Describe the visual style for your deck</label>
                            <textarea
                                id="theme-description"
                                value={localDeck.visualThemeDescription || ''}
                                onChange={handleThemeDescriptionChange}
                                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange focus:border-transparent transition"
                                placeholder="e.g., A clean, minimalist style for a healthcare startup, using a light blue accent color."
                            />
                             <button onClick={handleGenerateThemeAndVisuals} disabled={isGeneratingTheme || !localDeck.visualThemeDescription} className="mt-4 w-full bg-amo-dark text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700">
                                {isGeneratingTheme ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                {isGeneratingTheme ? 'Generating Theme & Visuals...' : 'Generate Theme & All Visuals'}
                            </button>
                        </div>

                        <AICopilot deckId={localDeck.id} onCommandSuccess={refreshDeck} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeckEditor;