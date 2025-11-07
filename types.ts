// types.ts
// Defines the core data structures used throughout the AMO AI application.

export interface Slide {
  id?: string;
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

export interface VisualBrief {
    style: string;
    colorPalette: string[];
    keywords: string[];
    mood: string;
}

export interface Deck {
  id: string;
  name: string;
  slides: Slide[];
  lastEdited: number;
  template: TemplateID;
  visualThemeDescription?: string;
  visualThemeBrief?: VisualBrief;
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
    id:string;
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

export interface JobApplication {
    fullName: string;
    email: string;
    resume: {
        name: string;
        size: number;
    } | null;
    coverLetter: string;
    yearsOfExperience: string;
    portfolioUrl: string;
    skills: string[];
    locationPreference: 'Onsite' | 'Remote' | 'Hybrid';
    salaryExpectation: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: 'AI News' | 'Founder Stories' | 'Tutorials' | 'Events' | 'Startup Lessons';
  author: {
    name: string;
    avatarUrl: string;
  };
  date: string;
  isFeatured?: boolean;
  isPlaceholder?: boolean;
}

// Added types for Professional Profile Page
export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export interface Skill {
  name: string;
  description: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  type: 'Founder' | 'Employee' | 'Investor' | 'Mentor';
}

export interface UserProfile {
  name: string;
  role: string;
  location: string;
  avatar: string;
  tags: string[];
  stats: {
    views: string;
    completion: number;
    connections: number;
    endorsements: number;
  };
  verification: {
    email: VerificationStatus;
    linkedin: VerificationStatus;
    github: VerificationStatus;
    domain: VerificationStatus;
  };
  skills: Skill[];
  experience: Experience[];
}

// Types for Strategic Analysis feature
export type InsightCategory = 'Strength' | 'Weakness' | 'Suggestion';

export interface Insight {
    category: InsightCategory;
    slide_number: number;
    slide_title: string;
    feedback: string;
}

export interface AnalysisResult {
    pitch_readiness_score: number;
    executive_summary: string;
    key_insights: Insight[];
}

// Types for Market Research Agent
export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
}

export interface ResearchResult {
    answer: string;
    sources: GroundingChunk[];
}