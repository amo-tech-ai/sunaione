import React from 'react';
import { Screen, Job } from '../types';
import { PublicHeader } from './HomePage';
import Footer from '../components/Footer';
import { CheckCircleIcon, ArrowRightIcon, DownloadIcon } from '../components/Icons';

interface ApplySuccessScreenProps {
    job: Job;
    setCurrentScreen: (screen: Screen) => void;
}

const ApplySuccessScreen: React.FC<ApplySuccessScreenProps> = ({ job, setCurrentScreen }) => {
    return (
        <div className="bg-sunai-beige font-sans min-h-screen flex flex-col">
            <style>{`
                .confetti {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background-color: #E96E32;
                    border-radius: 50%;
                    animation: fall 5s linear infinite;
                    opacity: 0;
                }
                .confetti:nth-child(2) { background-color: #0D2433; animation-delay: 0.5s; left: 10%; }
                .confetti:nth-child(3) { background-color: #FBBF24; animation-delay: 1s; left: 20%; }
                .confetti:nth-child(4) { background-color: #3B82F6; animation-delay: 1.5s; left: 30%; }
                .confetti:nth-child(5) { background-color: #E96E32; animation-delay: 2s; left: 40%; }
                .confetti:nth-child(6) { background-color: #0D2433; animation-delay: 2.5s; left: 50%; }
                .confetti:nth-child(7) { background-color: #FBBF24; animation-delay: 3s; left: 60%; }
                .confetti:nth-child(8) { background-color: #3B82F6; animation-delay: 3.5s; left: 70%; }
                .confetti:nth-child(9) { background-color: #E96E32; animation-delay: 4s; left: 80%; }
                .confetti:nth-child(10) { background-color: #0D2433; animation-delay: 4.5s; left: 90%; }
                @keyframes fall {
                    0% { transform: translateY(-100px) rotateZ(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
                }
            `}</style>
            <PublicHeader onNavigate={setCurrentScreen} />
            <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                {Array.from({ length: 10 }).map((_, i) => <div key={i} className="confetti" />)}
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 text-center">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
                    <h1 className="text-3xl md:text-4xl font-bold text-sunai-dark mt-6">Application Submitted!</h1>
                    <p className="text-lg text-gray-600 mt-3">
                        Your application for the <strong>{job.title}</strong> role at <strong>{job.companyName}</strong> has been successfully received.
                    </p>

                    <div className="text-left mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-sunai-dark mb-4">What happens next?</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-sunai-orange/10 text-sunai-orange font-bold text-lg rounded-full flex items-center justify-center">1</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Application Review</h3>
                                    <p className="text-sm text-gray-600">The hiring team at {job.companyName} will review your application.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-sunai-orange/10 text-sunai-orange font-bold text-lg rounded-full flex items-center justify-center">2</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">You'll be notified</h3>
                                    <p className="text-sm text-gray-600">You can expect to hear back within the next 1-2 weeks.</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-sunai-orange/10 text-sunai-orange font-bold text-lg rounded-full flex items-center justify-center">3</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Prepare for an interview</h3>
                                    <p className="text-sm text-gray-600">In the meantime, feel free to browse our blog for interview tips!</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setCurrentScreen(Screen.JobBoard)}
                            className="bg-sunai-dark text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            Back to Job Board <ArrowRightIcon className="w-4 h-4" />
                        </button>
                         <button
                            onClick={() => alert('Downloading a text summary... (demo)')}
                            className="bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            Download Submission Copy <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
            <Footer onNavigate={setCurrentScreen} />
        </div>
    );
};

export default ApplySuccessScreen;