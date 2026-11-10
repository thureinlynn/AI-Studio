import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'my';

interface Translations {
  [key: string]: {
    en: string;
    my: string;
  };
}

export const translations: Translations = {
  // Brand
  brandName: { en: 'LuuKyone', my: 'လူကြုံ' },
  brandSubtitle: { en: 'Traveler Classifieds', my: 'ခရီးသွား ပစ္စည်းကြုံ ကြော်ငြာ' },
  footerBrandSubtitle: { en: 'Free Traveler Classified Bulletin', my: 'အခမဲ့ ခရီးသွား ပစ္စည်းကြုံ ကြော်ငြာသင်ပုန်း' },
  footerCopyright: {
    en: '© 2026 LuuKyone. A free community connecting travelers with luggage space.',
    my: '© ၂၀၂၆ လူကြုံ (LuuKyone)။ ခရီးသွားများနှင့် ပစ္စည်းကြုံပို့သူများ ချိတ်ဆက်ပေးသော အခမဲ့ ပလက်ဖောင်း။',
  },
  footerMessaging: {
    en: 'Direct WhatsApp, Viber & Telegram contact',
    my: 'WhatsApp, Viber နှင့် Telegram ဖြင့် တိုက်ရိုက်ဆက်သွယ်နိုင်ပါသည်',
  },

  // Header Nav
  navBrowse: { en: 'Browse Trips', my: 'ခရီးစဉ်များ' },
  navHowItWorks: { en: 'How It Works', my: 'လုပ်ဆောင်ပုံ' },
  navSafety: { en: 'Safety Rules', my: 'စည်းကမ်းနှင့် လုံခြုံရေး' },
  navMyPosts: { en: 'My Posts', my: 'ကျွန်ုပ်၏ ပို့စ်များ' },
  navPost: { en: 'Post', my: 'တင်မည်' },
  navLogin: { en: 'Log In', my: 'အကောင့်ဝင်ရန်' },
  navAccount: { en: 'Account', my: 'အကောင့်' },
  navSettings: { en: 'Settings', my: 'ဆက်တင်များ' },

  // Mobile Nav
  mobileHome: { en: 'Home', my: 'ပင်မ' },
  mobileMyTrips: { en: 'My Trips', my: 'ခရီးစဉ်များ' },
  mobileAccount: { en: 'Account', my: 'အကောင့်' },
  mobileSettings: { en: 'Settings', my: 'ဆက်တင်' },

  // Search & Filter
  searchQueryPlaceholder: {
    en: 'Search any city, country, or announcement...',
    my: 'မြို့၊ နိုင်ငံ သို့မဟုတ် ကြေညာချက် ရှာရန်...',
  },
  fromPlaceholder: { en: 'From: e.g. Bangkok', my: 'ထွက်ခွာ: ဥပမာ ဘန်ကောက်' },
  toPlaceholder: { en: 'To: e.g. Yangon', my: 'ရောက်ရှိ: ဥပမာ ရန်ကုန်' },
  clearFilters: { en: 'Clear', my: 'ဖျက်မည်' },
  sortLabel: { en: 'Sort:', my: 'စီစဉ်ရန်:' },
  sortDateAsc: { en: 'Departure Date (Earliest First)', my: 'ထွက်ခွာမည့်ရက် (အစောဆုံး)' },
  sortNewest: { en: 'Recently Posted', my: 'မကြာသေးမီက တင်ထားသော' },
  availableTripsHeading: { en: 'Available Traveler Trips', my: 'ရရှိနိုင်သော ခရီးစဉ်များ' },
  tripSingular: { en: 'trip available', my: 'ခု ရရှိနိုင်သည်' },
  tripPlural: { en: 'trips available', my: 'ခု ရရှိနိုင်သည်' },
  noTripsTitle: { en: 'No trips posted yet', my: 'ခရီးစဉ် မရှိသေးပါ' },
  noTripsDesc: {
    en: 'Start by posting your first trip! Share your flight departure, arrival destination, and spare luggage capacity with senders.',
    my: 'သင်၏ ပထမဆုံး ခရီးစဉ်ကို စတင်တင်လိုက်ပါ! လေယာဉ်ထွက်ခွာမည့်ရက်၊ ဆိုက်ရောက်မည့်မြို့နှင့် ပစ္စည်းကြုံနေရာများကို မျှဝေလိုက်ပါ။',
  },
  postFirstTripBtn: { en: 'Post the First Trip', my: 'ပထမဆုံး ခရီးစဉ် တင်မည်' },
  noMatchingTitle: { en: 'No matching trips found', my: 'ကိုက်ညီသော ခရီးစဉ် မရှိပါ' },
  noMatchingDesc: {
    en: "We couldn't find any traveler trips matching your route or criteria. Try clearing filters or post a new trip.",
    my: 'သင်ရှာဖွေသော လမ်းကြောင်းနှင့် ကိုက်ညီသည့် ခရီးစဉ် မတွေ့ရှိပါ။ စစ်ထုတ်မှုများကို ရှင်းလင်းပါ သို့မဟုတ် ခရီးစဉ်အသစ် တင်ပါ။',
  },

  // Trip Card
  cardDropOff: { en: 'Drop-off', my: 'ပစ္စည်းပေးရက်' },
  cardDelivery: { en: 'Delivery', my: 'ပစ္စည်းထုတ်ယူရက်' },
  cardDetails: { en: 'Details', my: 'အသေးစိတ်' },
  cardTripsCompleted: { en: 'trips completed', my: 'ကြိမ် ခရီးစဉ် ပြီးမြောက်' },

  // Trip Detail
  detailBack: { en: 'Back to All Trips', my: 'ခရီးစဉ်များအားလုံးသို့' },
  detailShare: { en: 'Share Trip', my: 'ခရီးစဉ် မျှဝေရန်' },
  detailLinkCopied: { en: 'Link Copied!', my: 'လင့်ခ် ကူးယူပြီးပါပြီ!' },
  detailDepartureCity: { en: 'Departure City', my: 'ထွက်ခွာမည့်မြို့' },
  detailArrivalCity: { en: 'Arrival City', my: 'ရောက်ရှိမည့်မြို့' },
  detailLastDropOff: { en: 'Last Drop-off', my: 'နောက်ဆုံး ပစ္စည်းပေးရက်' },
  detailDepartureDate: { en: 'Departure Date', my: 'ထွက်ခွာမည့်ရက်' },
  detailArrivalDate: { en: 'Arrival Date', my: 'ဆိုက်ရောက်မည့်ရက်' },
  detailCheckOutDate: { en: 'Check-Out Date', my: 'ပစ္စည်းထုတ်ယူရက်' },
  detailReadyPickup: { en: 'Ready for pickup', my: 'ထုတ်ယူနိုင်သည့်ရက်' },
  detailFlightDate: { en: 'Flight date', my: 'လေယာဉ်ပျံသန်းမည့်ရက်' },
  detailLands: { en: 'Lands at destination', my: 'ဆိုက်ရောက်မည့်အချိန်' },
  detailAnnouncementTitle: {
    en: 'Announcement for the service',
    my: 'ဝန်ဆောင်မှုအတွက် ကြေညာချက်',
  },
  detailDropOffHandover: {
    en: 'Drop-Off Handover (Departure City)',
    my: 'ပစ္စည်းပေးအပ်မည့်နေရာ (ထွက်ခွာမည့်မြို့)',
  },
  detailPickupLocation: {
    en: 'Check-Out Pickup (Arrival City)',
    my: 'ပစ္စည်းထုတ်ယူမည့်နေရာ (ဆိုက်ရောက်မည့်မြို့)',
  },
  detailGuidelinesTitle: {
    en: 'Item Guidelines & Customs Compliance',
    my: 'ပစ္စည်းပို့ဆောင်မှု စည်းကမ်းချက်များနှင့် အကောက်ခွန် ဥပဒေ',
  },
  detailAccepted: { en: 'Accepted Parcel Categories', my: 'လက်ခံနိုင်သော ပစ္စည်းအမျိုးအစားများ' },
  detailProhibited: { en: 'Strictly Prohibited Items', my: 'လုံးဝ တားမြစ်ထားသော ပစ္စည်းများ' },
  detailSafetyNotice: {
    en: 'Inspect all parcels together in person at drop-off.',
    my: 'ပစ္စည်းပေးအပ်ချိန်တွင် လူချင်းတွေ့ဆုံပြီး အတူတကွ သေချာစစ်ဆေးပါ။',
  },
  detailReadSafetyGuide: { en: 'Read Safety Guide', my: 'လုံခြုံရေး လမ်းညွှန် ဖတ်ရန်' },
  detailTravelerProfile: { en: 'Traveler Profile', my: 'ခရီးသွား ပရိုဖိုင်' },
  detailMemberSince: { en: 'Member since', my: 'အသုံးပြုသည့်ရက်' },
  detailDirectContactTitle: { en: 'Direct Traveler Contact', my: 'ခရီးသွားနှင့် တိုက်ရိုက် ဆက်သွယ်ရန်' },
  detailDirectContactDesc: {
    en: 'Tap any button below to connect with the traveler directly on their verified messaging apps.',
    my: 'အောက်ပါ ခလုတ်များကို နှိပ်ပြီး ခရီးသွားထံသို့ တိုက်ရိုက် မက်ဆေ့ခ်ျ ပို့နိုင်ပါသည်။',
  },
  detailChatWhatsApp: { en: 'Chat on WhatsApp', my: 'WhatsApp ဖြင့် ဆက်သွယ်ရန်' },
  detailMessageTelegram: { en: 'Message on Telegram', my: 'Telegram ဖြင့် ဆက်သွယ်ရန်' },
  detailConnectFacebook: { en: 'Connect on Facebook', my: 'Facebook ဖြင့် ဆက်သွယ်ရန်' },
  detailCallViber: { en: 'Connect on Viber', my: 'Viber ဖြင့် ဆက်သွယ်ရန်' },
  detailCopy: { en: 'Copy', my: 'ကူးမည်' },
  detailCopied: { en: 'Copied', my: 'ကူးပြီး' },

  // Post Modal
  postModalHeading: { en: 'Post a Traveler Trip', my: 'ခရီးသွား ပို့စ်အသစ် တင်မည်' },
  postModalSubheading: {
    en: 'Share your upcoming flight route and extra baggage space with the community.',
    my: 'သင်၏ လေယာဉ်ခရီးစဉ်နှင့် ပစ္စည်းကြုံနေရာများကို မျှဝေလိုက်ပါ။',
  },
  postSectionRoute: { en: '1. Route & Flight Schedule', my: '၁။ ခရီးစဉ်နှင့် လေယာဉ် အချက်အလက်' },
  postSectionTiming: { en: '2. Drop-off & Pickup Dates', my: '၂။ ပစ္စည်းပေးရက်နှင့် ထုတ်ယူရက်များ' },
  postSectionLocations: { en: '3. Handover & Pickup Locations', my: '၃။ ပစ္စည်းပေးအပ်မည့်နေရာနှင့် ထုတ်ယူမည့်နေရာ' },
  postSectionAnnouncement: { en: '4. Traveler Announcement & Conditions', my: '၄။ ခရီးသွား ကြေညာချက်နှင့် စည်းကမ်းများ' },
  postSectionContacts: { en: '5. Direct Contact Channels', my: '၅။ တိုက်ရိုက် ဆက်သွယ်ရန် လိပ်စာများ' },
  postDepartureCityLabel: { en: 'Departure City *', my: 'ထွက်ခွာမည့်မြို့ *' },
  postArrivalCityLabel: { en: 'Arrival City *', my: 'ရောက်ရှိမည့်မြို့ *' },
  postDepartureCountryLabel: { en: 'Departure Country', my: 'ထွက်ခွာမည့်နိုင်ငံ' },
  postArrivalCountryLabel: { en: 'Arrival Country', my: 'ရောက်ရှိမည့်နိုင်ငံ' },
  postFlightNumberLabel: { en: 'Flight Number (Optional)', my: 'လေယာဉ်နံပါတ် (မထည့်လည်းရပါသည်)' },
  postLastDropOffLabel: { en: 'Last Drop-off Date *', my: 'နောက်ဆုံး ပစ္စည်းပေးအပ်ရမည့်ရက် *' },
  postDepartureDateLabel: { en: 'Flight Departure Date *', my: 'လေယာဉ်ထွက်ခွာမည့်ရက် *' },
  postArrivalDateLabel: { en: 'Flight Arrival Date *', my: 'လေယာဉ်ဆိုက်ရောက်မည့်ရက် *' },
  postCheckOutDateLabel: { en: 'Check-out / Pickup Date *', my: 'ပစ္စည်းထုတ်ယူနိုင်မည့်ရက် *' },
  postDropOffLocationLabel: { en: 'Departure Handover Spot', my: 'ထွက်ခွာမည့်မြို့တွင် ပစ္စည်းပေးအပ်မည့်နေရာ' },
  postPickUpLocationLabel: { en: 'Destination Pickup Spot', my: 'ဆိုက်ရောက်မည့်မြို့တွင် ပစ္စည်းထုတ်ယူမည့်နေရာ' },
  postAnnouncementPlaceholder: {
    en: 'Write conditions for your luggage space (e.g. accepting parcels, snacks, clothes, document envelopes. Note any restrictions)...',
    my: 'သင်၏ ပစ္စည်းကြုံအတွက် အသေးစိတ်စည်းကမ်းချက်များ ရေးသားပါ (ဥပမာ စာရွက်စာတမ်း၊ အဝတ်အထည်၊ မုန့်ပဲသရေစာ လက်ခံနိုင်သည်)...',
  },
  postSubmitBtn: { en: 'Post', my: 'တင်မည်' },
  postCancelBtn: { en: 'Cancel', my: 'မလုပ်တော့ပါ' },

  // Auth Modal
  authSignInTitle: { en: 'Sign in to LuuKyone', my: 'လူကြုံ (LuuKyone) သို့ ဝင်ရန်' },
  authRegisterTitle: { en: 'Create Traveler Profile', my: 'ခရီးသွား အကောင့်အသစ်ဖွင့်ရန်' },
  authNameLabel: { en: 'Full Name *', my: 'အမည်အပြည့်အစုံ *' },
  authEmailLabel: { en: 'Email Address *', my: 'အီးမေးလ်လိပ်စာ *' },
  authWhatsAppLabel: { en: 'WhatsApp Number', my: 'WhatsApp ဖုန်းနံပါတ်' },
  authViberLabel: { en: 'Viber Number', my: 'Viber ဖုန်းနံပါတ်' },
  authTelegramLabel: { en: 'Telegram Username', my: 'Telegram ယူဆာနိမ်း' },
  authBioLabel: { en: 'Short Bio (Optional)', my: 'မိမိအကြောင်း အကျဉ်း (မထည့်လည်းရပါသည်)' },
  authSignInBtn: { en: 'Sign In', my: 'အကောင့်ဝင်ရန်' },
  authRegisterBtn: { en: 'Create Account', my: 'အကောင့်သစ် ဖွင့်မည်' },
  authSwitchToRegister: { en: "Don't have an account? Create Profile", my: 'အကောင့် မရှိသေးဘူးလား? အကောင့်သစ်ဖွင့်ရန်' },
  authSwitchToSignIn: { en: 'Already have an account? Sign In', my: 'အကောင့် ရှိပြီးသားလား? ဝင်ရောက်ရန်' },
  authSignOut: { en: 'Sign Out', my: 'အကောင့်မှ ထွက်မည်' },

  // My Trips
  myTripsHeading: { en: 'My Posted Trips', my: 'ကျွန်ုပ်၏ ခရီးစဉ်များ' },
  myTripsSubheading: {
    en: 'Manage your active flights, schedules, and traveler announcements.',
    my: 'သင်တင်ထားသော လေယာဉ်ခရီးစဉ်များနှင့် ကြေညာချက်များကို စီမံခန့်ခွဲပါ။',
  },
  postAnotherTrip: { en: 'Post Another Trip', my: 'ခရီးစဉ်အသစ် ထပ်တင်မည်' },
  noMyTripsTitle: { en: 'No Trips Posted Yet', my: 'ခရီးစဉ် မတင်ရသေးပါ' },
  noMyTripsDesc: {
    en: "You haven't listed any trips yet. Have extra baggage on an upcoming flight?",
    my: 'သင်သည် ခရီးစဉ် မတင်ရသေးပါ။ လာမည့်ခရီးစဉ်တွင် ပစ္စည်းကြုံနေရာ ပိုနေပါသလား?',
  },
  statusActive: { en: 'Status: Active', my: 'အခြေအနေ: ဖွင့်လှစ်ထားသည်' },
  statusBooked: { en: 'Status: Fully Booked', my: 'အခြေအနေ: ပြည့်သွားပါပြီ' },

  // How It Works
  howBadge: { en: 'Peer-to-Peer Traveler Space', my: 'ခရီးသွားများအချင်းချင်း ပစ္စည်းကြုံနေရာ မျှဝေခြင်း' },
  howTitle: { en: 'How LuuKyone Works', my: 'လူကြုံ (LuuKyone) လုပ်ဆောင်ပုံ' },
  howSubtitle: {
    en: 'A completely free classified bulletin for travelers flying with empty luggage allowance to assist people sending packages worldwide.',
    my: 'ခရီးသည်များ မိမိတို့၏ လေယာဉ်ခရီးစဉ်တွင် ပိုနေသော ပစ္စည်းတင်ဆောင်ခွင့်ဖြင့် ပစ္စည်းပို့လိုသူများကို အခမဲ့ ကူညီပေးနိုင်သော ကြော်ငြာသင်ပုန်း ဖြစ်ပါသည်။',
  },
  howForSenders: { en: 'For Senders', my: 'ပစ္စည်းပို့လိုသူများအတွက်' },
  howForSendersDesc: { en: 'Need to transport documents or goods abroad', my: 'ပြည်ပသို့ စာရွက်စာတမ်း သို့မဟုတ် ပစ္စည်းများ ပို့ဆောင်လိုသူများ' },
  howSenderStep1Title: { en: '1. Search Your Destination Route', my: '၁။ သင်သွားလိုသော ခရီးစဉ်ကို ရှာဖွေပါ' },
  howSenderStep1Desc: {
    en: 'Browse trips matching your departure city and arrival location. Filter by available weight capacity and dates.',
    my: 'သင်ထွက်ခွာမည့်မြို့နှင့် ဆိုက်ရောက်မည့်မြို့နှင့် ကိုက်ညီသော ခရီးစဉ်များကို ရှာဖွေပြီး ထွက်ခွာရက်နှင့် ပစ္စည်းပေးရက်များကို စစ်ဆေးပါ။',
  },
  howSenderStep2Title: { en: '2. Direct One-Click Messaging', my: '၂။ ခရီးသွားထံ တိုက်ရိုက် မက်ဆေ့ခ်ျပို့ပါ' },
  howSenderStep2Desc: {
    en: 'Tap the WhatsApp, Telegram, or Viber button to message the traveler directly. No sign-up wall to reach travelers.',
    my: 'WhatsApp, Viber သို့မဟုတ် Telegram ခလုတ်ကို နှိပ်ပြီး ခရီးသွားနှင့် တိုက်ရိုက် မက်ဆေ့ခ်ျပို့ ဆက်သွယ်နိုင်ပါသည်။',
  },
  howSenderStep3Title: { en: '3. Meet Before Last Drop-off Date', my: '၃။ နောက်ဆုံး ပစ္စည်းပေးရက်မတိုင်မီ လူချင်းတွေ့ဆုံပါ' },
  howSenderStep3Desc: {
    en: 'Bring the package open for physical inspection. Meet the traveler at the agreed spot before their departure deadline.',
    my: 'ပစ္စည်းကို မပိတ်ထားဘဲ အတူတကွ စစ်ဆေးနိုင်ရန် ယူဆောင်လာပြီး သတ်မှတ်ထားသော နေရာတွင် ခရီးသွားနှင့် လူချင်းတွေ့ဆုံပေးအပ်ပါ။',
  },
  howForTravelers: { en: 'For Travelers', my: 'ခရီးသွားများအတွက်' },
  howForTravelersDesc: { en: 'Have extra baggage allowance on your flight', my: 'မိမိ၏ လေယာဉ်ခရီးစဉ်တွင် ပစ္စည်းကြုံတင်ဆောင်နိုင်သော နေရာရှိသူများ' },
  howTravelerStep1Title: { en: '1. Post Your Trip Classified', my: '၁။ ခရီးစဉ်ကြော်ငြာ တင်လိုက်ပါ' },
  howTravelerStep1Desc: {
    en: 'Sign in and enter your flight cities, departure & arrival dates, drop-off deadline, check-out date, and spare kg.',
    my: 'လေယာဉ်ထွက်ခွာမည့်မြို့၊ ဆိုက်ရောက်မည့်မြို့၊ ပစ္စည်းပေးရက်နှင့် ထုတ်ယူရက်များကို ထည့်သွင်းပြီး အခမဲ့ တင်ပါ။',
  },
  howTravelerStep2Title: { en: '2. Set Clear Item Conditions', my: '၂။ လက်ခံနိုင်သော ပစ္စည်းအမျိုးအစား သတ်မှတ်ပါ' },
  howTravelerStep2Desc: {
    en: 'Specify what you can carry (clothes, documents, snacks) and your preferred contact method (WhatsApp, Viber, Telegram).',
    my: 'မိမိတင်ဆောင်ပေးနိုင်သော ပစ္စည်းများ (စာရွက်စာတမ်း၊ အဝတ်အထည်၊ မုန့်ပဲသရေစာ) နှင့် ဆက်သွယ်ရန် နည်းလမ်းများကို ဖော်ပြပါ။',
  },
  howTravelerStep3Title: { en: '3. Hand Over at Destination', my: '၃။ ဆိုက်ရောက်မြို့တွင် ပစ္စည်းပြန်လည်လွှဲပြောင်းပေးပါ' },
  howTravelerStep3Desc: {
    en: 'Deliver the parcel to the recipient on the agreed check-out date at your destination city.',
    my: 'ဆိုက်ရောက်မည့်မြို့တွင် သဘောတူထားသော ပစ္စည်းထုတ်ယူရက်၌ လက်ခံသူထံသို့ ပစ္စည်း လွှဲပြောင်းပေးအပ်ပါ။',
  },
  howCtaTitle: { en: 'Flying with spare luggage space?', my: 'လေယာဉ်ခရီးစဉ်တွင် ပစ္စည်းတင်ဆောင်ရန် နေရာပိုနေပါသလား?' },
  howCtaDesc: {
    en: 'Post your trip information in 2 minutes and connect directly with senders.',
    my: '၂ မိနစ်အတွင်း ခရီးစဉ်ကြော်ငြာတင်ပြီး ပစ္စည်းပို့လိုသူများနှင့် တိုက်ရိုက်ချိတ်ဆက်ပါ။',
  },
  howPostTripBtn: { en: '+ Post a Trip', my: '+ ခရီးစဉ် တင်မည်' },
  howBrowseBtn: { en: 'Browse Listings', my: 'ခရီးစဉ်များ ကြည့်မည်' },

  // Safety Rules
  safetyModalTitle: { en: 'Community Courier Safety & Rules', my: 'အသိုက်အဝန်း လုံခြုံရေးနှင့် စည်းကမ်းချက်များ' },
  safetyGoldenRuleTitle: { en: 'Golden Rule of Air Travel:', my: 'လေကြောင်းခရီးသွားများ လိုက်နာရမည့် ရွှေစည်းကမ်း:' },
  safetyGoldenRuleDesc: {
    en: 'As the passenger checking in luggage, you are legally responsible for all items in your baggage under international aviation regulations.',
    my: 'မိမိအမည်ဖြင့် တင်ဆောင်သော အိတ်အတွင်းရှိ ပစ္စည်းအားလုံးအတွက် နိုင်ငံတကာ လေကြောင်းဥပဒေအရ ခရီးသည်ကိုယ်တိုင် တာဝန်ရှိပါသည်။',
  },
  safetyRule1Title: { en: '1. Always Inspect In-Person Before Handover', my: '၁။ ပစ္စည်းပေးအပ်ချိန်တွင် လူချင်းတွေ့ဆုံ၍ အမြဲတမ်း စစ်ဆေးပါ' },
  safetyRule1Desc: {
    en: 'Never accept closed, gift-wrapped, or pre-taped boxes without examining the contents together. Senders must keep items visible until the traveler verifies them.',
    my: 'အထဲတွင် မည်သည့်ပစ္စည်းပါသည်ကို အတူတကွ မစစ်ဆေးရသေးဘဲ တိပ်ပိတ်ထားသော သို့မဟုတ် လက်ဆောင်ထုပ်ပိုးထားသော ပါဆယ်များကို လုံးဝ လက်မခံပါနှင့်။',
  },
  safetyRule2Title: { en: '2. Zero Tolerance Prohibited Items', my: '၂။ လုံးဝ တားမြစ်ထားသော ပစ္စည်းများ' },
  safetyRule2Desc: {
    en: 'No prescription drugs without verified medical paperwork, no hazardous materials, lithium batteries in checked bags, flammable liquids, weapons, or unlicensed food.',
    my: 'တရားဝင် ဆရာဝန်ဆေးစာမပါသော ဆေးဝါးများ၊ လီသီယမ်ဘက်ထရီများ၊ မီးလောင်လွယ်သော အရည်များ၊ လက်နက်များနှင့် တရားမဝင် ပစ္စည်းများကို လုံးဝ သယ်ဆောင်ခွင့်မပြုပါ။',
  },
  safetyRule3Title: { en: '3. Weigh Accurately at Drop-off', my: '၃။ ပစ္စည်းပေးအပ်ချိန်တွင် တိကျစွာ အလေးချိန်ချိန်ပါ' },
  safetyRule3Desc: {
    en: 'Bring luggage scales or weigh packages during handover to avoid airline excess weight charges at the airport counter.',
    my: 'လေဆိပ်တွင် အလေးချိန်ပိုကြေး ပေးဆောင်ရခြင်းမှ ကင်းဝေးစေရန် ပစ္စည်းလွှဲပြောင်းချိန်တွင် အလေးချိန် တိကျစွာ ချိန်တွယ်ပါ။',
  },
  safetyRule4Title: { en: '4. Clear Photo Records & Direct Messaging', my: '၄။ ဓာတ်ပုံမှတ်တမ်းယူပြီး တိုက်ရိုက် မက်ဆေ့ခ်ျဖြင့် အတည်ပြုပါ' },
  safetyRule4Desc: {
    en: 'Take photos of the item and receipt during handover and share on WhatsApp / Telegram / Viber as mutual proof of condition and custody.',
    my: 'ပစ္စည်းလွှဲပြောင်းချိန်တွင် ပစ္စည်း၏ အခြေအနေကို ဓာတ်ပုံရိုက်ပြီး WhatsApp/Viber/Telegram တွင် အပြန်အလှန် ပေးပို့မှတ်တမ်းတင်ထားပါ။',
  },
  safetyAgreeBtn: { en: 'I Understand & Agree', my: 'နားလည်သဘောတူပါသည်' },

  // Item guidelines
  detailNeverAcceptNotice: {
    en: 'Never accept uninspected sealed packages or illegal goods',
    my: 'မစစ်ဆေးရသေးသော အလုံပိတ် ပါဆယ်များနှင့် တရားမဝင်ပစ္စည်းများကို လုံးဝ လက်မခံပါနှင့်',
  },

  // Settings
  settingsTitle: { en: 'Settings', my: 'ဆက်တင်များ' },
  settingsSubtitle: {
    en: 'Manage application preferences, language, appearance, and units.',
    my: 'ဘာသာစကား၊ အလင်း/အမှောင်၊ အတိုင်းအတာ ယူနစ်များနှင့် အထွေထွေ ဆက်တင်များကို ပြင်ဆင်ပါ။',
  },
  settingsAppearance: { en: 'Appearance & Theme', my: 'မြင်ကွင်းနှင့် အလင်း/အမှောင်' },
  settingsThemeLabel: { en: 'Display Theme', my: 'အလင်း/အမှောင် ရွေးချယ်မှု' },
  settingsThemeDesc: {
    en: 'Switch between clean light theme and eye-friendly dark mode.',
    my: 'အလင်းရောင် သို့မဟုတ် ညဘက်သုံး အမှောင်မုဒ်သို့ ပြောင်းလဲပါ။',
  },
  themeLight: { en: 'Light Mode', my: 'အလင်းမုဒ်' },
  themeDark: { en: 'Dark Mode', my: 'အမှောင်မုဒ်' },
  themeSystem: { en: 'System Default', my: 'စက်သတ်မှတ်ချက်' },
  settingsLanguage: { en: 'Language & Region', my: 'ဘာသာစကားနှင့် ဒေသ' },
  settingsLangDesc: {
    en: 'Choose your preferred language for navigation, listings, and forms.',
    my: 'အက်ပ်အသုံးပြုမည့် ဘာသာစကားကို ရွေးချယ်ပါ။',
  },
  settingsLangEnglish: { en: 'English', my: 'အင်္ဂလိပ် (English)' },
  settingsLangMyanmar: { en: 'မြန်မာ (Burmese)', my: 'မြန်မာ (Burmese)' },
  settingsUnits: { en: 'Units & Measurements', my: 'အတိုင်းအတာ ယူနစ်များ' },
  settingsWeightUnit: { en: 'Luggage Weight Unit', my: 'အလေးချိန် ယူနစ်' },
  settingsWeightDesc: { en: 'Standard unit for spare baggage capacity display', my: 'ခရီးဆောင်အိတ် အလေးချိန်ပြသရန် စံယူနစ်' },
  unitKg: { en: 'Kilograms (kg)', my: 'ကီလိုဂရမ် (kg)' },
  unitLb: { en: 'Pounds (lbs)', my: 'ပေါင် (lbs)' },
  settingsCurrency: { en: 'Preferred Currency Reference', my: 'ငွေကြေး ပြသမှု' },
  settingsCurrencyDesc: { en: 'Display format for service tips & shared cost estimates', my: 'အခကြေးငွေနှင့် ကုန်ကျစရိတ် ပြသမည့် ငွေကြေး' },
  settingsNotifications: { en: 'Direct Inquiries & Alerts', my: 'မက်ဆေ့ခ်ျနှင့် အသိပေးချက်များ' },
  settingsDirectChatNotification: { en: 'Instant Direct Chat Link Redirection', my: 'တိုက်ရိုက် ချိတ်ဆက်မှု အတည်ပြုချက်' },
  settingsDirectChatDesc: {
    en: 'Opens WhatsApp, Telegram, or Viber immediately when contacting travelers.',
    my: 'ခရီးသွားထံ ဆက်သွယ်သည့်အခါ WhatsApp, Telegram သို့မဟုတ် Viber အက်ပ်သို့ တိုက်ရိုက်သွားရောက်ရန်။',
  },
  settingsDataPrivacy: { en: 'Data & Privacy', my: 'ဒေတာနှင့် လုံခြုံရေး' },
  settingsClearCache: { en: 'Reset Search & Filter Cache', my: 'ရှာဖွေမှု မှတ်တမ်းများ ရှင်းလင်းရန်' },
  settingsClearCacheDesc: {
    en: 'Reset your saved destination routes, city filters, and temporary queries.',
    my: 'ရှာဖွေထားသော မြို့များနှင့် စစ်ထုတ်မှုများကို မူလအတိုင်း ပြန်ထားမည်။',
  },
  settingsClearSuccess: { en: 'Search filters reset successfully!', my: 'စစ်ထုတ်မှုများကို ရှင်းလင်းပြီးပါပြီ!' },
  settingsAbout: { en: 'About LuuKyone', my: 'လူကြုံ (LuuKyone) အကြောင်း' },
  settingsVersion: { en: 'Version 1.2.0 (Community Release)', my: 'ဗားရှင်း ၁.၂.၀ (အခမဲ့ ပလက်ဖောင်း)' },
  settingsAboutDesc: {
    en: 'A completely free community bulletin connecting travelers with spare baggage space to people needing parcels transported safely.',
    my: 'ခရီးသွားများနှင့် ပစ္စည်းကြုံပို့သူများကို တိုက်ရိုက် ချိတ်ဆက်ပေးသော အခမဲ့ ကြော်ငြာသင်ပုန်း ဖြစ်ပါသည်။',
  },

  // Public Traveler Profile
  publicProfileTitle: { en: 'Traveler Profile', my: 'ခရီးသွား ပရိုဖိုင်' },
  publicProfileSubtitle: { en: 'Community carrier on LuuKyone classifieds', my: 'လူကြုံ ကြော်ငြာသင်ပုန်းမှ ခရီးသွား' },
  publicTripHistoryTitle: { en: 'Other active trips', my: 'အခြားသော ခရီးစဉ်များ' },
  publicTripHistoryDesc: {
    en: 'Currently active and available trips by this traveler.',
    my: 'ဤခရီးသွား၏ လတ်တလော ဖွင့်လှစ်ထားသော ခရီးစဉ်များ။',
  },
  publicActiveTripsTab: { en: 'Active Trips', my: 'ဖွင့်လှစ်ထားသော ခရီးစဉ်များ' },
  publicCompletedTripsTab: { en: 'Completed Trips', my: 'ပြီးမြောက်ပြီးသော ခရီးစဉ်များ' },
  publicNoTrips: { en: 'No other active trips currently available.', my: 'လတ်တလော အခြားဖွင့်လှစ်ထားသော ခရီးစဉ် မရှိသေးပါ။' },
  viewTripDetails: { en: 'View Trip Details', my: 'ခရီးစဉ် အသေးစိတ် ကြည့်မည်' },
  viewProfile: { en: 'View Profile', my: 'ပရိုဖိုင် ကြည့်မည်' },
};

