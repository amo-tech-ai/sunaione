import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, Outlet } from 'react-router-dom';
import { DeckData, Deck, Event, Perk, Job, Article } from './types';
import { generateDeck } from './services/geminiService';

import WizardSteps from './screens/WizardSteps';
import GeneratingScreen from './screens/GeneratingScreen';
import DeckEditor from './screens/DeckEditor';
import Dashboard from './screens/Dashboard';
import PresentationScreen from './screens/PresentationScreen';
import HomePage from './screens/HomePage';
import DashboardLayout from './screens/DashboardLayout';
import ProfileScreen from './screens/ProfileScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import PerksScreen from './screens/PerksScreen';
import EventsScreen from './screens/EventsScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import PerkDetailScreen from './screens/PerkDetailScreen';
import JobBoardScreen from './screens/JobBoardScreen';
import PostAJobScreen from './screens/PostAJobScreen';
import BlogScreen from './screens/BlogScreen';
import ApplyScreen from './screens/ApplyScreen';
import ApplySuccessScreen from './screens/ApplySuccessScreen';

// --- Wrapper Components for routing ---

const DeckEditorWrapper: React.FC<{ decks: Deck[]; setDecks: React.Dispatch<React.SetStateAction<Deck[]>> }> = ({ decks, setDecks }) => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const activeDeck = decks.find(d => d.id === deckId);
    
    const setActiveDeck = (updatedDeck: Deck | null) => {
        if (updatedDeck) {
            setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
        }
    };

    if (!activeDeck) return <Navigate to="/dashboard" />;
    return <DeckEditor deck={activeDeck} setDeck={setActiveDeck} navigate={navigate} />;
};

const PresentationWrapper: React.FC<{ decks: Deck[] }> = ({ decks }) => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const activeDeck = decks.find(d => d.id === deckId);
    if (!activeDeck) return <Navigate to="/dashboard" />;
    return <PresentationScreen deck={activeDeck} navigate={navigate} />;
};

const EventDetailWrapper: React.FC<{ events: Event[]; onRegisterToggle: (id: string) => void }> = ({ events, onRegisterToggle }) => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    if (!eventId) return <Navigate to="/events" />;
    return <EventDetailScreen eventId={eventId} events={events} onRegisterToggle={onRegisterToggle} navigate={navigate} />;
};

const PerkDetailWrapper: React.FC<{ perks: Perk[] }> = ({ perks }) => {
    const { perkId } = useParams<{ perkId: string }>();
    const navigate = useNavigate();
    if (!perkId) return <Navigate to="/perks" />;
    return <PerkDetailScreen perkId={perkId} allPerks={perks} navigate={navigate} />;
};

const ApplyWrapper: React.FC<{ jobs: Job[]; onSuccess: (jobId: string) => void }> = ({ jobs, onSuccess }) => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const jobToApply = jobs.find(j => j.id === jobId);
    if (!jobToApply) return <Navigate to="/jobs" />;
    return <ApplyScreen job={jobToApply} onSuccess={() => onSuccess(jobToApply.id)} navigate={navigate} />;
};

const ApplySuccessWrapper: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const appliedJob = jobs.find(j => j.id === jobId);
    if (!appliedJob) return <Navigate to="/jobs" />;
    return <ApplySuccessScreen job={appliedJob} navigate={navigate} />;
};


const initialDeckData: DeckData = {
  companyName: '', problem: '', solution: '', targetAudience: '',
  businessModel: '', traction: '', teamMembers: '', fundingAmount: '',
  useOfFunds: '', template: 'startup',
};

