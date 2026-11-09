import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDisplay, formatMemberSince, countCompletedTripsForTraveler } from '../utils/tripUtils';
import {
  X,
  User,
  LogIn,
  UserPlus,
  LogOut,
  MessageCircle,
  Send,
  PhoneCall,
  Facebook,
  Luggage,
  Plus,
  ArrowRight,
  ExternalLink,
  Trash2,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    loginWithFirebase,
    signUpWithFirebase,
    sendPasswordReset,
    logout,
    instantSignIn,
    loginAsDemoUser,
  } = useAuth();
  const { isAuthModalOpen, closeAuthModal, trips, openTripDetail, openPostModal, deleteTrip } = useTrips();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [viber, setViber] = useState('');
  const [telegram, setTelegram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [bio, setBio] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSentNotice, setResetSentNotice] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSentNotice(null);

    if (!email.trim() || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await loginWithFirebase(email, password);
    setIsLoading(false);

    if (result.success) {
      closeAuthModal();
    } else {
      setAuthError(result.error || 'Failed to sign in.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSentNotice(null);

    if (!name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const result = await signUpWithFirebase(email, password, {
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      viber: viber.trim(),
      telegram: telegram.trim(),
      facebook: facebook.trim(),
      bio: bio.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      closeAuthModal();
    } else {
      setAuthError(result.error || 'Failed to create account.');
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setAuthError('Please enter your email above to receive a password reset link.');
      return;
    }
    setAuthError(null);
    setIsLoading(true);
    const result = await sendPasswordReset(email);
    setIsLoading(false);
    if (result.success) {
      setResetSentNotice(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
    } else {
      setAuthError(result.error || 'Could not send reset email.');
    }
  };

  const userTrips = user ? trips.filter((t) => t.userId === user.id) : [];
  const completedUserTrips = user ? countCompletedTripsForTraveler(trips, { name: user.name, userId: user.id }) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAuthenticated ? 'Traveler Profile' : mode === 'signin' ? 'Sign In to LuuKyone' : 'Create Traveler Account'}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {isAuthenticated && user ? (
            /* Logged-in Traveler Profile View */
            <div className="space-y-5 text-sm">
              {/* Profile Card */}
              <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center ring-2 ring-amber-400/60 dark:ring-amber-500/40 shrink-0">
                  <User className="w-7 h-7 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-base">{user.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('detailMemberSince')} {formatMemberSince(user.createdAt || user.memberSince)}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                    {userTrips.length} {userTrips.length === 1 ? 'trip listed' : 'trips listed'} · {completedUserTrips} {t('cardTripsCompleted')}
                  </div>
                </div>
              </div>

              {/* Saved Contact Channels */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[10px]">
                  Your Saved Contact Channels:
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-slate-700 dark:text-slate-300 font-mono border border-slate-100 dark:border-slate-700">
                  {user.contacts?.whatsapp ? (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>WhatsApp: {user.contacts.whatsapp}</span>
                    </div>
                  ) : null}
                  {user.contacts?.telegram ? (
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                      <span>Telegram: @{user.contacts.telegram}</span>
                    </div>
                  ) : null}
                  {(user.contacts as any)?.facebook ? (
                    <div className="flex items-center gap-2">
                      <Facebook className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Facebook: {(user.contacts as any).facebook}</span>
                    </div>
                  ) : null}
                  {user.contacts?.viber ? (
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>Viber: {user.contacts.viber}</span>
                    </div>
                  ) : null}
                  {!user.contacts?.whatsapp && !user.contacts?.telegram && !user.contacts?.viber && !(user.contacts as any)?.facebook && (
                    <span className="text-slate-400 dark:text-slate-500 font-sans italic">No direct channels saved</span>
                  )}
                </div>
              </div>

              {/* Trip Created History */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      {t('authMyTrips')} ({userTrips.length})
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeAuthModal();
                      openPostModal();
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('authPostNewTrip')}</span>
                  </button>
                </div>

                {userTrips.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
                    {t('authNoTripsYet')}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {userTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 transition-colors text-xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span className="truncate">{trip.departureCity}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{trip.arrivalCity}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>Drop-off: {formatDateDisplay(trip.lastDropOffDate)}</span>
                            <span>·</span>
                            <span
                              className={`font-semibold ${
                                trip.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
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
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
                            title="View Trip"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTrip(trip.id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                            title="Delete Trip"
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
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeAuthModal();
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold cursor-pointer"
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
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Sign In / Register Tabs */
            <div className="space-y-4">
              {/* Tab selector */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setAuthError(null);
                    setResetSentNotice(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setAuthError(null);
                    setResetSentNotice(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{authError}</span>
                  </div>
                  {authError.includes('Firebase Email/Password provider is not yet enabled') && (
                    <div className="pt-2 border-t border-rose-200/70 dark:border-rose-900/60 flex flex-col gap-2">
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        Tip: You can use Instant Sign-In to test all listing and community features immediately without waiting:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          instantSignIn(email || 'traveler@luukyone.com', name || 'Traveler');
                          closeAuthModal();
                        }}
                        className="w-full py-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Instant Sign-In (Continue with local session)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Password Reset Sent Notice */}
              {resetSentNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{resetSentNotice}</span>
                </div>
              )}

              {mode === 'signin' ? (
                /* Sign In Form */
                <form onSubmit={handleSignIn} className="space-y-3.5 text-xs pt-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Sign in with your Firebase account credentials to post trips and manage your community listings.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="traveler@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Signing In...' : 'Sign In with Firebase'}</span>
                  </button>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-3 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. maya@example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password * (min 6 characters)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Direct Contact Channels */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block text-[11px]">
                      Direct Contact Handles (For senders to reach you):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="WhatsApp (+66...)"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="Telegram (@handle)"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <input
                        type="text"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="Facebook Link / User"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <input
                        type="text"
                        value={viber}
                        onChange={(e) => setViber(e.target.value)}
                        placeholder="Viber (+95...)"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Travel Frequency</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Flying Bangkok to Yangon twice a month. Happy to take documents or snacks."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Creating Account...' : 'Register Firebase Account'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
