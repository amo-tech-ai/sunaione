import React from 'react';
import { ResearchResult } from '../types';
import { GlobeAltIcon, XMarkIcon } from './Icons';

export const ResearchResultPanel: React.FC<{ result: ResearchResult, onClose: () => void }> = ({ result, onClose }) => (
    <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-amo-dark flex items-center gap-2">
                <GlobeAltIcon className="w-6 h-6 text-amo-orange" />
                Research Result
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{result.answer}</p>
        {result.sources && result.sources.length > 0 && (
            <div>
                <h4 className="text-sm font-bold text-gray-600 mb-2">Sources:</h4>
                <ul className="space-y-1">
                    {result.sources.map((source, index) => source.web && (
                        <li key={index}>
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                {source.web.title || source.web.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);