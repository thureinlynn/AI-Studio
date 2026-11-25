import React, { useMemo, useState } from 'react';
import { CargoPartner, PartnerBranchAddress } from '../types/partner';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from './SEO';
import { formatCanonicalUrl, generatePartnerJsonLd } from '../utils/seoUtils';
import {
  formatDateDisplay,
  formatFacebookUrl,
  formatGoogleMapsSearchUrl,
  formatTelUrl,
  formatViberUrl,
  formatWhatsAppUrl,
  getFacebookDisplay,
  sanitizeExternalHttpUrl,
} from '../utils/tripUtils';
import { CountryFlagByName } from './CountrySelect';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Facebook,
  Globe,
  MapPin,
  Megaphone,
  MessageCircle,
  Package,
  Phone,
  PhoneCall,
  Pin,
  Plane,
  Share2,
  Ship,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { trackConversion } from '../firebase';

interface CargoPartnerDetailProps {
  partner: CargoPartner;
}

const MODE_ICON_MAP = {
  air: Plane,
  land: Truck,
  sea: Ship,
  express: Package,
  ecommerce: ShoppingBag,
} as const;

const ANNOUNCEMENT_CATEGORY_LABEL: Record<string, string> = {
  schedule: 'Dispatch Schedule',
  rate_update: 'Rate Update',
  promotion: 'Service Offer',
  notice: 'Customs & Packing Notice',
};

