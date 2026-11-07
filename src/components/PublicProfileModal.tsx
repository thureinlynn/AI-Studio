import React from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDisplay, isDropOffDatePassed } from '../utils/tripUtils';
import {
  X,
  User,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  MessageCircle,
  Send,
  PhoneCall,
  Facebook,
  ExternalLink,
  Luggage,
  ShieldCheck,
  Plane,
} from 'lucide-react';

export const PublicProfileModal: React.FC = () => {
  const { publicProfileTraveler, closePublicProfile, trips, openTripDetail } = useTrips();
  const { t } = useLanguage();

  if (!publicProfileTraveler) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Find all trips by this traveler (matching by userId or by name)
  const travelerTrips = trips.filter((trip) => {
    const matchUserId = publicProfileTraveler.userId && trip.userId === publicProfileTraveler.userId;
    const matchName = trip.traveler.name.trim().toLowerCase() === publicProfileTraveler.name.trim().toLowerCase();
    return matchUserId || matchName;
  });

  // Filter to trips that remain visible until their drop-off date passes and they automatically expire
  const visibleTrips = travelerTrips.filter((trip) => {
    return !isDropOffDatePassed(trip.lastDropOffDate);
  });

  const activeTrips = visibleTrips.filter((t) => t.status === 'active');
  const bookedOrCompletedTrips = visibleTrips.filter((t) => t.status !== 'active');

  const contacts = publicProfileTraveler.contacts || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('publicProfileTitle')}
            </h3>
          </div>
          <button
            onClick={closePublicProfile}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {/* Identity Card */}
          <div className="p-5 bg-gradient-to-br from-blue-50/70 via-sky-50/50 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 rounded-3xl border border-blue-100/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center ring-2 ring-blue-300 dark:ring-blue-700/60 shrink-0">
                  <User className="w-8 h-8 stroke-[2.2]" />
                </div>
                {publicProfileTraveler.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-white dark:ring-slate-900" title="Verified Traveler">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                    {publicProfileTraveler.name}
                  </h4>
                  {publicProfileTraveler.isVerified && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('detailMemberSince')} {publicProfileTraveler.memberSince || '2026'}
                </div>
                <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5" />
                  <span>{publicProfileTraveler.tripsCompleted || visibleTrips.length || 1} {t('cardTripsCompleted')}</span>
                </div>
              </div>
            </div>

            {publicProfileTraveler.bio && (
              <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700 leading-relaxed">
                "{publicProfileTraveler.bio}"
              </p>
            )}

            {/* Direct Contact Channels */}
            {(contacts.whatsapp || contacts.telegram || contacts.viber) && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('detailDirectContactTitle')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {contacts.whatsapp && (
                    <a
                      href={`https://wa.me/${contacts.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {contacts.telegram && (
                    <a
                      href={`https://t.me/${contacts.telegram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  )}
                  {contacts.facebook && (
                    <a
                      href={contacts.facebook.startsWith('http') ? contacts.facebook : `https://facebook.com/${contacts.facebook.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <Facebook className="w-3.5 h-3.5 fill-current" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {contacts.viber && (
                    <a
                      href={`viber://chat?number=%2B${contacts.viber.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Viber</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trip History Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Luggage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t('publicTripHistoryTitle')}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('publicTripHistoryDesc')}
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                {visibleTrips.length} {visibleTrips.length === 1 ? 'Trip' : 'Trips'}
              </span>
            </div>

            {visibleTrips.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-500">
                {t('publicNoTrips')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Active Trips */}
                {activeTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => {
                      closePublicProfile();
                      openTripDetail(trip.id);
                    }}
                    className="p-3.5 bg-white dark:bg-slate-800 hover:bg-sky-50/50 dark:hover:bg-slate-700/60 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <span className="truncate">{trip.departureCity}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="truncate">{trip.arrivalCity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDateDisplay(trip.departureDate)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-500" />
                          Drop-off: {formatDateDisplay(trip.lastDropOffDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {t('statusActive')}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))}

                {/* Completed or Booked Trips */}
                {bookedOrCompletedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => {
                      closePublicProfile();
                      openTripDetail(trip.id);
                    }}
                    className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 transition-all cursor-pointer flex items-center justify-between gap-3 group opacity-85"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        <span className="truncate">{trip.departureCity}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{trip.arrivalCity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span>{formatDateDisplay(trip.departureDate)}</span>
                        <span>·</span>
                        <span>Drop-off: {formatDateDisplay(trip.lastDropOffDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {t('statusBooked')}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
