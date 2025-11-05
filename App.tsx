import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useParams, Navigate, useNavigate } from 'react-router-dom';
import { DeckData, Deck, Event, Perk, Job, Article, Slide } from './types';
import { deckService } from './services/deckService';

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
import PublicLayout from './screens/PublicLayout';

// --- Constants ---
const WIZARD_DRAFT_KEY = 'amo_wizard_draft';
const initialDeckData: DeckData = {
    companyName: '',
    problem: '',
    solution: '',
    targetAudience: '',
    businessModel: '',
    traction: '',
    teamMembers: '',
    fundingAmount: '',
    useOfFunds: '',
    template: 'startup',
};


// --- Mock Data (for non-deck features) ---
const initialEvents: Event[] = [
  {
    id: 'event-1',
    title: 'AI Startup Summit 2024',
    description: 'Join the brightest minds in AI for a full day of talks, workshops, and networking. This is the premier event for anyone looking to build, fund, or join an AI startup. Keynote speakers include industry pioneers and top-tier venture capitalists.',
    image: 'https://source.unsplash.com/random/800x600/?conference,technology',
    date: 'October 26, 2024',
    time: '9:00 AM PST',
    location: 'San Francisco, CA',
    registeredCount: 85,
    totalSpots: 150,
    category: 'Conference',
    status: 'Upcoming',
    registered: true,
  },
  {
    id: 'event-2',
    title: 'Founder Networking Mixer',
    description: 'Connect with fellow founders, investors, and potential partners in a relaxed, virtual setting. Share your ideas, get feedback, and build meaningful connections that can help accelerate your startup journey.',
    image: 'https://source.unsplash.com/random/800x600/?networking,startup',
    date: 'November 15, 2024',
    time: '6:00 PM PST',
    location: 'Virtual Event',
    isVirtual: true,
    registeredCount: 120,
    totalSpots: 200,
    category: 'Networking',
    status: 'Upcoming',
    registered: false,
  },
];

const initialPerks: Perk[] = [
    {
        id: 'perk-1',
        partner: 'AWS Activate',
        logo: 'https://i.imgur.com/L4tr0C1.png',
        description: 'Get free AWS credits, technical support, and training to grow your business.',
        offer: '$5,000 Credits',
        category: 'Cloud',
        users: 150,
        rating: 4.8,
        tag: 'Featured',
    },
    {
        id: 'perk-2',
        partner: 'Stripe',
        logo: 'https://i.imgur.com/rCIv25d.png',
        description: 'Process payments with Stripe and get your first $20,000 in transactions fee-free.',
        offer: 'Fee-Free Processing',
        category: 'Finance',
        users: 210,
        rating: 4.9,
        tag: 'Popular',
    },
];

const initialJobs: Job[] = [
    {
        id: 'job-1',
        title: 'Machine Learning Engineer',
        companyName: 'Innovate AI',
        companyLogo: 'https://i.imgur.com/4h5zV8V.png',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$150,000 - $180,000',
        isRemote: true,
        tags: ['Python', 'PyTorch', 'NLP'],
        category: 'Engineering',
    },
    {
        id: 'job-2',
        title: 'Product Manager, AI Platforms',
        companyName: 'DataCorp',
        companyLogo: 'https://i.imgur.com/5g7mZbw.png',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$160,000 - $190,000',
        isRemote: false,
        tags: ['Roadmap', 'Agile', 'AI'],
        category: 'Product',
    },
];

const initialArticles: Article[] = [
    {
      id: '1',
      title: 'The Future of Generative AI: What to Expect in 2025',
      excerpt: 'Generative AI is evolving at an unprecedented pace. We dive into the upcoming trends, from hyper-realistic video generation to autonomous AI agents that will redefine industries.',
      imageUrl: 'https://source.unsplash.com/random/800x600/?ai,future',
      category: 'AI News',
      author: {
        name: 'Jane Doe',
        avatarUrl: 'https://i.pravatar.cc/150?u=janedoe'
      },
      date: 'October 15, 2024',
      isFeatured: true,
    },
    {
      id: '2',
      title: 'From Idea to $1M Seed: A Founder\'s Journey',
      excerpt: 'Learn how Sarah Chen, founder of ConnectSphere, navigated the challenges of fundraising, product development, and team building to secure a $1M seed round.',
      imageUrl: 'https://source.unsplash.com/random/800x600/?startup,founder',
      category: 'Founder Stories',
      author: {
        name: 'John Smith',
        avatarUrl: 'https://i.pravatar.cc/150?u=johnsmith'
      },
      date: 'October 12, 2024'
    },
];


