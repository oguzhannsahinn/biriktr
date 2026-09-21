'use client';

import React from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { formatCurrency, formatUsd } from '@/lib/calculations';
import { ShieldAlert, X, TrendingDown, Target, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface BufferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BufferModal: React.FC<BufferModalProps> = ({ isOpen, onClose }) => {
  const { getCurrentLog, usdTryRate } = usePortfolioStore();

  if (!isOpen) return null;

  const currentLog = getCurrentLog();
  const liquidityCategory = currentLog.categories.find((c) => c.id === 'liquidity');
  const bufferTotal = liquidityCategory
    ? liquidityCategory.items.reduce((s, i) => s + (i.actualAmount || i.targetAmount), 0)
    : Math.round(currentLog.budget.totalBudget * 0.35);

  const step1 = Math.round(bufferTotal * 0.33);
  const step2 = Math.round(bufferTotal * 0.33);
  const step3 = Math.max(0, bufferTotal - step1 - step2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] max-w-2xl w-full p-6 sm:p-7 rounded-2xl shadow-2xl relative space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface-header)] border border-[var(--border-main)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Başlık & Cephane Özeti */}
        <div className="flex items-start gap-4 pr-10">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
              Dip Stratejisi & Alım Cephanesi
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Kullanılabilir Likit Rezerv (%35):{' '}
              <strong className="text-cyan-600 dark:text-cyan-400 font-mono-num font-extrabold text-sm sm:text-base">
                {formatCurrency(bufferTotal)}
              </strong>
              <span className="ml-1.5 text-xs text-[var(--text-subtle)]">({formatUsd(bufferTotal, usdTryRate)})</span>
            </p>
          </div>
        </div>

        {/* 2. Temel Felsefe & Nasıl Çalışır? */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 font-bold text-[var(--text-main)] text-sm">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Neden %35 Likit Tampon Tutuyoruz?
          </div>
          <p>
            Piyasalar yükselirken bu para <strong>IOO Para Piyasası Fonu</strong> veya mevduatta kalarak sabit risksiz getiri üretir. Borsalarda sert geri çekilmeler olduğunda ise panikle hisse satmak yerine <strong>en dipten ucuza alım yapacak nakit cephanemiz</strong> olur.
          </p>
        </div>

        {/* 3. 3 Kademeli Dağıtım Stratejisi */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Kademeli Devreye Alma Planı (%33 — %33 — %34)
          </h4>

          {/* 1. Kademe */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  1. Kademe (%33)
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                  Tetikleyici: Endekste %10 — %15 Düzeltme
                </span>
              </div>
              <div className="text-left sm:text-right font-mono-num font-extrabold text-cyan-600 dark:text-cyan-400 text-base sm:text-lg">
                {formatCurrency(step1)}
                <span className="text-xs text-[var(--text-muted)] font-normal ml-1">({formatUsd(step1, usdTryRate)})</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              İlk düşüş dalgasında panik yapmadan ilk cephaneyi omurga temettü ve lider hisselere aktar.
            </p>
            <div className="text-xs text-[var(--text-main)] font-semibold bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>Öncelikli Alımlar: <strong>THYAO</strong>, <strong>FROTO</strong>, <strong>MU (Micron)</strong></span>
            </div>
          </div>

          {/* 2. Kademe */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  2. Kademe (%33)
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                  Tetikleyici: %15 — %25 Ayı Piyasası
                </span>
              </div>
              <div className="text-left sm:text-right font-mono-num font-extrabold text-blue-600 dark:text-blue-400 text-base sm:text-lg">
                {formatCurrency(step2)}
                <span className="text-xs text-[var(--text-muted)] font-normal ml-1">({formatUsd(step2, usdTryRate)})</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Düşüş derinleştiğinde ve piyasada korku hakimken 2. dilimle maliyet düşür.
            </p>
            <div className="text-xs text-[var(--text-main)] font-semibold bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Öncelikli Alımlar: <strong>ISCTR</strong>, <strong>MGROS</strong>, <strong>CIEN</strong>, <strong>NOK</strong></span>
            </div>
          </div>

          {/* 3. Kademe */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-header)] border border-[var(--border-main)] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  3. Kademe (%34)
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                  Tetikleyici: %25+ Panik Satış & Dip Bölgesi
                </span>
              </div>
              <div className="text-left sm:text-right font-mono-num font-extrabold text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                {formatCurrency(step3)}
                <span className="text-xs text-[var(--text-muted)] font-normal ml-1">({formatUsd(step3, usdTryRate)})</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Son rezerv ile yüksek büyüme ve asimetrik getiri sunan hisseleri dip seviyelerden topla.
            </p>
            <div className="text-xs text-[var(--text-main)] font-semibold bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Öncelikli Alımlar: <strong>ASTS</strong>, <strong>RKLB</strong>, <strong>QUBT</strong>, <strong>DXYZ</strong></span>
            </div>
          </div>
        </div>

        {/* 4. Altın Kurallar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-header)] border border-red-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              Yapılmaması Gerekenler:
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Tüm nakdi ilk düşüş gününde tek seferde harcama. Piyasa daha da düşerse cephanesiz kalırsın.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-header)] border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4" />
              Yapılması Gerekenler:
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Kademeli alarak ortalama maliyeti aşağı çek. Borsa toparlandığında en yüksek kârı bu cephane üretir.
            </p>
          </div>
        </div>

        {/* Footer Kapat Butonu */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-bold text-white rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Stratejiyi Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
