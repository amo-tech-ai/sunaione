import React from 'react';
import { Screen } from '../types';
import { 
    UserCircleIcon, SparklesIcon, CalendarIcon, 
    // Fix: Added BriefcaseIcon and new TagIcon import
    BriefcaseIcon, TagIcon, ChatBubbleLeftRightIcon
} from '../components/Icons';
import Footer from '../components/Footer';

// Placeholder for real icons
const DeckIcon = SparklesIcon; 

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    screen: Screen;
    currentScreen: Screen;
    setCurrentScreen: (screen: Screen) => void;
}> = ({ icon: Icon, label, screen, currentScreen, setCurrentScreen }) => {
    const isActive = currentScreen === screen;
    return (
        <button
            onClick={() => setCurrentScreen(screen)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                    ? 'bg-sunai-orange/10 text-sunai-orange'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};


const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentScreen, setCurrentScreen }) => {
  return (
    <div className="flex h-screen bg-sunai-beige">
      <aside className="w-64 bg-white p-4 border-r border-gray-200 flex flex-col">
        <div className="font-bold text-2xl text-sunai-dark px-2 py-4">Sun AI</div>
        <nav className="flex-1 space-y-2 mt-8">
            <NavItem icon={DeckIcon} label="My Decks" screen={Screen.Dashboard} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            <NavItem icon={UserCircleIcon} label="My Profile" screen={Screen.Profile} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            <NavItem icon={CalendarIcon} label="Events" screen={Screen.Events} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            <NavItem icon={TagIcon} label="Perks" screen={Screen.Perks} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            <NavItem icon={BriefcaseIcon} label="Jobs" screen={Screen.JobBoard} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
            <NavItem icon={ChatBubbleLeftRightIcon} label="Blog" screen={Screen.Blog} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
        </nav>
        <div className="mt-auto">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
                <h4 className="font-bold text-sm">Upgrade to Pro</h4>
                <p className="text-xs text-gray-500 mt-1">Unlock advanced AI features and analytics.</p>
                <button className="mt-3 w-full bg-sunai-dark text-white text-xs font-bold py-2 rounded-md hover:bg-black">Upgrade</button>
            </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-grow p-8">
            {children}
        </div>
        <Footer onNavigate={setCurrentScreen} />
      </main>
    </div>
  );
};

export default DashboardLayout;