import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { Home, PlusCircle, Plane, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openPostModal, openAuthModal, closeTripDetail } = useTrips();
  const { isAuthenticated } = useAuth();

  const handleTab = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => handleTab('browse')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'browse' ? 'text-amber-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Post Trip (Center highlight) */}
        <button
          onClick={openPostModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer text-amber-600 group"
        >
          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/40 group-active:scale-95 transition-transform">
            <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold text-slate-900">Post</span>
        </button>

        {/* My Trips */}
        <button
          onClick={() => handleTab('my_trips')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'my_trips' ? 'text-amber-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Plane className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">My Trips</span>
        </button>

        {/* Profile / Account */}
        <button
          onClick={openAuthModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer text-slate-500 hover:text-slate-900 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">{isAuthenticated ? 'Account' : 'Login'}</span>
        </button>
      </div>
    </div>
  );
};
