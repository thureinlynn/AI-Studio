import React from 'react';
import { TripPost } from '../types/trip';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDisplay, countCompletedTripsForTraveler } from '../utils/tripUtils';
import { getDicebearAvatar, normalizeAvatarUrl, UNCLE_AVATAR_URL, isAdminAccount, isGoogleVerifiedUser } from '../utils/userUtils';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';
import { ArrowRight, Calendar, Clock, ChevronRight, User } from 'lucide-react';

interface TripCardProps {
  trip: TripPost;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const { openTripDetail, openPublicProfile, trips } = useTrips();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isGoogle = isGoogleVerifiedUser(trip.traveler) || isGoogleVerifiedUser({ id: trip.userId });
  const isAuthorAdmin =
    !isGoogle && (isAdminAccount(trip.traveler) ||
    isAdminAccount(trip.userId) ||
    (user && user.id === trip.userId && isAdminAccount(user)));
  const authorAvatar = isGoogle && trip.traveler.avatarUrl && !trip.traveler.avatarUrl.includes('uncle_avatar')
    ? trip.traveler.avatarUrl
    : isAuthorAdmin
    ? UNCLE_AVATAR_URL
    : normalizeAvatarUrl(trip.traveler.avatarUrl, trip.userId || trip.traveler.name, trip.traveler);

  return (
    <article
      onClick={() => openTripDetail(trip.id)}
      className="group bg-[#f0f7ff] dark:bg-slate-900/90 hover:bg-[#e4f1ff] dark:hover:bg-slate-800/90 rounded-2xl border border-sky-200/80 dark:border-slate-800 hover:border-sky-400/90 dark:hover:border-sky-500/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        {/* Top Header: Route & Flight */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-800 dark:group-hover:text-sky-300 transition-colors">
              <span>{trip.departureCity}</span>
              <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              <span>{trip.arrivalCity}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span>{trip.departureCountry}</span>
              <span aria-hidden="true">·</span>
              <span>{trip.arrivalCountry}</span>
              {trip.weightAvailableKg > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 text-[11px]">
                    {trip.weightAvailableKg} kg space
                  </span>
                </>
              ) : trip.flightNumber ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-sky-100 dark:border-slate-700">
                    {trip.flightNumber}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Critical Dates Matrix */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-white/85 dark:bg-slate-800/80 rounded-xl mb-4 border border-sky-100 dark:border-slate-700 text-xs">
          <div>
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-400 text-[11px] font-medium mb-0.5">
              <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>{t('cardDropOff')}</span>
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDateDisplay(trip.lastDropOffDate)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-400 text-[11px] font-medium mb-0.5">
              <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{t('cardDelivery')}</span>
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDateDisplay(trip.checkOutDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Traveler Profile Snapshot & Details Action */}
      <div className="pt-3 border-t border-sky-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
        {/* Traveler Profile Snapshot (clickable to view public traveler profile) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPublicProfile(trip.traveler, trip.userId, trip.contacts, trip.traveler.createdAt);
          }}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity focus:outline-hidden group/author"
          title={`View ${trip.traveler.name}'s profile and trip history`}
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ring-1 ring-sky-200 dark:ring-slate-700 shrink-0 overflow-hidden group-hover/author:ring-blue-400">
              <img
                src={authorAvatar}
                alt={trip.traveler.name}
                className="w-full h-full object-cover p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {isGoogle && (
              <div className="absolute -bottom-1 -right-1">
                <GoogleVerifiedBadge size="xs" />
              </div>
            )}
          </div>
          <div className="truncate text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover/author:text-blue-600 dark:group-hover/author:text-blue-400 flex items-center gap-1">
              <span className="truncate">{trip.traveler.name}</span>
              {isGoogle && <GoogleVerifiedBadge size="xs" />}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <span>{countCompletedTripsForTraveler(trips, { name: trip.traveler.name, userId: trip.userId })} {t('cardTripsCompleted')}</span>
            </div>
          </div>
        </button>

        {/* View Details Action Indicator */}
        <div className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 shrink-0">
          <span className="hidden sm:inline">{t('cardDetails')}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
};
