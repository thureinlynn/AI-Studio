import React from 'react';
import { TripPost } from '../types/trip';
import { useTrips } from '../context/TripContext';
import { formatDateDisplay, getDropOffStatus, formatWhatsAppUrl, formatTelegramUrl, formatViberUrl } from '../utils/tripUtils';
import { ArrowRight, Calendar, Clock, Weight, MessageCircle, Send, PhoneCall, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TripCardProps {
  trip: TripPost;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const { openTripDetail } = useTrips();
  const dropOffStatus = getDropOffStatus(trip.lastDropOffDate);

  const waUrl = formatWhatsAppUrl(
    trip.contacts.whatsapp,
    `Hi ${trip.traveler.name}, I saw your trip from ${trip.departureCity} to ${trip.arrivalCity} on LuuKyone. Do you still have luggage space available?`
  );
  const tgUrl = formatTelegramUrl(trip.contacts.telegram);
  const viberUrl = formatViberUrl(trip.contacts.viber);

  return (
    <article
      onClick={() => openTripDetail(trip.id)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        {/* Top Header: Route & Flight */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              <span>{trip.departureCity}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              <span>{trip.arrivalCity}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>{trip.departureCountry}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{trip.arrivalCountry}</span>
              {trip.flightNumber && (
                <>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono text-slate-600">{trip.flightNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* Weight Badge */}
          <div className="shrink-0 text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-lg text-xs font-bold tabular-nums">
              <Weight className="w-3.5 h-3.5 text-amber-700" />
              {trip.weightAvailableKg} kg left
            </span>
          </div>
        </div>

        {/* Announcement Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {trip.announcement}
        </p>

        {/* Critical Dates Matrix: Departure, Last Drop-off, Check-out */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-xs">
          <div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Clock className="w-3 h-3 text-rose-500" />
              <span>Last Drop-off</span>
            </div>
            <div className="font-semibold text-slate-800">
              {formatDateDisplay(trip.lastDropOffDate)}
            </div>
            <div className={`text-[10px] mt-0.5 font-medium ${dropOffStatus.isUrgent ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
              {dropOffStatus.label}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>Check-out / Delivery</span>
            </div>
            <div className="font-semibold text-slate-800">
              {formatDateDisplay(trip.checkOutDate)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Fly: {formatDateDisplay(trip.departureDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Traveler Profile & Direct Contact Links */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Traveler Profile Snapshot */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={trip.traveler.avatarUrl || '/src/assets/images/traveler_profile_avatar_1793803079186.jpg'}
              alt={trip.traveler.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/traveler_profile_avatar_1793803079186.jpg';
              }}
            />
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
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="text-amber-600 font-bold">★ {trip.traveler.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{trip.traveler.tripsCompleted} trips</span>
            </div>
          </div>
        </div>

        {/* Direct Contact Button Links */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {trip.contacts.whatsapp && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
              title={`WhatsApp: ${trip.contacts.whatsapp}`}
              aria-label="Direct WhatsApp contact"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {trip.contacts.telegram && (
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 flex items-center justify-center transition-colors"
              title={`Telegram: @${trip.contacts.telegram.replace(/^@/, '')}`}
              aria-label="Direct Telegram contact"
            >
              <Send className="w-4 h-4" />
            </a>
          )}

          {trip.contacts.viber && (
            <a
              href={viberUrl}
              className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 flex items-center justify-center transition-colors"
              title={`Viber: ${trip.contacts.viber}`}
              aria-label="Direct Viber contact"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => openTripDetail(trip.id)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center ml-1"
            title="View Details"
            aria-label="View trip details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
