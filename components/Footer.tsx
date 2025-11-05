import React from 'react';
import { Screen } from '../types';
import { TwitterIcon, LinkedInIcon, GitHubIcon } from './Icons';

interface FooterProps {
  onNavigate: (screen: Screen) => void;
}

const AmoAILogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-3 font-poppins font-bold text-xl ${className}`}>
        <div className="bg-white p-1.5 rounded-md flex items-center justify-center w-8 h-8">
            <svg viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-amo-teal-dark">
                <path d="M8 1L0 13H2.5L4.5 8H11.5L13.5 13H16L8 1ZM5.5 6.5L8 2.5L10.5 6.5H5.5Z" fill="currentColor"/>
            </svg>
        </div>
        <span>AMO AI</span>
    </div>
);


const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-amo-dark text-white">
      <div className="max-w-7xl mx-auto py-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
                <AmoAILogo className="text-white" />
                <p className="mt-4 text-gray-400 text-sm">
                    Create Investor-Ready Pitch Decks in Minutes.
                </p>
            </div>
            <div>
                <h3 className="font-bold text-gray-300">Product</h3>
                <ul className="mt-4 space-y-2">
                    <li><button onClick={() => onNavigate(Screen.Welcome)} className="text-gray-400 hover:text-white text-sm">Create Deck</button></li>
                    <li><button onClick={() => onNavigate(Screen.Dashboard)} className="text-gray-400 hover:text-white text-sm">Dashboard</button></li>
                    <li><button onClick={() => onNavigate(Screen.Profile)} className="text-gray-400 hover:text-white text-sm">Profile</button></li>
                    <li><button onClick={() => onNavigate(Screen.Perks)} className="text-gray-400 hover:text-white text-sm">Perks</button></li>
                </ul>
            </div>
            <div>
                 <h3 className="font-bold text-gray-300">Community</h3>
                 <ul className="mt-4 space-y-2">
                    <li><button onClick={() => onNavigate(Screen.Events)} className="text-gray-400 hover:text-white text-sm">Events</button></li>
                    <li><button onClick={() => onNavigate(Screen.MyEvents)} className="text-gray-400 hover:text-white text-sm">My Events</button></li>
                    <li><button onClick={() => onNavigate(Screen.Blog)} className="text-gray-400 hover:text-white text-sm">Blog</button></li>
                    <li><button onClick={() => onNavigate(Screen.JobBoard)} className="text-gray-400 hover:text-white text-sm">Job Board</button></li>
                    <li><button onClick={() => onNavigate(Screen.PostAJob)} className="text-gray-400 hover:text-white text-sm">Post a Job</button></li>
                 </ul>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="text-gray-400 order-2 sm:order-1 mt-4 sm:mt-0">&copy; {new Date().getFullYear()} AMO AI. All rights reserved.</p>
          <div className="flex gap-5 text-gray-400 order-1 sm:order-2">
            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><TwitterIcon className="w-5 h-5" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><LinkedInIcon className="w-5 h-5" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-white transition-colors"><GitHubIcon className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;