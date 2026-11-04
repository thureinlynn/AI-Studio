import React from 'react';
import { useTrips } from '../context/TripContext';
import { TripCard } from './TripCard';
import { filterAndSortTrips } from '../utils/tripUtils';
import { SearchX, SlidersHorizontal, Luggage, ArrowUpDown } from 'lucide-react';

export const TripList: React.FC = () => {
  const { trips, filters, updateFilterField, resetFilters, openPostModal } = useTrips();

  const filteredTrips = filterAndSortTrips(trips, filters);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Sub-header: Results count & Sort control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Available Traveler Trips
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip available' : 'trips available'}
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilterField('sortBy', e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="date_asc">Departure Date (Earliest First)</option>
            <option value="weight_desc">Weight Capacity (High to Low)</option>
            <option value="newest">Recently Posted</option>
          </select>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No matching trips found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              We couldn't find any traveler trips matching your route or weight criteria. Try clearing filters or post your own trip!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              onClick={openPostModal}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              + Post a Trip
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

    </section>
  );
};
