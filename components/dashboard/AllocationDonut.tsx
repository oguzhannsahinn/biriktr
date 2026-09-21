'use client';

import React, { useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { getDonutChartData, formatCurrency } from '@/lib/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sliders } from 'lucide-react';

interface HoveredCategory {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface AllocationDonutProps {
  onOpenStrategyModal?: () => void;
}

export const AllocationDonut: React.FC<AllocationDonutProps> = ({ onOpenStrategyModal }) => {
  const { getCurrentLog, theme } = usePortfolioStore();
  const currentLog = getCurrentLog();
  const { targetData } = getDonutChartData(currentLog.categories);

  // Hover edilen kategori (Hover yoksa genel bütçeyi göster)
  const [activeItem, setActiveItem] = useState<HoveredCategory | null>(null);

  const strokeColor = theme === 'dark' ? '#11131a' : '#ffffff';

  return (
    <div className="clean-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Hedef Dağılım</h4>
          <span className="text-xs text-[var(--text-muted)] font-medium">Strateji Oranları</span>
        </div>

        {onOpenStrategyModal && (
          <button
            type="button"
            onClick={onOpenStrategyModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer shadow-2xs"
            title="Hedef Dağılım Oranlarını Düzenle"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Oranları Düzenle</span>
          </button>
        )}
      </div>


      {/* Ferah ve Geniş Donut */}
      <div className="w-full h-52 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={targetData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveItem(targetData[index])}
              onMouseLeave={() => setActiveItem(null)}
              className="cursor-pointer outline-none"
            >
              {targetData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={strokeColor}
                  strokeWidth={2}
                  className="transition-all duration-200 hover:opacity-85"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Ortadaki Ferah Dinamik Merkez */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
          {activeItem ? (
            <div className="animate-in fade-in zoom-in-95 duration-150 max-w-[125px] flex flex-col items-center">
              <span className="text-xs font-bold text-[var(--text-main)] leading-tight line-clamp-2">
                {activeItem.name}
              </span>
              <span className="text-base font-extrabold font-mono-num mt-1" style={{ color: activeItem.color }}>
                {formatCurrency(activeItem.value)}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)] mt-0.5">
                %{activeItem.percentage} Pay
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">
                Toplam Bütçe
              </span>
              <span className="text-base font-extrabold text-[var(--text-main)] font-mono-num mt-0.5">
                {formatCurrency(currentLog.budget.totalBudget)}
              </span>
              <span className="text-xs text-[var(--text-subtle)] font-medium">
                {targetData.length} Varlık Sınıfı
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Kategori Yüzde Listesi */}
      <div className="space-y-1.5 pt-1">
        {targetData.map((item) => {
          const isHovered = activeItem?.id === item.id;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
              className={`flex items-center justify-between text-sm py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                isHovered ? 'bg-[var(--bg-surface-hover)]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className={`text-sm font-medium ${isHovered ? 'text-[var(--text-main)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-mono-num font-bold">
                <span className="text-[var(--text-muted)] text-xs">%{item.percentage}</span>
                <span className="text-[var(--text-main)] text-sm">{formatCurrency(item.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
