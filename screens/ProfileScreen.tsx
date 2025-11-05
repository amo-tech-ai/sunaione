import React from 'react';
import { UserProfile, VerificationStatus, Skill, Experience } from '../types';
import { 
    UserCircleIcon, SparklesIcon, EyeIcon, UploadIcon, CheckCircleIcon, 
    LinkedInIcon, GitHubIcon, GlobeAltIcon, ExclamationTriangleIcon,
    LoaderIcon,
    RocketIcon
} from '../components/Icons';

// Dummy data for the profile page
const userProfile: UserProfile = {
  name: 'Alex Doe',
  role: 'Founder & CEO at Innovate AI',
  location: 'San Francisco, CA',
  avatar: 'https://i.pravatar.cc/150?u=alexdoe',
  tags: ['Founder', 'Product', 'AI', 'Startup Builder'],
  stats: {
    views: '1.2k',
    completion: 65,
    connections: 128,
    endorsements: 42,
  },
  verification: {
    email: 'verified',
    linkedin: 'unverified',
    github: 'unverified',
    domain: 'pending',
  },
  skills: [
    { name: 'AI Strategy', description: 'Developing and implementing AI-driven product roadmaps.' },
    { name: 'Go-to-Market', description: 'Successfully launched 3 SaaS products, acquiring first 1000 users.' },
    { name: 'Fundraising', description: 'Raised $1.5M in pre-seed and seed rounds.' },
  ],
  experience: [
    { role: 'Founder & CEO', company: 'Innovate AI', period: '2022 - Present', type: 'Founder' },
    { role: 'Senior Product Manager', company: 'TechCorp', period: '2018 - 2022', type: 'Employee' },
  ],
};


// --- Local Components for Profile Screen ---

const ProfileHeader: React.FC = () => (
    <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl font-bold text-amo-dark">Professional Profile</h1>
                <p className="text-gray-600 mt-1">Show your skills, experience, and startup journey to connect with founders and investors.</p>
            </div>
            <button className="hidden sm:flex bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors items-center gap-2">
                <LinkedInIcon className="w-5 h-5"/> Import from LinkedIn
            </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-amo-orange h-2.5 rounded-full" style={{width: `${userProfile.stats.completion}%`}}></div>
        </div>
    </div>
);

