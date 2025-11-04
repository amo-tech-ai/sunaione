import React from 'react';
import { Screen } from '../types';
import { SunIcon, TwitterIcon, LinkedInIcon, GitHubIcon } from './Icons';

interface FooterProps {
  onNavigate: (screen: Screen) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  type LinkItem = {
    label: string;
    screen?: Screen;
    external?: boolean;
    href?: string;
  };

  const quickLinks: LinkItem[] = [
    { label: 'Founders', screen: Screen.Profile },
    { label: 'Startups', screen: Screen.Dashboard },
    { label: 'Member Profiles', screen: Screen.Profile },
    { label: 'Events', screen: Screen.Events },
    { label: 'Jobs', screen: Screen.JobBoard },
    { label: 'Perks & Deals', screen: Screen.Perks },
    { label: 'About Us', screen: Screen.Home },
    { label: 'Contact', screen: Screen.Home },
  ];

  const dashboards: LinkItem[] = [
    { label: 'My Dashboard', screen: Screen.Dashboard },
    { label: 'My Events', screen: Screen.MyEvents },
    { label: 'My Pitch Decks', screen: Screen.Dashboard },
    { label: 'Jobs Board', screen: Screen.JobBoard },
    { label: 'Perks', screen: Screen.Perks },
    { label: 'Settings', screen: Screen.Profile },
  ];

  const community: LinkItem[] = [
    { label: 'Join WhatsApp', external: true, href: '#' },
    { label: 'Join Slack', external: true, href: '#' },
    { label: 'LinkedIn Group', external: true, href: '#' },
    { label: 'Newsletter', external: true, href: '#' },
  ];

  const FooterColumn: React.FC<{ title: string; links: LinkItem[] }> = ({ title, links }) => (
    <div>
      <h3 className="font-bold uppercase text-sm text-gray-400 tracking-wider">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map(link => (
          <li key={link.label}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm">{link.label}</a>
            ) : (
              <button onClick={() => link.screen && onNavigate(link.screen)} className="text-gray-300 hover:text-white transition-colors text-sm">{link.label}</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-sunai-teal-dark text-white">
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div>
             <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-md">
                    <SunIcon className="w-5 h-5 text-sunai-dark" />
                </div>
                <span className="font-bold text-xl text-white">Sun AI</span>
            </div>
            <p className="mt-4 text-gray-300 text-sm max-w-xs">
              Building the future of AI through community, education, and innovation.
            </p>
          </div>

          {/* Columns 2, 3, 4 */}
          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Dashboards" links={dashboards} />
          <FooterColumn title="Community" links={community} />
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="text-gray-400 order-2 sm:order-1 mt-4 sm:mt-0">&copy; {new Date().getFullYear()} Sun AI. All rights reserved.</p>
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