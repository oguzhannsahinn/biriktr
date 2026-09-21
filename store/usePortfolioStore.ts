import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MonthlyLog, AssetCategory } from '@/types/portfolio';
import { DEFAULT_MONTHLY_BUDGET, INITIAL_CATEGORIES, MONTH_NAMES_TR } from '@/lib/constants';
import { recalculateBudgetDistribution, calculateMonthlyStats, DEFAULT_USD_TRY_RATE } from '@/lib/calculations';

interface PortfolioState {
  theme: 'dark' | 'light';
  usdTryRate: number;
  goldGramRate: number;
  isLoadingCurrency: boolean;
  lastCurrencyUpdated?: string;
  currentMonthId: string;
  monthlyLogs: Record<string, MonthlyLog>;
  totalAccumulatedPortfolio: number;
  existingCategoryBalances: Record<string, number>;
  annualReturnAssumption: number;

  // Aksiyonlar
  toggleTheme: () => void;
  setUsdTryRate: (rate: number) => void;
  setGoldGramRate: (rate: number) => void;
  fetchLiveUsdRate: () => Promise<void>;
  updateStrategyPercentages: (percentages: Record<string, number>) => void;
  selectMonth: (monthId: string) => void;
  setBudget: (monthId: string, newBudget: number) => void;
  updateItemActual: (
    monthId: string,
    categoryId: string,
    itemId: string,
    actualAmount: number,
    isCompleted?: boolean
  ) => void;
  toggleItemCompletion: (monthId: string, categoryId: string, itemId: string) => void;
  addNewMonth: (year: number, month: number, budget?: number) => string;
  setTotalAccumulatedPortfolio: (amount: number) => void;
  setExistingCategoryBalances: (balances: Record<string, number>) => void;
  setAnnualReturnAssumption: (rate: number) => void;
  getCurrentLog: () => MonthlyLog;
}


const getCurrentMonthId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const createInitialMonthLog = (
  monthId: string,
  budgetAmount: number = DEFAULT_MONTHLY_BUDGET
): MonthlyLog => {
  const [yearStr, monthStr] = monthId.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const monthLabel = `${MONTH_NAMES_TR[month - 1]} ${year}`;

  const categories = recalculateBudgetDistribution(budgetAmount, INITIAL_CATEGORIES);

  const initialLog: MonthlyLog = {
    id: monthId,
    budget: {
      id: monthId,
      year,
      month,
      monthLabel,
      totalBudget: budgetAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    categories,
    totalActualAmount: 0,
    completionRate: 0,
  };

  return initialLog;
};

// Eski localStorage kayıtlarını güncel şablona senkronize etme (Kullanıcı strateji oranlarını korur)
const sanitizeCategories = (categories: AssetCategory[], budget: number): AssetCategory[] => {
  const cleanBase = INITIAL_CATEGORIES.map((initCat) => {
    const existing = categories.find((c) => c.id === initCat.id);
    if (!existing) return initCat;

    const mergedItems = initCat.items.map((initItem) => {
      const existingItem = existing.items.find((i) => i.id === initItem.id);
      if (existingItem) {
        return {
          ...initItem,
          actualAmount: existingItem.actualAmount,
          isCompleted: existingItem.isCompleted,
        };
      }
      return initItem;
    });

    return {
      ...initCat,
      targetPercentage: existing.targetPercentage ?? initCat.targetPercentage,
      items: mergedItems,
    };
  });

  return recalculateBudgetDistribution(budget, cleanBase);
};

export const usePortfolioStore = create<PortfolioState>()(

  persist(
    (set, get) => {
      const initialMonthId = getCurrentMonthId();
      const initialLogs: Record<string, MonthlyLog> = {
        [initialMonthId]: createInitialMonthLog(initialMonthId, DEFAULT_MONTHLY_BUDGET),
      };

      return {
        theme: 'light',
        usdTryRate: DEFAULT_USD_TRY_RATE,
        goldGramRate: 6818.0,
        isLoadingCurrency: false,
        currentMonthId: initialMonthId,
        monthlyLogs: initialLogs,
        totalAccumulatedPortfolio: 250000,
        existingCategoryBalances: {
          liquidity: 87500,
          bist_stocks: 62500,
          us_stocks: 37500,
          gold_commodities: 37500,
          high_risk: 25000,
        },
        annualReturnAssumption: 35,


        toggleTheme: () => {
          const next = get().theme === 'dark' ? 'light' : 'dark';
          set({ theme: next });
          if (typeof document !== 'undefined') {
            if (next === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        },

        setUsdTryRate: (rate: number) => {
          set({ usdTryRate: Math.max(1, rate) });
        },

        setGoldGramRate: (rate: number) => {
          set({ goldGramRate: Math.max(1, rate) });
        },

        fetchLiveUsdRate: async () => {
          set({ isLoadingCurrency: true });
          try {
            const res = await fetch('/api/currency');
            const data = await res.json();
            const updates: Partial<PortfolioState> = { isLoadingCurrency: false };

            if (data?.rate && typeof data.rate === 'number') {
              updates.usdTryRate = data.rate;
            }
            if (data?.goldGramRate && typeof data.goldGramRate === 'number') {
              updates.goldGramRate = data.goldGramRate;
            }
            if (data?.updatedAt) {
              updates.lastCurrencyUpdated = data.updatedAt;
            }

            // 2 Gram Fiziki Altın kaleminin hedefini canlı fiyata göre (2 x gramAltin) otomatik güncelle
            if (data?.goldGramRate && typeof data.goldGramRate === 'number') {
              const live2GrTarget = Math.round(2 * data.goldGramRate);
              const state = get();
              const updatedMonthlyLogs = { ...state.monthlyLogs };

              Object.keys(updatedMonthlyLogs).forEach((mId) => {
                const log = updatedMonthlyLogs[mId];
                if (log && log.categories) {
                  let hasChanged = false;
                  const newCategories = log.categories.map((cat) => {
                    if (cat.id !== 'gold_commodities') return cat;
                    const newItems = cat.items.map((item) => {
                      if (item.code === '2GR-ALTIN' || item.id === 'item-gold-physical') {
                        hasChanged = true;
                        return {
                          ...item,
                          targetAmount: live2GrTarget,
                          description: `Aylık 2 gram fiziki altın (Gram: ${Math.round(data.goldGramRate).toLocaleString('tr-TR')} ₺)`,
                        };
                      }
                      return item;
                    });
                    return { ...cat, items: newItems };
                  });

                  if (hasChanged) {
                    updatedMonthlyLogs[mId] = {
                      ...log,
                      categories: newCategories,
                    };
                  }
                }
              });

              updates.monthlyLogs = updatedMonthlyLogs;
            }

            set(updates);
          } catch (e) {
            set({ isLoadingCurrency: false });
          }
        },

        updateStrategyPercentages: (percentages: Record<string, number>) => {
          set((state) => {
            const currentId = state.currentMonthId;
            const currentLog = state.monthlyLogs[currentId] || createInitialMonthLog(currentId);
            const totalBudget = currentLog.budget.totalBudget || DEFAULT_MONTHLY_BUDGET;

            // Kategori hedef yüzdelerini güncelle
            const updatedCategories = currentLog.categories.map((cat) => {
              const newPct = percentages[cat.id] !== undefined ? percentages[cat.id] : cat.targetPercentage;
              return {
                ...cat,
                targetPercentage: Math.max(0, Math.min(100, newPct)),
              };
            });

            // Yeni yüzdelere göre varlık hedeflerini yeniden dağıt
            const reallocatedCategories = recalculateBudgetDistribution(totalBudget, updatedCategories);

            const updatedLog: MonthlyLog = {
              ...currentLog,
              categories: reallocatedCategories,
              budget: {
                ...currentLog.budget,
                updatedAt: new Date().toISOString(),
              },
            };

            const stats = calculateMonthlyStats(updatedLog);
            updatedLog.totalActualAmount = stats.totalActual;
            updatedLog.completionRate = stats.completionRate;

            return {
              monthlyLogs: {
                ...state.monthlyLogs,
                [currentId]: updatedLog,
              },
            };
          });
        },

        selectMonth: (monthId) => {

          const state = get();
          if (!state.monthlyLogs[monthId]) {
            const newLog = createInitialMonthLog(monthId, DEFAULT_MONTHLY_BUDGET);
            set({
              monthlyLogs: { ...state.monthlyLogs, [monthId]: newLog },
              currentMonthId: monthId,
            });
          } else {
            set({ currentMonthId: monthId });
          }
        },

        setBudget: (monthId, newBudget) => {
          set((state) => {
            const currentLog = state.monthlyLogs[monthId] || createInitialMonthLog(monthId, newBudget);
            const sanitizedCats = sanitizeCategories(currentLog.categories, newBudget);
            const updatedCategories = recalculateBudgetDistribution(newBudget, sanitizedCats);

            const updatedLog: MonthlyLog = {
              ...currentLog,
              budget: {
                ...currentLog.budget,
                totalBudget: newBudget,
                updatedAt: new Date().toISOString(),
              },
              categories: updatedCategories,
            };

            const stats = calculateMonthlyStats(updatedLog);
            updatedLog.totalActualAmount = stats.totalActual;
            updatedLog.completionRate = stats.completionRate;

            return {
              monthlyLogs: {
                ...state.monthlyLogs,
                [monthId]: updatedLog,
              },
            };
          });
        },

        updateItemActual: (monthId, categoryId, itemId, actualAmount, isCompleted) => {
          set((state) => {
            const currentLog = state.monthlyLogs[monthId] || createInitialMonthLog(monthId);
            const sanitizedCats = sanitizeCategories(currentLog.categories, currentLog.budget.totalBudget);
            const updatedCategories = sanitizedCats.map((cat) => {
              if (cat.id !== categoryId) return cat;

              return {
                ...cat,
                items: cat.items.map((item) => {
                  if (item.id !== itemId) return item;
                  const completedStatus =
                    isCompleted !== undefined ? isCompleted : actualAmount > 0 ? true : item.isCompleted;
                  return {
                    ...item,
                    actualAmount: Math.max(0, actualAmount),
                    isCompleted: completedStatus,
                    completedAt: completedStatus ? item.completedAt || new Date().toISOString() : undefined,
                  };
                }),
              };
            });

            const updatedLog: MonthlyLog = {
              ...currentLog,
              categories: updatedCategories,
            };

            const stats = calculateMonthlyStats(updatedLog);
            updatedLog.totalActualAmount = stats.totalActual;
            updatedLog.completionRate = stats.completionRate;

            return {
              monthlyLogs: {
                ...state.monthlyLogs,
                [monthId]: updatedLog,
              },
            };
          });
        },

        toggleItemCompletion: (monthId, categoryId, itemId) => {
          set((state) => {
            const currentLog = state.monthlyLogs[monthId] || createInitialMonthLog(monthId);
            const sanitizedCats = sanitizeCategories(currentLog.categories, currentLog.budget.totalBudget);
            const updatedCategories = sanitizedCats.map((cat) => {
              if (cat.id !== categoryId) return cat;

              return {
                ...cat,
                items: cat.items.map((item) => {
                  if (item.id !== itemId) return item;
                  const newCompleted = !item.isCompleted;
                  const newActual =
                    newCompleted && item.actualAmount === 0 ? item.targetAmount : item.actualAmount;

                  return {
                    ...item,
                    isCompleted: newCompleted,
                    actualAmount: newActual,
                    completedAt: newCompleted ? new Date().toISOString() : undefined,
                  };
                }),
              };
            });

            const updatedLog: MonthlyLog = {
              ...currentLog,
              categories: updatedCategories,
            };

            const stats = calculateMonthlyStats(updatedLog);
            updatedLog.totalActualAmount = stats.totalActual;
            updatedLog.completionRate = stats.completionRate;

            return {
              monthlyLogs: {
                ...state.monthlyLogs,
                [monthId]: updatedLog,
              },
            };
          });
        },

        addNewMonth: (year, month, budget = DEFAULT_MONTHLY_BUDGET) => {
          const monthId = `${year}-${String(month).padStart(2, '0')}`;
          const state = get();
          if (!state.monthlyLogs[monthId]) {
            const newLog = createInitialMonthLog(monthId, budget);
            set({
              monthlyLogs: { ...state.monthlyLogs, [monthId]: newLog },
              currentMonthId: monthId,
            });
          } else {
            set({ currentMonthId: monthId });
          }
          return monthId;
        },

        setTotalAccumulatedPortfolio: (amount) => {
          set({ totalAccumulatedPortfolio: Math.max(0, amount) });
        },

        setExistingCategoryBalances: (balances) => {
          const sum = Object.values(balances).reduce((acc, val) => acc + (Number(val) || 0), 0);
          set({
            existingCategoryBalances: balances,
            totalAccumulatedPortfolio: sum,
          });
        },

        setAnnualReturnAssumption: (rate) => {

          set({ annualReturnAssumption: Math.max(1, rate) });
        },

        getCurrentLog: () => {
          const state = get();
          const currentId = state.currentMonthId;
          const log = state.monthlyLogs[currentId] || createInitialMonthLog(currentId);
          const sanitizedCats = sanitizeCategories(log.categories, log.budget.totalBudget);
          return {
            ...log,
            categories: sanitizedCats,
          };
        },
      };
    },
    {
      name: 'yatirimim-portfolio-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
