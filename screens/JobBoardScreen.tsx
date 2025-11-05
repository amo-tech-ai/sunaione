import React, { useState } from 'react';
import { Job } from '../types';
import { 
    SearchIcon, MapPinIcon, BriefcaseIcon, CurrencyDollarIcon, 
    RocketIcon, GlobeAltIcon, BeakerIcon 
} from '../components/Icons';
import { useNavigate } from 'react-router-dom';

interface JobBoardScreenProps {
    jobs: Job[];
}

// Updated categories list for multi-select. "All" is now handled by an empty selection.
const categories = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];

const JobCard: React.FC<{ job: Job; onStartApply: (jobId: string) => void; }> = ({ job, onStartApply }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <img src={job.companyLogo} alt={`${job.companyName} logo`} className="w-8 h-8 object-contain" />
            </div>
            {job.isRemote && <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-800">Remote</span>}
        </div>
        <div className="flex-grow my-4">
            <h3 className="font-bold text-lg text-amo-dark">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{job.companyName}</p>
        </div>
        <div className="text-sm text-gray-500 space-y-2 mb-4">
            <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> <span>{job.location}</span></div>
            <div className="flex items-center gap-2"><BriefcaseIcon className="w-4 h-4" /> <span>{job.type}</span></div>
            <div className="flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4" /> <span>{job.salary}</span></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map(tag => (
                <span key={tag} className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">{tag}</span>
            ))}
        </div>
        <button 
            onClick={() => onStartApply(job.id)}
            className="w-full mt-auto bg-amo-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition-colors">
            Apply Now
        </button>
    </div>
);

const ValueCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <div className="bg-orange-100 text-amo-orange w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-amo-dark mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const JobBoardScreen: React.FC<JobBoardScreenProps> = ({ jobs }) => {
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryChange = (category: string) => {
        setSelectedCategories(prevSelected => {
            if (prevSelected.includes(category)) {
                return prevSelected.filter(c => c !== category);
            } else {
                return [...prevSelected, category];
            }
        });
    };

    const filteredJobs = jobs.filter(job => {
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(job.category);
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const onStartApply = (jobId: string) => {
        navigate(`/jobs/${jobId}/apply`);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-amo-dark">Job Board</h1>
                <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">Discover opportunities at AI startups and innovative companies around the world.</p>
                <div className="relative mt-6 max-w-2xl mx-auto">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search jobs, roles, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-amo-orange focus:border-transparent transition"
                    />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {categories.map(category => (
                        <label key={category} className="cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryChange(category)}
                            />
                            <div
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                    selectedCategories.includes(category)
                                        ? 'bg-amo-orange text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {category}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Job Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <JobCard key={job.id} job={job} onStartApply={onStartApply} />
                ))}
            </div>
             {filteredJobs.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-bold text-amo-dark">No jobs found</h3>
                    <p className="text-gray-600 mt-2">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Featured Partner Banner */}
            <div className="my-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div>
                    <h2 className="text-3xl font-bold">Featured Hiring Partner: Google for Startups</h2>
                    <p className="mt-2 text-gray-300">Empowering AI founders with cloud-backed tools and resources.</p>
                </div>
                <button className="mt-6 md:mt-0 bg-white text-amo-dark font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all flex-shrink-0">
                    View Open Roles
                </button>
            </div>
            
             {/* "Why Work" Section */}
            <section className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValueCard icon={BeakerIcon} title="Innovate Daily" description="Work on cutting-edge AI projects that shape the future." />
                    <ValueCard icon={RocketIcon} title="Grow Fast" description="Join agile teams where your work makes an immediate impact." />
                    <ValueCard icon={GlobeAltIcon} title="Global Talent Network" description="Collaborate with founders and developers worldwide." />
                </div>
            </section>
            
            {/* Employer CTA Section */}
            <section className="text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-200">
                 <h2 className="text-3xl font-bold text-amo-dark">Are you hiring AI talent?</h2>
                 <p className="text-lg text-gray-600 mt-2 mb-6">Post your openings and reach hundreds of startup founders and engineers using AMO AI.</p>
                 <button 
                    onClick={() => navigate('/jobs/post')}
                    className="bg-amo-orange text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-all">
                     Add Job Posting
                 </button>
                 <p className="text-sm text-gray-500 mt-3">Free for verified startups — launch your first listing today.</p>
             </section>
        </div>
    );
};

export default JobBoardScreen;