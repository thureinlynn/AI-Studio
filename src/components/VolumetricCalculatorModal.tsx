import React, { useState, useMemo } from 'react';
import { X, Calculator } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VolumetricCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolumetricCalculatorModal: React.FC<VolumetricCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [lengthCm, setLengthCm] = useState<string>('40');
  const [widthCm, setWidthCm] = useState<string>('30');
  const [heightCm, setHeightCm] = useState<string>('25');
  const [actualKg, setActualKg] = useState<string>('4.5');

  const volumetricStats = useMemo(() => {
    const l = Math.max(0, parseFloat(lengthCm) || 0);
    const w = Math.max(0, parseFloat(widthCm) || 0);
    const h = Math.max(0, parseFloat(heightCm) || 0);
    const actual = Math.max(0, parseFloat(actualKg) || 0);
    const cbm = (l * w * h) / 1_000_000;
    const volumetricKg = (l * w * h) / 6000;
    const chargeableKg = Math.max(actual, volumetricKg);
    return {
      cbm: cbm.toFixed(4),
      volumetricKg: volumetricKg.toFixed(2),
      chargeableKg: chargeableKg.toFixed(2),
      billedBy: volumetricKg > actual ? t('volumetricWeight') : t('actualWeight'),
    };
  }, [lengthCm, widthCm, heightCm, actualKg, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('volumetricCalculatorTitle')}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative animate-scaleIn overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('volumetricCalculatorTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('volumetricFormula')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calculator Body */}
        <div className="py-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t('lengthCm')}
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t('widthCm')}
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t('heightCm')}
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t('actualWeight')}
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={actualKg}
                onChange={(e) => setActualKg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                {t('volumetricWeight')}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                {volumetricStats.volumetricKg} kg
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                {t('seaVolume')}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                {volumetricStats.cbm} CBM
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold block">
                {t('chargeableWeight')}
              </span>
              <span className="text-base font-extrabold text-blue-700 dark:text-blue-300 tabular-nums mt-0.5 block">
                {volumetricStats.chargeableKg} kg
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
            {t('volumetricCalcNote')} ({volumetricStats.billedBy})
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
};
