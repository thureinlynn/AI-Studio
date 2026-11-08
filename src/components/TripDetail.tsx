import React, { useState } from 'react';
import { TripPost } from '../types/trip';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import {
  formatDateDisplay,
  getDropOffStatus,
  formatWhatsAppUrl,
  formatTelegramUrl,
  formatFacebookUrl,
  getFacebookDisplay,
  formatViberUrl,
} from '../utils/tripUtils';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MessageCircle,
  Send,
  PhoneCall,
  Facebook,
  CheckCircle2,
  AlertTriangle,
  Plane,
  MapPin,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  User,
} from 'lucide-react';

interface TripDetailProps {
  trip: TripPost;
}

export const TripDetail: React.FC<TripDetailProps> = ({ trip }) => {
  const { closeTripDetail, openSafetyModal, openPublicProfile } = useTrips();
  const { t, translateItem } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dropOffStatus = getDropOffStatus(trip.lastDropOffDate);

  const prefilledMsg = `Hi ${trip.traveler.name}, I found your trip from ${trip.departureCity} to ${trip.arrivalCity} on LuuKyone. I would like to inquire about sending a parcel with you. Is luggage space still available?`;

  const waUrl = formatWhatsAppUrl(trip.contacts.whatsapp, prefilledMsg);
  const tgUrl = formatTelegramUrl(trip.contacts.telegram);
  const fbUrl = formatFacebookUrl(trip.contacts.facebook);
  const viberUrl = formatViberUrl(trip.contacts.viber);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `LuuKyone: ${trip.departureCity} to ${trip.arrivalCity}`,
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detailBack')}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {copiedKey === 'share' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedKey === 'share' ? t('detailLinkCopied') : t('detailShare')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Route, Announcement, Dates, Guidelines (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Route Card */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                <Plane className="w-3.5 h-3.5" />
                <span>{t('brandSubtitle')}</span>
              </div>
            </div>

            {/* From -> To Headline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
              {/* Departure */}
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('detailDepartureCity')}</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  {trip.departureCity}
                </h2>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {trip.departureCountry}
                  {trip.departureAirportCode && <span className="ml-1 font-mono text-slate-700 dark:text-slate-300 font-semibold">({trip.departureAirportCode})</span>}
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-center px-4">
                <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 mb-1">
                  {trip.flightNumber || 'Direct Flight'}
                </span>
                <div className="w-24 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-blue-500 flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 rotate-45" />
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="sm:text-right">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('detailArrivalCity')}</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  {trip.arrivalCity}
                </h2>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {trip.arrivalCountry}
                  {trip.arrivalAirportCode && <span className="ml-1 font-mono text-slate-700 dark:text-slate-300 font-semibold">({trip.arrivalAirportCode})</span>}
                </div>
              </div>
            </div>

            {/* Key Handover & Delivery Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-2">
              {/* Last Drop Off Date */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-xs font-bold mb-1">
                  <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{t('detailLastDropOff')}</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {formatDateDisplay(trip.lastDropOffDate)}
                </div>
                <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                  {dropOffStatus.label}
                </div>
              </div>

              {/* Check-Out / Delivery Date */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('detailCheckOutDate')}</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {formatDateDisplay(trip.checkOutDate)}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {t('detailReadyPickup')}
                </div>
              </div>
            </div>
          </section>

          {/* Traveler's Announcement for the service */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {t('detailAnnouncementTitle')}
            </h3>
            <div className="p-4 bg-amber-50/60 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {trip.announcement}
            </div>

            {/* Handover & Pickup Meeting Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('detailDropOffHandover')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  {trip.dropOffLocationNote}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>{t('detailPickupLocation')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  {trip.pickUpLocationNote}
                </p>
              </div>
            </div>
          </section>

          {/* Items Accepted & Prohibited */}
          {/* Items Accepted & Prohibited */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('detailGuidelinesTitle')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accepted items */}
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('detailAccepted')}
                </span>
                <ul className="space-y-2">
                  {trip.acceptedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{translateItem(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prohibited items */}
              <div>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide block mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  {t('detailProhibited')}
                </span>
                <ul className="space-y-2">
                  {trip.prohibitedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{translateItem(item)}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{t('detailNeverAcceptNotice')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('detailSafetyNotice')}
              </span>
              <button
                onClick={openSafetyModal}
                className="text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                {t('detailReadSafetyGuide')}
              </button>
            </div>
          </section>

        </div>

        {/* Right Column: Traveler Profile & Direct Contact Buttons (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Traveler Profile Card (Clickable to view public profile) */}
          <section
            onClick={() => openPublicProfile(trip.traveler, trip.userId, trip.contacts)}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md transition-all group"
            title="Click to view public traveler profile & trip history"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('detailTravelerProfile')}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                {t('viewProfile')} &rarr;
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center ring-2 ring-blue-300 dark:ring-blue-700/60 shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-8 h-8 stroke-[2.2]" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {trip.traveler.name}
                  </h4>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('detailMemberSince')} {trip.traveler.memberSince}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold mt-1 text-slate-700 dark:text-slate-300">
                  <span>{trip.traveler.tripsCompleted} {t('cardTripsCompleted')}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium text-center pt-1">
              Click to view verified history & other trips
            </div>
          </section>

          {/* Direct Contact Buttons (WhatsApp, Telegram, Viber) */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('detailDirectContactTitle')}
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                Direct Links
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-normal">
              {t('detailDirectContactDesc')}
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
                    <span>{t('detailChatWhatsApp')}</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{trip.contacts.whatsapp}</span>
                    <button
                      onClick={() => copyToClipboard(trip.contacts.whatsapp, 'wa')}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'wa' ? t('detailCopied') : t('detailCopy')}</span>
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
                    <span>{t('detailMessageTelegram')}</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>@{trip.contacts.telegram.replace(/^@/, '')}</span>
                    <button
                      onClick={() => copyToClipboard(`@${trip.contacts.telegram.replace(/^@/, '')}`, 'tg')}
                      className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedKey === 'tg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'tg' ? t('detailCopied') : t('detailCopy')}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Facebook Button (Positioned below Telegram link as requested) */}
              {trip.contacts.facebook ? (
                <div className="space-y-1 pt-1">
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.98] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm shadow-[#1877F2]/30 transition-all cursor-pointer"
                  >
                    <Facebook className="w-5 h-5 fill-current" />
                    <span>{t('detailConnectFacebook')}</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="truncate max-w-[200px]">{getFacebookDisplay(trip.contacts.facebook)}</span>
                    <button
                      onClick={() => copyToClipboard(fbUrl, 'fb')}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-sans shrink-0"
                    >
                      {copiedKey === 'fb' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'fb' ? t('detailCopied') : t('detailCopy')}</span>
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
                    <span>{t('detailCallViber')}</span>
                  </a>
                  <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{trip.contacts.viber}</span>
                    <button
                      onClick={() => copyToClipboard(trip.contacts.viber, 'viber')}
                      className="text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedKey === 'viber' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'viber' ? t('detailCopied') : t('detailCopy')}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Safety Reminder */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 -mx-6 -mb-6 p-4 rounded-b-3xl text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed transition-colors">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Community Classified Notice:</span>
              LuuKyone is a free bulletin service. Please confirm parcel contents, legal customs allowances, and inspection procedures directly with the traveler before handing over items.
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
