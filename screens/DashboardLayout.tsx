
import React from 'react';
import { Screen } from '../types';
import { 
    DocumentDuplicateIcon, ChartBarIcon, SunIcon, UserCircleIcon, CalendarIcon, 
    TagIcon, BriefcaseIcon, CogIcon 
} from '../components/Icons';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  screen: Screen;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  icon: React.ElementType;
  label: string;
}> = ({ screen, currentScreen, setCurrentScreen, icon: Icon, label }) => {
  const isActive = currentScreen === screen;
  return (
    <button
      onClick={() => setCurrentScreen(screen)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-sunai-orange/10 text-sunai-orange'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentScreen, setCurrentScreen }) => {
  return (
    <div className="min-h-screen flex bg-sunai-beige">
      <aside className="w-64 bg-white p-4 border-r border-gray-200 flex-col hidden lg:flex">
        <div className="flex items-center gap-2 px-3 mb-6">
            <div className="bg-sunai-dark p-2 rounded-lg">
                <SunIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-sunai-dark">Sun AI</h1>
        </div>
        <nav className="flex-grow space-y-1.5">
          <NavItem screen={Screen.Dashboard} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} icon={ChartBarIcon} label="Dashboard" />
          <NavItem screen={Screen.Profile} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} icon={UserCircleIcon} label="Profile" />
          <NavItem screen={Screen.MyEvents} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} icon={CalendarIcon} label="My Events" />
          <NavItem screen={Screen.Perks} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} icon={TagIcon} label="Perks" />
          <NavItem screen={Screen.JobBoard} currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} icon={BriefcaseIcon} label="Job Board" />
        </nav>
        <div className="mt-auto">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">
                <CogIcon className="w-5 h-5" /> Settings
            </button>
             <button onClick={() => setCurrentScreen(Screen.Home)} className="mt-2 w-full text-sm text-gray-500 hover:text-sunai-orange">
                Exit to Homepage
             </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
