'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { formatCurrency } from '@/lib/calculations';
import { X, Sliders, RotateCcw, Check, AlertCircle, Sparkles, PieChart } from 'lucide-react';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  {
    name: 'Dengeli (Varsayılan)',
    description: '%35 Likit, %25 BIST, %15 ABD, %15 Altın, %10 Yüksek Risk',
    values: {
      liquidity: 35,
      bist_stocks: 25,
      us_stocks: 15,
      gold_commodities: 15,
      high_risk: 10,
    },
  },
  {
    name: 'Agresif Büyüme',
    description: '%20 Likit, %35 BIST, %25 ABD, %10 Altın, %10 Yüksek Risk',
    values: {
      liquidity: 20,
      bist_stocks: 35,
      us_stocks: 25,
      gold_commodities: 10,
      high_risk: 10,
    },
  },
  {
    name: 'Defansif & Korumacı',
    description: '%45 Likit, %20 BIST, %10 ABD, %20 Altın, %5 Yüksek Risk',
    values: {
      liquidity: 45,
      bist_stocks: 20,
      us_stocks: 10,
      gold_commodities: 20,
      high_risk: 5,
    },
  },
];

export const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose }) => {
  const { getCurrentLog, updateStrategyPercentages } = usePortfolioStore();
  const currentLog = getCurrentLog();
  const totalBudget = currentLog.budget.totalBudget || 55000;

  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const log = getCurrentLog();
      const initial: Record<string, number> = {};
      log.categories.forEach((cat) => {
        initial[cat.id] = cat.targetPercentage;
      });
      setPercentages(initial);
      setSavedSuccess(false);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const currentSum = Object.values(percentages).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const isValidSum = currentSum === 100;
  const difference = 100 - currentSum;

  const handlePercentageChange = (categoryId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setPercentages((prev) => ({
      ...prev,
      [categoryId]: clamped,
    }));
  };

  const handleApplyPreset = (presetValues: Record<string, number>) => {
    setPercentages(presetValues);
  };

  const handleAutoBalance = () => {
    // Kalan farkı Likit Tampon'a aktar
    setPercentages((prev) => {
      const currentLiquidity = prev['liquidity'] || 0;
      const newLiquidity = Math.max(0, currentLiquidity + difference);
      return {
        ...prev,
        liquidity: newLiquidity,
      };
    });
  };

  const handleSave = () => {
    if (!isValidSum) return;
    updateStrategyPercentages(percentages);
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
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
              Strateji & Hedef Oranları
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Aylık <strong className="text-[var(--text-main)] font-mono-num">{formatCurrency(totalBudget)}</strong> bütçenin varlık sınıflarına dağılımını özelleştirin.
            </p>
          </div>
        </div>

        {/* 2. Hızlı Şablonlar (Presets) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Örnek Strateji Şablonları
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset.values)}
                className="p-2.5 rounded-xl text-left border border-[var(--border-main)] bg-[var(--bg-surface-header)] hover:bg-[var(--bg-surface-hover)] hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {preset.name}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Kategori Oran Ayarları */}
        <div className="space-y-3.5 pt-1">
          {currentLog.categories.map((cat) => {
            const currentPct = percentages[cat.id] ?? cat.targetPercentage;
            const targetTl = Math.round((totalBudget * currentPct) / 100);

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-bold text-[var(--text-main)] truncate">
                      {cat.name}
                    </span>
                  </div>

                  {/* TL Karşılığı ve % Input */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono-num font-bold text-[var(--text-muted)] hidden sm:inline">
                      {formatCurrency(targetTl)}
                    </span>

                    <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 focus-within:border-emerald-500 shadow-2xs">
                      <span className="text-xs font-bold text-[var(--text-muted)]">%</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentPct}
                        onChange={(e) => handlePercentageChange(cat.id, Number(e.target.value))}
                        className="w-10 bg-transparent text-sm font-bold font-mono-num text-[var(--text-main)] text-right outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentPct}
                    onChange={(e) => handlePercentageChange(cat.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Toplam Yüzde Durumu & Dengeleme */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-bold transition-colors ${
            isValidSum
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {isValidSum ? (
              <>
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Toplam Oran: %100 (Dağılım Kusursuz)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Toplam: %{currentSum} ({difference > 0 ? `%${difference} eksik` : `%${Math.abs(difference)} fazla`})
                </span>
              </>
            )}
          </div>

          {!isValidSum && (
            <button
              type="button"
              onClick={handleAutoBalance}
              className="text-xs px-3 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
            >
              Kalanı Likit Tampona Aktar
            </button>
          )}
        </div>

        {/* 5. Alt Aksiyonlar */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => handleApplyPreset(PRESETS[0].values)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Varsayılana Sıfırla
          </button>

          <div className="flex items-center gap-2">
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
              disabled={!isValidSum}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                isValidSum
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-[var(--bg-surface-header)] text-[var(--text-muted)] border border-[var(--border-main)] opacity-50 cursor-not-allowed'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Kaydedildi
                </>
              ) : (
                'Stratejiyi Kaydet'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
