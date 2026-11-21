import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X, Globe } from 'lucide-react';
import { CountryOption, findCountryByName, filterCountries } from '../data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
}

export const CountryFlag: React.FC<{ country: CountryOption; className?: string }> = ({
  country,
  className = 'w-5 h-3.5',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [country.code]);

  if (imgFailed) {
    return (
      <span aria-hidden="true" className="text-sm leading-none shrink-0">
        {country.flag}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
      alt=""
      loading="lazy"
      onError={() => setImgFailed(true)}
      className={`${className} object-cover rounded-[2px] shrink-0 ring-1 ring-black/10 dark:ring-white/15`}
    />
  );
};

export const CountryFlagByName: React.FC<{ countryName?: string; className?: string }> = ({
  countryName,
  className,
}) => {
  const country = useMemo(() => findCountryByName(countryName || ''), [countryName]);
  if (!country) {
    return <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />;
  }
  return <CountryFlag country={country} className={className} />;
};

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  placeholder = 'Select country',
  id,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(() => findCountryByName(value), [value]);
  const filteredOptions = useMemo(() => filterCountries(searchQuery), [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleSelect = (country: CountryOption) => {
    onChange(country.name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm flex items-center justify-between gap-2 text-left cursor-pointer transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 scale-[1.02] -translate-y-[1px] shadow-md'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedCountry ? (
            <>
              <CountryFlag country={selectedCountry} />
              <span className="text-slate-900 dark:text-white truncate">{selectedCountry.name}</span>
            </>
          ) : value ? (
            <span className="text-slate-900 dark:text-white truncate">{value}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
          )}
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selected country"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-600' : ''
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fadeIn"
        >
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching countries
              </div>
            ) : (
              filteredOptions.map((country) => {
                const isSelected = selectedCountry?.code === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(country)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <CountryFlag country={country} />
                      <span className="truncate">{country.name}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
