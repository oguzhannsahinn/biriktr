'use client';

import React, { useState } from 'react';
import { AssetItem } from '@/types/portfolio';
import { formatCurrency, formatUsd } from '@/lib/calculations';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { Check } from 'lucide-react';

interface AssetRowProps {
  item: AssetItem;
  categoryId: string;
  onUpdateActual: (amount: number, isCompleted?: boolean) => void;
  onToggleComplete: () => void;
}

export const AssetRow: React.FC<AssetRowProps> = ({
  item,
  categoryId,
  onUpdateActual,
  onToggleComplete,
}) => {
  const { usdTryRate, goldGramRate } = usePortfolioStore();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    item.actualAmount > 0 ? item.actualAmount.toString() : item.targetAmount.toString()
  );

  const isUsAsset = categoryId === 'us_stocks';
  const isGoldAsset = item.code === '2GR-ALTIN' || categoryId === 'gold_commodities';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val)) {
      onUpdateActual(val, val > 0);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`asset-row px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
        item.isCompleted ? 'bg-emerald-500/5' : ''
      }`}
    >
      {/* Sol: Checkbox & Varlık Bilgisi */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            item.isCompleted
              ? 'bg-emerald-500 text-white dark:text-black font-bold shadow-xs'
              : 'border-2 border-[var(--border-input)] hover:border-emerald-500 bg-[var(--bg-input)]'
          }`}
        >
          {item.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        <div className="truncate">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm text-[var(--text-main)] font-mono-num shrink-0 px-2 py-0.5 rounded bg-[var(--bg-badge)]">
              {item.code}
            </span>
            <span
              className={`text-sm sm:text-[15px] truncate font-medium ${
                item.isCompleted
                  ? 'text-[var(--text-muted)] line-through opacity-75'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {item.name}
            </span>
          </div>
        </div>
      </div>

      {/* Sağ: Hedef & Gerçekleşen Tutar */}
      <div className="flex items-center gap-5 sm:gap-8 shrink-0">
        {/* Hedef */}
        <div className="text-right hidden sm:block">
          <span className="text-xs text-[var(--text-muted)] block uppercase font-semibold">Hedef</span>
          <div className="flex items-baseline justify-end gap-1.5 font-mono-num">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              {formatCurrency(item.targetAmount)}
            </span>
            {isUsAsset && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                ({formatUsd(item.targetAmount, usdTryRate)})
              </span>
            )}
            {isGoldAsset && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                (Gram: {formatCurrency(goldGramRate)})
              </span>
            )}
          </div>
        </div>


        {/* Gerçekleşen */}
        <div className="text-right min-w-[105px]">
          <span className="text-xs text-[var(--text-muted)] block uppercase font-semibold">Gerçekleşen</span>
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center justify-end gap-1 mt-0.5">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-24 bg-[var(--bg-input)] border-2 border-emerald-500 rounded-md px-2 py-1 text-sm text-[var(--text-main)] font-mono-num text-right outline-none font-bold"
                autoFocus
                onBlur={handleSave}
              />
            </form>
          ) : (
            <div className="flex items-baseline justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputValue(item.actualAmount > 0 ? item.actualAmount.toString() : item.targetAmount.toString());
                  setIsEditing(true);
                }}
                className={`text-sm font-mono-num font-bold hover:underline text-right cursor-pointer ${
                  item.actualAmount > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Tutarı düzenlemek için tıklayın"
              >
                {item.actualAmount > 0 ? formatCurrency(item.actualAmount) : '0 ₺'}
              </button>
              {isUsAsset && item.actualAmount > 0 && (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono-num">
                  ({formatUsd(item.actualAmount, usdTryRate)})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
