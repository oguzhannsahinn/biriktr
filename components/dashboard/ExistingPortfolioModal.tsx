'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { formatCurrency, formatUsd } from '@/lib/calculations';
import { X, Wallet, Check, Sparkles, PieChart } from 'lucide-react';

interface ExistingPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExistingPortfolioModal: React.FC<ExistingPortfolioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    existingCategoryBalances,
    setExistingCategoryBalances,
    getCurrentLog,
    usdTryRate,
    goldGramRate,
  } = usePortfolioStore();

  const currentLog = getCurrentLog();
  const categories = currentLog.categories;

  const [balances, setBalances] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      categories.forEach((cat) => {
        initial[cat.id] = existingCategoryBalances?.[cat.id] ?? 0;
      });
      setBalances(initial);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSum = Object.values(balances).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const handleValueChange = (categoryId: string, value: number) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    setBalances((prev) => ({
      ...prev,
      [categoryId]: safeVal,
    }));
  };

  const handleSave = () => {
    setExistingCategoryBalances(balances);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] max-w-xl w-full p-6 sm:p-7 rounded-2xl shadow-2xl relative space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface-header)] border border-[var(--border-main)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Başlık */}
        <div className="flex items-start gap-3.5 pr-10">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
              Mevcut Varlık Bakiyelerim
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Şu ana kadar biriktirdiğiniz BIST, Altın, ABD hisseleri ve nakit bakiyelerinizi ayrı ayrı girin.
            </p>
          </div>
        </div>

        {/* 2. Toplam Net Bakiye Özeti & Görsel Dağılım */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Toplam Mevcut Portföy
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono-num">
              ≈ {formatUsd(totalSum, usdTryRate)}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-mono-num tracking-tight">
            {formatCurrency(totalSum)}
          </div>

          {/* Çok Renkli Canlı Dağılım Çubuğu */}
          {totalSum > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[var(--border-subtle)]">
                {categories.map((cat) => {
                  const val = balances[cat.id] || 0;
                  const pct = totalSum > 0 ? (val / totalSum) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={cat.id}
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      className="h-full transition-all duration-300"
                      title={`${cat.name}: %${pct.toFixed(1)} (${formatCurrency(val)})`}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)] font-medium pt-1">
                {categories.map((cat) => {
                  const val = balances[cat.id] || 0;
                  const pct = totalSum > 0 ? (val / totalSum) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <span key={cat.id} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}: %{Math.round(pct)}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Varlık Bazlı Giriş Alanları */}
        <div className="space-y-3 pt-1">
          {categories.map((cat) => {
            const currentVal = balances[cat.id] ?? 0;
            const isUsStocks = cat.id === 'us_stocks';
            const isGold = cat.id === 'gold_commodities';

            const usdEquiv = isUsStocks && currentVal > 0 ? formatUsd(currentVal, usdTryRate) : null;
            const gramsEquiv = isGold && currentVal > 0 && goldGramRate > 0
              ? (currentVal / goldGramRate).toFixed(2)
              : null;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-bold text-[var(--text-main)] truncate">
                      {cat.name}
                    </span>
                  </div>

                  {/* Rozetler ($ / Gram) */}
                  <div className="flex items-center gap-2 text-xs font-mono-num font-bold">
                    {usdEquiv && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {usdEquiv}
                      </span>
                    )}
                    {gramsEquiv && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        ≈ {gramsEquiv} Gram
                      </span>
                    )}
                  </div>
                </div>

                {/* Tutar Girişi (TL) */}
                <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-2 focus-within:border-emerald-500 shadow-2xs">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={currentVal === 0 ? '' : currentVal}
                    onChange={(e) => handleValueChange(cat.id, parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-base font-bold font-mono-num text-[var(--text-main)] outline-none"
                  />
                  <span className="text-sm font-bold text-[var(--text-muted)] ml-2">₺</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Alt Aksiyonlar */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface-header)] border border-[var(--border-main)] transition-colors cursor-pointer"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Kaydedildi
              </>
            ) : (
              'Bakiyeleri Kaydet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
