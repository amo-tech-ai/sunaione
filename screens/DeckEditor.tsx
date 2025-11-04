
import React, { useState } from 'react';
import { Deck, Screen, Slide, TemplateID } from '../types';
import { SparklesIcon, EyeIcon, UserCircleIcon, LoaderIcon } from '../components/Icons';
import { templateStyles } from '../styles/templates';
import { rewriteSlideContent, generateSlideImage } from '../services/geminiService';

interface DeckEditorProps {
    deck: Deck;
    setDeck: React.Dispatch<React.SetStateAction<Deck | null>>;
    setCurrentScreen: (screen: Screen) => void;
}

const DeckEditor: React.FC<DeckEditorProps> = ({ deck, setDeck, setCurrentScreen }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [editingContent, setEditingContent] = useState<string | null>(null);
    const [isRewriting, setIsRewriting] = useState(false);

    if (!deck) {
        return <div className="p-8">Error: No deck loaded.</div>;
    }
    
    const style = templateStyles[deck.template || 'startup'];

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value.split('\n');
        updateSlide(activeSlide, { content: newContent });
    };

    const updateSlide = (index: number, newSlideData: Partial<Slide>) => {
        const newSlides = [...deck.slides];
        newSlides[index] = { ...newSlides[index], ...newSlideData, imageLoading: newSlideData.image === undefined ? newSlides[index].imageLoading : false };
        setDeck({ ...deck, slides: newSlides, lastEdited: Date.now() });
    };
    
    const handleRewrite = async () => {
        setIsRewriting(true);
        const originalContent = deck.slides[activeSlide].content.join('\n');
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
        const slide = deck.slides[activeSlide];
        updateSlide(activeSlide, { imageLoading: true });
        try {
            const imageUrl = await generateSlideImage(slide.title, slide.content);
            updateSlide(activeSlide, { image: imageUrl, imageLoading: false });
        } catch (error) {
            console.error("Error generating image:", error);
            updateSlide(activeSlide, { imageLoading: false }); // Reset loading state on error
        }
    };


    const currentSlide = deck.slides[activeSlide];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar for slide thumbnails */}
            <aside className="w-64 bg-white p-4 overflow-y-auto border-r border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-sunai-dark">{deck.name}</h2>
                    <button onClick={() => setCurrentScreen(Screen.Dashboard)} className="text-sm text-gray-500 hover:text-sunai-orange">Exit</button>
                </div>
                <div className="space-y-2">
                    {deck.slides.map((slide, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`p-2 rounded-lg cursor-pointer border-2 ${activeSlide === index ? style.accentBorder : 'border-transparent'} ${style.accentBgLight}`}
                        >
                            <p className={`text-sm font-semibold ${style.header}`}>{index + 1}. {slide.title}</p>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main slide editor */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-end gap-4 mb-4">
                    <button 
                        onClick={() => alert('Share functionality is coming soon!')}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <UserCircleIcon className="w-5 h-5"/> Share
                    </button>
                    <button 
                        onClick={() => setCurrentScreen(Screen.Presentation)}
                        className="bg-sunai-dark text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-black transition-all flex items-center gap-2">
                        <EyeIcon className="w-5 h-5"/> Present
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
                            <h3 className="text-xl font-bold text-sunai-dark mb-4">Edit Content</h3>
                            <textarea
                                value={currentSlide.content.join('\n')}
                                onChange={handleContentChange}
                                className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition"
                            />
                            <button onClick={handleRewrite} disabled={isRewriting} className="mt-4 w-full bg-sunai-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400">
                                {isRewriting ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                {isRewriting ? 'Rewriting...' : 'Rewrite with AI'}
                            </button>
                        </div>

                         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-sunai-dark mb-4">Visuals</h3>
                            <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                                {currentSlide.imageLoading ? (
                                    <LoaderIcon className="w-8 h-8 text-sunai-orange animate-spin" />
                                ) : currentSlide.image ? (
                                    <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                    <p className="text-gray-500">No image generated.</p>
                                )}
                            </div>
                             <button onClick={handleGenerateImage} disabled={currentSlide.imageLoading} className="mt-4 w-full bg-sunai-dark text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-700">
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