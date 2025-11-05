import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { templateStyles } from '../styles/templates';
import { useNavigate } from 'react-router-dom';

interface PresentationScreenProps {
  deck: Deck;
}

const PresentationScreen: React.FC<PresentationScreenProps> = ({ deck }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault(); // Prevent space from scrolling the page
        setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        navigate(`/dashboard/decks/${deck.id}/edit`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deck.slides.length, deck.id, navigate]);

  const currentSlide = deck.slides[currentSlideIndex];
  const style = templateStyles[deck.template || 'startup'];

  const hasImage = !!currentSlide.image;

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center items-center p-4 sm:p-8 md:p-12">
        <div className="aspect-video w-full max-w-6xl bg-white shadow-2xl rounded-lg flex items-center justify-center">
            <div className={`w-full h-full flex flex-col md:flex-row p-4 sm:p-8 ${!hasImage ? 'justify-center items-center text-center' : 'gap-8'}`}>
                {hasImage && (
                    <div className="w-full md:w-1/2 h-full bg-gray-100 rounded-md flex items-center justify-center">
                        <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover rounded-md" />
                    </div>
                )}
                <div className={`flex flex-col justify-center ${hasImage ? 'w-full md:w-1/2' : 'w-full'}`}>
                     <h1 className={`text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-8 ${style.header}`}>{currentSlide.title}</h1>
                     <ul className="space-y-2 sm:space-y-4">
                         {currentSlide.content.map((point, i) => (
                             <li key={i} className={`flex items-start gap-4 text-base sm:text-lg md:text-xl ${style.body} ${!hasImage ? 'mx-auto max-w-2xl text-left' : ''}`}>
                                 <span className={`mt-2 flex-shrink-0 w-3 h-3 rounded-full ${style.bullet}`}></span>
                                 <span>{point}</span>
                             </li>
                         ))}
                     </ul>
                </div>
            </div>
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center text-sm">
        <div className="font-bold">{deck.name}</div>
        <div>{currentSlideIndex + 1} / {deck.slides.length}</div>
        <button onClick={() => navigate(`/dashboard/decks/${deck.id}/edit`)} className="font-semibold hover:text-amo-orange">Exit Presentation</button>
      </div>
    </div>
  );
};

export default PresentationScreen;