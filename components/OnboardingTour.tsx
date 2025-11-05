
import React, { useState } from 'react';
import { XMarkIcon, ArrowRightIcon } from './Icons';

interface TourStep {
  title: string;
  content: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen || !steps[currentStep]) return null;

  const { title, content } = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0); // Reset for next time
    }
  };
  
  const handleSkip = () => {
      onClose();
      setCurrentStep(0); // Reset for next time
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <button onClick={handleSkip} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-amo-dark mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{content}</p>
        
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">{currentStep + 1} / {steps.length}</span>
            <div className="flex gap-2">
                <button onClick={handleSkip} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                    Skip
                </button>
                <button onClick={handleNext} className="bg-amo-orange text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2">
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep < steps.length - 1 && <ArrowRightIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;