import React from 'react';
import { AnalysisResult, Insight, InsightCategory } from '../types';
import { LoaderIcon, AcademicCapIcon, SparklesIcon, ClipboardDocumentListIcon, CheckCircleIcon, XMarkIcon, LightBulbIcon } from './Icons';

const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-32 h-32 mx-auto my-2">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200" stroke="currentColor" strokeWidth="10" fill="transparent" r="45" cx="50" cy="50" />
                <circle className={color} stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="transparent" r="45" cx="50" cy="50" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} transform="rotate(-90 50 50)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${color}`}>{score}</span>
            </div>
        </div>
    );
};

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
    const categoryStyles: Record<InsightCategory, { icon: React.ReactNode, color: string }> = {
        'Strength': { icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />, color: 'border-green-500' },
        'Weakness': { icon: <XMarkIcon className="w-5 h-5 text-red-600" />, color: 'border-red-500' },
        'Suggestion': { icon: <LightBulbIcon className="w-5 h-5 text-blue-600" />, color: 'border-blue-500' },
    };
    const style = categoryStyles[insight.category];

    return (
        <div className={`p-4 bg-white border-l-4 ${style.color} rounded-r-lg border border-gray-200`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                <div>
                    <p className="font-semibold text-gray-800">{insight.feedback}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Related to Slide {insight.slide_number}: "{insight.slide_title}"
                    </p>
                </div>
            </div>
        </div>
    );
};

const AnalysisResultsDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div>
        <h3 className="text-xl font-bold text-amo-dark mb-4">Strategic Analysis Complete</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm font-bold text-gray-600">Pitch Readiness Score</p>
                <ScoreDisplay score={result.pitch_readiness_score} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
                 <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><ClipboardDocumentListIcon className="w-5 h-5 text-amo-orange" /> Executive Summary</h4>
                 <p className="text-sm text-gray-600">{result.executive_summary}</p>
            </div>
        </div>
        <h4 className="font-bold text-gray-800 mb-2">Key Insights & Recommendations</h4>
        <div className="space-y-3">
            {result.key_insights.map((insight, index) => <InsightCard key={index} insight={insight} />)}
        </div>
    </div>
);


export const AnalysisPanel: React.FC<{ result: AnalysisResult | null, isLoading: boolean, error: string | null, onAnalyze: () => void }> = ({ result, isLoading, error, onAnalyze }) => {
    if (isLoading) {
        return (
            <div className="text-center p-8">
                <LoaderIcon className="w-12 h-12 text-amo-orange animate-spin mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-amo-dark">Analyzing Your Strategy...</h3>
                <p className="text-gray-600">The AI is performing a deep analysis of your deck. This may take up to 30 seconds.</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;
    }

    if (result) {
        return <AnalysisResultsDisplay result={result} />;
    }

    return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-bold text-amo-dark">Get Strategic Feedback</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">Our AI agent will analyze your entire deck for narrative flow, clarity, and strategic weaknesses to give you an investor-ready edge.</p>
            <button onClick={onAnalyze} className="mt-6 bg-amo-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 mx-auto">
                <SparklesIcon className="w-5 h-5" />
                Analyze My Pitch
            </button>
        </div>
    );
};