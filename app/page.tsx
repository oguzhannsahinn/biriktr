'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { Header } from '@/components/layout/Header';
import { SummaryBar } from '@/components/dashboard/SummaryBar';
import { AllocationDonut } from '@/components/dashboard/AllocationDonut';
import { CompoundGrowthCard } from '@/components/dashboard/CompoundGrowthCard';
import { BufferModal } from '@/components/dashboard/BufferModal';
import { StrategyModal } from '@/components/dashboard/StrategyModal';
import { ExistingPortfolioModal } from '@/components/dashboard/ExistingPortfolioModal';
import { CategorySection } from '@/components/checklist/CategorySection';
import { QuickCalculator } from '@/components/ui/QuickCalculator';

const CATEGORY_SHORT_NAMES: Record<string, string> = {
  liquidity: 'Likit Tampon',
  us_stocks: 'ABD Hisseleri',
  bist_stocks: 'BIST Hisseleri',
  gold_commodities: 'Altın & Emtia',
  high_risk: 'Yüksek Risk',
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isBufferOpen, setIsBufferOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [isExistingPortfolioOpen, setIsExistingPortfolioOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');



  const {
    currentMonthId,
    getCurrentLog,
    updateItemActual,
    toggleItemCompletion,
    theme,
    fetchLiveUsdRate,
  } = usePortfolioStore();

  useEffect(() => {
    setMounted(true);
    fetchLiveUsdRate();

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, fetchLiveUsdRate]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-muted)] text-sm font-medium">
        Yükleniyor...
      </div>
    );
  }

  const currentLog = getCurrentLog();
  const categories = currentLog.categories;

  // %0 olan (hedef ve gerçekleşen tutarı 0 olan) kategorileri gizle
  const visibleCategories = categories.filter(
    (c) => (c.targetPercentage || 0) > 0 || c.items.some((i) => (i.actualAmount || 0) > 0)
  );

  const filteredCategories =
    selectedFilter === 'all'
      ? visibleCategories
      : visibleCategories.filter((c) => c.id === selectedFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-main)] transition-colors">
      {/* Header */}
      <Header onOpenBufferModal={() => setIsBufferOpen(true)} />

      {/* Ana İçerik */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">
        {/* 1. Özet Bütçe & İlerleme Barı */}
        <SummaryBar onOpenExistingPortfolioModal={() => setIsExistingPortfolioOpen(true)} />

        {/* 2. Ana Grid: Sol (Checklist) + Sağ (Grafik & Hedef Özeti) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Sol Kolon: Checklist (Geniş 8 Kolon) */}
          <section className="lg:col-span-8 space-y-4">
            {/* Emojisiz Sade Başlık ve Tek Satır Kompakt Filtre Çubuğu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <h2 className="text-base font-bold text-[var(--text-main)]">
                Aylık Alım Listesi
              </h2>

              {/* Tek Satır Kompakt Filtre Butonları */}
              <div className="flex items-center gap-1.5 overflow-x-auto sm:overflow-visible">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedFilter === 'all'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface-header)]/60 hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  Tümü ({visibleCategories.length})
                </button>
                {visibleCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedFilter(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedFilter === c.id
                        ? 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface-header)]/60 hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    {CATEGORY_SHORT_NAMES[c.id] || c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Kategorileri */}
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  onUpdateItemActual={(catId, itemId, amount, isCompleted) =>
                    updateItemActual(currentMonthId, catId, itemId, amount, isCompleted)
                  }
                  onToggleItemComplete={(catId, itemId) =>
                    toggleItemCompletion(currentMonthId, catId, itemId)
                  }
                />
              ))}
            </div>
          </section>

          {/* Sağ Kolon: Kompakt Donut Dağılımı ve 1M Projeksiyonu (4 Kolon) */}
          <aside className="lg:col-span-4 space-y-5">
            <AllocationDonut onOpenStrategyModal={() => setIsStrategyOpen(true)} />
            <CompoundGrowthCard />
          </aside>
        </div>
      </main>

      {/* Düşüş Tamponu Modalı */}
      <BufferModal isOpen={isBufferOpen} onClose={() => setIsBufferOpen(false)} />

      {/* Strateji & Hedef Oranları Düzenleme Modalı */}
      <StrategyModal isOpen={isStrategyOpen} onClose={() => setIsStrategyOpen(false)} />

      {/* Mevcut Portföy Varlık Bakiyeleri Düzenleme Modalı */}
      <ExistingPortfolioModal
        isOpen={isExistingPortfolioOpen}
        onClose={() => setIsExistingPortfolioOpen(false)}
      />

      {/* Hızlı Hesap Makinesi Widget'ı */}
      <QuickCalculator />



      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-5 text-center text-xs text-[var(--text-muted)] font-medium">
        Yatırımım • Finansal Portföy Disiplini
      </footer>
    </div>
  );
}
