import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { X, User, LogIn, UserPlus, LogOut, MessageCircle, Send, PhoneCall, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { user, isAuthenticated, loginAsDemoUser, registerUser, logout } = useAuth();
  const { isAuthModalOpen, closeAuthModal } = useTrips();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [viber, setViber] = useState('');
  const [telegram, setTelegram] = useState('');
  const [bio, setBio] = useState('');

  if (!isAuthModalOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isAuthenticated ? 'Traveler Account' : 'Traveler Sign In'}
          </h3>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If already logged in */}
        {isAuthenticated && user ? (
          <div className="p-6 space-y-5 text-sm">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 truncate">{user.name}</h4>
                  {user.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{user.tripsCount} posted trips</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">
                Your Saved Contact Channels:
              </span>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-slate-700 font-mono">
                {user.contacts.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp: {user.contacts.whatsapp}</span>
                  </div>
                )}
                {user.contacts.telegram && (
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-sky-500" />
                    <span>Telegram: @{user.contacts.telegram.replace(/^@/, '')}</span>
                  </div>
                )}
                {user.contacts.viber && (
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                    <span>Viber: {user.contacts.viber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Switch preset accounts for demo testing */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Quick Demo Switch:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(DEMO_USERS).map(([key, demo]) => (
                  <button
                    key={key}
                    onClick={() => {
                      loginAsDemoUser(key as any);
                    }}
                    className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                      user.id === demo.id
                        ? 'bg-amber-50 border-amber-400 font-bold text-amber-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate font-semibold">{demo.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500">{demo.contacts.preferred}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  logout();
                  closeAuthModal();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              <button
                onClick={closeAuthModal}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Register tabs */
          <div className="p-6 space-y-5">
            {/* 1-Click Fast Demo Login Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                1-Click Instant Demo Login
              </span>
              <div className="space-y-2">
                {Object.entries(DEMO_USERS).map(([key, demo]) => (
                  <button
                    key={key}
                    onClick={() => {
                      loginAsDemoUser(key as any);
                      closeAuthModal();
                    }}
                    className="w-full p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={demo.avatarUrl}
                        alt={demo.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{demo.name}</div>
                        <div className="text-[10px] text-slate-500">{demo.bio}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      Sign In
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or create your traveler profile</span>
              </div>
            </div>

            {/* Custom Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
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
                  placeholder="e.g. Flying weekly between London & Dubai"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm mt-3"
              >
                Create Account & Sign In
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
