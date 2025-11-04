import React, { useState } from 'react';
import { Screen } from '../types';
import { 
    UserCircleIcon, ChevronLeftIcon, SparklesIcon, EyeIcon, SaveIcon,
    UploadIcon, CheckCircleIcon, ArrowRightIcon, LinkedInIcon, LoaderIcon
} from '../components/Icons';
import { refineText } from '../services/geminiService';

interface ProfileScreenProps {
    setCurrentScreen: (screen: Screen) => void;
}

// --- Local Components for Profile Screen ---

const Stepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => (
    <div className="w-full">
        <div className="flex items-center justify-between">
            {steps.map((step, index) => (
                <div key={step} className="flex flex-col items-center w-full">
                    <div className="flex items-center w-full">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${index + 1 <= currentStep ? 'bg-sunai-orange text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-grow h-1 ${index + 1 < currentStep ? 'bg-sunai-orange' : 'bg-gray-200'}`}></div>
                        )}
                    </div>
                    <p className={`mt-2 text-xs text-center ${index + 1 === currentStep ? 'text-sunai-orange font-bold' : 'text-gray-500'}`}>{step}</p>
                </div>
            ))}
        </div>
    </div>
);

const FileUploadZone: React.FC<{ title: string, recommendation: string }> = ({ title, recommendation }) => (
    <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-sunai-orange hover:bg-gray-50 transition-colors">
        <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="font-semibold text-gray-700">{title}</p>
        <p className="text-xs text-gray-500">{recommendation}</p>
    </div>
);

const CircularProgress: React.FC<{ percentage: number, size?: number, strokeWidth?: number }> = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-sunai-orange"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-sunai-dark">{percentage}%</span>
            </div>
        </div>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ setCurrentScreen }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const steps = ["Company Basics", "About Your Startup", "Traction & Metrics", "Team & Culture", "What You Need"];

    const [profileData, setProfileData] = useState({
        companyName: '',
        websiteUrl: '',
        tagline: '',
        foundedYear: '2024',
        companyDescription: '',
    });
    const [profileStrength, setProfileStrength] = useState(0);
    const [refiningField, setRefiningField] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        
        const updatedProfileData = { ...profileData, [name]: value };
        const totalFields = Object.keys(updatedProfileData).length;
        const filledFields = Object.values(updatedProfileData).filter(v => v && String(v).trim() !== '').length;
        setProfileStrength(Math.round((filledFields / totalFields) * 100));
    };

    const handleLinkedInImport = () => {
        const url = window.prompt("Please enter your company's LinkedIn profile URL:");
        if (url) {
            alert(`Thanks! LinkedIn import is coming soon. We'll use this URL to help pre-fill your profile:\n${url}`);
        }
    };
    
    const handleRefine = async (fieldName: keyof typeof profileData) => {
        const textToRefine = profileData[fieldName];
        if (!textToRefine) return;

        setRefiningField(fieldName);
        try {
            const refinedText = await refineText(textToRefine, "Company Description");
            setProfileData(prev => ({ ...prev, [fieldName]: refinedText }));
        } catch (error) {
            console.error("Failed to refine text:", error);
        } finally {
            setRefiningField(null);
        }
    };
    
    const renderRefineButton = (fieldName: keyof typeof profileData, label: string) => (
        <button
            onClick={() => handleRefine(fieldName)}
            disabled={!profileData[fieldName] || refiningField === fieldName}
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

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <>
            {/* Title and Stepper */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-sunai-dark">Create Startup Profile</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 flex items-center gap-2"><LoaderIcon className="w-4 h-4 animate-spin"/> Auto-saving...</span>
                        <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <EyeIcon className="w-5 h-5"/> Preview
                        </button>
                    </div>
                </div>
                <Stepper steps={steps} currentStep={currentStep} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form Card */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-8">
                    
                    {currentStep === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-sunai-dark">Company Basics</h2>
                            <p className="text-gray-600 mt-1 mb-6">Let's start with the essential information about your company.</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                                    <input type="text" name="companyName" id="companyName" value={profileData.companyName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="Your registered business name" />
                                </div>
                                <div>
                                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                    <input type="url" name="websiteUrl" id="websiteUrl" value={profileData.websiteUrl} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="https://yourstartup.com" />
                                    <p className="text-xs text-gray-500 mt-1">We'll auto-fetch your logo and company info.</p>
                                </div>
                                <div>
                                    <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">Company Tagline *</label>
                                    <textarea name="tagline" id="tagline" rows={2} maxLength={70} value={profileData.tagline} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition resize-none" placeholder="A memorable one-liner (e.g., 'AI-powered logistics for Latin America')"></textarea>
                                    <p className="text-xs text-gray-500 text-right">{profileData.tagline.length}/70 characters</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                                        <FileUploadZone title="Upload Logo" recommendation="PNG or JPG, max 2MB" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                        <FileUploadZone title="Upload Cover" recommendation="1200x400px recommended" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                                    <input type="number" name="foundedYear" id="foundedYear" value={profileData.foundedYear} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" placeholder="2024" />
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                             <h2 className="text-2xl font-bold text-sunai-dark">About Your Startup</h2>
                            <p className="text-gray-600 mt-1 mb-6">Provide a comprehensive overview of your company. This is your chance to tell your story.</p>
                            
                            <div className="space-y-6">
                                <div className="relative">
                                    <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">Company Description *</label>
                                    <textarea 
                                        name="companyDescription" 
                                        id="companyDescription" 
                                        rows={10} 
                                        value={profileData.companyDescription} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" 
                                        placeholder="Describe your company's mission, vision, the product/service you offer, and what makes you unique. Aim for 2-3 paragraphs."
                                    />
                                    {renderRefineButton('companyDescription', 'Refine with AI')}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                        <button onClick={prevStep} disabled={currentStep === 1} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeftIcon className="w-5 h-5"/> Previous
                        </button>
                        <div className="flex items-center gap-3">
                            <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <SaveIcon className="w-5 h-5"/> Save Draft
                            </button>
                            <button onClick={nextStep} className="bg-sunai-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2">
                                Continue <ArrowRightIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-sunai-dark">Profile Strength</h3>
                        <div className="my-4">
                           <CircularProgress percentage={profileStrength} />
                        </div>
                        <p className="text-sm text-gray-600">Keep going! Add more details to strengthen your profile.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-sunai-dark flex items-center gap-2 mb-4"><SparklesIcon className="w-5 h-5 text-sunai-orange" /> Pro Tips</h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span>Add specific metrics to stand out to investors.</span></li>
                            <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span>Upload high-quality logo and cover images.</span></li>
                            <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span>Be clear about what help you need.</span></li>
                            <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span>Complete your profile for 3x more visibility.</span></li>
                        </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                         <h3 className="text-lg font-bold text-sunai-dark mb-4">Quick Actions</h3>
                         <div className="space-y-3">
                            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-3 text-sm">
                                <SparklesIcon className="w-5 h-5 text-sunai-orange" /> Generate Pitch Deck
                            </button>
                            <button 
                                onClick={handleLinkedInImport}
                                className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-3 text-sm">
                                <LinkedInIcon className="w-5 h-5 text-blue-600" /> Import from LinkedIn
                            </button>
                            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-3 text-sm">
                                <EyeIcon className="w-5 h-5" /> Preview Public Profile
                            </button>
                         </div>
                    </div>

                </aside>
            </div>
        </>
    );
};

export default ProfileScreen;