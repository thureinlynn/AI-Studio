import React from 'react';
import { useTrips } from '../context/TripContext';
import { Plane, Search, MessageSquare, Handshake, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowItWorksView: React.FC = () => {
  const { openPostModal, setActiveTab } = useTrips();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
          Peer-to-Peer Traveler Space
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3 tracking-tight">
          How LuggageShare Works
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          A completely free classified bulletin for travelers flying with empty luggage allowance to assist people sending packages worldwide.
        </p>
      </div>

      {/* 2-Column Split: For Senders & For Travelers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* For Senders */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">For Senders</h3>
              <p className="text-xs text-slate-500">Need to transport documents or goods abroad</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <Search className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">1. Search Your Destination Route</strong>
                Browse trips matching your departure city and arrival location. Filter by available weight capacity and dates.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">2. Direct One-Click Messaging</strong>
                Tap the WhatsApp, Telegram, or Viber button to message the traveler directly. No sign-up wall to reach travelers.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Handshake className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">3. Meet Before Last Drop-off Date</strong>
                Bring the package open for physical inspection. Meet the traveler at the agreed spot before their departure deadline.
              </div>
            </div>
          </div>
        </div>

        {/* For Travelers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">For Travelers</h3>
              <p className="text-xs text-slate-500">Have extra baggage allowance on your flight</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <Plane className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">1. Post Your Trip Classified</strong>
                Sign in and enter your flight cities, departure & arrival dates, drop-off deadline, check-out date, and spare kg.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">2. Set Clear Item Conditions</strong>
                Specify what you can carry (clothes, documents, snacks) and your preferred contact method (WhatsApp, Viber, Telegram).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">3. Hand Over at Destination</strong>
                Deliver the parcel to the recipient on the agreed check-out date at your destination city.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CTA Strip */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h3 className="text-lg font-bold text-white">
            Flying with spare luggage space?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Post your trip information in 2 minutes and connect directly with senders.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={openPostModal}
            className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>+ Post a Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Browse Listings
          </button>
        </div>
      </div>

    </div>
  );
};
