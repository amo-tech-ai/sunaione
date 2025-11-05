import React from 'react';

export const AmoAILogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-3 font-poppins font-bold text-2xl ${className}`}>
        <div className="bg-current p-1.5 rounded-md flex items-center justify-center w-9 h-9">
            <svg viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white" style={{ color: 'var(--logo-bg-color, white)' }}>
                <path d="M8 1L0 13H2.5L4.5 8H11.5L13.5 13H16L8 1ZM5.5 6.5L8 2.5L10.5 6.5H5.5Z" fill="currentColor"/>
            </svg>
        </div>
        <span>AMO AI</span>
    </div>
);

// A specific version for the dark footer
export const FooterLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-3 font-poppins font-bold text-xl text-white ${className}`}>
        <div className="bg-white p-1.5 rounded-md flex items-center justify-center w-8 h-8">
            <svg viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-amo-teal-dark">
                <path d="M8 1L0 13H2.5L4.5 8H11.5L13.5 13H16L8 1ZM5.5 6.5L8 2.5L10.5 6.5H5.5Z" fill="currentColor"/>
            </svg>
        </div>
        <span>AMO AI</span>
    </div>
);