const App: React.FC = () => {
    const [deckData, setDeckData] = useState<DeckData>(initialDeckData);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [perks, setPerks] = useState<Perk[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    
    const navigate = useNavigate();

    useEffect(() => {
        // Mock data loading
        const mockDecks: Deck[] = [
            { id: 'deck1', name: 'Innovate AI Pitch', lastEdited: Date.now() - 86400000, template: 'startup', slides: [{title: 'Title', content: ['Innovate AI: The Future of Automation']}, {title: 'Problem', content: ['Manual data entry is slow and error-prone']}] },
            { id: 'deck2', name: 'HealthTech Solution', lastEdited: Date.now() - 2 * 86400000, template: 'corporate', slides: [{title: 'Welcome', content: ['Revolutionizing Patient Care']}] },
        ];
        setDecks(mockDecks);

        const mockEventsData: Event[] = [
            { id: 'e1', title: 'AI in FinTech Summit', description: 'Explore the latest trends in AI and finance, network with industry leaders, and discover innovative solutions that are reshaping the financial landscape. This summit features keynote speakers, panel discussions, and hands-on workshops.', image: 'https://source.unsplash.com/random/800x600?fintech', date: 'Oct 28, 2024', time: '10:00 AM', location: 'New York, NY', registeredCount: 150, totalSpots: 200, category: 'Conference', status: 'Upcoming', registered: true, isVirtual: false, agenda: [{time: '10 AM', topic: 'Keynote: AI-Powered Finance', speaker: 'Dr. Eva Core'}, {time: '11 AM', topic: 'Panel: The Future of Robo-Advisors'}] },
            { id: 'e2', title: 'Founder Networking Night', description: 'An exclusive evening for startup founders, investors, and tech enthusiasts to connect in a relaxed atmosphere. Share ideas, build relationships, and find your next co-founder or investor.', image: 'https://source.unsplash.com/random/800x600?networking', date: 'Nov 05, 2024', time: '6:00 PM', location: 'San Francisco, CA', registeredCount: 45, totalSpots: 100, category: 'Networking', status: 'Upcoming', registered: false, speakers: [{name: 'Jane Doe', title: 'VC at Sun Ventures', image: 'https://i.pravatar.cc/150?u=jane'}] },
            { id: 'e3', title: 'Pitch Perfect Workshop', description: 'Join our interactive workshop designed to help you craft and deliver a compelling startup pitch. Get expert feedback and learn the secrets to capturing investor attention.', image: 'https://source.unsplash.com/random/800x600?pitch', date: 'Sep 15, 2024', time: '2:00 PM', location: 'Virtual', registeredCount: 88, totalSpots: 100, category: 'Workshop', status: 'Past', registered: true, isVirtual: true },
        ];
        setEvents(mockEventsData);

        const mockPerksData: Perk[] = [
            { id: 'p1', partner: 'AWS Activate', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', description: 'Get the resources you need to get started with AWS. The Activate program provides startups with a host of benefits, including AWS credits, technical support, and training.', offer: '$5,000 Credits', category: 'Cloud', users: 120, rating: 4.8, tag: 'Featured' },
            { id: 'p2', partner: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', description: 'Power payments for your startup with Stripe. Sun AI members get their first $50,000 of card transactions processed for free.', offer: '$50k Fee-Free', category: 'Finance', users: 250, rating: 4.9, tag: 'Popular' },
            { id: 'p3', partner: 'HubSpot for Startups', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/HubSpot_Logo.svg', description: 'Get access to HubSpot Growth Platform, a full suite of software for marketing, sales, and customer service, with a startup-friendly discount.', offer: '90% Discount', category: 'Marketing', users: 95, rating: 4.7, tag: 'New' },
        ];
        setPerks(mockPerksData);

        const mockJobsData: Job[] = [
             { id: 'j1', title: 'Senior AI Engineer', companyName: 'Innovate AI', companyLogo: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/openai.svg', location: 'San Francisco, CA', type: 'Full-time', salary: '$150k - $180k', isRemote: false, tags: ['Python', 'PyTorch', 'NLP'], category: 'Engineering' },
             { id: 'j2', title: 'Product Manager, AI Platforms', companyName: 'DataCorp', companyLogo: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/googlecloud.svg', location: 'Remote', type: 'Full-time', salary: '$140k - $170k', isRemote: true, tags: ['Product Strategy', 'Roadmap', 'API'], category: 'Product' },
        ];
        setJobs(mockJobsData);

        const mockArticlesData: Article[] = [
            { id: 'a1', title: 'The Future of Generative AI in Startups', excerpt: 'Discover how generative AI is reshaping industries and creating new opportunities for entrepreneurs.', imageUrl: 'https://source.unsplash.com/random/800x600?ai', category: 'AI News', author: { name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=jane'}, date: 'Oct 20, 2024', isFeatured: true },
            { id: 'a2', title: 'How We Raised Our First $1M Seed Round', excerpt: 'A step-by-step guide from a founder who just went through the fundraising trenches.', imageUrl: 'https://source.unsplash.com/random/800x600?money', category: 'Founder Stories', author: { name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=john'}, date: 'Oct 15, 2024' },
            { id: 'a3', title: 'Mastering the Art of the Pitch Deck', excerpt: 'Learn the key components of a compelling pitch deck that will grab investors attention.', imageUrl: 'https://source.unsplash.com/random/800x600?presentation', category: 'Tutorials', author: { name: 'Emily White', avatarUrl: 'https://i.pravatar.cc/150?u=emily'}, date: 'Oct 10, 2024', isPlaceholder: true },
        ];
        setArticles(mockArticlesData);
    }, []);

    const handleDeckGenerationFinish = async () => {
        navigate('/generating');
        const newSlides = await generateDeck(deckData);
        const newDeck: Deck = { id: String(Date.now()), name: `${deckData.companyName} Pitch Deck`, slides: newSlides, lastEdited: Date.now(), template: deckData.template };
        setDecks(prev => [...prev, newDeck]);
        setDeckData(initialDeckData);
        navigate(`/deck/${newDeck.id}/edit`);
    };

    const handleSelectDeck = (deckId: string) => {
        navigate(`/deck/${deckId}/edit`);
    };
    
    const handleRegisterToggle = (eventId: string) => {
        setEvents(events.map(e => e.id === eventId ? { ...e, registered: !e.registered, registeredCount: e.registered ? e.registeredCount - 1 : e.registeredCount + 1 } : e));
    };

    return (
        <Routes>
            <Route path="/" element={<HomePage navigate={navigate} />} />
            <Route path="/blog" element={<BlogScreen navigate={navigate} />} />
            <Route path="/jobs/post" element={<PostAJobScreen navigate={navigate} />} />
            <Route path="/create-deck" element={<WizardSteps deckData={deckData} setDeckData={setDeckData} onFinish={handleDeckGenerationFinish} navigate={navigate} />} />
            <Route path="/generating" element={<GeneratingScreen />} />

            <Route path="/deck/:deckId/edit" element={<DeckEditorWrapper decks={decks} setDecks={setDecks} />} />
            <Route path="/deck/:deckId/present" element={<PresentationWrapper decks={decks} />} />
            <Route path="/jobs/:jobId/apply/success" element={<ApplySuccessWrapper jobs={jobs} />} />

            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard decks={decks} onSelectDeck={handleSelectDeck} navigate={navigate} />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/my-events" element={<MyEventsScreen events={events} navigate={navigate} />} />
                <Route path="/events" element={<EventsScreen events={events} onRegisterToggle={handleRegisterToggle} />} />
                <Route path="/events/:eventId" element={<EventDetailWrapper events={events} onRegisterToggle={handleRegisterToggle} />} />
                <Route path="/perks" element={<PerksScreen perks={perks} />} />
                <Route path="/perks/:perkId" element={<PerkDetailWrapper perks={perks} />} />
                <Route path="/jobs" element={<JobBoardScreen jobs={jobs} />} />
                <Route path="/jobs/:jobId/apply" element={<ApplyWrapper jobs={jobs} onSuccess={(jobId) => navigate(`/jobs/${jobId}/apply/success`)} />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default App;