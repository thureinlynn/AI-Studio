import React, { useState } from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COMMON_ITEM_CATEGORIES } from '../data/mockTrips';
import { formatMemberSince } from '../utils/tripUtils';
import { normalizeAvatarUrl, handleAvatarImageError, isGoogleVerifiedUser } from '../utils/userUtils';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  Send,
  PhoneCall,
  Facebook,
  Luggage,
  ShieldCheck,
  LogIn,
  AlertCircle,
  CheckCircle2,
  User,
  Plus,
} from 'lucide-react';

export const PostTripModal: React.FC = () => {
  const { isPostModalOpen, closePostModal, addNewTrip, openTripDetail, openAuthModal } = useTrips();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Form states initialized blank and clean for production launch
  const [departureCity, setDepartureCity] = useState('');
  const [departureCountry, setDepartureCountry] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalCountry, setArrivalCountry] = useState('');
  const [weightAvailable, setWeightAvailable] = useState<string>('');
  
  // Date helpers
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = getTomorrowStr();

  // Key Dates: Drop-off (deadline) and Delivery / Check-out - completely blank
  const [lastDropOffDate, setLastDropOffDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const [announcement, setAnnouncement] = useState('');
  const [dropOffLocationNote, setDropOffLocationNote] = useState('');
  const [pickUpLocationNote, setPickUpLocationNote] = useState('');
  const [selectedAcceptedItems, setSelectedAcceptedItems] = useState<string[]>([]);

  // Contacts
  const [whatsapp, setWhatsapp] = useState(user?.contacts?.whatsapp || '');
  const [viber, setViber] = useState(user?.contacts?.viber || '');
  const [telegram, setTelegram] = useState(user?.contacts?.telegram || '');
  const [facebook, setFacebook] = useState((user?.contacts as any)?.facebook || '');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'viber' | 'telegram' | 'facebook'>('whatsapp');

  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setDepartureCity('');
    setDepartureCountry('');
    setArrivalCity('');
    setArrivalCountry('');
    setWeightAvailable('');
    setLastDropOffDate('');
    setCheckOutDate('');
    setAnnouncement('');
    setDropOffLocationNote('');
    setPickUpLocationNote('');
    setSelectedAcceptedItems([]);
    setWhatsapp(user?.contacts?.whatsapp || '');
    setViber(user?.contacts?.viber || '');
    setTelegram(user?.contacts?.telegram || '');
    setFacebook((user?.contacts as any)?.facebook || '');
    setFormError(null);
  };

  // Sync contacts if user logs in while modal is open
  React.useEffect(() => {
    if (user?.contacts) {
      if (!whatsapp) setWhatsapp(user.contacts.whatsapp || '');
      if (!viber) setViber(user.contacts.viber || '');
      if (!telegram) setTelegram(user.contacts.telegram || '');
      if (!facebook) setFacebook((user.contacts as any)?.facebook || '');
    }
  }, [user]);

  if (!isPostModalOpen) return null;

  const toggleItem = (category: string) => {
    if (selectedAcceptedItems.includes(category)) {
      setSelectedAcceptedItems(selectedAcceptedItems.filter((i) => i !== category));
    } else {
      setSelectedAcceptedItems([...selectedAcceptedItems, category]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError('You must be logged in to post trip information.');
      return;
    }

    if (!departureCity.trim() || !arrivalCity.trim()) {
      setFormError('Please provide both Departure and Arrival cities.');
      return;
    }

    if (!lastDropOffDate || !checkOutDate) {
      setFormError('Please select both Drop-off and Delivery dates.');
      return;
    }

    // Drop off date must be not current date and cannot be added earlier than current date
    const today = new Date().toISOString().split('T')[0];
    if (lastDropOffDate <= today) {
      setFormError('Drop-off date cannot be today or in the past. It must be a future date.');
      return;
    }

    // Delivery date can't be earlier than drop-off date
    if (checkOutDate < lastDropOffDate) {
      setFormError('Delivery date cannot be earlier than the drop-off date.');
      return;
    }

    const weightVal = Number(weightAvailable);
    if (!weightVal || weightVal <= 0) {
      setFormError('Please enter available luggage weight (minimum 0.5 kg).');
      return;
    }

    if (!whatsapp.trim() && !viber.trim() && !telegram.trim() && !facebook.trim()) {
      setFormError('Please enter at least one contact channel (WhatsApp, Telegram, Facebook, or Viber).');
      return;
    }

    if (!announcement.trim()) {
      setFormError('Please write an information announcement describing your trip and luggage conditions.');
      return;
    }

    // Create the new trip post
    const createdTrip = addNewTrip({
      userId: user.id,
      departureCity: departureCity.trim(),
      departureCountry: departureCountry.trim() || 'Global',
      arrivalCity: arrivalCity.trim(),
      arrivalCountry: arrivalCountry.trim() || 'Global',
      lastDropOffDate,
      checkOutDate,
      departureDate: lastDropOffDate,
      arrivalDate: checkOutDate,
      weightCapacityKg: weightVal,
      weightAvailableKg: weightVal,
      serviceFeeType: 'free',
      feeDescription: 'Free peer-to-peer baggage carrier',
      announcement: announcement.trim(),
      dropOffLocationNote: dropOffLocationNote.trim(),
      pickUpLocationNote: pickUpLocationNote.trim(),
      acceptedItems: selectedAcceptedItems,
      prohibitedItems: [
        'Illegal items or narcotics',
        'Batteries & hazardous chemicals',
        'Uninspected sealed packages',
        'Restricted commercial goods',
      ],
      contacts: {
        whatsapp: whatsapp.trim(),
        viber: viber.trim(),
        telegram: telegram.trim(),
        facebook: facebook.trim(),
        preferred: preferredContact,
      },
      traveler: {
        name: user.name,
        avatarUrl: normalizeAvatarUrl(user.avatarUrl, user.id, user),
        rating: 5.0,
        reviewCount: 1,
        tripsCompleted: 0,
        isVerified: false,
        isGoogleVerified: isGoogleVerifiedUser(user),
        authProvider: user.authProvider || (isGoogleVerifiedUser(user) ? 'google' : 'password'),
        createdAt: user.createdAt || new Date().toISOString(),
        memberSince: formatMemberSince(user.createdAt || user.memberSince),
        bio: user.bio || 'Community traveler sharing extra luggage allowance.',
        languages: user.languages || ['English'],
      },
    });

    resetForm();
    closePostModal();
    openTripDetail(createdTrip.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <Luggage className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Post a Traveler Trip
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your extra baggage allowance with senders
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              closePostModal();
            }}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Barrier Notice if user is not logged in */}
        {!isAuthenticated || !user ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Traveler Login Required
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                To keep our classified community secure and prevent spam, travelers must be logged in before posting their flight and baggage details.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openAuthModal}
                className="w-full sm:w-auto px-6 py-3 bg-[#1e60d5] hover:bg-[#1952ba] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#1e60d5]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In or Create Traveler Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Trip Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
            
            {/* Logged in traveler banner */}
            <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                  <img
                    src={normalizeAvatarUrl(user.avatarUrl, user.id, user)}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover p-0.5"
                    onError={(e) => handleAvatarImageError(e, user.id)}
                  />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    <span>Posting as {user.name}</span>
                    {isGoogleVerifiedUser(user) && <GoogleVerifiedBadge />}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Section 1: Route & Flight */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                1. Travel Route & Baggage Space
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure City *
                  </label>
                  <input
                    type="text"
                    required
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    placeholder="e.g. Bangkok"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure Country
                  </label>
                  <input
                    type="text"
                    value={departureCountry}
                    onChange={(e) => setDepartureCountry(e.target.value)}
                    placeholder="e.g. Thailand"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Arrival City *
                  </label>
                  <input
                    type="text"
                    required
                    value={arrivalCity}
                    onChange={(e) => setArrivalCity(e.target.value)}
                    placeholder="e.g. Yangon"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Arrival Country
                  </label>
                  <input
                    type="text"
                    value={arrivalCountry}
                    onChange={(e) => setArrivalCountry(e.target.value)}
                    placeholder="e.g. Myanmar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Luggage className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Available Luggage Weight (kg) *
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    Spare baggage capacity
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={weightAvailable}
                    onChange={(e) => setWeightAvailable(e.target.value)}
                    placeholder="e.g. 5, 10, or 23"
                    className="w-full pl-3.5 pr-14 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500 dark:text-slate-400">
                    kg
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Key Dates (Drop-Off and Delivery) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                2. Key Dates (Drop-Off & Delivery)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Last Drop Off Date */}
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl transition-colors">
                  <label className="block text-xs font-bold text-rose-900 dark:text-rose-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Last Drop-Off Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={tomorrowStr}
                    value={lastDropOffDate}
                    onChange={(e) => {
                      const newDropOff = e.target.value;
                      setLastDropOffDate(newDropOff);
                      if (checkOutDate < newDropOff) {
                        setCheckOutDate(newDropOff);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Must be after today (deadline for senders)
                  </span>
                </div>

                {/* Check Out / Delivery Date */}
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl transition-colors">
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Check-Out / Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={lastDropOffDate || tomorrowStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    When receiver can collect the item (on or after drop-off)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Handover & Pickup Locations */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {t('postSectionLocations')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('postDropOffLocationLabel')}
                  </label>
                  <input
                    type="text"
                    value={dropOffLocationNote}
                    onChange={(e) => setDropOffLocationNote(e.target.value)}
                    placeholder="e.g. BTS Asok or Suvarnabhumi Airport Gate 4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('postPickUpLocationLabel')}
                  </label>
                  <input
                    type="text"
                    value={pickUpLocationNote}
                    onChange={(e) => setPickUpLocationNote(e.target.value)}
                    placeholder="e.g. Junction City Mall or Yangon Airport Arrival Hall"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Accepted items checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Accepted Parcel Types
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {COMMON_ITEM_CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-colors cursor-pointer ${
                        selectedAcceptedItems.includes(cat)
                          ? 'bg-amber-50 border-amber-300 text-slate-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAcceptedItems.includes(cat)}
                        onChange={() => toggleItem(cat)}
                        className="rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Information Announcement */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-amber-600" />
                4. Trip Announcement & Information Notice *
              </h4>

              <p className="text-xs text-slate-500 leading-normal">
                Describe flight notes, space dimensions, handover timing, and any condition requirements.
              </p>

              <textarea
                required
                rows={3}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Flying direct on Singapore Airlines SQ 638. Have 10 kg spare checked bag space. Can take sealed local snacks, clothes, or documents. Items must be inspected before packing. Drop off before 6 PM on Nov 11 at BTS Asok..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Section 5: Mandatory Contact Preferences (WhatsApp, Telegram, Facebook, Viber) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 -mx-6 -mb-6 p-6 rounded-b-3xl transition-colors">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  5. Contact Channels (WhatsApp, Telegram, Facebook, Viber) *
                </h4>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                  Direct Contact Buttons
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                These will generate direct clickable contact buttons on your trip post for senders to connect instantly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+66 81 234 5678"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                    Telegram Handle
                  </label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@traveler_username"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Facebook Account Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Facebook className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Facebook Account Link / Username
                  </label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/username or @username"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Viber */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Viber Number
                  </label>
                  <input
                    type="text"
                    value={viber}
                    onChange={(e) => setViber(e.target.value)}
                    placeholder="+95 9 1234 5678"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Preferred Contact Radio */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Preferred channel:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="preferred_contact"
                    checked={preferredContact === 'whatsapp'}
                    onChange={() => setPreferredContact('whatsapp')}
                    className="text-amber-500"
                  />
                  <span>WhatsApp</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="preferred_contact"
                    checked={preferredContact === 'telegram'}
                    onChange={() => setPreferredContact('telegram')}
                    className="text-amber-500"
                  />
                  <span>Telegram</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="preferred_contact"
                    checked={preferredContact === 'facebook'}
                    onChange={() => setPreferredContact('facebook')}
                    className="text-amber-500"
                  />
                  <span>Facebook</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="preferred_contact"
                    checked={preferredContact === 'viber'}
                    onChange={() => setPreferredContact('viber')}
                    className="text-amber-500"
                  />
                  <span>Viber</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closePostModal}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  {t('postCancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/25 active:scale-[0.98] cursor-pointer flex items-center gap-2 border border-blue-400/30"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t('postSubmitBtn')}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
