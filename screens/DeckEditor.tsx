import React, { useState, useEffect } from 'react';
import { Deck, Slide, AnalysisResult, ResearchResult } from '../types';
import { SparklesIcon, EyeIcon, UserCircleIcon, LoaderIcon, SaveIcon, PlusIcon, CheckCircleIcon, XMarkIcon, PaperAirplaneIcon, PaletteIcon, DocumentTextIcon, AcademicCapIcon, ClipboardDocumentListIcon, LightBulbIcon, GlobeAltIcon, DownloadIcon } from '../components/Icons';
import { templateStyles } from '../styles/templates';
import { generateSlideImage, generateSlideSuggestions, invokeEditorAgent, generateVisualTheme, analyzeDeck, invokeResearchAgent, refineSlideImage, generateWorkflowDiagram } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { deckService } from '../services/deckService';
import AICopilot from '../components/AICopilot';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { ResearchResultPanel } from '../components/ResearchResultPanel';

// Add mermaid to the window object for TypeScript
declare global {
    interface Window {
        mermaid?: any;
    }
}

interface DeckEditorProps {
    deck: Deck;
    setDeck: (deck: Deck | null) => void;
}

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

const MermaidDiagramModal: React.FC<{ isOpen: boolean; onClose: () => void; diagramCode: string; isLoading: boolean }> = ({ isOpen, onClose, diagramCode, isLoading }) => {
    const diagramContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !isLoading && diagramCode && diagramContainerRef.current && window.mermaid) {
            diagramContainerRef.current.innerHTML = ''; // Clear previous diagram
            try {
                window.mermaid.render('mermaid-graph', diagramCode, (svgCode: string) => {
                    if (diagramContainerRef.current) {
                       diagramContainerRef.current.innerHTML = svgCode;
                    }
                });
            } catch (e) {
                console.error("Mermaid rendering error:", e);
                if (diagramContainerRef.current) {
                    diagramContainerRef.current.innerText = "Error rendering diagram. Please check the code.";
                }
            }
        }
    }, [isOpen, isLoading, diagramCode]);
    
    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(diagramCode);
        // You could add a toast notification here for feedback
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amo-dark">Workflow Diagram</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[300px] flex items-center justify-center overflow-auto">
                    {isLoading ? (
                        <div className="text-center">
                            <LoaderIcon className="w-10 h-10 text-amo-orange animate-spin mx-auto" />
                            <p className="mt-2 text-gray-600 font-semibold">Generating diagram...</p>
                        </div>
                    ) : (
                        <div ref={diagramContainerRef} className="w-full"></div>
                    )}
                </div>
                <div className="mt-4 flex gap-4">
                    <button onClick={copyToClipboard} disabled={isLoading || !diagramCode} className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50">
                        <ClipboardDocumentListIcon className="w-5 h-5" /> Copy Code
                    </button>
                    <button onClick={onClose} className="flex-1 bg-amo-dark text-white font-bold py-2 px-4 rounded-lg hover:bg-black">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeckEditor: React.FC<DeckEditorProps> = ({ deck, setDeck }) => {
    const [localDeck, setLocalDeck] = useState<Deck>(deck);
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeTab, setActiveTab] = useState<EditorTab>('Edit');
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [suggestions, setSuggestions] = useState<Record<number, { title?: string; content?: string }>>({});
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefiningImage, setIsRefiningImage] = useState(false);
    const [workflowDiagram, setWorkflowDiagram] = useState('');
    const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
    const [showDiagramModal, setShowDiagramModal] = useState(false);
    const navigate = useNavigate();
    
    const currentSlide = localDeck.slides[activeSlide];
    const debouncedSlideContent = useDebounce(currentSlide, 500); // Debounce slide content for suggestions

    // Sync local state if the incoming deck prop changes
    useEffect(() => {
        setLocalDeck(deck);
    }, [deck]);
    
    // Generate suggestions for the active slide when its content changes (debounced)
    useEffect(() => {
        const generateSingleSuggestion = async () => {
            if (!debouncedSlideContent) return;
            setIsLoadingSuggestions(true);
            try {
                const suggestion = await generateSlideSuggestions(debouncedSlideContent);
                if (suggestion) {
                    const slideSuggestions: { title?: string; content?: string } = {};
                    const originalContentStr = debouncedSlideContent.content.join('\n');
                    
                    if (suggestion.suggested_title && suggestion.suggested_title.trim().toLowerCase() !== debouncedSlideContent.title.trim().toLowerCase()) {
                        slideSuggestions.title = suggestion.suggested_title.trim();
                    }
                    if (suggestion.suggested_content && suggestion.suggested_content.trim().toLowerCase() !== originalContentStr.trim().toLowerCase()) {
                        slideSuggestions.content = suggestion.suggested_content.trim();
                    }
                    
                    setSuggestions(prev => ({
                        ...prev,
                        [activeSlide]: Object.keys(slideSuggestions).length > 0 ? slideSuggestions : {}
                    }));
                }
            } catch (error) {
                console.error(`Could not generate suggestion for slide ${activeSlide}:`, error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        generateSingleSuggestion();
    }, [debouncedSlideContent, activeSlide]);


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

    const handleRefineImage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const currentImage = localDeck.slides[activeSlide].image;
        if (!refinePrompt.trim() || !currentImage) return;
    
        setIsRefiningImage(true);
        try {
            const [header, base64Data] = currentImage.split(',');
            if (!header || !base64Data) throw new Error("Invalid image data URL format.");
            
            const mimeTypeMatch = header.match(/:(.*?);/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not determine mime type from image data URL.");
            const mimeType = mimeTypeMatch[1];
            
            const newImageUrl = await refineSlideImage(base64Data, mimeType, refinePrompt);
            
            updateSlide(activeSlide, { image: newImageUrl });
            setRefinePrompt('');
            await handleSave();
            
        } catch (error) {
            console.error("Error refining image:", error);
            // Consider showing a user-facing error toast here
        } finally {
            setIsRefiningImage(false);
        }
    };

    const handleGenerateThemeAndVisuals = async () => {
        if (!localDeck.visualThemeDescription) return;

        await handleSave();
        setIsGeneratingTheme(true);
        
        const deckToProcess = { ...localDeck };
        const originalSlides = [...deckToProcess.slides]; 

        const loadingSlides = originalSlides.map(s => ({ ...s, imageLoading: true }));
        setLocalDeck(prev => ({ ...prev, slides: loadingSlides }));

        try {
            const brief = await generateVisualTheme(deckToProcess.visualThemeDescription!);

            const imagePromises = originalSlides.map((slide) => 
                generateSlideImage(slide.title, slide.content, brief)
            );

            const results = await Promise.allSettled(imagePromises);

            const finalSlides = originalSlides.map((slide, index) => {
                const result = results[index];
                const newSlideData: Partial<Slide> = { imageLoading: false };
                if (result.status === 'fulfilled') {
                    newSlideData.image = result.value;
                } else {
                    console.error(`Failed to generate image for slide ${index}:`, result.reason);
                }
                return { ...slide, ...newSlideData };
            });
            
            const finalDeck: Deck = { 
                ...deckToProcess, 
                slides: finalSlides, 
                visualThemeBrief: brief,
                lastEdited: Date.now()
            };

            await setDeck(finalDeck);

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

    const handleAnalyzeDeck = async () => {
        await handleSave();
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeDeck(localDeck.id);
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateDiagram = async () => {
        setIsGeneratingDiagram(true);
        setShowDiagramModal(true);
        try {
            const diagramCode = await generateWorkflowDiagram(localDeck.id);
            setWorkflowDiagram(diagramCode);
        } catch (error) {
            console.error("Failed to generate diagram:", error);
            setWorkflowDiagram("Error: Could not generate diagram.");
        } finally {
            setIsGeneratingDiagram(false);
        }
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

    const currentSuggestions = suggestions[activeSlide] || {};

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
            <Toast message="Deck saved successfully!" show={showSaveToast} />
            <MermaidDiagramModal 
                isOpen={showDiagramModal}
                onClose={() => setShowDiagramModal(false)}
                diagramCode={workflowDiagram}
                isLoading={isGeneratingDiagram}
            />

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
                        onClick={handleGenerateDiagram}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base">
                        <DownloadIcon className="w-5 h-5"/> Export Workflow
                    </button>
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
                         <div className="relative w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 mb-4">
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
                            {isRefiningImage && (
                                <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center text-white">
                                    <LoaderIcon className="w-8 h-8 animate-spin" />
                                    <p className="mt-2 font-semibold">Refining image...</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleGenerateImage} disabled={currentSlide.imageLoading || isGeneratingTheme || isRefiningImage} className="w-full bg-amo-dark text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700">
                            {currentSlide.imageLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                            {currentSlide.imageLoading ? 'Generating...' : currentSlide.image ? 'Regenerate Image' : 'Generate Image with AI'}
                        </button>
                        {currentSlide.image && !currentSlide.imageLoading && (
                            <div className="w-full mt-4">
                                <form onSubmit={handleRefineImage}>
                                    <label htmlFor="refine-prompt" className="block text-sm font-medium text-gray-700 mb-1">Refine with AI</label>
                                    <div className="relative flex gap-2">
                                        <input
                                            id="refine-prompt"
                                            type="text"
                                            value={refinePrompt}
                                            onChange={(e) => setRefinePrompt(e.target.value)}
                                            placeholder="e.g., make the background color dark blue"
                                            disabled={isRefiningImage}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amo-orange"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isRefiningImage || !refinePrompt.trim()}
                                            className="bg-amo-dark text-white font-bold p-3 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700"
                                        >
                                            {isRefiningImage ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <span>Refine</span>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    
                    {/* Editing controls & Analysis */}
                    <div className="flex flex-col gap-8">
                         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-1">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-200">
                                <TabButton icon={DocumentTextIcon} label="Edit" isActive={activeTab === 'Edit'} onClick={() => setActiveTab('Edit')} />
                                <TabButton icon={PaletteIcon} label="Theme" isActive={activeTab === 'Theme'} onClick={() => setActiveTab('Theme')} />
                                <TabButton icon={AcademicCapIcon} label="Analysis" isActive={activeTab === 'Analysis'} onClick={() => setActiveTab('Analysis')} />
                            </div>

                            <div className="p-6">
                                {activeTab === 'Edit' && (
                                    <>
                                        <h3 className="text-xl font-bold text-amo-dark mb-4 flex items-center gap-2">
                                            Edit Content
                                            {isLoadingSuggestions && (
                                                <span className="text-sm font-normal text-gray-500 flex items-center gap-1">
                                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                                    Checking for suggestions...
                                                </span>
                                            )}
                                        </h3>
                                        <div className="relative mb-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <label htmlFor="slide-title" className="block text-sm font-medium text-gray-700">Slide Title</label>
                                                {currentSuggestions.title && (
                                                    <div className="flex items-center gap-1 text-xs text-amo-orange font-semibold animate-fade-in" title="AI suggestion available">
                                                        <SparklesIcon className="w-4 h-4" />
                                                        Suggestion available
                                                    </div>
                                                )}
                                            </div>
                                            <input id="slide-title" type="text" value={currentSlide.title} onChange={handleTitleChange} className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange" />
                                        </div>
                                        {currentSuggestions.title && <SuggestionBox suggestion={currentSuggestions.title} onAccept={() => handleAcceptSuggestion('title')} onReject={() => handleRejectSuggestion('title')} />}
                                        <div className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <label htmlFor="slide-content" className="block text-sm font-medium text-gray-700">Slide Content</label>
                                                {currentSuggestions.content && (
                                                    <div className="flex items-center gap-1 text-xs text-amo-orange font-semibold animate-fade-in" title="AI suggestion available">
                                                        <SparklesIcon className="w-4 h-4" />
                                                        Suggestion available
                                                    </div>
                                                )}
                                            </div>
                                            <textarea id="slide-content" value={currentSlide.content.join('\n')} onChange={handleContentChange} className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange" placeholder="Enter each bullet point on a new line." />
                                        </div>
                                        {currentSuggestions.content && <SuggestionBox suggestion={currentSuggestions.content} onAccept={() => handleAcceptSuggestion('content')} onReject={() => handleRejectSuggestion('content')} />}
                                    </>
                                )}

                                {activeTab === 'Theme' && (
                                    <>
                                        <h3 className="text-xl font-bold text-amo-dark mb-4">Visual Theme</h3>
                                        <label htmlFor="theme-description" className="block text-sm font-medium text-gray-700 mb-1">Describe the visual style for your deck</label>
                                        <textarea id="theme-description" value={localDeck.visualThemeDescription || ''} onChange={handleThemeDescriptionChange} className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange" placeholder="e.g., A clean, minimalist style for a healthcare startup, using a light blue accent color." />
                                        <button onClick={handleGenerateThemeAndVisuals} disabled={isGeneratingTheme || !localDeck.visualThemeDescription} className="mt-4 w-full bg-amo-dark text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-black flex items-center justify-center gap-2 disabled:bg-gray-700">
                                            {isGeneratingTheme ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                            {isGeneratingTheme ? 'Generating Theme & Visuals...' : 'Generate Theme & All Visuals'}
                                        </button>
                                    </>
                                )}

                                {activeTab === 'Analysis' && (
                                    <AnalysisPanel result={analysisResult} isLoading={isAnalyzing} error={analysisError} onAnalyze={handleAnalyzeDeck} />
                                )}
                            </div>
                        </div>

                        {researchResult && (
                            <ResearchResultPanel 
                                result={researchResult} 
                                onClose={() => setResearchResult(null)}
                            />
                        )}

                        <AICopilot 
                            deckId={localDeck.id} 
                            onCommandSuccess={refreshDeck}
                            onBeforeCommand={handleSave}
                            onResearchComplete={(result) => setResearchResult(result)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Sub-components for DeckEditor ---

type EditorTab = 'Edit' | 'Theme' | 'Analysis';

const TabButton: React.FC<{ icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-semibold border-b-2 transition-colors ${
            isActive ? 'border-amo-orange text-amo-orange' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
        }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);

export default DeckEditor;