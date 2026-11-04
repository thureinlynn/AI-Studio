import React from 'react';
import { useTrips } from '../context/TripContext';
import { Search, MapPin, ArrowRight, Weight, X, Filter } from 'lucide-react';
import { POPULAR_ROUTES } from '../data/mockTrips';

export const SearchBar: React.FC = () => {
  const { filters, updateFilterField, resetFilters, openPostModal } = useTrips();

  const handleRouteClick = (from: string, to: string) => {
    updateFilterField('departureCity', from);
    updateFilterField('arrivalCity', to);
    updateFilterField('query', '');
  };

  const hasActiveFilters = Boolean(
    filters.query || filters.departureCity || filters.arrivalCity || filters.minWeight || filters.maxWeight
  );

  return (
    <section className="bg-white border-b border-slate-200 pt-6 pb-6 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with prominent dashboard Post Trip button */}
        <div className="mb-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-2xl p-5 sm:p-6 text-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold tracking-wider uppercase text-amber-950/80 mb-1">
              Free Classified Baggage Exchange
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Carry extra baggage for someone, or send items abroad safely.
            </h1>
            <p className="text-sm text-slate-900/80 mt-1">
              Connect directly with verified travelers heading to your destination. Zero commission, direct WhatsApp, Viber, and Telegram contact.
            </p>
          </div>
          <button
            onClick={openPostModal}
            className="w-full md:w-auto px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
          >
            <span>+ Post a Trip Listing</span>
          </button>
        </div>

        {/* Search controls form */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* General Search Input */}
            <div className="md:col-span-5 relative">
              <label htmlFor="search-query" className="sr-only">Search trips, cities, or keywords</label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="search-query"
                type="text"
                value={filters.query}
                onChange={(e) => updateFilterField('query', e.target.value)}
                placeholder="Search any city, country, or announcement..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Departure City */}
            <div className="md:col-span-3 relative">
              <label htmlFor="dept-city" className="sr-only">Departure city</label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                id="dept-city"
                type="text"
                value={filters.departureCity}
                onChange={(e) => updateFilterField('departureCity', e.target.value)}
                placeholder="From: e.g. Bangkok"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Arrival City */}
            <div className="md:col-span-3 relative">
              <label htmlFor="arr-city" className="sr-only">Arrival city</label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <input
                id="arr-city"
                type="text"
                value={filters.arrivalCity}
                onChange={(e) => updateFilterField('arrivalCity', e.target.value)}
                placeholder="To: e.g. Yangon"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Weight / Filter quick button */}
            <div className="md:col-span-1 flex items-center">
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="w-full py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Clear all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              ) : (
                <div className="w-full py-2.5 px-3 bg-white border border-slate-200 text-slate-400 text-xs font-medium rounded-xl flex items-center justify-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>All</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Route Buttons & Capacity Filters */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium mr-1">Popular routes:</span>
              {POPULAR_ROUTES.map((route) => {
                const isActive =
                  filters.departureCity.toLowerCase() === route.from.toLowerCase() &&
                  filters.arrivalCity.toLowerCase() === route.to.toLowerCase();
                return (
                  <button
                    key={`${route.from}-${route.to}`}
                    onClick={() => handleRouteClick(route.from, route.to)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span>{route.from}</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    <span>{route.to}</span>
                  </button>
                );
              })}
            </div>

            {/* Weight filter buttons */}
            <div className="flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  updateFilterField('minWeight', undefined);
                  updateFilterField('maxWeight', undefined);
                }}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  filters.minWeight === undefined && filters.maxWeight === undefined
                    ? 'font-bold text-amber-700 bg-amber-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Any kg
              </button>
              <button
                onClick={() => {
                  updateFilterField('minWeight', 1);
                  updateFilterField('maxWeight', 5);
                }}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  filters.minWeight === 1 && filters.maxWeight === 5
                    ? 'font-bold text-amber-700 bg-amber-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1-5 kg
              </button>
              <button
                onClick={() => {
                  updateFilterField('minWeight', 5);
                  updateFilterField('maxWeight', 12);
                }}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  filters.minWeight === 5 && filters.maxWeight === 12
                    ? 'font-bold text-amber-700 bg-amber-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                5-12 kg
              </button>
              <button
                onClick={() => {
                  updateFilterField('minWeight', 12);
                  updateFilterField('maxWeight', undefined);
                }}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  filters.minWeight === 12
                    ? 'font-bold text-amber-700 bg-amber-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                12+ kg
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
