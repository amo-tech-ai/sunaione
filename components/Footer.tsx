import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, LinkedInIcon, GitHubIcon } from './Icons';
import { FooterLogo } from './Logo';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-amo-dark text-white">
      <div className="max-w-7xl mx-auto py-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
                <FooterLogo />
                <p className="mt-4 text-gray-400 text-sm">
                    Create Investor-Ready Pitch Decks in Minutes.
                </p>
            </div>
            <div>
                <h3 className="font-bold text-gray-300">Product</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link to="/create-deck" className="text-gray-400 hover:text-white text-sm">Create Deck</Link></li>
                    <li><Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
                    <li><Link to="/profile" className="text-gray-400 hover:text-white text-sm">Profile</Link></li>
                    <li><Link to="/perks" className="text-gray-400 hover:text-white text-sm">Perks</Link></li>
                </ul>
            </div>
            <div>
                 <h3 className="font-bold text-gray-300">Community</h3>
                 <ul className="mt-4 space-y-2">
                    <li><Link to="/events" className="text-gray-400 hover:text-white text-sm">Events</Link></li>
                    <li><Link to="/my-events" className="text-gray-400 hover:text-white text-sm">My Events</Link></li>
                    <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
                    <li><Link to="/jobs" className="text-gray-400 hover:text-white text-sm">Job Board</Link></li>
                    <li><Link to="/jobs/post" className="text-gray-400 hover:text-white text-sm">Post a Job</Link></li>
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
