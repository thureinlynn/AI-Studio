import React from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { Plane, Search, MessageSquare, Handshake, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowItWorksView: React.FC = () => {
  const { openPostModal, setActiveTab } = useTrips();
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
          {t('howBadge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3 tracking-tight">
          {t('howTitle')}
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {t('howSubtitle')}
        </p>
      </div>

      {/* 2-Column Split: For Senders & For Travelers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* For Senders */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('howForSenders')}</h3>
              <p className="text-xs text-slate-500">{t('howForSendersDesc')}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-3">
              <Search className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">{t('howSenderStep1Title')}</strong>
                {t('howSenderStep1Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">{t('howSenderStep2Title')}</strong>
                {t('howSenderStep2Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Handshake className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">{t('howSenderStep3Title')}</strong>
                {t('howSenderStep3Desc')}
              </div>
            </div>
          </div>
        </div>

        {/* For Travelers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('howForTravelers')}</h3>
              <p className="text-xs text-slate-500">{t('howForTravelersDesc')}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-3">
              <Plane className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">{t('howTravelerStep1Title')}</strong>
                {t('howTravelerStep1Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">{t('howTravelerStep2Title')}</strong>
                {t('howTravelerStep2Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">{t('howTravelerStep3Title')}</strong>
                {t('howTravelerStep3Desc')}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CTA Strip */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h3 className="text-lg font-bold text-white">
            {t('howCtaTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('howCtaDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={openPostModal}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>{t('howPostTripBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            {t('howBrowseBtn')}
          </button>
        </div>
      </div>

    </div>
  );
};
