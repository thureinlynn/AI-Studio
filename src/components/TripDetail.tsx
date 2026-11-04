import React, { useState } from 'react';
import { TripPost } from '../types/trip';
import { useTrips } from '../context/TripContext';
import {
  formatDateDisplay,
  getDropOffStatus,
  formatWhatsAppUrl,
  formatTelegramUrl,
  formatViberUrl,
} from '../utils/tripUtils';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Weight,
  MessageCircle,
  Send,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Plane,
  MapPin,
  Share2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface TripDetailProps {
  trip: TripPost;
}

export const TripDetail: React.FC<TripDetailProps> = ({ trip }) => {
  const { closeTripDetail, openSafetyModal } = useTrips();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dropOffStatus = getDropOffStatus(trip.lastDropOffDate);

  const prefilledMsg = `Hi ${trip.traveler.name}, I found your trip from ${trip.departureCity} to ${trip.arrivalCity} on LuggageShare. I would like to inquire about sending a parcel with you. Is luggage space still available?`;

  const waUrl = formatWhatsAppUrl(trip.contacts.whatsapp, prefilledMsg);
  const tgUrl = formatTelegramUrl(trip.contacts.telegram);
  const viberUrl = formatViberUrl(trip.contacts.viber);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `LuggageShare: ${trip.departureCity} to ${trip.arrivalCity}`,
        text: `Traveler ${trip.traveler.name} has ${trip.weightAvailableKg}kg luggage space from ${trip.departureCity} to ${trip.arrivalCity}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyToClipboard(window.location.href, 'share');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top back button & share */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={closeTripDetail}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Trips</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {copiedKey === 'share' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedKey === 'share' ? 'Link Copied!' : 'Share Trip'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Route, Announcement, Dates, Guidelines (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Route Card */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                <Plane className="w-3.5 h-3.5" />
                <span>Traveler Extra Baggage Classified</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-amber-300 rounded-xl text-xs font-bold tabular-nums">
                <Weight className="w-4 h-4 text-amber-400" />
                <span>{trip.weightAvailableKg} kg Available</span>
              </div>
            </div>

            {/* From -> To Headline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-100">
              {/* Departure */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Departure City</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  {trip.departureCity}
                </h2>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {trip.departureCountry}
                  {trip.departureAirportCode && <span className="ml-1 font-mono text-slate-700 font-semibold">({trip.departureAirportCode})</span>}
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-center px-4">
                <span className="text-[11px] font-mono font-medium text-slate-400 mb-1">
                  {trip.flightNumber || 'Direct Flight'}
                </span>
                <div className="w-24 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-amber-500 flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5 text-amber-600 rotate-45" />
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="sm:text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Arrival City</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  {trip.arrivalCity}
                </h2>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {trip.arrivalCountry}
                  {trip.arrivalAirportCode && <span className="ml-1 font-mono text-slate-700 font-semibold">({trip.arrivalAirportCode})</span>}
                </div>
              </div>
            </div>

            {/* Four Critical Timing Milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-2">
              {/* Last Drop Off Date */}
              <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold mb-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Last Drop-off</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatDateDisplay(trip.lastDropOffDate)}
                </div>
                <div className="text-[11px] font-semibold text-rose-600 mt-0.5">
                  {dropOffStatus.label}
                </div>
              </div>

              {/* Flight Date */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold mb-1">
                  <Plane className="w-3.5 h-3.5 text-slate-500" />
                  <span>Departure Date</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatDateDisplay(trip.departureDate)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Flight date
                </div>
              </div>

              {/* Arrival Date */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Arrival Date</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatDateDisplay(trip.arrivalDate)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Lands at destination
                </div>
              </div>

              {/* Check-Out / Delivery Date */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Check-Out Date</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {formatDateDisplay(trip.checkOutDate)}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                  Ready for pickup
                </div>
              </div>
            </div>
          </section>

          {/* Traveler's Information Announcement */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Information Announcement for This Trip
            </h3>
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
              {trip.announcement}
            </div>

            {/* Handover & Pickup Meeting Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Drop-Off Handover (Departure City)</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  {trip.dropOffLocationNote}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Check-Out Pickup (Arrival City)</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  {trip.pickUpLocationNote}
                </p>
              </div>
            </div>
          </section>

          {/* Items Accepted & Prohibited */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Item Guidelines & Customs Compliance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accepted items */}
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Accepted Parcel Categories
                </span>
                <ul className="space-y-2">
                  {trip.acceptedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prohibited items */}
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wide block mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Strictly Prohibited Items
                </span>
                <ul className="space-y-2">
                  {trip.prohibitedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-xs text-rose-800 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>Never accept uninspected sealed packages or illegal goods</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Inspect all parcels together in person at drop-off.
              </span>
              <button
                onClick={openSafetyModal}
                className="text-amber-700 font-bold hover:underline cursor-pointer"
              >
                Read Safety Guide
              </button>
            </div>
          </section>

        </div>

        {/* Right Column: Traveler Profile & Direct Contact Buttons (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Traveler Profile Card */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
              Traveler Profile
            </span>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={trip.traveler.avatarUrl || '/src/assets/images/traveler_profile_avatar_1793803079186.jpg'}
                  alt={trip.traveler.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/traveler_profile_avatar_1793803079186.jpg';
                  }}
                />
                {trip.traveler.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-white" title="Verified Traveler Identity">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900">{trip.traveler.name}</h4>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Member since {trip.traveler.memberSince}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold mt-1">
                  <span className="text-amber-600 flex items-center gap-0.5">
                    ★ {trip.traveler.rating.toFixed(2)}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-700">{trip.traveler.tripsCompleted} trips completed</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
              "{trip.traveler.bio}"
            </p>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-700">Languages:</span>
              {trip.traveler.languages.map((lang, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                  {lang}
                </span>
              ))}
            </div>
          </section>

          {/* Direct Contact Buttons (WhatsApp, Telegram, Viber) */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Direct Traveler Contact
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Direct Links
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-normal">
              Tap any button below to connect with <strong className="text-slate-800">{trip.traveler.name}</strong> directly on their verified messaging apps.
            </p>

            <div className="space-y-3">
              {/* WhatsApp Button */}
              {trip.contacts.whatsapp ? (
                <div className="space-y-1">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-mono">
                    <span>{trip.contacts.whatsapp}</span>
                    <button
                      onClick={() => copyToClipboard(trip.contacts.whatsapp, 'wa')}
                      className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'wa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Telegram Button */}
              {trip.contacts.telegram ? (
                <div className="space-y-1 pt-1">
                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm shadow-sky-500/30 transition-all cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                    <span>Message on Telegram</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-mono">
                    <span>@{trip.contacts.telegram.replace(/^@/, '')}</span>
                    <button
                      onClick={() => copyToClipboard(`@${trip.contacts.telegram.replace(/^@/, '')}`, 'tg')}
                      className="text-sky-600 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedKey === 'tg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'tg' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Viber Button */}
              {trip.contacts.viber ? (
                <div className="space-y-1 pt-1">
                  <a
                    href={viberUrl}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Connect on Viber</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-mono">
                    <span>{trip.contacts.viber}</span>
                    <button
                      onClick={() => copyToClipboard(trip.contacts.viber, 'viber')}
                      className="text-purple-700 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedKey === 'viber' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'viber' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Safety Reminder */}
            <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-3xl text-slate-600 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Community Classified Notice:</span>
              LuggageShare is a free bulletin service. Please confirm parcel weights, legal customs allowances, and inspection procedures directly with the traveler before handing over items.
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
