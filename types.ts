// Fix: Replaced incorrect component code with actual type definitions.
export enum Screen {
  Home = 'Home',
  Welcome = 'Welcome',
  Problem = 'Problem',
  Market = 'Market',
  Traction = 'Traction',
  Ask = 'Ask',
  Generating = 'Generating',
  DeckEditor = 'DeckEditor',
  Dashboard = 'Dashboard',
  Presentation = 'Presentation',
  Profile = 'Profile',
  Events = 'Events',
  EventDetail = 'EventDetail',
  MyEvents = 'MyEvents',
  Perks = 'Perks',
  PerkDetail = 'PerkDetail',
  JobBoard = 'JobBoard',
}

export interface Slide {
  title: string;
  content: string[];
  image?: string;
  imageLoading?: boolean;
}

export type TemplateID = 'startup' | 'corporate' | 'creative';

export interface DeckData {
  companyName: string;
  problem: string;
  solution: string;
  targetAudience: string;
  businessModel: string;
  traction: string;
  teamMembers: string;
  fundingAmount: string;
  useOfFunds: string;
  template: TemplateID;
}

export interface Deck {
  id: string;
  name: string;
  slides: Slide[];
  lastEdited: number;
  template: TemplateID;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  registeredCount: number;
  totalSpots: number;
  category: string;
  status: 'Upcoming' | 'Past';
  registered: boolean;
  isVirtual?: boolean;
  agenda?: { time: string; topic: string; speaker?: string }[];
  speakers?: { name: string; title: string; image: string }[];
}

export interface Perk {
    id: string;
    partner: string;
    logo: string;
    description: string;
    offer: string;
    category: string;
    users: number;
    rating: number;
    tag?: 'Featured' | 'Popular' | 'New';
}

export interface Job {
    id: string;
    title: string;
    companyName: string;
    companyLogo: string;
    location: string;
    type: string;
    salary: string;
    isRemote: boolean;
    tags: string[];
    category: string;
}
