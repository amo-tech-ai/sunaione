import React, { useState, useEffect } from 'react';
// Fix: Added Job import
import { Screen, DeckData, Deck, Slide, TemplateID, Event, Perk, Job } from './types';
import WizardSteps from './screens/WizardSteps';
import GeneratingScreen from './screens/GeneratingScreen';
import DeckEditor from './screens/DeckEditor';
import Dashboard from './screens/Dashboard';
import { generateDeck } from './services/geminiService';
import HomePage, { PublicHeader } from './screens/HomePage';
import DashboardLayout from './screens/DashboardLayout';
import ProfileScreen from './screens/ProfileScreen';
import EventsScreen from './screens/EventsScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import PerksScreen from './screens/PerksScreen';
import PresentationScreen from './screens/PresentationScreen';
import PerkDetailScreen from './screens/PerkDetailScreen';
// Fix: Added JobBoardScreen import
import JobBoardScreen from './screens/JobBoardScreen';
import Footer from './components/Footer';


const initialEventsData: Event[] = [
  {
    id: '1',
    title: 'Seed Stage Startup Pitch Night',
    description: 'An exclusive event for seed-stage startups to pitch in front of leading venture capitalists and angel investors. Get feedback, make connections, and find your next funding round.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80',
    date: 'December 15, 2023',
    time: '6:00 PM - 9:00 PM PST',
    location: 'Silicon Valley, CA',
    registeredCount: 85,
    totalSpots: 100,
    category: 'Networking',
    status: 'Upcoming',
    registered: true,
  },
  {
    id: '2',
    title: 'AI in SaaS: The Next Frontier',
    description: 'Join industry leaders and innovators to discuss the impact of AI on the SaaS landscape. Explore new business models, product strategies, and the future of intelligent software.',
    image: 'https://images.unsplash.com/photo-1620712943543-2858200f745a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    date: 'November 28, 2023',
    time: '9:00 AM - 4:00 PM PST',
    location: 'Virtual Event',
    isVirtual: true,
    registeredCount: 450,
    totalSpots: 500,
    category: 'Conference',
    status: 'Past',
    registered: true,
  },
  {
    id: '3',
    title: 'Growth Hacking Workshop for Startups',
    description: 'A hands-on workshop designed to teach you the most effective growth hacking strategies for 2023. Learn from experts who have scaled companies from zero to millions.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    date: 'January 10, 2024',
    time: '10:00 AM - 1:00 PM PST',
    location: 'New York, NY',
    registeredCount: 30,
    totalSpots: 50,
    category: 'Workshop',
    status: 'Upcoming',
    registered: false,
  },
  {
    id: '4',
    title: 'Web3 & Decentralization Summit',
    description: 'Explore the future of the internet with pioneers in blockchain, DeFi, and NFTs. This summit brings together the brightest minds to discuss the challenges and opportunities of a decentralized world.',
    image: 'https://images.unsplash.com/photo-1642104704074-af0f48723549?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80',
    date: 'February 5, 2024',
    time: 'All Day',
    location: 'Miami, FL',
    registeredCount: 120,
    totalSpots: 200,
    category: 'Conference',
    status: 'Upcoming',
    registered: false,
  },
];

