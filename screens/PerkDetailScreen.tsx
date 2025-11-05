
import React from 'react';
import { Screen, Perk } from '../types';
import { ChevronLeftIcon, LightBulbIcon, PuzzlePieceIcon, CogIcon, CheckCircleIcon } from '../components/Icons';

interface PerkDetailScreenProps {
    perkId: string;
    allPerks: Perk[];
    setCurrentScreen: (screen: Screen) => void;
    onViewDetails: (perkId: string) => void;
}

// Reusable card component for this page
const DetailCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-200 p-8 ${className}`}>
        <h2 className="text-2xl font-bold text-amo-dark mb-6">{title}</h2>
        {children}
    </div>
);

// Benefit card component
const BenefitCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-gray-50/50 p-6 rounded-xl text-center transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-200">
        <div className="bg-orange-100 text-amo-orange w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-amo-dark mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

// Step card component
const StepCard: React.FC<{ step: number; title: string; description: string }> = ({ step, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-amo-orange text-white font-bold text-lg rounded-full flex items-center justify-center">
            {step}
        </div>
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </div>
);


const PerkDetailScreen: React.FC<PerkDetailScreenProps> = ({ perkId, allPerks, setCurrentScreen, onViewDetails }) => {
    const perk = allPerks.find(p => p.id === perkId);

    if (!perk) {
        return (
            <div>
                <button onClick={() => setCurrentScreen(Screen.Perks)} className="flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:text-amo-dark transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to All Perks
                </button>
                <h1 className="text-2xl font-bold">Perk not found</h1>
            </div>
        );
    }
    
    const relatedPerks = allPerks.filter(p => p.id !== perkId).slice(0, 3);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-4">
                <span className="cursor-pointer hover:underline" onClick={() => setCurrentScreen(Screen.Dashboard)}>Dashboard</span>
                <span className="mx-2">/</span>
                <span className="cursor-pointer hover:underline" onClick={() => setCurrentScreen(Screen.Perks)}>Perks</span>
                <span className="mx-2">/</span>
                <span className="font-semibold text-gray-700">{perk.partner}</span>
            </nav>

            {/* Hero Section */}
            <div className="relative bg-gray-200 h-48 rounded-2xl mb-8 shadow-inner overflow-hidden">
                <img 
                    src={`https://source.unsplash.com/random/1200x300/?technology,abstract,${perk.category}`} 
                    alt={`${perk.partner} banner`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-full p-2 shadow-lg border-2 border-white flex items-center justify-center">
                       <img src={perk.logo} alt={`${perk.partner} logo`} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white shadow-text">{perk.partner}</h1>
                        <p className="text-lg text-white font-semibold shadow-text">{perk.offer}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* About the Offer */}
                    <DetailCard title="About This Offer">
                        <p className="text-gray-600 leading-relaxed mb-6">{perk.description}</p>
                         <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-gray-700"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Access exclusive startup credits.</li>
                            <li className="flex items-center gap-2 text-gray-700"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Valid for early-stage founders.</li>
                            <li className="flex items-center gap-2 text-gray-700"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Free onboarding and support.</li>
                        </ul>
                    </DetailCard>

                    {/* Benefits Section */}
                     <DetailCard title="Why Founders Love This Perk">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <BenefitCard icon={LightBulbIcon} title="Scalable Infrastructure" description="Easily deploy and grow your AI products." />
                            <BenefitCard icon={PuzzlePieceIcon} title="Startup Credits" description="Save thousands with exclusive partner benefits." />
                            <BenefitCard icon={CogIcon} title="Developer Support" description="Access direct help from the partner team." />
                        </div>
                    </DetailCard>
                    
                     {/* How to Redeem */}
                    <DetailCard title="How to Redeem This Offer">
                        <div className="space-y-6">
                            <StepCard step={1} title="Sign up or log in" description="Create your free AMO AI account in seconds to get started." />
                            <StepCard step={2} title="Verify your startup" description="Add your company details and logo to your profile." />
                            <StepCard step={3} title="Click 'Claim' and follow link" description="Redirect to the partner site with your founder token." />
                        </div>
                    </DetailCard>
                    
                    {/* Related Perks */}
                    <div>
                        <h2 className="text-2xl font-bold text-amo-dark mb-4">More Perks You Might Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedPerks.map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                                    <img src={p.logo} alt={p.partner} className="h-8 object-contain mx-auto mb-3" />
                                    <p className="font-bold text-amo-orange text-sm">{p.offer}</p>
                                    <p className="text-xs text-gray-500 mb-3">from {p.partner}</p>
                                    <button 
                                        onClick={() => onViewDetails(p.id)}
                                        className="w-full bg-gray-100 text-gray-800 font-semibold py-1.5 rounded-md hover:bg-gray-200 text-xs">
                                        View Perk
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sticky Sidebar */}
                <aside className="lg:col-span-1 sticky top-8">
                     <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-3">
                         <button 
                             onClick={() => alert('Perk Claimed! (This is a demo)')}
                             className="w-full bg-amo-orange text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all text-base"
                         >
                             Claim This Perk
                         </button>
                          <button 
                             onClick={() => alert('Perk Saved! (This is a demo)')}
                             className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-base"
                         >
                             Save for Later
                         </button>
                    </div>
                </aside>
            </div>

             {/* CTA Banner */}
            <div className="mt-16 text-center bg-gradient-to-r from-orange-100 to-amber-100 p-12 rounded-2xl">
                 <h2 className="text-3xl font-bold text-amo-dark">Ready to unlock all founder perks?</h2>
                 <p className="text-lg text-gray-700 mt-2 mb-6">Join hundreds of startups saving thousands with AMO AI.</p>
                 <button 
                     onClick={() => setCurrentScreen(Screen.Welcome)}
                     className="bg-amo-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-black transition-all"
                 >
                     Join Free & Claim Your Perks
                 </button>
             </div>
        </div>
    );
};

export default PerkDetailScreen;