// --- Wrapper Components for routing ---

const DeckEditorWrapper: React.FC<{ decks: Deck[]; setDecks: React.Dispatch<React.SetStateAction<Deck[]>> }> = ({ decks, setDecks }) => {
    const { id } = useParams<{ id: string }>();
    const activeDeck = decks.find(d => d.id === id);
    
    const setActiveDeck = useCallback(async (updatedDeck: Deck | null) => {
        if (updatedDeck) {
            await deckService.saveDeck(updatedDeck);
            setDecks(currentDecks => currentDecks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
        }
    }, [setDecks]);

    if (!activeDeck) return <Navigate to="/dashboard" />;
    return <DeckEditor deck={activeDeck} setDeck={setActiveDeck} />;
};

const PresentationWrapper: React.FC<{ decks: Deck[] }> = ({ decks }) => {
    const { id } = useParams<{ id: string }>();
    const activeDeck = decks.find(d => d.id === id);
    if (!activeDeck) return <Navigate to="/dashboard" />;
    return <PresentationScreen deck={activeDeck} />;
};

const EventDetailWrapper: React.FC<{ events: Event[]; onRegisterToggle: (id: string) => void }> = ({ events, onRegisterToggle }) => {
    const { eventId } = useParams<{ eventId: string }>();
    if (!eventId) return <Navigate to="/events" />;
    return <EventDetailScreen eventId={eventId} events={events} onRegisterToggle={onRegisterToggle} />;
};

const PerkDetailWrapper: React.FC<{ perks: Perk[] }> = ({ perks }) => {
    const { perkId } = useParams<{ perkId: string }>();
    if (!perkId) return <Navigate to="/perks" />;
    return <PerkDetailScreen perkId={perkId} allPerks={perks} />;
};

const ApplyWrapper: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
    const { jobId } = useParams<{ jobId: string }>();
    const jobToApply = jobs.find(j => j.id === jobId);
    if (!jobToApply) return <Navigate to="/jobs" />;
    return <ApplyScreen job={jobToApply} />;
};

const ApplySuccessWrapper: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
    const { jobId } = useParams<{ jobId: string }>();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return <Navigate to="/jobs" />;
    return <ApplySuccessScreen job={job} />;
};

