'use client';

import React, { useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { calculateMonthlyStats, formatCurrency, formatUsd } from '@/lib/calculations';
import { Edit2, Check, X } from 'lucide-react';

interface SummaryBarProps {
  onOpenExistingPortfolioModal?: () => void;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({ onOpenExistingPortfolioModal }) => {
  const {
    currentMonthId,
    getCurrentLog,
    setBudget,
    totalAccumulatedPortfolio,
    setTotalAccumulatedPortfolio,
    usdTryRate,
    existingCategoryBalances,
  } = usePortfolioStore();

  const currentLog = getCurrentLog();
  const stats = calculateMonthlyStats(currentLog);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(currentLog.budget.totalBudget.toString());

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budgetVal);
    if (!isNaN(num) && num > 0) {
      setBudget(currentMonthId, num);
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. KART: Mevcut Toplam Portföy */}
      <div
        onClick={onOpenExistingPortfolioModal}
        className="clean-card p-4 sm:p-5 flex flex-col justify-between space-y-2.5 cursor-pointer group hover:border-emerald-500/40 transition-all"
        title="Varlık bazlı bakiyeleri düzenlemek için tıklayın"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Mevcut Portföy
          </span>

          <span className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <Edit2 className="w-3 h-3" />
            Düzenle
          </span>
        </div>

        <div>
          <div className="text-2xl sm:text-[26px] font-extrabold text-[var(--text-main)] font-mono-num tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {formatCurrency(totalAccumulatedPortfolio)}
          </div>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono-num mt-0.5">
            ≈ {formatUsd(totalAccumulatedPortfolio, usdTryRate)}
          </div>
        </div>

        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          Varlık bazlı bakiye dökümü
        </span>
      </div>

      {/* 2. KART: Aylık Hedef Bütçe */}
      <div className="clean-card p-4 sm:p-5 flex flex-col justify-between space-y-2.5 group hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Aylık Bütçe
          </span>

          {!isEditingBudget && (
            <button
              type="button"
              onClick={() => {
                setBudgetVal(currentLog.budget.totalBudget.toString());
                setIsEditingBudget(true);
              }}
              className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Aylık bütçeyi düzenle"
            >
              <Edit2 className="w-3 h-3" />
              Düzenle
            </button>
          )}
        </div>

        <div>
          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-1.5 my-1">
              <input
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-full bg-[var(--bg-input)] border-2 border-blue-500 rounded-lg px-2 py-1 text-base font-bold text-[var(--text-main)] outline-none font-mono-num"
                autoFocus
                onBlur={handleSaveBudget}
              />
              <button
                type="submit"
                className="p-1 rounded-lg bg-blue-600 text-white cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div
              onClick={() => {
                setBudgetVal(currentLog.budget.totalBudget.toString());
                setIsEditingBudget(true);
              }}
              className="cursor-pointer"
              title="Bütçeyi düzenlemek için tıklayın"
            >
              <div className="text-2xl sm:text-[26px] font-extrabold text-[var(--text-main)] font-mono-num tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {formatCurrency(stats.totalTarget)}
              </div>
              <div className="text-xs font-bold text-[var(--text-muted)] font-mono-num mt-0.5">
                ≈ {formatUsd(stats.totalTarget, usdTryRate)}
              </div>
            </div>
          )}
        </div>

        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          Hedeflenen aylık birikim
        </span>
      </div>

      {/* 3. KART: Gerçekleşen Alımlar */}
      <div className="clean-card p-4 sm:p-5 flex flex-col justify-between space-y-2.5 hover:border-emerald-500/40 transition-all">
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Bu Ay Alınan
        </span>

        <div>
          <div className="text-2xl sm:text-[26px] font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-num tracking-tight">
            {formatCurrency(stats.totalActual)}
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)] font-mono-num mt-0.5">
            Kalan: {formatCurrency(stats.remainingAmount)}
          </div>
        </div>

        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          {stats.completedItemsCount} / {stats.totalItemsCount} alım tamamlandı
        </span>
      </div>

      {/* 4. KART: Bütçe İlerleme Oranı */}
      <div className="clean-card p-4 sm:p-5 flex flex-col justify-between space-y-2.5 hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Tamamlanma
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 font-mono-num">
            %{stats.completionRate}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between font-mono-num">
            <span className="text-2xl sm:text-[26px] font-extrabold text-[var(--text-main)]">
              %{stats.completionRate}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-bold">
              {stats.completedItemsCount}/{stats.totalItemsCount} Kalem
            </span>
          </div>

          <div className="w-full bg-[var(--progress-track)] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, stats.completionRate)}%` }}
            />
          </div>
        </div>

        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          {stats.remainingAmount === 0 && stats.totalActual > 0
            ? '🎉 Aylık hedef tamamlandı!'
            : 'Planlanan doğrultuda'}
        </span>
      </div>
    </div>
  );
};