const ITEM_TRANSLATIONS: Record<string, string> = {
  'Urgent Documents & Letters': 'အရေးကြီး စာရွက်စာတမ်းများနှင့် စာများ',
  'Documents, business contracts & certificates': 'စာရွက်စာတမ်း၊ စာချုပ်များနှင့် လက်မှတ်များ',
  'Clothing & Fashion Goods': 'အဝတ်အထည်နှင့် ဖက်ရှင်သုံးပစ္စည်းများ',
  'Personal clothes, shoes & dry fabric items': 'ကိုယ်ပိုင် အဝတ်အထည်၊ ဖိနပ်နှင့် အသုံးအဆောင်များ',
  'Sealed Packaged Food & Snacks': 'အလုံပိတ် မုန့်ပဲသရေစာနှင့် အစားအသောက်များ',
  'Packaged dry snacks, tea & non-perishable food': 'မုန့်ပဲသရေစာ၊ လက်ဖက်ခြောက်နှင့် မပုပ်သိုးနိုင်သော အစားအစာများ',
  'Small electronics & personal chargers': 'အီလက်ထရောနစ် ပစ္စည်းငယ်များနှင့် အားသွင်းကြိုးများ',
  'Standard cosmetics, sealed lotions & toiletries': 'အလုံပိတ် အလှကုန်များနှင့် အိမ်သုံးပစ္စည်းများ',
  'Prescription drugs without original doctor certificate': 'တရားဝင် ဆရာဝန်ဆေးစာ မပါသော ဆေးဝါးများ',
  'Lithium power banks or e-batteries in checked luggage': 'လေယာဉ်တင်အိတ်အတွင်း ထည့်သွင်းသော Power Bank နှင့် ဘက်ထရီများ',
  'Aerosol sprays, perfumes >100ml, flammable fluids': 'မီးလောင်လွယ်သော အရည်များ၊ ဓာတ်ငွေ့ဖြန်းဘူးများ',
  'Meat products, fresh vegetables, fresh dairy': 'အသားငါး၊ လတ်ဆတ်သော ဟင်းသီးဟင်းရွက်နှင့် နို့ထွက်ပစ္စည်းများ',
  'Weapons, narcotics, and restricted contraband': 'လက်နက်၊ မူးယစ်ဆေးဝါးနှင့် တရားမဝင် တားမြစ်ပစ္စည်းများ',
  'Illegal items or narcotics': 'တရားမဝင် ပစ္စည်းများနှင့် မူးယစ်ဆေးဝါးများ',
  'Batteries & hazardous chemicals': 'ဘက်ထရီများနှင့် အန္တရာယ်ရှိသော ဓာတုပစ္စည်းများ',
  'Uninspected sealed packages': 'မစစ်ဆေးရသေးသော အလုံပိတ် အထုပ်များ',
  'Restricted commercial goods': 'အကောက်ခွန် ကန့်သတ်ထားသော ကုန်သွယ်ပစ္စည်းများ',
  'General Personal Goods': 'အထွေထွေ ကိုယ်ပိုင် အသုံးအဆောင်များ',
};

export function translateItemText(item: string, language: Language): string {
  if (language === 'my') {
    return ITEM_TRANSLATIONS[item] || item;
  }
  return item;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations) => string;
  translateItem: (item: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('luukyone_lang');
      if (saved === 'en' || saved === 'my') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('luukyone_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'my' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: keyof typeof translations): string => {
    const item = translations[key];
    if (!item) return key as string;
    return item[language] || item.en;
  };

  const translateItem = (item: string): string => {
    return translateItemText(item, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateItem }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