export const App: React.FC = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [deckData, setDeckData] = useState<DeckData>(() => {
        try {
            const savedDraft = localStorage.getItem(WIZARD_DRAFT_KEY);
            return savedDraft ? JSON.parse(savedDraft) : initialDeckData;
        } catch (error) {
            console.error("Failed to load wizard draft:", error);
            return initialDeckData;
        }
    });
    
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [perks] = useState<Perk[]>(initialPerks);
    const [jobs] = useState<Job[]>(initialJobs);
    const [articles] = useState<Article[]>(initialArticles);

    // Load initial decks from service on mount
    useEffect(() => {
        deckService.getDecks().then(setDecks);
    }, []);

    // Save wizard draft to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(deckData));
        } catch (error) {
            console.error("Failed to save wizard draft:", error);
        }
    }, [deckData]);
    
    const handleCreateDeck = async (newDeckData: DeckData, navigate: (path: string) => void) => {
        navigate('/pitch-deck/generating');
        
        // Simulate async operation and deck generation from the backend
        await new Promise(resolve => setTimeout(resolve, 2500));

        try {
            console.log("Simulating deck creation from data:", newDeckData);
            
            // This simulates the behavior of the 'create-deck-with-images' Edge Function
            const newDeck: Deck = {
                id: `deck-${Date.now()}`,
                name: newDeckData.companyName || 'Untitled Deck',
                template: newDeckData.template,
                lastEdited: Date.now(),
                slides: [
                    { title: 'Welcome', content: [`To the pitch for ${newDeckData.companyName}`], image: `https://picsum.photos/500/300?random=1` },
                    { title: 'The Problem', content: newDeckData.problem.split('\n').filter(Boolean), image: `https://picsum.photos/500/300?random=2` },
                    { title: 'Our Solution', content: newDeckData.solution.split('\n').filter(Boolean), image: `https://picsum.photos/500/300?random=3` },
                    { title: 'Target Audience', content: newDeckData.targetAudience.split('\n').filter(Boolean), image: `https://picsum.photos/500/300?random=4` },
                    { title: 'Business Model', content: newDeckData.businessModel.split('\n').filter(Boolean), image: `https://picsum.photos/500/300?random=5` },
                    { title: 'Traction', content: newDeckData.traction.split('\n').filter(Boolean), image: `https://picsum.photos/500/300?random=6` },
                    { title: 'Our Team', content: newDeckData.teamMembers.split('\n').filter(Boolean), image: `https://picsum.photos/500/300?random=7` },
                    { title: 'The Ask', content: [`We are seeking ${newDeckData.fundingAmount}.`, ...newDeckData.useOfFunds.split('\n').filter(Boolean)], image: `https://picsum.photos/500/300?random=8` },
                    { title: 'Thank You', content: ['Any Questions?'], image: `https://picsum.photos/500/300?random=9` },
                ].filter(slide => slide.content.length > 0 && !(slide.content.length === 1 && slide.content[0] === '')), // Remove empty slides
            };

            // Add to our mock store via the service, so it's persisted for the session
            await deckService.addDeck(newDeck);
            setDecks(prev => [...prev, newDeck]);
            
            // Clear draft and reset form state after successful creation
            localStorage.removeItem(WIZARD_DRAFT_KEY);
            setDeckData(initialDeckData);

            navigate(`/dashboard/decks/${newDeck.id}/edit`);
        } catch (error) {
            console.error("Failed to create mock deck:", error);
            alert("There was an error creating your deck. Please try again.");
            navigate('/pitch-deck');
        }
    };

    const handleSelectDeck = (deckId: string, navigate: (path: string) => void) => {
        navigate(`/dashboard/decks/${deckId}/edit`);
    };

    const handleDeleteDeck = async (deckId: string) => {
        await deckService.deleteDeck(deckId);
        setDecks(prev => prev.filter(d => d.id !== deckId));
    };

    const handleDuplicateDeck = async (deckId: string) => {
        const duplicatedDeck = await deckService.duplicateDeck(deckId);
        setDecks(prev => [...prev, duplicatedDeck]);
    };
    
    const handleRegisterToggle = (eventId: string) => {
        setEvents(prevEvents =>
            prevEvents.map(event => {
                if (event.id === eventId) {
                    const isRegistered = !event.registered;
                    return {
                        ...event,
                        registered: isRegistered,
                        registeredCount: isRegistered ? event.registeredCount + 1 : event.registeredCount - 1
                    };
                }
                return event;
            })
        );
    };

    return (
        <Routes>
            {/* Standalone (no layout) Routes */}
            <Route path="/pitch-deck" element={<WizardSteps deckData={deckData} setDeckData={setDeckData} onFinish={handleCreateDeck} />} />
            <Route path="/pitch-deck/generating" element={<GeneratingScreen />} />
            
            {/* Public Routes with consistent layout */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsScreen events={events} onRegisterToggle={handleRegisterToggle} />} />
                <Route path="/events/:eventId" element={<EventDetailWrapper events={events} onRegisterToggle={handleRegisterToggle} />} />
                <Route path="/perks" element={<PerksScreen perks={perks} />} />
                <Route path="/perks/:perkId" element={<PerkDetailWrapper perks={perks} />} />
                <Route path="/jobs" element={<JobBoardScreen jobs={jobs} />} />
                <Route path="/jobs/post" element={<PostAJobScreen />} />
                <Route path="/jobs/:jobId/apply" element={<ApplyWrapper jobs={jobs} />} />
                <Route path="/jobs/:jobId/apply/success" element={<ApplySuccessWrapper jobs={jobs} />} />
                <Route path="/blog" element={<BlogScreen articles={articles} />} />
            </Route>

            {/* Authenticated Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard decks={decks} onSelectDeck={handleSelectDeck} onDeleteDeck={handleDeleteDeck} onDuplicateDeck={handleDuplicateDeck} />} />
                <Route path="profile" element={<ProfileScreen />} />
                <Route path="my-events" element={<MyEventsScreen events={events} />} />
                <Route path="decks/:id/edit" element={<DeckEditorWrapper decks={decks} setDecks={setDecks} />} />
                <Route path="decks/:id/present" element={<PresentationWrapper decks={decks} />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default App;