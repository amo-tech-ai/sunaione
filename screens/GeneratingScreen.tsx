
import React from 'react';
import { LoaderIcon } from '../components/Icons';

const GeneratingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sunai-beige">
      <LoaderIcon className="w-16 h-16 text-sunai-orange animate-spin mb-6" />
      <h1 className="text-3xl font-bold text-sunai-dark mb-2">Generating Your Deck...</h1>
      <p className="text-lg text-gray-600">The AI is crafting your story. This might take a moment.</p>
    </div>
  );
};

export default GeneratingScreen;