import React from 'react';
import { Perk } from '../types';
import { useNavigate } from 'react-router-dom';
import { PublicHeader } from './HomePage';
import Footer from '../components/Footer';

const PerkCard: React.FC<{ perk: Perk; onViewDetails: (id: string) => void; }> = ({ perk, onViewDetails }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-start justify-between">
            <img src={perk.logo} alt={perk.partner} className="h-8 object-contain" />
            {perk.tag && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    perk.tag === 'Featured' ? 'bg-orange-100 text-amo-orange' :
                    perk.tag === 'Popular' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>{perk.tag}</span>
            )}
        </div>
        <div className="flex-grow my-4">
            <h3 className="font-bold text-lg text-amo-dark">{perk.partner}</h3>
            <p className="text-sm text-gray-600 mt-1">{perk.description}</p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
             <span className="font-bold text-lg text-amo-orange">{perk.offer}</span>
             <button 
                onClick={() => onViewDetails(perk.id)}
                className="bg-amo-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition-colors text-sm">
                View Details
            </button>
        </div>
    </div>
);


const PerksScreen: React.FC<{ perks: Perk[] }> = ({ perks }) => {
    const navigate = useNavigate();
    const onViewDetails = (perkId: string) => {
        navigate(`/perks/${perkId}`);
    };
    
    return (
        <div className="bg-amo-beige min-h-screen">
            <PublicHeader />
            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-amo-dark">Startup Perks</h1>
                        <p className="text-gray-600 mt-1">Exclusive deals and credits from our partners to help you grow.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {perks.map(perk => (
                            <PerkCard key={perk.id} perk={perk} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PerksScreen;