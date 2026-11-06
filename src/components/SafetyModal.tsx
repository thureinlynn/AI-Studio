import React from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { X, ShieldAlert, AlertTriangle, Eye, Scale, FileText } from 'lucide-react';

export const SafetyModal: React.FC = () => {
  const { isSafetyModalOpen, closeSafetyModal } = useTrips();
  const { t } = useLanguage();

  if (!isSafetyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              {t('safetyModalTitle')}
            </h3>
          </div>
          <button
            onClick={closeSafetyModal}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
            <strong>{t('safetyGoldenRuleTitle')}</strong> {t('safetyGoldenRuleDesc')}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Eye className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5">{t('safetyRule1Title')}</strong>
                {t('safetyRule1Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5">{t('safetyRule2Title')}</strong>
                {t('safetyRule2Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Scale className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5">{t('safetyRule3Title')}</strong>
                {t('safetyRule3Desc')}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <FileText className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5">{t('safetyRule4Title')}</strong>
                {t('safetyRule4Desc')}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={closeSafetyModal}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t('safetyAgreeBtn')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
