import { AssetCategory } from '@/types/portfolio';

export const DEFAULT_MONTHLY_BUDGET = 55000;

export const INITIAL_CATEGORIES: AssetCategory[] = [
  {
    id: 'liquidity',
    name: 'Mevduat & Likit Tampon',
    targetPercentage: 35, // %35 (Kalan pay)
    color: '#06b6d4', // Cyan
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    badgeText: 'text-cyan-400',
    roleDescription: 'Sabit getiri ve borsalarda %10+ düşüş olduğunda alım cephanesi.',
    items: [
      {
        id: 'item-ioo',
        name: 'IOO Para Piyasası Fonu / Günlük Mevduat',
        code: 'IOO',
        description: 'Likit faiz getirisi & Acil Düşüş Rezervi',
        targetAmount: 19250,
        actualAmount: 0,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'bist_stocks',
    name: 'BIST Hisseleri',
    targetPercentage: 25, // %25
    color: '#10b981', // Emerald Green
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    roleDescription: 'Temettü ve büyüme omurgası (THYAO, FROTO, ISCTR, MGROS, TCELL, ENJSA).',
    items: [
      {
        id: 'item-thyao',
        name: 'Türk Hava Yolları',
        code: 'THYAO',
        description: 'Havacılık ve küresel lojistik lideri',
        targetAmount: 2750,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-froto',
        name: 'Ford Otosan',
        code: 'FROTO',
        description: 'Otomotiv ihracat ve temettü omurgası',
        targetAmount: 2750,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-isctr',
        name: 'İş Bankası (C)',
        code: 'ISCTR',
        description: 'Bankacılık ve iştirak portföy gücü',
        targetAmount: 2250,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-mgros',
        name: 'Migros Ticaret',
        code: 'MGROS',
        description: 'Perakende ve enflasyonist nakit akışı',
        targetAmount: 2250,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-tcell',
        name: 'Turkcell',
        code: 'TCELL',
        description: 'Telekomünikasyon ve veri altyapısı',
        targetAmount: 1875,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-enjsa',
        name: 'Enerjisa Enerji',
        code: 'ENJSA',
        description: 'Elektrik dağıtım ve yüksek temettü verimi',
        targetAmount: 1875,
        actualAmount: 0,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'us_stocks',
    name: 'ABD Hisseleri',
    targetPercentage: 15, // %15
    color: '#3b82f6', // Blue
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    badgeText: 'text-blue-400',
    roleDescription: 'Global teknoloji, telekom ve büyüme omurgası (MU, NOK, RKLB, CIEN, QUBT, DXYZ).',
    items: [
      {
        id: 'item-mu',
        name: 'Micron Technology',
        code: 'MU',
        description: 'Yapay zeka ve bellek teknolojileri omurgası',
        targetAmount: 1650,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-nok',
        name: 'Nokia',
        code: 'NOK',
        description: '5G ve telekomünikasyon altyapı lideri',
        targetAmount: 1320,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-rklb',
        name: 'Rocket Lab USA',
        code: 'RKLB',
        description: 'Uzay fırlatma ve uydu teknolojileri',
        targetAmount: 1500,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-cien',
        name: 'Ciena Corporation',
        code: 'CIEN',
        description: 'Optik ağ ve veri merkezi iletişim altyapısı',
        targetAmount: 1380,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-qubt',
        name: 'Quantum Computing Inc.',
        code: 'QUBT',
        description: 'Kuantum fotonik ve optimizasyon',
        targetAmount: 1200,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-dxyz',
        name: 'Destiny Tech100',
        code: 'DXYZ',
        description: 'Özel teknoloji girişimleri (SpaceX, OpenAI)',
        targetAmount: 1200,
        actualAmount: 0,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gold_commodities',
    name: 'Altın & Emtia',
    targetPercentage: 15, // %15
    color: '#f59e0b', // Amber
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeText: 'text-amber-400',
    roleDescription: 'Enflasyondan korunma ve güvenli liman (Aylık 2 Gram Fiziki Altın).',
    items: [
      {
        id: 'item-gold-physical',
        name: '2 Gram Fiziki Altın',
        code: '2GR-ALTIN',
        description: 'Aylık düzenli 2 gram fiziki altın birikimi',
        targetAmount: 8250,
        actualAmount: 0,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'high_risk',
    name: 'Yüksek Riskli Varlıklar',
    targetPercentage: 10, // %10
    color: '#ec4899', // Pink / Magenta
    gradient: 'from-pink-500/20 via-pink-500/5 to-transparent',
    badgeBg: 'bg-pink-500/10 border-pink-500/30',
    badgeText: 'text-pink-400',
    roleDescription: 'Asimetrik getiri ve yeni nesil teknoloji potansiyeli (ASTS, IONQ, JOBY, Girişim Fonu).',
    items: [
      {
        id: 'item-asts',
        name: 'AST SpaceMobile',
        code: 'ASTS',
        description: 'Uzaydan doğrudan akıllı telefon 5G uydu ağı',
        targetAmount: 1750,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-ionq',
        name: 'IonQ Inc.',
        code: 'IONQ',
        description: 'Kuantum hesaplama ve donanım mimarisi',
        targetAmount: 1500,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-joby',
        name: 'Joby Aviation',
        code: 'JOBY',
        description: 'Elektrikli dikey iniş-kalkışlı (eVTOL) hava taksi',
        targetAmount: 1250,
        actualAmount: 0,
        isCompleted: false,
      },
      {
        id: 'item-gsyf',
        name: 'Girişim Sermayesi Yatırım Fonu (GSYF)',
        code: 'GSYF',
        description: 'Erken aşama teknoloji girişim fonları',
        targetAmount: 1000,
        actualAmount: 0,
        isCompleted: false,
      },
    ],
  },
];

export const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
