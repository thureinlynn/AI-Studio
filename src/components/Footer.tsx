import React, { useState } from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RotateCcw, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openSafetyModal, setActiveTab, closeTripDetail, resetAllDataToDemoBeginning } = useTrips();
  const { resetAuth } = useAuth();
  const [justReset, setJustReset] = useState(false);

  const handleTab = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  const handleReset = () => {
    resetAuth();
    resetAllDataToDemoBeginning();
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-12 pb-20 md:pb-8 pt-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/1793174899099_3f8af047.png"
                alt="LuuKyone Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 block leading-tight">LuuKyone</span>
              <span className="text-[10px] text-slate-400 block">Free Traveler Classified Bulletin</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => handleTab('browse')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Browse Trips
            </button>
            <button
              onClick={() => handleTab('how_it_works')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={openSafetyModal}
              className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Safety & Baggage Rules</span>
            </button>
            <button
              onClick={handleReset}
              className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1 text-slate-400 hover:font-medium"
              title="Reset all local storage to original beginning state"
            >
              {justReset ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Demo Data Reset!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} LuuKyone. A free community connecting travelers with spare baggage space.
          </p>
          <p className="flex items-center gap-1">
            <span>Direct WhatsApp, Viber & Telegram contact</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

