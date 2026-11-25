import { CargoPartner } from '../types/partner';

export const CARGO_PARTNERS: readonly CargoPartner[] = [
  {
    id: 'khint-power',
    name: 'Khint Power International Trading Co.,Ltd.',
    shortName: 'Khint Power Cargo',
    categoryLabel: 'Cargo Partner',
    tagline: 'International Air Cargo & E-Commerce Forwarding',
    description:
      'Dedicated international air freight forwarder and e-commerce cargo specialist connecting Myanmar with global destinations worldwide.',
    logoUrl: '/ads/khint-power-logo.jpg',
    fallbackLogoUrl: '/ads/khint-power-logo.jpg',
    establishedYear: '2019',
    servicesOffered: [
      'Air Cargo Express',
      'E-Commerce Parcel Consolidation & Repacking',
      'Customs Clearance & Documentation',
      'Door-to-Door Delivery Service',
    ],
    serviceRegions: [
      { country: 'Myanmar' },
      { country: 'Thailand' },
      { country: 'Vietnam' },
      { country: 'Singapore' },
      { country: 'Malaysia' },
      { country: 'Japan' },
      { country: 'South Korea' },
      { country: 'US' },
      { country: 'Canada' },
      { country: 'UK' },
      { country: 'France' },
      { country: 'Germany' },
      { country: 'Finland' },
      { country: 'India' },
      { country: 'China' },
      { country: 'Australia' },
      { country: 'New Zealand' },
      { country: 'UAE' },
      { country: 'Qatar' },
      { country: 'Dubai' },
    ],
    freightModes: [
      {
        mode: 'air',
        title: 'Air Cargo Express',
        transitTime: 'Global Express Air Service',
        cutOffSchedule: 'Daily intake and dispatch',
        minWeight: '1 kg minimum',
        rateNote: 'Billed by actual or volumetric weight (whichever is higher)',
        highlights: [
          'Fast door-to-door global delivery',
          'Affordable kilo rates for international shipments',
          'Dedicated customer support and parcel tracking',
        ],
      },
    ],
    addresses: [
      {
        id: 'kp-mm-ygn-hq',
        country: 'Myanmar',
        city: 'Yangon',
        branchName: 'Yangon Headquarters & Warehouse',
        addressLine: 'No.(99) Min Ye Kyaw Swar (7) Street, (7) Ward, South Okkalapa',
        postalCode: '11091',
        receivingCodeHint: 'Label parcels with your recipient name and phone number',
        hoursNote: 'Open Monday – Saturday: 09:00 AM – 06:00 PM',
      },
    ],
    businessHours: {
      timezone: 'MMT (UTC+6:30) / ICT (UTC+7)',
      summary: 'Mon – Sat: 09:00 AM – 06:00 PM',
      schedule: [
        { days: 'Monday – Saturday', hours: '09:00 AM – 06:00 PM', note: 'Customer support, parcel drop-off & intake' },
        { days: 'Sunday', hours: 'Closed', note: 'Online inquiries answered on Monday morning' },
      ],
    },
    announcements: [
      {
        id: 'kp-promo-burmese',
        title: 'Khint Power Logistics - နိုင်ငံတကာ ကုန်ပစ္စည်းပို့ဆောင်ရေး',
        date: '2026-11-24',
        pinned: true,
        category: 'promotion',
        content:
          'နိုင်ငံတကာကို ကုန်ပစ္စည်းပို့ချင်တဲ့ Customer တွေရှိရင် Khint Power Logistics နဲ့ ပို့ဆောင်လိုက်ပါ 🥳အိမ်အရောက်ပို့ဆောင်တဲ့အပြင်kilo စျေးလဲသက်သာပါတယ် 🤩service💝 အပိုင်းဆိုရင်လဲ Customer စိတ်တိုင်းကြ ပို့ဆောင်ပေးတာဖြစ်လို့ ကုန်ပစ္စည်းပို့ဖို့စိတ်ကူးရှိရင် Khint Power မှာ အသေးစိတ် စုံစမ်းမေးမြန်းလိုက်ပါ',
      },
      {
        id: 'kp-ann-global',
        title: 'Global Air Cargo Service & Door-to-Door Delivery',
        date: '2026-11-20',
        pinned: false,
        category: 'rate_update',
        content:
          'We provide reliable international shipping connecting Myanmar with Thailand, Singapore, Malaysia, Japan, Korea, China, India, US, UK, Germany, France, Australia, UAE, and worldwide destinations. Contact us via Viber or WhatsApp for current per-kilo rates.',
      },
    ],
    contacts: {
      phones: [
        {
          id: 'kp-phone-mm',
          label: 'Myanmar Dispatch Desk',
          country: 'Myanmar',
          number: '+959893525826',
        },
        {
          id: 'kp-phone-de',
          label: 'Germany / International Desk',
          country: 'Germany',
          number: '+4917662404435',
        },
      ],
      whatsapp: [
        {
          id: 'kp-wa-mm',
          label: 'Myanmar WhatsApp Support',
          value: '+959893525826',
        },
        {
          id: 'kp-wa-de',
          label: 'Germany / International WhatsApp',
          value: '+4917662404435',
        },
      ],
      viber: [
        {
          id: 'kp-viber-mm',
          label: 'Myanmar Viber Hotline',
          value: '+959893525826',
        },
        {
          id: 'kp-viber-de',
          label: 'Germany / International Viber',
          value: '+4917662404435',
        },
      ],
      facebook: [
        {
          label: 'Khint Power Cargo Official Page',
          url: 'https://web.facebook.com/Khintpowercargo',
        },
      ],
    },
    volumetricRule: 'Length (cm) × Width (cm) × Height (cm) ÷ 6,000 = Volumetric Weight (kg). Chargeable weight is the greater of Actual Weight or Volumetric Weight.',
    warehouseLabelingSteps: [
      'Contact our Myanmar or Germany/International desk via Viber or WhatsApp to discuss your shipment details.',
      'Prepare your package with clear recipient name, address, and active phone number.',
      'Drop off your parcel at our South Okkalapa warehouse in Yangon or coordinate international handover.',
      'Enjoy fast air cargo delivery with direct door-to-door tracking.',
    ],
    acceptedCargo: [
      'Apparel, Clothing & Fashion Items',
      'Consumer Electronics & Mobile Accessories',
      'Cosmetics, Skincare & Personal Care',
      'Documents, Books & Commercial Samples',
      'Packaged Food, Dry Snacks & Consumer Goods',
    ],
    restrictedCargo: [
      'Flammable Liquids, Aerosols & Compressed Gases',
      'Illegal Narcotics & Controlled Substances',
      'Weapons, Ammunition & Explosives',
      'Unpackaged Lithium Batteries (Bulk)',
      'Perishable Fresh Foods without Proper Packaging',
    ],
  },
];

export function getCargoPartnerById(id?: string | null): CargoPartner | null {
  if (!id || typeof id !== 'string') return null;
  const cleanId = id.trim().toLowerCase();
  return CARGO_PARTNERS.find((partner) => partner.id.toLowerCase() === cleanId) || null;
}
