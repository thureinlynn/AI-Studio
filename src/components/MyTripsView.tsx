import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { TripCard } from './TripCard';
import { Luggage, Plus, LogIn, CheckCircle2, AlertCircle, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export const MyTripsView: React.FC = () => {
  const { trips, openPostModal, openAuthModal, deleteTrip, toggleTripStatus } = useTrips();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Sign In to View Your Trips
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Log in with your traveler account to view, manage, and track all your posted luggage classifieds.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Find user's posted trips
  const userTrips = trips.filter((t) => t.userId === user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-950">
              My Posted Trips
            </h2>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {userTrips.length} {userTrips.length === 1 ? 'Trip' : 'Trips'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active flights, spare weight availability, and traveler announcements.
          </p>
        </div>

        <button
          onClick={openPostModal}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Post Another Trip</span>
        </button>
      </div>

      {userTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Luggage className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Trips Posted Yet
          </h3>
          <p className="text-xs text-slate-500">
            You haven't listed any trips yet. Have extra baggage on an upcoming flight?
          </p>
          <button
            onClick={openPostModal}
            className="mt-2 px-5 py-2.5 bg-slate-950 text-amber-400 font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Post Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTrips.map((trip) => (
            <div key={trip.id} className="relative flex flex-col justify-between">
              <TripCard trip={trip} />
              
              {/* Manage controls bar */}
              <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <button
                  onClick={() => toggleTripStatus(trip.id)}
                  className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                  title="Toggle booking status"
                >
                  {trip.status === 'active' ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                      <span>Status: Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>Status: Fully Booked</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trip post?')) {
                      deleteTrip(trip.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete post"
                  aria-label="Delete trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
