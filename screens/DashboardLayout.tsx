import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
    ChartBarIcon, SunIcon, UserCircleIcon, CalendarIcon, 
    TagIcon, BriefcaseIcon, CogIcon 
} from '../components/Icons';

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string; }> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/dashboard' && location.pathname.startsWith('/dashboard/decks'));
  
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-amo-orange/10 text-amo-orange'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-amo-beige">
      <aside className="w-64 bg-white p-4 border-r border-gray-200 flex-col hidden lg:flex">
        <div className="flex items-center gap-2 px-3 mb-6">
            <div className="bg-amo-dark p-2 rounded-lg">
                <SunIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-amo-dark">AMO AI</h1>
        </div>
        <nav className="flex-grow space-y-1.5">
          <NavItem to="/dashboard" icon={ChartBarIcon} label="Dashboard" />
          <NavItem to="/dashboard/profile" icon={UserCircleIcon} label="Profile" />
          <NavItem to="/dashboard/my-events" icon={CalendarIcon} label="My Events" />
          <NavItem to="/jobs" icon={BriefcaseIcon} label="Job Board" />
        </nav>
        <div className="mt-auto">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">
                <CogIcon className="w-5 h-5" /> Settings
            </button>
             <button onClick={() => navigate('/')} className="mt-2 w-full text-sm text-gray-500 hover:text-amo-orange">
                Exit to Homepage
             </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;