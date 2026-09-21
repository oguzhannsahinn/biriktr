'use client';

import React, { useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { calculateCompoundProjection, formatCurrency } from '@/lib/calculations';
import { Sparkles, SlidersHorizontal, Info } from 'lucide-react';

export const CompoundGrowthCard: React.FC = () => {
  const {
    totalAccumulatedPortfolio,
    setTotalAccumulatedPortfolio,
    annualReturnAssumption,
    setAnnualReturnAssumption,
    getCurrentLog,
  } = usePortfolioStore();

  const currentLog = getCurrentLog();
  const monthlyBudget = currentLog.budget.totalBudget || 55000;
  const [showEdit, setShowEdit] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number>(1); // Varsayılan 1 yıl

  const projection = calculateCompoundProjection(
    totalAccumulatedPortfolio,
    monthlyBudget,
    10000000,
    annualReturnAssumption / 100,
    selectedYears
  );

  return (
    <div className="clean-card p-5 space-y-4">
      {/* 1. Tek Satır Başlık */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider whitespace-nowrap">
            Bileşik Büyüme Simülasyonu
          </h4>
        </div>
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg cursor-pointer transition-colors"
          title="Parametreleri Düzenle"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Kompakt ve Kibar Süre Seçici Butonlar */}
      <div className="flex items-center gap-1.5 bg-[var(--bg-surface-header)] p-1 rounded-lg border border-[var(--border-main)] text-xs">
        {[1, 3, 5].map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYears(yr)}
            className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer font-bold ${
              selectedYears === yr
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs border border-[var(--border-main)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {yr} Yıl
          </button>
        ))}
      </div>

      {/* Parametre Düzenleyici */}
      {showEdit && (
        <div className="p-3.5 bg-[var(--bg-surface-header)] rounded-xl space-y-2.5 text-sm border border-[var(--border-main)]">
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
              Mevcut Başlangıç Birikimi (₺):
            </label>
            <input
              type="number"
              value={totalAccumulatedPortfolio}
              onChange={(e) => setTotalAccumulatedPortfolio(Number(e.target.value))}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-main)] font-mono-num outline-none font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
              Yıllık Beklenen Ortalama Getiri (%):
            </label>
            <input
              type="number"
              value={annualReturnAssumption}
              onChange={(e) => setAnnualReturnAssumption(Number(e.target.value))}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-main)] font-mono-num outline-none font-bold"
            />
          </div>
        </div>
      )}

      {/* Ana Büyüklük Göstergesi */}
      <div className="space-y-1">
        <span className="text-xs text-[var(--text-muted)] font-medium">
          {selectedYears} Yıl Sonunda Tahmini Portföy:
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono-num">
            {formatCurrency(projection.finalBalance)}
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
            %{annualReturnAssumption} Getiri
          </span>
        </div>
      </div>

      {/* Detay Dökümü: Anapara vs Getiri Katkısı */}
      <div className="text-xs text-[var(--text-muted)] space-y-2 pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between items-center">
          <span>Toplam Anapara:</span>
          <span className="text-[var(--text-secondary)] font-mono-num font-bold text-sm">
            {formatCurrency(projection.totalInvested)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Getiri Katkısı:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono-num font-extrabold text-sm">
            +{formatCurrency(projection.totalGain)}
          </span>
        </div>
      </div>

      {/* Bilgilendirme Notu */}
      <div className="p-2.5 rounded-lg bg-[var(--bg-surface-header)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-start gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500" />
        <span>
          Aylık <strong>{formatCurrency(monthlyBudget)}</strong> tasarruf ve %{annualReturnAssumption} yıllık bileşik getiri ile hesaplanmıştır.
        </span>
      </div>
    </div>
  );
};
