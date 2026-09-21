import { AssetCategory, MonthlyLog } from '@/types/portfolio';
import { INITIAL_CATEGORIES } from './constants';

export const DEFAULT_USD_TRY_RATE = 35.0;

/**
 * Verilen toplam bütçeye göre tüm kategorilerin ve alt varlıkların hedef tutarlarını yeniden hesaplar.
 */
export function recalculateBudgetDistribution(
  totalBudget: number,
  existingCategories?: AssetCategory[]
): AssetCategory[] {
  const baseCategories = existingCategories || INITIAL_CATEGORIES;

  return baseCategories.map((category) => {
    const categoryTargetTotal = Math.round((totalBudget * category.targetPercentage) / 100);
    const currentItemSum = category.items.reduce((acc, item) => acc + (item.targetAmount || 1), 0) || 1;

    const updatedItems = category.items.map((item, idx) => {
      if (idx === category.items.length - 1) {
        const previousItemsTotal = category.items
          .slice(0, idx)
          .reduce((sum, curr) => sum + Math.round((curr.targetAmount / currentItemSum) * categoryTargetTotal), 0);
        return {
          ...item,
          targetAmount: Math.max(0, categoryTargetTotal - previousItemsTotal),
        };
      }

      const calculatedTarget = Math.round((item.targetAmount / currentItemSum) * categoryTargetTotal);
      return {
        ...item,
        targetAmount: calculatedTarget,
      };
    });

    return {
      ...category,
      items: updatedItems,
    };
  });
}

/**
 * Aylık günlüğün gerçekleşen tutarlarını ve genel ilerleme oranını hesaplar.
 */
export function calculateMonthlyStats(monthlyLog: MonthlyLog) {
  let totalTarget = monthlyLog.budget.totalBudget || 0;
  let totalActual = 0;
  let totalItemsCount = 0;
  let completedItemsCount = 0;

  monthlyLog.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      totalItemsCount++;
      if (item.isCompleted) {
        completedItemsCount++;
      }
      totalActual += item.actualAmount || 0;
    });
  });

  const completionRate = totalTarget > 0 ? Math.min(100, Math.round((totalActual / totalTarget) * 100)) : 0;
  const itemsCompletionRate = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  return {
    totalTarget,
    totalActual,
    remainingAmount: Math.max(0, totalTarget - totalActual),
    completionRate,
    itemsCompletionRate,
    completedItemsCount,
    totalItemsCount,
  };
}

/**
 * Donut Grafik için Hedef vs. Gerçekleşen Dağılımını Formatlar (%0 olanları gizler)
 */
export function getDonutChartData(categories: AssetCategory[]) {
  const targetData = categories
    .filter((c) => (c.targetPercentage || 0) > 0)
    .map((c) => {
      const categoryTargetSum = c.items.reduce((sum, i) => sum + i.targetAmount, 0);
      return {
        name: c.name,
        value: categoryTargetSum,
        color: c.color,
        id: c.id,
        percentage: c.targetPercentage,
      };
    })
    .filter((item) => item.value > 0 || item.percentage > 0);

  const actualData = categories
    .map((c) => {
      const categoryActualSum = c.items.reduce((sum, i) => sum + i.actualAmount, 0);
      return {
        name: c.name,
        value: categoryActualSum,
        color: c.color,
        id: c.id,
      };
    })
    .filter((item) => item.value > 0);

  return { targetData, actualData };
}


/**
 * Dinamik Süre ve Hedef Odaklı Bileşik Büyüme Projeksiyonu
 */
export function calculateCompoundProjection(
  currentPortfolio: number,
  monthlyAddition: number,
  targetGoal: number = 5000000,
  annualReturnRate: number = 0.50, // %50 yıllık getiri varsayımı
  projectionYears: number = 3 // 3 yıllık varsayılan projeksiyon
) {
  // Aylık bileşik getiri oranı: (1 + r)^(1/12) - 1
  const monthlyRate = Math.pow(1 + annualReturnRate, 1 / 12) - 1;
  const totalMonths = projectionYears * 12;

  let balance = currentPortfolio;
  let totalInvested = currentPortfolio;
  let monthsToGoal = 0;
  let reachedGoal = false;

  const timeline: { month: number; label: string; balance: number; invested: number }[] = [];

  timeline.push({
    month: 0,
    label: 'Başlangıç',
    balance: Math.round(balance),
    invested: Math.round(totalInvested),
  });

  for (let m = 1; m <= totalMonths; m++) {
    // Önceki bakiyeye aylık getiri ekle + yeni aylık birikimi ilave et
    balance = balance * (1 + monthlyRate) + monthlyAddition;
    totalInvested += monthlyAddition;

    if (!reachedGoal && balance >= targetGoal) {
      monthsToGoal = m;
      reachedGoal = true;
    }

    if (m % 6 === 0 || m === totalMonths || m === 12) {
      const year = (m / 12).toFixed(m % 12 === 0 ? 0 : 1);
      timeline.push({
        month: m,
        label: `${year}. Yıl`,
        balance: Math.round(balance),
        invested: Math.round(totalInvested),
      });
    }
  }

  if (!reachedGoal) {
    monthsToGoal = totalMonths;
  }

  const finalBalance = Math.round(balance);
  const totalInvestedRounded = Math.round(totalInvested);
  const totalGain = Math.round(finalBalance - totalInvestedRounded);

  return {
    projectionYears,
    monthsToGoal,
    yearsToGoal: (monthsToGoal / 12).toFixed(1),
    finalBalance,
    totalInvested: totalInvestedRounded,
    totalGain,
    timeline,
  };
}

/**
 * Para formatlayıcı (TL)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Dolar formatlayıcı ($) - Binlik basamakları Türkçe standartlarına uygun nokta (.) ile formatlar (virgül kullanmaz)
 */
export function formatUsd(amountInTry: number, rate: number = 35.0): string {
  if (!amountInTry || rate <= 0) return '$0';
  const usd = amountInTry / rate;
  const rounded = Math.round(usd);
  return `$${rounded.toLocaleString('tr-TR')}`;
}

