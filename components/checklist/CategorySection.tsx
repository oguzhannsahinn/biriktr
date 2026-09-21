'use client';

import React, { useState } from 'react';
import { AssetCategory } from '@/types/portfolio';
import { AssetRow } from './AssetRow';
import { formatCurrency, formatUsd } from '@/lib/calculations';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { ChevronDown, ChevronRight, Check, DollarSign, RefreshCw } from 'lucide-react';

interface CategorySectionProps {
  category: AssetCategory;
  onUpdateItemActual: (categoryId: string, itemId: string, amount: number, isCompleted?: boolean) => void;
  onToggleItemComplete: (categoryId: string, itemId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  onUpdateItemActual,
  onToggleItemComplete,
}) => {
  const { usdTryRate, setUsdTryRate, fetchLiveUsdRate, isLoadingCurrency } = usePortfolioStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(usdTryRate.toString());

  const categoryTargetSum = category.items.reduce((s, i) => s + i.targetAmount, 0);
  const categoryActualSum = category.items.reduce((s, i) => s + i.actualAmount, 0);
  const completedCount = category.items.filter((i) => i.isCompleted).length;
  const totalCount = category.items.length;
  const isAllDone = completedCount === totalCount && totalCount > 0;
  const isUsCategory = category.id === 'us_stocks';

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempRate);
    if (!isNaN(parsed) && parsed > 0) {
      setUsdTryRate(parsed);
    }
    setIsEditingRate(false);
  };

  const handleRefreshRate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetchLiveUsdRate();
  };

  return (
    <div className="clean-card overflow-hidden">
      {/* Kategori Başlık Satırı */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-[var(--bg-surface-header)] hover:bg-[var(--bg-surface-hover)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer border-b border-[var(--border-subtle)]"
      >
        <div className="flex items-center gap-3">
          <button className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm sm:text-base font-bold text-[var(--text-main)] tracking-tight">{category.name}</span>
          <span className="text-xs text-[var(--text-secondary)] font-bold px-2.5 py-0.5 rounded-md bg-[var(--bg-badge)]">
            %{category.targetPercentage}
          </span>
          {isAllDone && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
              <Check className="w-3.5 h-3.5" /> Tamamlandı
            </span>
          )}
        </div>

        {/* Sağ Taraf: Tutarlar & Canlı Kur */}
        <div className="flex items-center gap-4 justify-between sm:justify-end">
          {/* ABD Borsaları için Canlı USD Kuru & Yenileme */}
          {isUsCategory && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20"
            >
              {isEditingRate ? (
                <form onSubmit={handleSaveRate} className="flex items-center gap-1">
                  <span>1$ =</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    className="w-14 bg-[var(--bg-input)] border border-blue-500 rounded px-1 text-xs font-bold text-[var(--text-main)] outline-none"
                    autoFocus
                    onBlur={handleSaveRate}
                  />
                  <span>₺</span>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempRate(usdTryRate.toString());
                    setIsEditingRate(true);
                  }}
                  className="hover:underline flex items-center gap-0.5 cursor-pointer"
                  title="Manuel Değiştirmek İçin Tıklayın"
                >
                  <DollarSign className="w-3 h-3" />
                  1$ = {usdTryRate.toFixed(2)} ₺
                </button>
              )}

              {/* Canlı API Yenileme Butonu */}
              <button
                type="button"
                onClick={handleRefreshRate}
                className="p-0.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                title="Canlı Kuru Güncelle"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingCurrency ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm font-mono-num font-bold">
            <span className={categoryActualSum > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-[var(--text-muted)]'}>
              {formatCurrency(categoryActualSum)}
              {isUsCategory && categoryActualSum > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
                  ({formatUsd(categoryActualSum, usdTryRate)})
                </span>
              )}
            </span>
            <span className="text-[var(--text-subtle)] font-normal">/</span>
            <span className="text-[var(--text-secondary)]">
              {formatCurrency(categoryTargetSum)}
              {isUsCategory && (
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
                  ({formatUsd(categoryTargetSum, usdTryRate)})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Alt Varlık Listesi */}
      {isOpen && (
        <div>
          {category.items.map((item) => (
            <AssetRow
              key={item.id}
              item={item}
              categoryId={category.id}
              onUpdateActual={(amount, isCompleted) =>
                onUpdateItemActual(category.id, item.id, amount, isCompleted)
              }
              onToggleComplete={() => onToggleItemComplete(category.id, item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
