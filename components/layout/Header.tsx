'use client';

import React, { useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { MONTH_NAMES_TR } from '@/lib/constants';
import { Calendar, Plus, ChevronDown, ShieldAlert, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenBufferModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBufferModal }) => {
  const { currentMonthId, monthlyLogs, selectMonth, addNewMonth, theme, toggleTheme, usdTryRate, goldGramRate } = usePortfolioStore();
  const [isAddingMonth, setIsAddingMonth] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const availableMonths = Object.keys(monthlyLogs).sort().reverse();

  const handleCreateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addNewMonth(selectedYear, selectedMonth);
    selectMonth(newId);
    setIsAddingMonth(false);
  };

  return (
    <header className="border-b border-[var(--border-main)] bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-20 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Sol: Logo & Canlı Piyasa Fiyatları */}
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-main)] select-none">
              birik<span className="text-emerald-500">tr</span>
            </span>
          </div>

          {/* Canlı Kurlar (USD & Gram Altın) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono-num pl-3 border-l border-[var(--border-main)]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)] text-[11px]">USD</span>
              <span className="font-semibold text-[var(--text-main)]">{usdTryRate.toFixed(2)} ₺</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)] text-[11px]">Gr. Altın</span>
              <span className="font-semibold text-[var(--text-main)]">{Math.round(goldGramRate).toLocaleString('tr-TR')} ₺</span>
            </span>
          </div>
        </div>

        {/* Sağ: Aksiyonlar */}
        <div className="flex items-center gap-2">

          {/* Dip Stratejisi */}
          <button
            onClick={onOpenBufferModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] transition-colors cursor-pointer shadow-xs"
            title="Dip Stratejisi (%30 Likit Fon Alım Rehberi)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="hidden sm:inline">Dip Stratejisi</span>
          </button>

          {/* Dönem Seçici */}
          <div className="relative flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2.5 py-1 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] mr-1.5" />
            <select
              value={currentMonthId}
              onChange={(e) => selectMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[var(--text-main)] outline-none pr-4 cursor-pointer appearance-none"
            >
              {availableMonths.map((mId) => {
                const log = monthlyLogs[mId];
                return (
                  <option key={mId} value={mId} className="bg-[var(--bg-surface)] text-[var(--text-main)]">
                    {log ? log.budget.monthLabel : mId}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] pointer-events-none absolute right-2" />
          </div>

          {/* Yeni Ay */}
          <button
            onClick={() => setIsAddingMonth(!isAddingMonth)}
            className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-main)] transition-colors cursor-pointer shadow-xs"
            title="Yeni Ay Aç"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Tema Butonu */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-main)] transition-colors cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Beyaz Temaya Geç' : 'Koyu Temaya Geç'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Yeni Ay Ekleme Kutusu */}
      {isAddingMonth && (
        <div className="border-t border-[var(--border-main)] bg-[var(--bg-surface-header)] px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3 text-sm">
            <span className="text-[var(--text-secondary)] font-semibold">Yeni Dönem:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-[var(--bg-input)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5 text-[var(--text-main)] outline-none font-medium text-sm"
            >
              {MONTH_NAMES_TR.map((mName, i) => (
                <option key={i + 1} value={i + 1}>
                  {mName}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-20 bg-[var(--bg-input)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5 text-[var(--text-main)] outline-none font-mono-num font-semibold text-sm"
            />
            <button
              onClick={handleCreateMonth}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors cursor-pointer text-sm"
            >
              Oluştur
            </button>
            <button
              onClick={() => setIsAddingMonth(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer text-sm"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
