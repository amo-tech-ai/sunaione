
import React, { useState } from 'react';
import WizardScreen from '../components/WizardScreen';
import { Screen, DeckData, TemplateID } from '../types';
import { refineText } from '../services/geminiService';
import { SparklesIcon, LoaderIcon } from '../components/Icons';

interface WizardStepsProps {
  deckData: DeckData;
  setDeckData: React.Dispatch<React.SetStateAction<DeckData>>;
  onFinish: () => void;
}

const WizardSteps: React.FC<WizardStepsProps> = ({ deckData, setDeckData, onFinish }) => {
  const [step, setStep] = useState<Screen>(Screen.Welcome);
  const [refiningField, setRefiningField] = useState<string | null>(null);

  const totalSteps = 6; // Welcome doesn't count for progress

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeckData(prev => ({ ...prev, [name]: value }));
  };

  const handleRefine = async (fieldName: keyof DeckData) => {
    const textToRefine = deckData[fieldName];
    if (!textToRefine) return;

    setRefiningField(fieldName);
    try {
      const refinedText = await refineText(textToRefine, fieldName);
      setDeckData(prev => ({ ...prev, [fieldName]: refinedText }));
    } catch (error) {
      console.error("Failed to refine text:", error);
      // Optionally show an error to the user
    } finally {
      setRefiningField(null);
    }
  };

  const nextStep = () => {
    switch (step) {
      case Screen.Welcome: setStep(Screen.Problem); break;
      case Screen.Problem: setStep(Screen.Market); break;
      case Screen.Market: setStep(Screen.Traction); break;
      case Screen.Traction: setStep(Screen.Ask); break;
      case Screen.Ask: onFinish(); break;
    }
  };

  const prevStep = () => {
    switch (step) {
      case Screen.Problem: setStep(Screen.Welcome); break;
      case Screen.Market: setStep(Screen.Problem); break;
      case Screen.Traction: setStep(Screen.Market); break;
      case Screen.Ask: setStep(Screen.Traction); break;
    }
  };

  const renderRefineButton = (fieldName: keyof DeckData, label: string) => (
    <button
      onClick={() => handleRefine(fieldName)}
      disabled={!deckData[fieldName] || refiningField === fieldName}
      className="absolute top-0 right-0 mt-1 mr-1 text-xs bg-orange-100 text-sunai-orange font-semibold py-1 px-2 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {refiningField === fieldName ? (
        <LoaderIcon className="w-4 h-4 animate-spin" />
      ) : (
        <SparklesIcon className="w-4 h-4" />
      )}
      {refiningField === fieldName ? 'Refining...' : label}
    </button>
  );

  if (step === Screen.Welcome) {
    return (
      <WizardScreen title="Let's build your pitch deck." subtitle="We'll guide you through the key sections investors want to see. It'll be quick and easy." currentStep={1} totalSteps={totalSteps} onNext={nextStep} onBack={() => {}} canGoNext={!!deckData.companyName}>
        <div className="relative">
          <label htmlFor="companyName" className="block text-lg font-medium text-gray-700 mb-2">What is your company's name?</label>
          <input type="text" name="companyName" id="companyName" value={deckData.companyName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="e.g., Innovate Inc." />
        </div>
      </WizardScreen>
    );
  }
  if (step === Screen.Problem) {
    return (
      <WizardScreen title="The Problem" subtitle="Clearly define the problem you're solving. What is the pain point for your customers?" currentStep={2} totalSteps={totalSteps} onNext={nextStep} onBack={prevStep} canGoNext={!!deckData.problem && !!deckData.solution}>
        <div className="relative">
          <label htmlFor="problem" className="block text-lg font-medium text-gray-700 mb-2">What problem are you solving?</label>
          <textarea name="problem" id="problem" rows={4} value={deckData.problem} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="Describe the current pain point, inefficiency, or gap in the market."></textarea>
          {renderRefineButton('problem', 'Refine with AI')}
        </div>
        <div className="relative mt-6">
          <label htmlFor="solution" className="block text-lg font-medium text-gray-700 mb-2">How do you solve it?</label>
          <textarea name="solution" id="solution" rows={4} value={deckData.solution} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="Briefly explain your product or service and how it addresses the problem."></textarea>
          {renderRefineButton('solution', 'Refine with AI')}
        </div>
      </WizardScreen>
    );
  }
  if (step === Screen.Market) {
    return (
      <WizardScreen title="Market & Model" subtitle="Who are your customers and how will you make money?" currentStep={3} totalSteps={totalSteps} onNext={nextStep} onBack={prevStep} canGoNext={!!deckData.targetAudience && !!deckData.businessModel}>
        <div className="relative">
          <label htmlFor="targetAudience" className="block text-lg font-medium text-gray-700 mb-2">Who is your target audience?</label>
          <textarea name="targetAudience" id="targetAudience" rows={4} value={deckData.targetAudience} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="e.g., 'Small to medium-sized e-commerce businesses struggling with logistics' or 'Millennials in urban areas looking for sustainable food options.'"></textarea>
          {renderRefineButton('targetAudience', 'Refine with AI')}
        </div>
        <div className="relative mt-6">
          <label htmlFor="businessModel" className="block text-lg font-medium text-gray-700 mb-2">What's your business model?</label>
          <textarea name="businessModel" id="businessModel" rows={4} value={deckData.businessModel} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="e.g., 'SaaS model with monthly subscriptions', 'A marketplace taking a 10% commission on each transaction.'"></textarea>
          {renderRefineButton('businessModel', 'Refine with AI')}
        </div>
      </WizardScreen>
    );
  }
  if (step === Screen.Traction) {
    return (
      <WizardScreen title="Traction & Team" subtitle="Show what you've achieved and who is behind the vision." currentStep={4} totalSteps={totalSteps} onNext={nextStep} onBack={prevStep} canGoNext={!!deckData.traction && !!deckData.teamMembers}>
        <div className="relative">
          <label htmlFor="traction" className="block text-lg font-medium text-gray-700 mb-2">What's your key traction?</label>
          <textarea name="traction" id="traction" rows={4} value={deckData.traction} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="Mention key metrics: e.g., '10,000 active users', '$50k in monthly recurring revenue', 'Signed 5 pilot customers including...'"></textarea>
          {renderRefineButton('traction', 'Refine with AI')}
        </div>
        <div className="relative mt-6">
          <label htmlFor="teamMembers" className="block text-lg font-medium text-gray-700 mb-2">Who is on your core team?</label>
          <textarea name="teamMembers" id="teamMembers" rows={4} value={deckData.teamMembers} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="List the founders and key members with their relevant experience. E.g., 'Jane Doe (CEO) - 10 years at Google. John Smith (CTO) - Lead engineer at Stripe.'"></textarea>
          {renderRefineButton('teamMembers', 'Refine with AI')}
        </div>
      </WizardScreen>
    );
  }
  if (step === Screen.Ask) {
    return (
      <WizardScreen title="The Ask" subtitle="How much are you raising and what will you use it for?" currentStep={5} totalSteps={totalSteps} onNext={nextStep} onBack={prevStep} canGoNext={!!deckData.fundingAmount && !!deckData.useOfFunds} isLastStep>
        <div className="relative">
          <label htmlFor="fundingAmount" className="block text-lg font-medium text-gray-700 mb-2">How much funding are you seeking?</label>
          <input type="text" name="fundingAmount" id="fundingAmount" value={deckData.fundingAmount} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="e.g., $500,000" />
        </div>
        <div className="relative mt-6">
          <label htmlFor="useOfFunds" className="block text-lg font-medium text-gray-700 mb-2">How will you use the funds?</label>
          <textarea name="useOfFunds" id="useOfFunds" rows={4} value={deckData.useOfFunds} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="Break it down by category. E.g., '40% for product development, 30% for marketing and sales, 20% for new hires, 10% for operational costs.'"></textarea>
          {renderRefineButton('useOfFunds', 'Refine with AI')}
        </div>
        <div className="mt-6">
            <label htmlFor="template" className="block text-lg font-medium text-gray-700 mb-2">Choose a visual style</label>
            <select name="template" id="template" value={deckData.template} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition bg-white">
                <option value="startup">Startup</option>
                <option value="corporate">Corporate</option>
                <option value="creative">Creative</option>
            </select>
        </div>
      </WizardScreen>
    );
  }

  return <div>Loading...</div>;
};

export default WizardSteps;