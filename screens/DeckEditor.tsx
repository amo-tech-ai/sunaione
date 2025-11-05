import React, { useState, useEffect } from 'react';
import { Deck, Slide } from '../types';
import { SparklesIcon, EyeIcon, UserCircleIcon, LoaderIcon, SaveIcon, PlusIcon, CheckCircleIcon } from '../components/Icons';
import { templateStyles } from '../styles/templates';
import { rewriteSlideContent, generateSlideImage } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface DeckEditorProps {
    deck: Deck;
    setDeck: (deck: Deck | null) => void;
}

const Toast: React.FC<{ message: string; show: boolean; }> = ({ message, show }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-8 right-8 bg-amo-dark text-white py-3 px-6 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-up">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <span className="font-semibold">{message}</span>
        </div>
    );
};


const DeckEditor: React.FC<DeckEditorProps> = ({ deck, setDeck }) => {
    const [localDeck, setLocalDeck] = useState<Deck>(deck);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isRewriting, setIsRewriting] = useState(false);
    const [showSaveToast, setShowSaveToast] = useState(false);
    const navigate = useNavigate();

    // Sync local state if the incoming deck prop changes
    useEffect(() => {
        setLocalDeck(deck);
    }, [deck]);

    const handleSave = () => {
        setDeck({ ...localDeck, lastEdited: Date.now() });
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    }

    if (!localDeck) {
        return <div className="p-8">Error: No deck loaded.</div>;
    }
    
    const style = templateStyles[localDeck.template || 'startup'];

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value.split('\n');
        updateSlide(activeSlide, { content: newContent });
    };

    const updateSlide = (index: number, newSlideData: Partial<Slide>) => {
        const newSlides = [...localDeck.slides];
        newSlides[index] = { ...newSlides[index], ...newSlideData, imageLoading: newSlideData.image === undefined ? newSlides[index].imageLoading : false };
        setLocalDeck({ ...localDeck, slides: newSlides });
    };
    
    const handleRewrite = async () => {
        setIsRewriting(true);
        const originalContent = localDeck.slides[activeSlide].content.join('\n');
        try {
            const rewritten = await rewriteSlideContent(originalContent);
            updateSlide(activeSlide, { content: rewritten.split('\n') });
        } catch (error) {
            console.error("Error rewriting content:", error);
        } finally {
            setIsRewriting(false);
        }
    };
    
    const handleGenerateImage = async () => {
        const slide = localDeck.slides[activeSlide];
        updateSlide(activeSlide, { imageLoading: true });
        try {
            const imageUrl = await generateSlideImage(slide.title, slide.content);
            updateSlide(activeSlide, { image: imageUrl, imageLoading: false });
        } catch (error) {
            console.error("Error generating image:", error);
            updateSlide(activeSlide, { imageLoading: false }); // Reset loading state on error
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


    const currentSlide = localDeck.slides[activeSlide];

    return (
        <div className="flex h-screen bg-gray-100">
            <Toast message="Deck saved successfully!" show={showSaveToast} />
            {/* Sidebar for slide thumbnails */}
            <aside className="w-64 bg-white p-4 flex flex-col overflow-y-auto border-r border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-amo-dark">{localDeck.name}</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-amo-orange">Exit</button>
                </div>
                <div className="space-y-2 flex-grow">
                    {localDeck.slides.map((slide, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`p-2 rounded-lg cursor-pointer border-2 ${activeSlide === index ? style.accentBorder : 'border-transparent'} ${style.accentBgLight}`}
                        >
                            <p className={`text-sm font-semibold ${style.header}`}>{index + 1}. {slide.title}</p>
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
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-end items-center gap-4 mb-4">
                    <button 
                        onClick={() => alert('Share functionality is coming soon!')}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <UserCircleIcon className="w-5 h-5"/> Share
                    </button>
                    <button 
                        onClick={() => navigate(`/dashboard/decks/${localDeck.id}/present`)}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <EyeIcon className="w-5 h-5"/> Present
                    </button>
                     <button 
                        onClick={handleSave}
                        className="bg-amo-orange text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2">
                        <SaveIcon className="w-5 h-5"/> Save to AI Studio
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-8 h-full">
                    {/* Slide preview */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex flex-col justify-center items-center">
                        <div className="aspect-video w-full bg-gray-50 rounded-lg flex flex-col justify-center p-8">
                            <h1 className={`text-4xl font-bold mb-6 ${style.header}`}>{currentSlide.title}</h1>
                            <ul className="space-y-3">
                                {currentSlide.content.map((point, i) => (
                                    <li key={i} className={`flex items-start gap-3 text-lg ${style.body}`}>
                                        <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${style.bullet}`}></span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    {/* Editing controls */}
                    <div className="flex flex-col gap-8">
                         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-amo-dark mb-4">Edit Content</h3>
                            <textarea
                                value={currentSlide.content.join('\n')}
                                onChange={handleContentChange}
                                className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amo-orange focus:border-transparent transition"
                            />
                            <button onClick={handleRewrite} disabled={isRewriting} className="mt-4 w-full bg-amo-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400">
                                {isRewriting ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                {isRewriting ? 'Rewriting...' : 'Rewrite with AI'}
                            </button>
                        </div>

                         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-amo-dark mb-4">Visuals</h3>
                            <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                {currentSlide.imageLoading ? (
                                    <LoaderIcon className="w-8 h-8 text-amo-orange animate-spin" />
                                ) : currentSlide.image ? (
                                    <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                    <p className="text-gray-500">No image generated.</p>
                                )}
                            </div>
                             <button onClick={handleGenerateImage} disabled={currentSlide.imageLoading} className="mt-4 w-full bg-amo-dark text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700">
                                {currentSlide.imageLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                {currentSlide.imageLoading ? 'Generating...' : currentSlide.image ? 'Regenerate Image' : 'Generate Image with AI'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeckEditor;
