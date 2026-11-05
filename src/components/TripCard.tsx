import React from 'react';
import { TripPost } from '../types/trip';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDisplay } from '../utils/tripUtils';
import { ArrowRight, Calendar, Clock, ChevronRight, CheckCircle2, User } from 'lucide-react';

interface TripCardProps {
  trip: TripPost;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const { openTripDetail } = useTrips();
  const { t } = useLanguage();

  return (
    <article
      onClick={() => openTripDetail(trip.id)}
      className="group bg-[#f0f7ff] hover:bg-[#e4f1ff] rounded-2xl border border-sky-200/80 hover:border-sky-400/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        {/* Top Header: Route & Flight */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
              <span>{trip.departureCity}</span>
              <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              <span>{trip.arrivalCity}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>{trip.departureCountry}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{trip.arrivalCountry}</span>
              {trip.flightNumber && (
                <>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-sky-100">
                    {trip.flightNumber}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Critical Dates Matrix */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-white/85 rounded-xl mb-4 border border-sky-100 text-xs">
          <div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Clock className="w-3 h-3 text-sky-600" />
              <span>{t('cardDropOff')}</span>
            </div>
            <div className="font-semibold text-slate-800">
              {formatDateDisplay(trip.lastDropOffDate)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>{t('cardDelivery')}</span>
            </div>
            <div className="font-semibold text-slate-800">
              {formatDateDisplay(trip.checkOutDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Traveler Profile Snapshot & Details Action */}
      <div className="pt-3 border-t border-sky-200/60 flex items-center justify-between gap-3">
        {/* Traveler Profile Snapshot (without rating) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center ring-1 ring-sky-200 shrink-0">
              <User className="w-4 h-4 text-sky-700" />
            </div>
            {trip.traveler.isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-1 ring-white">
                <CheckCircle2 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div className="truncate text-xs">
            <div className="font-semibold text-slate-900 truncate">
              {trip.traveler.name}
            </div>
            <div className="text-[11px] text-slate-500">
              <span>{trip.traveler.tripsCompleted} {t('cardTripsCompleted')}</span>
            </div>
          </div>
        </div>

        {/* View Details Action Indicator */}
        <div className="flex items-center gap-1 text-xs font-semibold text-sky-600 group-hover:text-sky-700 shrink-0">
          <span className="hidden sm:inline">{t('cardDetails')}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
};
