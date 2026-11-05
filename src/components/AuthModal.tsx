import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDisplay } from '../utils/tripUtils';
import {
  X,
  User,
  LogIn,
  UserPlus,
  LogOut,
  MessageCircle,
  Send,
  PhoneCall,
  CheckCircle2,
  Luggage,
  Plus,
  ArrowRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { user, isAuthenticated, loginWithEmail, registerUser, logout } = useAuth();
  const { isAuthModalOpen, closeAuthModal, trips, openTripDetail, openPostModal, deleteTrip } = useTrips();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInName, setSignInName] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [viber, setViber] = useState('');
  const [telegram, setTelegram] = useState('');
  const [bio, setBio] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) return;
    loginWithEmail(signInEmail.trim(), signInName.trim() || undefined);
    closeAuthModal();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    registerUser({
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      viber: viber.trim(),
      telegram: telegram.trim(),
      bio: bio.trim(),
    });
    closeAuthModal();
  };

  const userTrips = user ? trips.filter((t) => t.userId === user.id) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-slate-900">
            {isAuthenticated ? 'Traveler Profile' : mode === 'signin' ? 'Traveler Sign In' : 'Create Traveler Profile'}
          </h3>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {isAuthenticated && user ? (
            /* Logged in Traveler Profile */
            <div className="space-y-5 text-sm">
              {/* Profile Card with Default Person Icon */}
              <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center ring-2 ring-amber-400/60 shrink-0">
                  <User className="w-7 h-7 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 truncate text-base">{user.name}</h4>
                    {user.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {userTrips.length} {userTrips.length === 1 ? 'trip listed' : 'trips listed'}
                  </div>
                </div>
              </div>

              {/* Saved Contact Channels */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">
                  Your Saved Contact Channels:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-slate-700 font-mono">
                  {user.contacts.whatsapp ? (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp: {user.contacts.whatsapp}</span>
                    </div>
                  ) : null}
                  {user.contacts.telegram ? (
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-sky-500" />
                      <span>Telegram: @{user.contacts.telegram}</span>
                    </div>
                  ) : null}
                  {user.contacts.viber ? (
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                      <span>Viber: {user.contacts.viber}</span>
                    </div>
                  ) : null}
                  {!user.contacts.whatsapp && !user.contacts.telegram && !user.contacts.viber && (
                    <span className="text-slate-400 font-sans italic">No direct channels saved</span>
                  )}
                </div>
              </div>

              {/* Trip Created History */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Trip Created History
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full tabular-nums">
                    {userTrips.length} {userTrips.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>

                {userTrips.length === 0 ? (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2.5">
                    <p className="text-xs text-slate-500">
                      You haven't listed any trips yet. Have extra baggage space on an upcoming flight?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        closeAuthModal();
                        openPostModal();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1e60d5] hover:bg-[#1952ba] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post a Trip Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {userTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors text-xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span className="truncate">{trip.departureCity}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{trip.arrivalCity}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>{formatDateDisplay(trip.departureDate)}</span>
                            <span>·</span>
                            <span
                              className={`font-semibold ${
                                trip.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            >
                              {trip.status === 'active' ? t('statusActive') : t('statusBooked')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              closeAuthModal();
                              openTripDetail(trip.id);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 bg-white transition-colors cursor-pointer"
                            title="View trip details"
                            aria-label="View trip details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this trip post?')) {
                                deleteTrip(trip.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete trip post"
                            aria-label="Delete trip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeAuthModal();
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('authSignOut')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeAuthModal();
                      openPostModal();
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1 border border-blue-400/30"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t('navPost')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Sign In / Register tabs */
            <div className="space-y-4">
              {/* Tab selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {mode === 'signin' ? (
                /* Sign In Form */
                <form onSubmit={handleSignIn} className="space-y-3.5 text-xs pt-1">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sign in with your email address to manage your trips and post baggage availability.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. traveler@domain.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name (Optional)</label>
                    <input
                      type="text"
                      value={signInName}
                      onChange={(e) => setSignInName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as Traveler</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-xs text-amber-700 hover:underline font-medium cursor-pointer"
                    >
                      Don't have an account yet? Create one
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-3 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. maya@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+66..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Viber</label>
                      <input
                        type="text"
                        value={viber}
                        onChange={(e) => setViber(e.target.value)}
                        placeholder="+95..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Telegram</label>
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="@maya"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bio / Travel Routine</label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Flying weekly between Bangkok & Yangon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm mt-3"
                  >
                    Create Account & Sign In
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-xs text-amber-700 hover:underline font-medium cursor-pointer"
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
