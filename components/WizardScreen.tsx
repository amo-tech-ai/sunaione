
import React from 'react';
import ProgressBar from './ProgressBar';
import { ArrowRightIcon, ChevronLeftIcon } from './Icons';

interface WizardScreenProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canGoNext?: boolean;
  isLastStep?: boolean;
}

const WizardScreen: React.FC<WizardScreenProps> = ({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext = true,
  isLastStep = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 bg-sunai-beige">
      <div className="w-full max-w-3xl mx-auto">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-sunai-dark mb-2">{title}</h1>
          <p className="text-gray-600 mb-8">{subtitle}</p>
          
          <div className="space-y-6">
            {children}
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={onBack}
              disabled={currentStep === 1}
              className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" /> Back
            </button>
            <button
              onClick={onNext}
              disabled={!canGoNext}
              className="bg-sunai-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLastStep ? 'Generate Deck' : 'Continue'} <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardScreen;