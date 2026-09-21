'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

export const QuickCalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calc' | 'share'>('calc');

  // Standart Hesap Makinesi State
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  // Hisse / Fon Lot Hesaplayıcı State
  const [unitPrice, setUnitPrice] = useState('');
  const [lotCount, setLotCount] = useState('');
  const [targetBudget, setTargetBudget] = useState('');

  const handleNum = useCallback((n: string) => {
    setDisplay((prev) => {
      if (prev === '0' || isCalculated) {
        setIsCalculated(false);
        return n;
      }
      return prev + n;
    });
  }, [isCalculated]);

  const handleOp = useCallback((op: string) => {
    setDisplay((prev) => {
      setEquation(`${prev} ${op} `);
      setIsCalculated(false);
      return '0';
    });
  }, []);

  const handleEqual = useCallback(() => {
    setEquation((currentEq) => {
      if (!currentEq) return currentEq;
      try {
        const fullExpr = currentEq + display;
        const sanitized = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        const formatted = Number.isInteger(result)
          ? result.toString()
          : parseFloat(result.toFixed(2)).toString();

        setDisplay(formatted);
        setIsCalculated(true);
        return `${fullExpr} =`;
      } catch (e) {
        setDisplay('Hata');
        return currentEq;
      }
    });
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setIsCalculated(false);
  }, []);

  const handleDelete = useCallback(() => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }, []);

  // Klavye Dinleyicisi
  useEffect(() => {
    if (!isOpen || activeTab !== 'calc') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Eğer kullanıcı başka bir input elementine yazıyorsa araya girme
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleNum(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        setDisplay((prev) => (prev.includes('.') ? prev : prev + '.'));
      } else if (e.key === '+') {
        e.preventDefault();
        handleOp('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOp('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOp('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOp('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeTab, handleNum, handleOp, handleEqual, handleDelete, handleClear]);

  // Hisse / Lot Hesaplamaları
  const calcTotalFromLots = () => {
    const price = parseFloat(unitPrice) || 0;
    const lots = parseFloat(lotCount) || 0;
    return (price * lots).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  };

  const calcLotsFromBudget = () => {
    const price = parseFloat(unitPrice) || 0;
    const budget = parseFloat(targetBudget) || 0;
    if (price <= 0) return '0';
    return (budget / price).toFixed(2);
  };

  return (
    <>
      {/* Sağ Alt Sabit Tetikleyici Buton */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer"
          title="Hesap Makinesi"
        >
          <Calculator className="w-5 h-5" />
          <span className="hidden sm:inline">Hesap Makinesi</span>
        </button>
      </div>

      {/* Hesap Makinesi Açılır Paneli */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-80 sm:w-88 clean-card bg-[var(--bg-surface)] p-4.5 rounded-2xl shadow-2xl border border-[var(--border-main)] animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-[var(--text-main)] block">Hızlı Hesap Makinesi</span>
                <span className="text-[10px] text-[var(--text-muted)]">Klavye girişi aktif (0-9, +, -, *, /, Enter)</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mod Değiştirici Sekmeler */}
          <div className="flex bg-[var(--bg-page)] p-1 rounded-xl mb-3 border border-[var(--border-subtle)] text-xs">
            <button
              onClick={() => setActiveTab('calc')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'calc'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Standart
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'share'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Lot / Adet Alım
            </button>
          </div>

          {/* TAB 1: STANDART HESAP MAKİNESİ */}
          {activeTab === 'calc' && (
            <div className="space-y-3">
              {/* Ekran */}
              <div className="bg-[var(--bg-page)] p-3 rounded-xl border border-[var(--border-main)] text-right">
                <div className="text-xs text-[var(--text-muted)] h-4 font-mono-num truncate">
                  {equation}
                </div>
                <div className="text-2xl font-extrabold text-[var(--text-main)] font-mono-num truncate mt-0.5">
                  {display}
                </div>
              </div>

              {/* Tuş Takımı */}
              <div className="grid grid-cols-4 gap-1.5 text-sm font-bold font-mono-num">
                <button
                  onClick={handleClear}
                  className="py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Temizle (Esc)"
                >
                  C
                </button>
                <button
                  onClick={handleDelete}
                  className="py-2.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-badge)] transition-colors cursor-pointer flex items-center justify-center"
                  title="Sil (Backspace)"
                >
                  <Delete className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOp('÷')}
                  className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  ÷
                </button>
                <button
                  onClick={() => handleOp('×')}
                  className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  ×
                </button>

                {['7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNum(n)}
                    className="py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] transition-colors cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleOp('-')}
                  className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  -
                </button>

                {['4', '5', '6'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNum(n)}
                    className="py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] transition-colors cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleOp('+')}
                  className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  +
                </button>

                {['1', '2', '3'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNum(n)}
                    className="py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] transition-colors cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={handleEqual}
                  className="row-span-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-sm transition-colors cursor-pointer flex items-center justify-center text-lg"
                  title="Hesapla (Enter)"
                >
                  =
                </button>

                <button
                  onClick={() => handleNum('0')}
                  className="col-span-2 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    if (!display.includes('.')) setDisplay(display + '.');
                  }}
                  className="py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] transition-colors cursor-pointer"
                >
                  .
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HİSSE / LOT ALIM HESAPLAYICI */}
          {activeTab === 'share' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] font-semibold block mb-1">
                  Birim Fiyat (₺ / $):
                </label>
                <input
                  type="number"
                  placeholder="Örn: 245.50"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-main)] font-mono-num font-bold outline-none"
                />
              </div>

              {/* 1. Seçenek: Adet Gir -> Toplam Tutar */}
              <div className="p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold">Alınacak Adet / Lot:</span>
                  <input
                    type="number"
                    placeholder="Adet"
                    value={lotCount}
                    onChange={(e) => setLotCount(e.target.value)}
                    className="w-24 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded px-2 py-1 text-xs text-right font-mono-num font-bold text-[var(--text-main)] outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">Toplam Maliyet:</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-num">
                    {calcTotalFromLots()} ₺
                  </span>
                </div>
              </div>

              {/* 2. Seçenek: Bütçe Gir -> Alınabilecek Adet */}
              <div className="p-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold">Ayrılan Bütçe (₺):</span>
                  <input
                    type="number"
                    placeholder="Tutar"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    className="w-24 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded px-2 py-1 text-xs text-right font-mono-num font-bold text-[var(--text-main)] outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">Alınabilir Adet:</span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono-num">
                    {calcLotsFromBudget()} Adet
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
