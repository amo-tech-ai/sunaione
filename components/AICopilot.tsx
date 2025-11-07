import React, { useState } from 'react';
import { SparklesIcon, LoaderIcon, PaperAirplaneIcon } from './Icons';
import { invokeEditorAgent, invokeResearchAgent } from '../services/geminiService';
import { ResearchResult } from '../types';

const AICopilot: React.FC<{
    deckId: string;
    onCommandSuccess: () => void;
    onBeforeCommand: () => Promise<void>;
    onResearchComplete: (result: ResearchResult) => void;
}> = ({ deckId, onCommandSuccess, onBeforeCommand, onResearchComplete }) => {
    const [command, setCommand] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim() || isLoading) return;

        // Simple heuristic to differentiate research queries from edit commands
        const isResearchQuery = /^(what|who|why|how|when|where|find|search|list|tell me about)\s/i.test(command.trim());

        setIsLoading(true);
        setError(null);

        if (isResearchQuery) {
            try {
                const result = await invokeResearchAgent(command);
                onResearchComplete(result);
                setCommand('');
            } catch (err) {
                console.error(err);
                setError("Sorry, I couldn't find an answer. Please try a different question.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Existing edit command logic
            try {
                await onBeforeCommand(); 
                await invokeEditorAgent(deckId, command);
                onCommandSuccess();
                setCommand('');
            } catch (err) {
                console.error(err);
                setError("Sorry, I couldn't complete that command. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-amo-dark mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-amo-orange" />
                AI Copilot
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                Use natural language to edit your deck or research data. Try: "Add a slide about our team" or "What is the market size for AI startups?".
            </p>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Tell me what to do..."
                        disabled={isLoading}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amo-orange"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !command.trim()}
                        aria-label={isLoading ? "Processing command" : "Submit command"}
                        className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-amo-dark hover:bg-black text-white disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default AICopilot;