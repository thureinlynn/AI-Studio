import React, { useState, useMemo, useEffect } from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDisplay, isDropOffDatePassed, countCompletedTripsForTraveler, formatMemberSince } from '../utils/tripUtils';
import { useTravelerAccountDate, normalizeAvatarUrl, handleAvatarImageError, isGoogleVerifiedUser } from '../utils/userUtils';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';
import {
  X,
  User,
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const PublicProfileModal: React.FC = () => {
  const { publicProfileTraveler, closePublicProfile, trips, openTripDetail } = useTrips();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Resolve authentic account creation date for traveler profile
  const travelerAccount = useTravelerAccountDate(
    publicProfileTraveler?.userId,
    publicProfileTraveler?.name,
    publicProfileTraveler?.createdAt || publicProfileTraveler?.memberSince
  );

  // Pagination state: declared at top level to obey React Rules of Hooks
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever traveler profile changes
  useEffect(() => {
    setCurrentPage(1);
  }, [publicProfileTraveler?.userId, publicProfileTraveler?.name]);

  // Find all trips by this traveler (matching by userId or by name)
  const travelerTrips = useMemo(() => {
    if (!publicProfileTraveler) return [];
    return trips.filter((trip) => {
      const matchUserId = publicProfileTraveler.userId && trip.userId === publicProfileTraveler.userId;
      const matchName = trip.traveler.name.trim().toLowerCase() === publicProfileTraveler.name.trim().toLowerCase();
      return matchUserId || matchName;
    });
  }, [trips, publicProfileTraveler]);

  // Other active trips: Another user cannot view disappeared/finished trips in the history, only active trips.
  const activeTrips = useMemo(() => {
    return travelerTrips.filter((trip) => trip.status === 'active' && !isDropOffDatePassed(trip.lastDropOffDate));
  }, [travelerTrips]);

  // Displayed trips for public traveler profile: only active trips
  const displayedTrips = activeTrips;

  // If no traveler is selected, return null AFTER all hooks have executed
  if (!publicProfileTraveler) return null;

  const totalPages = Math.max(1, Math.ceil(displayedTrips.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTrips = displayedTrips.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Count trips that completed (disappeared from active board after drop-off date or marked completed)
  const completedCount = countCompletedTripsForTraveler(trips, {
    name: publicProfileTraveler.name,
    userId: publicProfileTraveler.userId,
  });

  const contacts = publicProfileTraveler.contacts || {};

  const isOwnProfile = Boolean(user && publicProfileTraveler.userId && user.id === publicProfileTraveler.userId);
  const isGoogleVerified = isGoogleVerifiedUser(
    isOwnProfile ? { ...publicProfileTraveler, ...user } : publicProfileTraveler
  );
  const travelerAvatar = normalizeAvatarUrl(
    isOwnProfile ? user!.avatarUrl : publicProfileTraveler.avatarUrl,
    publicProfileTraveler.userId || publicProfileTraveler.name,
    isOwnProfile ? user : publicProfileTraveler
  );

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
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center ring-2 ring-blue-300 dark:ring-blue-700/60 shrink-0 overflow-hidden shadow-xs">
                  <img
                    src={travelerAvatar}
                    alt={publicProfileTraveler.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover p-0.5 bg-white dark:bg-slate-800"
                    onError={(e) => handleAvatarImageError(e, publicProfileTraveler.userId || publicProfileTraveler.name)}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                    {publicProfileTraveler.name}
                  </h4>
                  {isGoogleVerified && <GoogleVerifiedBadge />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('detailMemberSince')} {travelerAccount.formattedMemberSince}
                </div>
                <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5" />
                  <span>{completedCount} {t('cardTripsCompleted')}</span>
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

          {/* Other Active Trips Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Luggage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Other active trips</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('publicTripHistoryDesc')}
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full tabular-nums">
                {displayedTrips.length} {displayedTrips.length === 1 ? 'Trip' : 'Trips'}
                {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}
              </span>
            </div>

            {displayedTrips.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-500">
                {t('publicNoTrips')}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {paginatedTrips.map((trip) => {
                    const isActive = trip.status === 'active' && !isDropOffDatePassed(trip.lastDropOffDate);

                    return (
                      <div
                        key={trip.id}
                        onClick={() => {
                          closePublicProfile();
                          openTripDetail(trip.id);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 hover:bg-sky-50/50 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 border-slate-200/70 dark:border-slate-700/70 opacity-85'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className={`flex items-center gap-1.5 text-xs ${isActive ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                            <span className="truncate">{trip.departureCity}</span>
                            <ArrowRight className={`w-3 h-3 text-slate-400 ${isActive ? 'group-hover:text-blue-600' : ''} transition-colors`} />
                            <span className="truncate">{trip.arrivalCity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className={`w-3 h-3 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                              Drop-off: {formatDateDisplay(trip.lastDropOffDate)}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Delivery: {formatDateDisplay(trip.checkOutDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isActive
                              ? t('statusActive')
                              : trip.status === 'fully_booked'
                              ? t('statusBooked')
                              : isDropOffDatePassed(trip.lastDropOffDate)
                              ? 'Drop-off Closed'
                              : t('statusCompleted')}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Numbered Pagination with Previous and Next Buttons */}
                {totalPages > 1 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, displayedTrips.length)} of {displayedTrips.length} trips
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer font-semibold text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center tabular-nums ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      {/* Next Page Button */}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer font-semibold text-xs"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
