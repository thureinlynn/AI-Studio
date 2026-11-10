import React, { useState, useMemo, useEffect } from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TripCard } from './TripCard';
import { Luggage, Plus, LogIn, CheckCircle2, AlertCircle, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { isDropOffDatePassed } from '../utils/tripUtils';

export const MyTripsView: React.FC = () => {
  const { trips, openPostModal, openAuthModal, deleteTrip, toggleTripStatus } = useTrips();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Find user's posted trips (active trips first, then past trips)
  const userTrips = useMemo(() => {
    if (!user) return [];
    const all = trips.filter((t) => t.userId === user.id);
    const active = all.filter((t) => t.status === 'active' && !isDropOffDatePassed(t.lastDropOffDate));
    const past = all.filter((t) => t.status !== 'active' || isDropOffDatePassed(t.lastDropOffDate));
    return [...active, ...past];
  }, [user, trips]);

  // Pagination: 10 trips per page
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [user?.id]);

  const totalPages = Math.max(1, Math.ceil(userTrips.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTrips = userTrips.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {t('authSignInTitle')}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t('authSwitchToSignIn')}
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {t('navLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {t('myTripsHeading')}
            </h2>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              {userTrips.length} {userTrips.length === 1 ? 'Trip' : 'Trips'}
              {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('myTripsSubheading')}
          </p>
        </div>

        <button
          onClick={openPostModal}
          className="px-4.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border border-blue-400/30"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('postAnotherTrip')}</span>
        </button>
      </div>

      {userTrips.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Luggage className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('noMyTripsTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('noMyTripsDesc')}
          </p>
          <button
            onClick={openPostModal}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            {t('postFirstTripBtn')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTrips.map((trip) => (
              <div key={trip.id} className="relative flex flex-col justify-between">
                <TripCard trip={trip} />
                
                {/* Manage controls bar */}
                <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <button
                    onClick={() => toggleTripStatus(trip.id)}
                    className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                    title="Toggle booking status"
                  >
                    {trip.status === 'active' ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                        <span>{t('statusActive')}</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                        <span>{t('statusBooked')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete post"
                    aria-label="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Numbered Pagination with Previous and Next Buttons */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, userTrips.length)} of {userTrips.length} trips
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer font-semibold text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center tabular-nums ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer font-semibold text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
