import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { Luggage, Plus, UserCheck, LogIn, ShieldAlert } from 'lucide-react';

export const Header: React.FC = () => {
  const { openPostModal, openAuthModal, openSafetyModal, activeTab, setActiveTab, closeTripDetail } = useTrips();
  const { user, isAuthenticated } = useAuth();

  const handleNavClick = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('browse')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-500/20">
            <Luggage className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              LuggageShare
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 block uppercase">
              Traveler Classifieds
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick('browse')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1 ${
              activeTab === 'browse' ? 'text-slate-950 font-semibold border-b-2 border-amber-500' : ''
            }`}
          >
            Browse Trips
          </button>
          <button
            onClick={() => handleNavClick('how_it_works')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1 ${
              activeTab === 'how_it_works' ? 'text-slate-950 font-semibold border-b-2 border-amber-500' : ''
            }`}
          >
            How It Works
          </button>
          <button
            onClick={openSafetyModal}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Safety Rules
          </button>
          {isAuthenticated && (
            <button
              onClick={() => handleNavClick('my_trips')}
              className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1 ${
                activeTab === 'my_trips' ? 'text-slate-950 font-semibold border-b-2 border-amber-500' : ''
              }`}
            >
              My Posts
            </button>
          )}
        </nav>

        {/* Zone 3: Actions - Prominent Post Trip + Auth */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openPostModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-amber-400/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post a Trip</span>
          </button>

          {isAuthenticated && user ? (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-xs font-medium cursor-pointer"
              title="Manage Account"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="hidden sm:inline font-semibold max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
