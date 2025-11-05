import React, { useState, useEffect, useCallback } from 'react';
import { Job, JobApplication } from '../types';
import { PublicHeader } from './HomePage';
import Footer from '../components/Footer';
import { 
    ChevronLeftIcon, ArrowRightIcon, DocumentTextIcon, XMarkIcon, 
    UploadIcon, CheckCircleIcon, BriefcaseIcon, MapPinIcon, CurrencyDollarIcon 
} from '../components/Icons';
import { useNavigate } from 'react-router-dom';

interface ApplyScreenProps {
    job: Job;
    onSuccess: (navigate: (path: string) => void) => void;
}

const initialFormData: JobApplication = {
    fullName: '',
    email: '',
    resume: null,
    coverLetter: '',
    yearsOfExperience: '',
    portfolioUrl: '',
    skills: [],
    locationPreference: 'Onsite',
    salaryExpectation: '',
};

const ApplyScreen: React.FC<ApplyScreenProps> = ({ job, onSuccess }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<JobApplication>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDragging, setIsDragging] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    const storageKey = `amo_apply_${job.id}`;

    useEffect(() => {
        try {
            const savedDraft = localStorage.getItem(storageKey);
            if (savedDraft) {
                setFormData(JSON.parse(savedDraft));
            }
        } catch (error) {
            console.error("Failed to load draft from localStorage", error);
        }
    }, [storageKey]);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(formData));
        } catch (error) {
            console.error("Failed to save draft to localStorage", error);
        }
    }, [formData, storageKey]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
        if (!formData.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
        if (!formData.resume) newErrors.resume = "A resume is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required.";
        if (formData.portfolioUrl && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(formData.portfolioUrl)) {
            newErrors.portfolioUrl = "Please enter a valid URL.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        if (step === 2 && validateStep2()) setStep(3);
    };

    const handleBack = () => setStep(prev => Math.max(1, prev - 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to a server
        console.log("Submitting application:", formData);
        localStorage.removeItem(storageKey); // Clear draft on successful submission
        onSuccess(navigate);
    };

    // File handling logic
    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setErrors(prev => ({ ...prev, resume: "File size must be under 5MB." }));
                return;
            }
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                setErrors(prev => ({ ...prev, resume: "Only PDF and DOCX files are allowed." }));
                return;
            }
            setFormData(prev => ({ ...prev, resume: { name: file.name, size: file.size } }));
            setErrors(prev => ({...prev, resume: ''}));
        }
    };
    
    const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => e.preventDefault();
    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    // Skill tag logic
    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
            e.preventDefault();
            const newSkill = skillInput.trim().replace(/,$/, '');
            if (newSkill && !formData.skills.includes(newSkill)) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
            }
            setSkillInput('');
        }
    };
    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const isNextDisabled = () => {
      if (step === 1) return !formData.fullName || !formData.email || !formData.resume;
      if (step === 2) return !formData.yearsOfExperience;
      return false;
    };
    
    return (
        <div className="bg-amo-beige font-sans">
            <PublicHeader />
            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-amo-dark">Apply for {job.title}</h1>
                        <p className="text-gray-600">Step {step} of 3</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-amo-orange h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </header>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                            <form onSubmit={handleSubmit}>
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-amo-dark">Personal Information</h2>
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} required className={`w-full p-3 border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
                                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Resume/CV</label>
                                            {formData.resume ? (
                                                <div className="flex items-center justify-between p-3 border border-green-300 bg-green-50 rounded-lg">
                                                    <div className="flex items-center gap-2 text-green-800">
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                        <span className="font-medium">{formData.resume.name}</span>
                                                    </div>
                                                    <button onClick={() => setFormData(prev => ({...prev, resume: null}))} className="text-sm font-bold text-red-600 hover:underline">Remove</button>
                                                </div>
                                            ) : (
                                                <label onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop} className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-amo-orange bg-orange-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}>
                                                    <UploadIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                                    <p className="mt-2 text-sm text-gray-600"><span className="font-semibold text-amo-orange">Upload a file</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500">PDF, DOCX up to 5MB</p>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.doc,.docx" />
                                                </label>
                                            )}
                                             {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">Why are you interested in this role? (Optional)</label>
                                            <textarea name="coverLetter" id="coverLetter" rows={4} value={formData.coverLetter} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-amo-dark">Experience & Skills</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                                <select name="yearsOfExperience" id="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} required className={`w-full p-3 border rounded-lg bg-white ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}>
                                                    <option value="">Select an option</option>
                                                    <option value="0-1">0-1 years</option>
                                                    <option value="1-3">1-3 years</option>
                                                    <option value="3-5">3-5 years</option>
                                                    <option value="5-10">5-10 years</option>
                                                    <option value="10+">10+ years</option>
                                                </select>
                                                {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL (Optional)</label>
                                                <input type="url" name="portfolioUrl" id="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} className={`w-full p-3 border rounded-lg ${errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://"/>
                                                 {errors.portfolioUrl && <p className="text-red-500 text-sm mt-1">{errors.portfolioUrl}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills</label>
                                            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg">
                                                {formData.skills.map(skill => (
                                                    <span key={skill} className="flex items-center gap-1.5 bg-orange-100 text-amo-orange text-sm font-semibold px-2 py-1 rounded">
                                                        {skill}
                                                        <button type="button" onClick={() => removeSkill(skill)}><XMarkIcon className="w-4 h-4 text-amo-orange hover:text-orange-700"/></button>
                                                    </span>
                                                ))}
                                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} className="flex-grow p-1 outline-none bg-transparent" placeholder="e.g., Figma, Python..." />
                                            </div>
                                        </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div>
                                                <label htmlFor="locationPreference" className="block text-sm font-medium text-gray-700 mb-1">Location Preference</label>
                                                <select name="locationPreference" id="locationPreference" value={formData.locationPreference} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                                                    <option>Onsite</option>
                                                    <option>Remote</option>
                                                    <option>Hybrid</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="salaryExpectation" className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation (Optional)</label>
                                                <input type="text" name="salaryExpectation" id="salaryExpectation" value={formData.salaryExpectation} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., $150,000 USD"/>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-amo-dark">Review & Submit</h2>
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div><p className="text-sm text-gray-500">Full Name</p><p className="font-semibold">{formData.fullName}</p></div>
                                            <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold">{formData.email}</p></div>
                                            <div><p className="text-sm text-gray-500">Resume</p><p className="font-semibold">{formData.resume?.name}</p></div>
                                            <div><p className="text-sm text-gray-500">Years of Experience</p><p className="font-semibold">{formData.yearsOfExperience}</p></div>
                                            <div><p className="text-sm text-gray-500">Skills</p><p className="font-semibold">{formData.skills.join(', ')}</p></div>
                                        </div>
                                        <div className="flex items-start">
                                            <input id="confirmation" type="checkbox" required className="h-4 w-4 text-amo-orange border-gray-300 rounded focus:ring-amo-orange mt-1" />
                                            <label htmlFor="confirmation" className="ml-2 block text-sm text-gray-900">I confirm the information provided is accurate.</label>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                                    <button type="button" onClick={handleBack} disabled={step === 1} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50">
                                        <ChevronLeftIcon className="w-5 h-5"/> Back
                                    </button>
                                    {step < 3 ? (
                                        <button type="button" onClick={handleNext} disabled={isNextDisabled()} className="bg-amo-orange text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:bg-gray-400">
                                            Next <ArrowRightIcon className="w-5 h-5"/>
                                        </button>
                                    ) : (
                                        <button type="submit" className="bg-amo-orange text-white font-bold py-2 px-6 rounded-lg">Submit Application</button>
                                    )}
                                </div>
                            </form>
                        </div>
                        
                        <aside className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-amo-dark mb-4">Role Summary</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={job.companyLogo} alt={`${job.companyName} logo`} className="w-12 h-12 object-contain bg-gray-100 rounded-lg p-1"/>
                                    <div>
                                        <h4 className="font-bold">{job.title}</h4>
                                        <p className="text-sm text-gray-600">{job.companyName}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-2 border-t pt-4">
                                    <p className="flex items-center gap-2"><MapPinIcon className="w-4 h-4"/>{job.location}</p>
                                    <p className="flex items-center gap-2"><BriefcaseIcon className="w-4 h-4"/>{job.type}</p>
                                    <p className="flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4"/>{job.salary}</p>
                                </div>
                            </div>
                             <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24 mt-6">
                                <h3 className="text-lg font-bold text-amo-dark mb-4">Application Tips</h3>
                                <ul className="space-y-3 text-sm text-gray-600 list-disc list-inside">
                                    <li>Tailor your resume to highlight relevant AI/ML project experience.</li>
                                    <li>Quantify your achievements with metrics where possible.</li>
                                    <li>Double-check for typos before submitting.</li>
                                </ul>
                             </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ApplyScreen;