import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AmoAILogo } from './Logo';

export const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    return (
        <header className="absolute top-0 left-0 right-0 z-10 py-4 px-4 sm:px-8 flex justify-between items-center">
            <button onClick={() => navigate('/')} aria-label="Home">
                <AmoAILogo className="text-amo-teal-dark" />
            </button>
            <button
                onClick={() => navigate('/pitch-deck')}
                className="font-semibold text-amo-dark bg-white border border-gray-300 py-2 px-5 rounded-lg hover:bg-gray-100 transition-colors"
            >
                Try it Free Now
            </button>
        </header>
    );
};