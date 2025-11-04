
import React, { useState, useCallback } from 'react';
import { Screen } from '../types';
import { PublicHeader } from './HomePage';
import Footer from '../components/Footer';
import { 
    DocumentDuplicateIcon, CogIcon, CheckCircleIcon, GlobeAltIcon, 
    UsersIcon, ChartBarIcon, ArrowRightIcon, ImageIcon 
} from '../components/Icons';

interface PostAJobScreenProps {
  setCurrentScreen: (screen: Screen) => void;
}

const PostAJobScreen: React.FC<PostAJobScreenProps> = ({ setCurrentScreen }) => {
  const [skills, setSkills] = useState<string[]>(['Python', 'Machine Learning']);
  const [skillInput, setSkillInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,$/, '');
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    // In a real app, you would handle the file upload here.
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log('File dropped:', files[0].name);
      // Placeholder for file handling logic
    }
  };


  const sidebarSteps = [
    { icon: DocumentDuplicateIcon, title: '1. Submit Job Post', description: 'Fill out the form with your job details.' },
    { icon: CogIcon, title: '2. System Validation', description: 'Our system checks for completeness.' },
    { icon: CheckCircleIcon, title: '3. Admin Review', description: 'A quick review by our team for quality.' },
    { icon: GlobeAltIcon, title: '4. Job Published', description: 'Your job goes live on our board.' },
    { icon: UsersIcon, title: '5. Candidate Applications', description: 'Receive applications from top talent.' },
    { icon: ChartBarIcon, title: '6. Track & Manage', description: 'Manage your postings and applicants.' },
  ];

  return (
    <div className="bg-sunai-beige">
      <PublicHeader onNavigate={setCurrentScreen} />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center pt-8 pb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-sunai-dark">Post a Job on Sun AI</h1>
            <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">Connect with top AI talent from the heart of the innovation ecosystem.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
              <h2 className="text-3xl font-bold text-sunai-dark mb-8">Submit Job Details</h2>
              <form className="space-y-8" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input type="text" id="job-title" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange" placeholder="e.g., Senior AI Engineer" />
                  </div>
                  <div>
                    <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" id="company-name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange" placeholder="Your Company Inc." />
                  </div>
                </div>
                <div>
                  <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea id="job-description" rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange" placeholder="Describe the role, responsibilities, and qualifications..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" id="location" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange" placeholder="e.g., San Francisco / Remote" />
                  </div>
                  <div>
                    <label htmlFor="employment-type" className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select id="employment-type" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange bg-white">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="salary-range" className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
                  <input type="text" id="salary-range" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange" placeholder="e.g., $120,000 - $160,000 USD" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg">
                        {skills.map(skill => (
                            <span key={skill} className="flex items-center gap-1.5 bg-orange-100 text-sunai-orange text-sm font-semibold px-2 py-1 rounded">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="font-bold text-sunai-orange hover:text-orange-700">×</button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            className="flex-grow p-1 outline-none bg-transparent"
                            placeholder="Add a skill..."
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="application-link" className="block text-sm font-medium text-gray-700 mb-1">Application Link or Email</label>
                    <input type="text" id="application-link" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunai-orange" placeholder="https://yourcompany.com/apply or jobs@company.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Company Logo (Optional)</label>
                    <div 
                      className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-sunai-orange bg-orange-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600"><span className="font-semibold text-sunai-orange">Upload a file</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-200 flex items-center gap-4">
                    <button type="submit" className="bg-sunai-orange text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-opacity-90 transition-all">Publish Job</button>
                    <button type="button" className="bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-50 transition-colors">Save as Draft</button>
                </div>
                 <p className="text-xs text-gray-500">All submissions are reviewed for accuracy and community relevance.</p>
              </form>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-sunai-dark mb-6">How It Works</h2>
                <div className="space-y-6">
                  {sidebarSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-sunai-orange rounded-full flex items-center justify-center">
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
           <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <div>
                    <h2 className="text-2xl font-bold text-sunai-dark">Need help attracting talent?</h2>
                    <p className="text-gray-600 mt-1">Our team can help you craft the perfect job description and promote it to our community.</p>
                </div>
                <button className="mt-4 md:mt-0 flex-shrink-0 bg-sunai-dark text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center gap-2">
                    Contact Our Recruitment Team <ArrowRightIcon className="w-4 h-4" />
                </button>
           </div>
        </div>
      </main>
      <Footer onNavigate={setCurrentScreen} />
    </div>
  );
};

export default PostAJobScreen;