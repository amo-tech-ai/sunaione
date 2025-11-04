import React from 'react';
import { Screen, Event, Perk } from '../types';
import { ArrowRightIcon, SparklesIcon, ChatBubbleLeftRightIcon, SunIcon, CalendarIcon, MapPinIcon } from '../components/Icons';
import Footer from '../components/Footer';

interface HomePageProps {
  setCurrentScreen: (screen: Screen) => void;
  events: Event[];
  perks: Perk[];
}

// --- Local Components for HomePage ---

export const PublicHeader: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => (
    <header className="absolute top-0 left-0 right-0 z-10 py-4 px-8 flex justify-between items-center">
        <button onClick={() => onNavigate(Screen.Home)} className="font-bold text-2xl text-sunai-dark">Sun AI</button>
        <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
            <button onClick={() => onNavigate(Screen.Events)} className="hover:text-sunai-orange transition-colors">Events</button>
            <button onClick={() => onNavigate(Screen.Perks)} className="hover:text-sunai-orange transition-colors">Perks</button>
            <button onClick={() => onNavigate(Screen.JobBoard)} className="hover:text-sunai-orange transition-colors">Jobs</button>
            <button onClick={() => onNavigate(Screen.Blog)} className="hover:text-sunai-orange transition-colors">Blog</button>
        </nav>
        <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate(Screen.Dashboard)}
              className="font-medium text-gray-700 hover:text-sunai-dark"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate(Screen.Welcome)}
              className="bg-sunai-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition-colors"
            >
              Get Started
            </button>
        </div>
    </header>
);

const ValuePropCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <div className="bg-orange-100 text-sunai-orange w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-sunai-dark mb-2">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

const EventPreviewCard: React.FC<{ event: Event, onView: (screen: Screen) => void }> = ({ event, onView }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
        <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded-t-xl" />
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-md text-sunai-dark flex-grow">{event.title}</h3>
            <div className="text-sm text-gray-500 space-y-2 mt-3">
                <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> <span>{event.date}</span></div>
            </div>
            <button onClick={() => onView(Screen.Events)} className="w-full mt-4 bg-gray-50 text-sunai-dark font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                View Event
            </button>
        </div>
    </div>
);

const PerkPreviewCard: React.FC<{ perk: Perk, onView: (screen: Screen) => void }> = ({ perk, onView }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1 text-center">
        <img src={perk.logo} alt={perk.partner} className="h-10 object-contain mx-auto" />
        <div className="flex-grow my-4">
             <p className="font-bold text-lg text-sunai-orange">{perk.offer}</p>
            <p className="text-sm text-gray-600 mt-1">from {perk.partner}</p>
        </div>
        <button onClick={() => onView(Screen.Perks)} className="w-full mt-auto bg-gray-50 text-sunai-dark font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
            View Perk
        </button>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ setCurrentScreen, events, perks }) => {
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').slice(0, 3);
  const featuredPerks = perks.slice(0, 3);

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="bg-sunai-beige font-sans">
      <PublicHeader onNavigate={setCurrentScreen} />
      
      {/* Hero Section */}
      <main className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-sunai-dark leading-tight">
          Build your investor-ready<br/> story in minutes.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl">
          Sun AI helps founders turn ideas into clear, confident pitch decks — powered by AI and startup know-how.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setCurrentScreen(Screen.Welcome)}
            className="bg-sunai-orange text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-all text-lg flex items-center gap-2"
          >
            Start Your Deck
          </button>
          <button
            onClick={scrollToWaitlist}
            className="bg-white text-sunai-dark font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-all text-lg"
          >
            Join Early Access
          </button>
        </div>
      </main>

      {/* Value Proposition Section */}
      <section id="values" className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValuePropCard icon={SparklesIcon} title="Guided by AI">Generate investor slides step by step.</ValuePropCard>
            <ValuePropCard icon={ChatBubbleLeftRightIcon} title="Founder-Focused">Built by startup builders, for startup builders.</ValuePropCard>
            <ValuePropCard icon={SunIcon} title="Simple & Fast">No design skills needed — launch in minutes.</ValuePropCard>
        </div>
      </section>

      {/* Events Preview Section */}
      <section id="events" className="py-20 px-8 bg-sunai-beige">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-sunai-dark">Connect and Grow with Startup Events.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {upcomingEvents.length > 0 ? (
                      upcomingEvents.map(event => <EventPreviewCard key={event.id} event={event} onView={setCurrentScreen} />)
                  ) : (
                      <div className="md:col-span-3 text-center py-12 bg-gray-100 rounded-xl">
                          <p className="text-gray-500">No upcoming events yet — new ones are on the horizon.</p>
                      </div>
                  )}
              </div>
              <div className="text-center mt-12">
                  <button onClick={() => setCurrentScreen(Screen.Events)} className="font-bold text-sunai-orange hover:text-orange-700 transition-colors flex items-center gap-2 mx-auto">
                      Browse All Events <ArrowRightIcon className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </section>
      
      {/* Perks Preview Section */}
       <section id="perks" className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-sunai-dark">Unlock Founder Perks & Startup Benefits.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredPerks.length > 0 ? (
                    featuredPerks.map(perk => <PerkPreviewCard key={perk.id} perk={perk} onView={setCurrentScreen} />)
                ) : (
                    <div className="md:col-span-3 text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">New partner perks launching soon.</p>
                    </div>
                )}
            </div>
            <div className="text-center mt-12">
                  <button onClick={() => setCurrentScreen(Screen.Perks)} className="font-bold text-sunai-orange hover:text-orange-700 transition-colors flex items-center gap-2 mx-auto">
                      See All Perks <ArrowRightIcon className="w-4 h-4" />
                  </button>
              </div>
        </div>
      </section>
      
      {/* Early Access / Waitlist Section */}
      <section id="waitlist" className="py-20 px-8 bg-sunai-beige">
         <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-200">
             <h2 className="text-3xl font-bold text-sunai-dark">Join 100+ early founders building with Sun AI.</h2>
             <p className="text-lg text-gray-600 mt-4 mb-8">Unlock exclusive perks and be the first to access new features.</p>
             <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                 <input type="email" placeholder="Enter your email" className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sunai-orange focus:border-transparent transition" />
                 <button type="submit" className="bg-sunai-dark text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-all">
                    Join Waitlist
                 </button>
             </form>
         </div>
      </section>

      <Footer onNavigate={setCurrentScreen} />
    </div>
  );
};

export default HomePage;