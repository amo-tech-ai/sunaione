import React from 'react';
import { LightBulbIcon, CogIcon, PaletteIcon, StarIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import { PublicHeader } from '../components/PublicHeader';

interface HomePageProps {}

const HowItWorksCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-200/50">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-5">
            <Icon className="w-8 h-8 text-amo-teal-dark" />
        </div>
        <h3 className="text-xl font-bold text-amo-dark mb-2">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string, name: string, role: string }> = ({ quote, name, role }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
        <p className="text-gray-700 mb-4">"{quote}"</p>
        <div>
            <p className="font-bold text-amo-dark">{name}</p>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const handleCTA = () => navigate('/pitch-deck');
  
  return (
    <>
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 text-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '3rem 3rem',
            opacity: 0.5,
          }}
        />
        <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-black font-poppins text-amo-teal-dark leading-tight">
              Create Investor-Ready<br/>Pitch Decks in Minutes
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
              AMO AI helps founders craft professional decks fast — powered by intelligent storytelling.
            </p>
            <div className="mt-10">
              <button
                onClick={handleCTA}
                className="bg-amo-teal-dark text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:bg-opacity-90 transition-all text-lg"
              >
                Create Now
              </button>
            </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <HowItWorksCard icon={LightBulbIcon} title="Input Your Idea">
                Tell us about your startup. We’ll ask a few questions about your business, problem, solution, and market.
            </HowItWorksCard>
            <HowItWorksCard icon={CogIcon} title="AI Builds the Slides">
                Our AI analyzes your input and generates compelling content and visuals for investor presentations.
            </HowItWorksCard>
            <HowItWorksCard icon={PaletteIcon} title="Customize & Share">
                Fine-tune the design, edit content, and share it with your investors or team.
            </HowItWorksCard>
        </div>
      </section>

      {/* Deck Preview Section */}
      <section className="py-20 px-8 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold font-poppins text-amo-teal-dark">See what your Deck will look like</h2>
            <p className="text-lg text-gray-600 mt-2">Professional slides generated instantly.</p>
        </div>
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-3 grid-rows-2 gap-6">
            <div className="col-span-2 row-span-2 bg-[#3A7D91] p-8 rounded-2xl text-white">
                <h3 className="text-3xl font-bold">Marketing Proposal</h3>
                <p>The best team providing the best services for your company's growth.</p>
                <p className="mt-24 font-bold text-xl">Your Logo</p>
            </div>
            <div className="col-span-1 bg-gray-100 p-6 rounded-2xl">
                <p className="font-semibold text-sm">01 Introduction</p>
                <p className="font-semibold text-sm">02 The Problem</p>
                <p className="font-semibold text-sm">03 The Solution</p>
            </div>
            <div className="col-span-1 bg-gray-100 p-6 rounded-2xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mb-2"></div>
                <p className="font-bold">Simon Robbs, CEO</p>
                <p className="text-sm text-gray-500">Founder & Visionary</p>
            </div>
        </div>
        <div className="max-w-5xl mx-auto mt-6 grid grid-cols-3 gap-6">
             <div className="col-span-1 bg-white p-6 rounded-2xl border border-gray-200">
                <p className="font-bold">Competitor 1</p>
                <p className="text-sm text-gray-500">Strengths: Market Leader</p>
            </div>
            <div className="col-span-1 bg-white p-6 rounded-2xl border border-gray-200">
                <p className="font-bold">Competitor 2</p>
                <p className="text-sm text-gray-500">Weakness: Slow adoption</p>
            </div>
            <div className="col-span-1 bg-[#3A7D91] p-6 rounded-2xl text-white">
                <p className="font-semibold text-sm">02</p>
                <p className="font-bold text-xl">Team</p>
            </div>
        </div>
      </section>

      {/* Metrics & Trust */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                    <p className="text-5xl font-bold font-poppins text-amo-teal-dark">10K+</p>
                    <p className="text-gray-600 mt-1">Decks Created</p>
                </div>
                <div>
                    <p className="text-5xl font-bold font-poppins text-amo-teal-dark">$2.3B+</p>
                    <p className="text-gray-600 mt-1">Funding Raised</p>
                </div>
                 <div>
                    <p className="text-5xl font-bold font-poppins text-amo-teal-dark">94%</p>
                    <p className="text-gray-600 mt-1">Success Rate</p>
                </div>
            </div>
            <div className="mt-20 text-center">
                <h2 className="text-4xl font-bold font-poppins text-amo-teal-dark">Trusted by Founders Worldwide</h2>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <TestimonialCard name="Jane Doe" role="Co-founder @ Clarity" quote="We managed to close our seed round in 3 weeks! The AI suggestions were spot on." />
                    <TestimonialCard name="John Smith" role="CEO @ FlowTech" quote="This pitch deck tool has saved us weeks of work and the result was professional." />
                    <TestimonialCard name="David Chen" role="Founder @ DataSync" quote="Investors loved our deck. The AI made it easy to anticipate their questions and have answers ready." />
                </div>
            </div>
        </div>
      </section>

      {/* Path to Success */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold font-poppins text-amo-teal-dark">Your path to Pitch Success</h2>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={handleCTA} className="bg-white p-6 rounded-xl font-semibold text-amo-dark shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">Fill the AI wizard</button>
                <button onClick={handleCTA} className="bg-white p-6 rounded-xl font-semibold text-amo-dark shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">Auto-generate deck</button>
                <button onClick={handleCTA} className="bg-white p-6 rounded-xl font-semibold text-amo-dark shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">Customize style</button>
                <button onClick={handleCTA} className="bg-white p-6 rounded-xl font-semibold text-amo-dark shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">Export & pitch</button>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8">
         <div className="max-w-2xl mx-auto text-center">
             <h2 className="text-4xl font-bold font-poppins text-amo-teal-dark">Ready to Pitch with Confidence?</h2>
             <p className="text-lg text-gray-600 mt-4 mb-8">Join thousands of founders who've raised funding with AI-powered pitch decks.</p>
              <button
                onClick={handleCTA}
                className="bg-amo-teal-dark text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:bg-opacity-90 transition-all text-lg"
              >
                Create Now →
              </button>
         </div>
      </section>
    </>
  );
};

export default HomePage;