const perksData: Perk[] = [
    { id: '1', partner: 'AWS Activate', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', description: 'Get up to $5,000 in AWS Activate credits to build and scale your startup on the world\'s most comprehensive and broadly adopted cloud platform.', offer: '$5,000 Credits', category: 'Cloud', users: 1250, rating: 4.9, tag: 'Featured' },
    { id: '2', partner: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', description: 'Process your first $50,000 in payments completely fee-free. Stripe provides a suite of APIs that powers commerce for businesses of all sizes.', offer: '$50k Fee-Free', category: 'Payments', users: 2100, rating: 4.8, tag: 'Popular' },
    { id: '3', partner: 'HubSpot for Startups', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/HubSpot_Logo.svg', description: 'Receive up to 90% off HubSpot\'s marketing, sales, and service software in your first year, 50% off in your second, and 25% off ongoing.', offer: '90% Off', category: 'CRM', users: 980, rating: 4.7 },
    { id: '4', partner: 'Clerk', logo: 'https://clerk.com/_next/image?url=%2Fdocs%2Fclerk-logomark-light.png&w=64&q=75', description: 'The easiest way to add authentication and user management to your application. Get 1 year free on the Pro plan.', offer: '1 Year Free', category: 'Dev Tools', users: 850, rating: 4.9, tag: 'New' },
    { id: '5', partner: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg', description: 'The all-in-one workspace for your notes, tasks, wikis, and databases. Get $1,000 in credit for your team.', offer: '$1,000 Credit', category: 'Productivity', users: 3200, rating: 4.8 },
    { id: '6', partner: 'Google Cloud for Startups', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg', description: 'Build your startup on Google Cloud and get up to $100,000 in cloud credits for your first year, plus access to technical training and business support.', offer: '$100k Credits', category: 'Cloud', users: 760, rating: 4.9 },
];

// Fix: Added dummy data for jobs
const jobsData: Job[] = [
    { id: '1', title: 'Senior AI Engineer', companyName: 'Innovate AI', companyLogo: 'https://clerk.com/_next/image?url=%2Fdocs%2Fclerk-logomark-light.png&w=64&q=75', location: 'Remote', type: 'Full-time', salary: '150k - 190k', isRemote: true, tags: ['Python', 'PyTorch', 'LLMs'], category: 'Engineering' },
    { id: '2', title: 'Product Manager, Generative AI', companyName: 'Creative Solutions', companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg', location: 'San Francisco, CA', type: 'Full-time', salary: '160k - 200k', isRemote: false, tags: ['Product Strategy', 'AI/ML', 'SaaS'], category: 'Product' },
    { id: '3', title: 'UX/UI Designer for AI Tools', companyName: 'Sun AI', companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/HubSpot_Logo.svg', location: 'Remote (US)', type: 'Full-time', salary: '120k - 150k', isRemote: true, tags: ['Figma', 'User Research', 'Design Systems'], category: 'Design' },
    { id: '4', title: 'Marketing Lead, AI Platforms', companyName: 'Growth Rocket', companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', location: 'New York, NY', type: 'Full-time', salary: '140k - 170k', isRemote: false, tags: ['Go-to-Market', 'Demand Gen', 'SaaS'], category: 'Marketing' },
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  const [deckData, setDeckData] = useState<DeckData>({
    problem: '',
    solution: '',
    businessModel: '',
    targetAudience: '',
    traction: '',
    teamMembers: '',
    fundingAmount: '',
    useOfFunds: '',
    companyName: '',
    template: 'startup' as TemplateID,
  });

  const [decks, setDecks] = useState<Deck[]>(() => {
    const savedDecks = localStorage.getItem('decks');
    return savedDecks ? JSON.parse(savedDecks) : [];
  });
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activePerkId, setActivePerkId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>(initialEventsData);


  useEffect(() => {
    localStorage.setItem('decks', JSON.stringify(decks));
  }, [decks]);

  const handleRegisterToggle = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === eventId) {
          const isRegistered = !event.registered;
          const registeredCount = isRegistered
            ? event.registeredCount + 1
            : event.registeredCount - 1;
          return { ...event, registered: isRegistered, registeredCount };
        }
        return event;
      })
    );
  };

  const handleDeckGeneration = async () => {
    setCurrentScreen(Screen.Generating);
    try {
      const slides = await generateDeck(deckData);
      const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        name: `${deckData.companyName} Pitch Deck`,
        slides,
        lastEdited: Date.now(),
        template: deckData.template,
      };
      setDecks(prev => [...prev, newDeck]);
      setActiveDeck(newDeck);
      setCurrentScreen(Screen.DeckEditor);
    } catch (error) {
      console.error("Failed to generate deck", error);
      // Handle error, maybe show an error screen
      setCurrentScreen(Screen.Problem); // Go back to wizard
    }
  };

  const handleSelectDeck = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      setActiveDeck(deck);
      setCurrentScreen(Screen.DeckEditor);
    }
  };

  const handleViewEventDetails = (eventId: string) => {
    setActiveEventId(eventId);
    setCurrentScreen(Screen.EventDetail);
  };
  
  const handleViewPerkDetails = (perkId: string) => {
    setActivePerkId(perkId);
    setCurrentScreen(Screen.PerkDetail);
  };

  const setActiveDeckFromEditor = (deck: Deck | null) => {
    if(deck) {
        const deckIndex = decks.findIndex(d => d.id === deck.id);
        if(deckIndex > -1) {
            const newDecks = [...decks];
            newDecks[deckIndex] = deck;
            setDecks(newDecks);
        }
    }
    setActiveDeck(deck);
  }

  const renderScreen = () => {
    const dashboardScreens = [Screen.Dashboard, Screen.Profile, Screen.MyEvents];
    const publicScreens = [Screen.Events, Screen.EventDetail, Screen.Perks, Screen.PerkDetail, Screen.JobBoard];
    
    if (dashboardScreens.includes(currentScreen)) {
        return (
            <DashboardLayout currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}>
                {currentScreen === Screen.Dashboard && <Dashboard decks={decks} setCurrentScreen={setCurrentScreen} onSelectDeck={handleSelectDeck} />}
                {currentScreen === Screen.Profile && <ProfileScreen setCurrentScreen={setCurrentScreen} />}
                {currentScreen === Screen.MyEvents && <MyEventsScreen events={events} setCurrentScreen={setCurrentScreen} onViewDetails={handleViewEventDetails} />}
            </DashboardLayout>
        );
    }

    if (publicScreens.includes(currentScreen)) {
        return (
            <>
                <PublicHeader onNavigate={setCurrentScreen} />
                <div className="pt-20">
                    <main className="p-8 min-h-screen">
                        {currentScreen === Screen.Events && <EventsScreen events={events} onViewDetails={handleViewEventDetails} onRegisterToggle={handleRegisterToggle} />}
                        {currentScreen === Screen.EventDetail && activeEventId && <EventDetailScreen eventId={activeEventId} setCurrentScreen={setCurrentScreen} events={events} onRegisterToggle={handleRegisterToggle} />}
                        {currentScreen === Screen.Perks && <PerksScreen perks={perksData} onViewDetails={handleViewPerkDetails} />}
                        {currentScreen === Screen.PerkDetail && activePerkId && <PerkDetailScreen perkId={activePerkId} allPerks={perksData} setCurrentScreen={setCurrentScreen} onViewDetails={handleViewPerkDetails} />}
                        {currentScreen === Screen.JobBoard && <JobBoardScreen jobs={jobsData} />}
                    </main>
                    <Footer onNavigate={setCurrentScreen} />
                </div>
            </>
        );
    }


    switch (currentScreen) {
      case Screen.Home:
        return <HomePage setCurrentScreen={setCurrentScreen} events={events} perks={perksData} />;
      case Screen.Welcome:
      case Screen.Problem:
      case Screen.Market:
      case Screen.Traction:
      case Screen.Ask:
        return <WizardSteps deckData={deckData} setDeckData={setDeckData} onFinish={handleDeckGeneration} />;
      case Screen.Generating:
        return <GeneratingScreen />;
      case Screen.DeckEditor:
        return activeDeck ? <DeckEditor deck={activeDeck} setDeck={setActiveDeckFromEditor} setCurrentScreen={setCurrentScreen}/> : <Dashboard decks={decks} setCurrentScreen={setCurrentScreen} onSelectDeck={handleSelectDeck} />;
      case Screen.Presentation:
        return activeDeck ? <PresentationScreen deck={activeDeck} setCurrentScreen={setCurrentScreen} /> : <Dashboard decks={decks} setCurrentScreen={setCurrentScreen} onSelectDeck={handleSelectDeck} />;
      default:
        // Default to dashboard if logged in, otherwise home
        return <Dashboard decks={decks} setCurrentScreen={setCurrentScreen} onSelectDeck={handleSelectDeck} />;
    }
  };

  return (
    <div className="bg-sunai-beige min-h-screen font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;