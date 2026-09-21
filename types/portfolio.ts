export type AssetCategoryId =
  | 'liquidity'
  | 'us_stocks'
  | 'bist_stocks'
  | 'gold_commodities'
  | 'high_risk';

export interface AssetItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  targetRatioInCategory?: number; // Kategori içi hedef ağırlık (opsiyonel)
  targetAmount: number;           // Bu ayki hedef tutar (TL)
  actualAmount: number;           // Gerçekleşen alım tutarı (TL)
  isCompleted: boolean;           // Alım yapıldı mı?
  completedAt?: string;           // Alım tarihi (ISO String)
  unitPrice?: number;             // Ortalama alış maliyeti (opsiyonel)
  quantity?: number;              // Alınan adet (opsiyonel)
  notes?: string;                 // Kullanıcı notu
}

export interface AssetCategory {
  id: AssetCategoryId;
  name: string;
  targetPercentage: number;       // Örn: 30 (%30)
  color: string;                  // Grafik ve UI rengi (HEX / HSL)
  gradient: string;               // Kart gradient rengi
  badgeBg: string;                // Kategori etiketi arka planı
  badgeText: string;              // Kategori etiketi yazı rengi
  roleDescription: string;        // Örn: "Sabit getiri & düşüşlerde alım cephanesi"
  items: AssetItem[];
}

export interface MonthlyBudget {
  id: string;                     // Örn: "2026-10"
  year: number;
  month: number;                  // 1-12
  monthLabel: string;             // Örn: "Ekim 2026"
  totalBudget: number;            // Aylık yatırım bütçesi (Örn: 55000 TL)
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyLog {
  id: string;                     // "2026-10"
  budget: MonthlyBudget;
  categories: AssetCategory[];
  totalActualAmount: number;
  completionRate: number;         // % (0-100)
  isClosed?: boolean;             // Ay kapatıldı mı?
  notes?: string;
}

export interface BufferDeploymentStep {
  step: number;
  percentage: number;            // 33, 33, 34
  amount: number;                // TL karşılığı
  targetAssets: string[];        // Önerilen düşüş alım varlıkları (THYAO, FROTO, MU, S&P 500 vb.)
  marketDropTrigger: string;     // Örn: "%10 - %15 düşüşte 1. Kademe"
  isExecuted: boolean;
  executedAt?: string;
}

export interface BufferPlan {
  totalBufferAvailable: number;  // %30'luk likit tampon havuzu (TL)
  steps: BufferDeploymentStep[];
}