export const CargoPartnerDetail: React.FC<CargoPartnerDetailProps> = ({ partner }) => {
  const { closePartnerDetail } = useTrips();
  const { t } = useLanguage();
  const [logoStage, setLogoStage] = useState<'primary' | 'fallback' | 'initials'>('primary');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);



  // Group multiple branch addresses by country
  const addressesByCountry = useMemo(() => {
    const groups = new Map<string, PartnerBranchAddress[]>();
    for (const addr of partner.addresses) {
      const existing = groups.get(addr.country) || [];
      existing.push(addr);
      groups.set(addr.country, existing);
    }
    return Array.from(groups.entries());
  }, [partner.addresses]);

  const initials = partner.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleShare = () => {
    trackConversion('share_partner', { partnerId: partner.id, name: partner.name });
    const url = formatCanonicalUrl(null, null, partner.id);
    if (navigator.share) {
      navigator
        .share({
          title: `${partner.name} - ${partner.categoryLabel}`,
          text: `${partner.name} — ${partner.tagline}. Served regions: ${partner.serviceRegions
            .map((r) => r.country)
            .join(', ')}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      copyToClipboard(window.location.href || url, 'share');
    }
  };

  const prefilledInquiry = `Hello ${partner.shortName || partner.name}, I found your Cargo Partner profile on LuuKyone and would like to inquire about shipping rates and warehouse drop-off.`;
  const canonicalUrl = formatCanonicalUrl(null, null, partner.id);
  const partnerJsonLd = generatePartnerJsonLd(partner);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10 animate-scaleIn">
      <SEO
        title={`${partner.name} | Cargo Partner — LuuKyone`}
        description={partner.description}
        canonicalUrl={canonicalUrl}
        ogType="article"
        jsonLd={partnerJsonLd}
      />

      {/* Top Back & Share Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={closePartnerDetail}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToListings')}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {copiedKey === 'share' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
          <span>{copiedKey === 'share' ? t('linkCopied') || 'Link Copied' : t('sharePartnerPage')}</span>
        </button>
      </div>

      {/* Company Hero Profile Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Company Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden flex items-center justify-center p-2">
            {logoStage !== 'initials' ? (
              <img
                src={
                  logoStage === 'fallback' && partner.fallbackLogoUrl
                    ? partner.fallbackLogoUrl
                    : partner.logoUrl
                }
                alt={`${partner.name} logo`}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoStage === 'primary' && partner.fallbackLogoUrl) {
                    setLogoStage('fallback');
                  } else {
                    setLogoStage('initials');
                  }
                }}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
                {initials}
              </span>
            )}
          </div>

          {/* Company Title, Category & Overview */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                <Truck className="w-3.5 h-3.5" />
                <span>{partner.categoryLabel}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{partner.tagline}</span>
              {partner.establishedYear && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Est. {partner.establishedYear}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight text-balance">
              {partner.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              နိုင်ငံတကာကို ကုန်ပစ္စည်းပို့ချင်တဲ့ Customer တွေရှိရင် Khint Power Logistics နဲ့ ပို့ဆောင်လိုက်ပါ 🥳အိမ်အရောက်ပို့ဆောင်တဲ့အပြင်kilo စျေးလဲသက်သာပါတယ် 🤩service💝 အပိုင်းဆိုရင်လဲ Customer စိတ်တိုင်းကြ ပို့ဆောင်ပေးတာဖြစ်လို့ ကုန်ပစ္စည်းပို့ဖို့စိတ်ကူးရှိရင် Khint Power မှာ အသေးစိတ် စုံစမ်းမေးမြန်းလိုက်ပါ
            </p>

            {/* Core Services List (Clean Unboxed Typography) */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              {partner.servicesOffered.map((service) => (
                <span key={service} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{service}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Service Available Regions (Compact Mobile-Optimized Chips) */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{t('serviceAvailableRegions')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Active destination delivery corridors worldwide
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                {partner.serviceRegions.length} Regions
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {partner.serviceRegions.map((region) => (
                <div
                  key={region.country}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <CountryFlagByName countryName={region.country} className="w-4 h-3" />
                  <span>{region.country}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Announcements & Information Section */}
          {partner.announcements.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>{t('announcementsAndInfo')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest dispatch updates, cut-off schedules, and parcel notices
                </p>
              </div>

              <div className="space-y-3">
                {partner.announcements.map((post) => (
                  <article
                    key={post.id}
                    className={`p-4 rounded-2xl border transition-colors ${
                      post.pinned
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        {post.title}
                      </span>
                      <time className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatDateDisplay(post.date)}
                      </time>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 3. Freight Forwarding Services, Transit & Rate Structure */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{t('freightModesAndSchedule')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Compare air, land, sea, and parcel consolidation options before booking
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.freightModes.map((mode) => {
                const ModeIcon = MODE_ICON_MAP[mode.mode] || Package;
                return (
                  <div
                    key={mode.mode}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <ModeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{mode.title}</span>
                        </h3>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums shrink-0">
                          {mode.transitTime}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {mode.cutOffSchedule}
                        </div>
                        {mode.minWeight && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            Minimum: {mode.minWeight}
                          </div>
                        )}
                      </div>

                      <ul className="space-y-1.5">
                        {mode.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400">
                      {mode.rateNote}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Branch & Warehouse Addresses Grouped by Country */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Warehouses & Branch Addresses</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multiple drop-off warehouses and pickup offices organized by country
              </p>
            </div>

            <div className="space-y-6">
              {addressesByCountry.map(([country, branches]) => (
                <div key={country} className="space-y-3">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <CountryFlagByName countryName={country} className="w-6 h-4" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {country}
                    </h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                      ({branches.length} {branches.length === 1 ? 'location' : 'locations'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.map((branch) => {
                      const fullAddressText = `${branch.branchName}, ${branch.addressLine}, ${branch.city}${
                        branch.postalCode ? ` ${branch.postalCode}` : ''
                      }, ${branch.country}`;
                      const mapsUrl = formatGoogleMapsSearchUrl(
                        `${branch.addressLine}, ${branch.city}, ${branch.country}`
                      );
                      return (
                        <div
                          key={branch.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {branch.branchName}
                              </h4>
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                {branch.city}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                              <span>
                                {branch.addressLine}
                                {branch.postalCode ? `, ${branch.postalCode}` : ''}
                              </span>
                            </p>

                            {branch.receivingCodeHint && (
                              <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 rounded-xl px-2.5 py-1.5">
                                {branch.receivingCodeHint}
                              </p>
                            )}

                            {branch.hoursNote && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {branch.hoursNote}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-xs">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(fullAddressText, branch.id)}
                              className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            >
                              {copiedKey === branch.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedKey === branch.id ? 'Copied' : 'Copy Address'}</span>
                            </button>

                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Warehouse Drop-Off Guide + Accepted & Restricted Cargo */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Shipping Instructions & Cargo Guidelines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                How to label parcels for consolidation and customs compliance checklist
              </p>
            </div>

            {/* Step-by-step intake */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {partner.warehouseLabelingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
                >
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 tabular-nums shrink-0 mt-0.5">
                    0{idx + 1}.
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Accepted vs Restricted */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accepted Cargo</span>
                </h3>
                <ul className="space-y-2">
                  {partner.acceptedCargo.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Restricted / Prohibited Cargo</span>
                </h3>
                <ul className="space-y-2">
                  {partner.restrictedCargo.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Business Hours & Direct Contact Buttons (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Direct Contact Card */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 lg:sticky lg:top-24">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Direct Business Contacts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Reach dispatch desks directly for rate quotes, parcel tracking, and warehouse drop-offs.
              </p>
            </div>

            {/* Multiple Direct Phone Numbers */}
            {partner.contacts.phones.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Direct Phone Numbers</span>
                </h3>

                <div className="space-y-2.5">
                  {partner.contacts.phones.map((phone) => {
                    const telUrl = formatTelUrl(phone.number);
                    if (!telUrl) return null;
                    return (
                      <div key={phone.id} className="space-y-1">
                        <a
                          href={telUrl}
                          onClick={() =>
                            trackConversion('contact_partner', {
                              channel: 'phone',
                              partnerId: partner.id,
                              label: phone.label,
                            })
                          }
                          className="w-full min-h-[48px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]"
                        >
                          <Phone className="w-4 h-4 shrink-0" />
                          <span className="min-w-0 flex-1 text-left">
                            <span className="block text-[11px] font-medium text-slate-300 dark:text-slate-600 leading-tight">
                              {phone.label}
                            </span>
                            <span className="block font-mono text-xs sm:text-sm font-bold tabular-nums leading-snug">
                              {phone.number}
                            </span>
                          </span>
                        </a>
                        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            {phone.country && (
                              <CountryFlagByName countryName={phone.country} className="w-3.5 h-2.5" />
                            )}
                            <span>{phone.country || 'Hotline'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(phone.number, phone.id)}
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                          >
                            {copiedKey === phone.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedKey === phone.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct WhatsApp Buttons */}
            {partner.contacts.whatsapp.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  WhatsApp Desks
                </h3>
                {partner.contacts.whatsapp.map((wa) => {
                  const waUrl = formatWhatsAppUrl(wa.value, prefilledInquiry);
                  if (!waUrl) return null;
                  return (
                    <div key={wa.id} className="space-y-1">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackConversion('contact_partner', {
                            channel: 'whatsapp',
                            partnerId: partner.id,
                            label: wa.label,
                          })
                        }
                        className="w-full min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">{wa.label}</span>
                      </a>
                      <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{wa.value}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(wa.value, wa.id)}
                          className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-medium"
                        >
                          {copiedKey === wa.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === wa.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Viber Buttons */}
            {partner.contacts.viber.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Viber Hotlines
                </h3>
                {partner.contacts.viber.map((vb) => {
                  const viberUrl = formatViberUrl(vb.value);
                  if (!viberUrl) return null;
                  return (
                    <div key={vb.id} className="space-y-1">
                      <a
                        href={viberUrl}
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackConversion('contact_partner', {
                            channel: 'viber',
                            partnerId: partner.id,
                            label: vb.label,
                          })
                        }
                        className="w-full min-h-[44px] px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-purple-600/20 transition-all"
                      >
                        <PhoneCall className="w-4 h-4 shrink-0" />
                        <span className="truncate">{vb.label}</span>
                      </a>
                      <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{vb.value}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(vb.value, vb.id)}
                          className="text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-medium"
                        >
                          {copiedKey === vb.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === vb.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Facebook Page Link Button */}
            {partner.contacts.facebook.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Official Facebook Page
                </h3>
                {partner.contacts.facebook.map((fb, idx) => {
                  const fbUrl = formatFacebookUrl(fb.url);
                  if (!fbUrl) return null;
                  return (
                    <div key={fb.url} className="space-y-1">
                      <a
                        href={fbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackConversion('contact_partner', {
                            channel: 'facebook',
                            partnerId: partner.id,
                          })
                        }
                        className="w-full min-h-[44px] px-4 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#1877F2]/25 transition-all"
                      >
                        <Facebook className="w-4 h-4 fill-current shrink-0" />
                        <span className="truncate">{fb.label}</span>
                      </a>
                      <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="truncate max-w-[200px]">{getFacebookDisplay(fb.url)}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(fbUrl, `fb-${idx}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-medium shrink-0"
                        >
                          {copiedKey === `fb-${idx}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedKey === `fb-${idx}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Optional Website Link */}
            {partner.websiteUrl && sanitizeExternalHttpUrl(partner.websiteUrl) && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={sanitizeExternalHttpUrl(partner.websiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Business Hours Card (Inside Sidebar) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Business Hours</span>
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {partner.businessHours.timezone}
                </span>
              </div>

              <div className="space-y-2">
                {partner.businessHours.schedule.map((row) => (
                  <div
                    key={row.days}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <span>{row.days}</span>
                      <span className="tabular-nums text-slate-900 dark:text-white">{row.hours}</span>
                    </div>
                    {row.note && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {row.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
