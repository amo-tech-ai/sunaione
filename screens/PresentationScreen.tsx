import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { templateStyles } from '../styles/templates';
import { NavigateFunction } from 'react-router-dom';

interface PresentationScreenProps {
  deck: Deck;
  navigate: NavigateFunction;
}

const PresentationScreen: React.FC<PresentationScreenProps> = ({ deck, navigate }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        navigate(`/deck/${deck.id}/edit`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deck.slides.length, deck.id, navigate]);

  const currentSlide = deck.slides[currentSlideIndex];
  const style = templateStyles[deck.template || 'startup'];

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-1 flex justify-center items-center p-8 md:p-16">
        <div className="aspect-video w-full max-w-6xl bg-white shadow-2xl rounded-lg flex items-center justify-center p-8">
            <div className="w-full h-full flex flex-col justify-center">
                 <h1 className={`text-5xl font-bold mb-8 ${style.header}`}>{currentSlide.title}</h1>
                 <ul className="space-y-4">
                     {currentSlide.content.map((point, i) => (
                         <li key={i} className={`flex items-start gap-4 text-2xl ${style.body}`}>
                             <span className={`mt-2 flex-shrink-0 w-3 h-3 rounded-full ${style.bullet}`}></span>
                             <span>{point}</span>
                         </li>
                     ))}
                 </ul>
            </div>
        </div>
      </div>
      <div className="p-4 bg-gray-100 flex justify-between items-center text-sm">
        <div className="font-bold">{deck.name}</div>
        <div>{currentSlideIndex + 1} / {deck.slides.length}</div>
        <button onClick={() => navigate(`/deck/${deck.id}/edit`)} className="font-semibold hover:text-amo-orange">Exit Presentation</button>
      </div>
    </div>
  );
};

export default PresentationScreen;