const ProfileOverviewCard: React.FC<{ user: UserProfile }> = ({ user }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md"/>
            <div className="flex-grow text-center sm:text-left">
                <h2 className="text-2xl font-bold text-amo-dark">{user.name}</h2>
                <p className="text-gray-600">{user.role}</p>
                <p className="text-sm text-gray-500">{user.location}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    {user.tags.map(tag => <span key={tag} className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-amo-orange">{tag}</span>)}
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                 <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">Edit Profile</button>
                 <button className="bg-amo-dark text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-black transition-all w-full sm:w-auto">Preview</button>
            </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div><p className="text-xl font-bold">{user.stats.views}</p><p className="text-sm text-gray-500">Profile Views</p></div>
            <div><p className="text-xl font-bold">{user.stats.completion}%</p><p className="text-sm text-gray-500">Completion</p></div>
            <div><p className="text-xl font-bold">{user.stats.connections}</p><p className="text-sm text-gray-500">Connections</p></div>
            <div><p className="text-xl font-bold">{user.stats.endorsements}</p><p className="text-sm text-gray-500">Endorsements</p></div>
        </div>
    </div>
);

const VerificationStatusCard: React.FC<{ verification: UserProfile['verification'] }> = ({ verification }) => {
    const statusMap: Record<VerificationStatus, { icon: React.ReactNode, text: string, color: string }> = {
        verified: { icon: <CheckCircleIcon className="w-5 h-5 text-green-500"/>, text: 'Verified', color: 'text-green-700' },
        unverified: { icon: <ExclamationTriangleIcon className="w-5 h-5 text-orange-500"/>, text: 'Not Connected', color: 'text-orange-700' },
        pending: { icon: <LoaderIcon className="w-5 h-5 text-gray-500 animate-spin"/>, text: 'Pending', color: 'text-gray-700' },
    };
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-amo-dark mb-4">Verification Status</h3>
            <div className="space-y-3">
                {Object.entries(verification).map(([platform, status]) => {
                    const typedStatus = status as VerificationStatus;
                    const statusInfo = statusMap[typedStatus];

                    return (
                        <div key={platform} className="flex items-center justify-between">
                            <span className="capitalize font-semibold text-gray-700">{platform}</span>
                            <div className="flex items-center gap-2">
                               {statusInfo.icon}
                               <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
                               {typedStatus !== 'verified' && <button className="text-xs font-bold text-amo-orange hover:underline">
                                   {typedStatus === 'pending' ? 'Check' : 'Connect'}
                                </button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SkillsCard: React.FC<{ skills: Skill[] }> = ({ skills }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-lg font-bold text-amo-dark">Your Skills</h3>
                <p className="text-sm text-gray-500">Add or update the skills that best describe your experience.</p>
            </div>
            <button className="bg-amo-orange text-white font-bold py-2 px-4 rounded-lg shadow text-sm">+ Add Skill</button>
        </div>
        <div className="space-y-4">
            {skills.map(skill => (
                <div key={skill.name} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-gray-800">{skill.name}</h4>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const ExperienceCard: React.FC<{ experiences: Experience[] }> = ({ experiences }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-amo-dark mb-4">Your Experiences</h3>
        {experiences.map(exp => (
            <div key={exp.company} className="flex gap-4 border-l-2 border-gray-200 pl-4 py-2 relative">
                 <div className="absolute -left-2 top-3 w-4 h-4 rounded-full bg-amo-orange border-2 border-white"></div>
                 <div>
                    <p className="font-bold">{exp.role} <span className="font-normal text-gray-600">at {exp.company}</span></p>
                    <p className="text-sm text-gray-500">{exp.period}</p>
                 </div>
            </div>
        ))}
    </div>
);

const CircularProgress: React.FC<{ percentage: number, size?: number, strokeWidth?: number }> = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle className="text-gray-200" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle className="text-amo-orange" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-amo-dark">{percentage}%</span>
            </div>
        </div>
    );
};

const SkillMatchScoreCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-amo-dark mb-4">Skill Match Score</h3>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                    <span>Startups</span>
                    <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amo-orange h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                    <span>Tech Investors</span>
                    <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amo-orange h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                    <span>Co-Founder Match</span>
                    <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amo-orange h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
            </div>
        </div>
    </div>
);


const ProfileScreen: React.FC = () => {
    return (
        <div>
            <ProfileHeader />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <main className="lg:col-span-2 space-y-8">
                    <ProfileOverviewCard user={userProfile} />
                    <SkillsCard skills={userProfile.skills} />
                    <ExperienceCard experiences={userProfile.experience} />
                </main>
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-amo-dark">Profile Strength</h3>
                        <div className="my-4"><CircularProgress percentage={userProfile.stats.completion} /></div>
                        <p className="text-sm text-gray-600">Moderate Profile — add more skills to improve visibility.</p>
                        <button className="mt-3 w-full bg-gray-100 text-gray-800 font-bold py-2 rounded-md hover:bg-gray-200">Complete Profile</button>
                    </div>
                    <VerificationStatusCard verification={userProfile.verification} />
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-amo-dark flex items-center gap-2 mb-4"><SparklesIcon className="w-5 h-5 text-amo-orange" /> AI Recommendations</h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                             <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span>Add 3 technical skills to boost visibility.</span></li>
                             <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span>Quantify your achievements with metrics.</span></li>
                        </ul>
                    </div>
                    <SkillMatchScoreCard />
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                         <h3 className="text-lg font-bold text-amo-dark mb-4">Quick Actions</h3>
                         <div className="space-y-3">
                            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-3 text-sm"><UploadIcon className="w-5 h-5" /> Upload Resume</button>
                            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-3 text-sm"><GitHubIcon className="w-5 h-5" /> Connect GitHub</button>
                            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-3 text-sm"><RocketIcon className="w-5 h-5" /> Generate AI Pitch</button>
                         </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ProfileScreen;