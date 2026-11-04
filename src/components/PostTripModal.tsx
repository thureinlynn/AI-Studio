import React, { useState } from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { COMMON_ITEM_CATEGORIES } from '../data/mockTrips';
import {
  X,
  MapPin,
  Calendar,
  Weight,
  Clock,
  MessageCircle,
  Send,
  PhoneCall,
  Luggage,
  ShieldCheck,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const PostTripModal: React.FC = () => {
  const { isPostModalOpen, closePostModal, addNewTrip, openTripDetail, openAuthModal } = useTrips();
  const { user, isAuthenticated } = useAuth();

  // Form states initialized with user contacts if available
  const [departureCity, setDepartureCity] = useState('');
  const [departureCountry, setDepartureCountry] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalCountry, setArrivalCountry] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  
  // Dates
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [arrivalDate, setArrivalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [lastDropOffDate, setLastDropOffDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  });

  const [weightCapacityKg, setWeightCapacityKg] = useState('10');
  const [announcement, setAnnouncement] = useState('');
  const [dropOffLocationNote, setDropOffLocationNote] = useState('');
  const [pickUpLocationNote, setPickUpLocationNote] = useState('');
  const [selectedAcceptedItems, setSelectedAcceptedItems] = useState<string[]>([
    'Urgent Documents & Letters',
    'Clothing & Fashion Goods',
    'Sealed Packaged Food & Snacks',
  ]);

  // Mandatory Contacts
  const [whatsapp, setWhatsapp] = useState(user?.contacts?.whatsapp || '');
  const [viber, setViber] = useState(user?.contacts?.viber || '');
  const [telegram, setTelegram] = useState(user?.contacts?.telegram || '');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'viber' | 'telegram'>('whatsapp');

  const [formError, setFormError] = useState<string | null>(null);

  // Sync contacts if user logs in while modal is open
  React.useEffect(() => {
    if (user?.contacts) {
      if (!whatsapp) setWhatsapp(user.contacts.whatsapp || '');
      if (!viber) setViber(user.contacts.viber || '');
      if (!telegram) setTelegram(user.contacts.telegram || '');
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

    if (!departureDate || !arrivalDate || !lastDropOffDate || !checkOutDate) {
      setFormError('Please fill out all 4 date fields.');
      return;
    }

    if (lastDropOffDate > departureDate) {
      setFormError('Last drop-off date must be on or before the departure date.');
      return;
    }

    if (checkOutDate < arrivalDate) {
      setFormError('Check-out date must be on or after the flight arrival date.');
      return;
    }

    const weightNum = parseFloat(weightCapacityKg);
    if (isNaN(weightNum) || weightNum <= 0) {
      setFormError('Please enter a valid weight capacity greater than 0 kg.');
      return;
    }

    if (!whatsapp.trim() && !viber.trim() && !telegram.trim()) {
      setFormError('Please enter your contact information (WhatsApp, Viber, or Telegram).');
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
      flightNumber: flightNumber.trim() || undefined,
      departureDate,
      arrivalDate,
      lastDropOffDate,
      checkOutDate,
      weightCapacityKg: weightNum,
      weightAvailableKg: weightNum,
      serviceFeeType: 'free',
      feeDescription: 'Free peer-to-peer baggage carrier',
      announcement: announcement.trim(),
      dropOffLocationNote: dropOffLocationNote.trim() || `${departureCity} Central Area / Airport`,
      pickUpLocationNote: pickUpLocationNote.trim() || `${arrivalCity} Central Area / Airport`,
      acceptedItems: selectedAcceptedItems.length > 0 ? selectedAcceptedItems : ['General Personal Goods'],
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
        preferred: preferredContact,
      },
      traveler: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        rating: 5.0,
        reviewCount: 1,
        tripsCompleted: user.tripsCount || 1,
        isVerified: user.isVerified,
        memberSince: 'Today',
        bio: user.bio || 'Verified traveler sharing extra luggage allowance.',
        languages: user.languages || ['English'],
      },
    });

    closePostModal();
    openTripDetail(createdTrip.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <Luggage className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Post a Traveler Trip
              </h2>
              <p className="text-xs text-slate-500">
                Share your extra baggage allowance with senders
              </p>
            </div>
          </div>
          <button
            onClick={closePostModal}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Posting as {user.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer"
              >
                Switch Account
              </button>
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
                1. Travel Route & Flight
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departure City *
                  </label>
                  <input
                    type="text"
                    required
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    placeholder="e.g. Bangkok"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departure Country
                  </label>
                  <input
                    type="text"
                    value={departureCountry}
                    onChange={(e) => setDepartureCountry(e.target.value)}
                    placeholder="e.g. Thailand"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Arrival City *
                  </label>
                  <input
                    type="text"
                    required
                    value={arrivalCity}
                    onChange={(e) => setArrivalCity(e.target.value)}
                    placeholder="e.g. Yangon"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Arrival Country
                  </label>
                  <input
                    type="text"
                    value={arrivalCountry}
                    onChange={(e) => setArrivalCountry(e.target.value)}
                    placeholder="e.g. Myanmar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Flight Number / Airline (Optional)
                </label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="e.g. TG 304, SQ 638, or British Airways"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section 2: Four Mandatory Dates */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                2. Key Dates (Handover & Delivery Milestones)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Last Drop Off Date */}
                <div className="p-3 bg-rose-50/50 border border-rose-200/60 rounded-xl">
                  <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    Last Drop-Off Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={lastDropOffDate}
                    onChange={(e) => setLastDropOffDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Deadline for senders to give you parcels
                  </span>
                </div>

                {/* Departure Date */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Flight Departure Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Day your flight leaves
                  </span>
                </div>

                {/* Arrival Date */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Flight Arrival Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Day you land at destination
                  </span>
                </div>

                {/* Check Out Date */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl">
                  <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Check-Out / Pickup Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    When receiver can collect the item
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Weight Capacity & Handover Locations */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-amber-600" />
                3. Weight Capacity & Locations
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Spare Weight (kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    required
                    value={weightCapacityKg}
                    onChange={(e) => setWeightCapacityKg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departure Handover Spot
                  </label>
                  <input
                    type="text"
                    value={dropOffLocationNote}
                    onChange={(e) => setDropOffLocationNote(e.target.value)}
                    placeholder="e.g. BTS Asok or Suvarnabhumi Airport Gate 4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Pickup Spot
                </label>
                <input
                  type="text"
                  value={pickUpLocationNote}
                  onChange={(e) => setPickUpLocationNote(e.target.value)}
                  placeholder="e.g. Junction City Mall or Yangon Airport Arrival Hall"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
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

            {/* Section 5: Mandatory Contact Preferences (WhatsApp, Viber, Telegram) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  5. Contact Channels (WhatsApp, Viber, Telegram) *
                </h4>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Direct Contact Buttons
                </span>
              </div>

              <p className="text-xs text-slate-500">
                These will generate direct clickable contact buttons on your trip post for senders to connect instantly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+66 81 234 5678"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Viber */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                    Viber Number
                  </label>
                  <input
                    type="text"
                    value={viber}
                    onChange={(e) => setViber(e.target.value)}
                    placeholder="+95 9 1234 5678"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-sky-500" />
                    Telegram Handle
                  </label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@traveler_username"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Preferred Contact Radio */}
              <div className="pt-2 flex items-center gap-4 text-xs">
                <span className="font-semibold text-slate-700">Preferred channel:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="preferred_contact"
                    checked={preferredContact === 'whatsapp'}
                    onChange={() => setPreferredContact('whatsapp')}
                    className="text-amber-500"
                  />
                  <span>WhatsApp</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="preferred_contact"
                    checked={preferredContact === 'telegram'}
                    onChange={() => setPreferredContact('telegram')}
                    className="text-amber-500"
                  />
                  <span>Telegram</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
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
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Publish Trip Classified</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
