import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let usdRate = 48.80;
    let goldGramRate = 6818.0;
    let source = 'fallback';

    // 1. Birincil Ücretsiz API: finans.truncgil.com/v4/today.json (Hem USD hem Gram Altın)
    try {
      const truncgilRes = await fetch('https://finans.truncgil.com/v4/today.json', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 600 }, // 10 dakika önbellek
      });

      if (truncgilRes.ok) {
        const data = await truncgilRes.json();
        if (data?.USD?.Selling) {
          usdRate = parseFloat(Number(data.USD.Selling).toFixed(2));
          source = 'truncgil';
        }
        if (data?.GRA?.Selling) {
          goldGramRate = parseFloat(Number(data.GRA.Selling).toFixed(2));
          source = 'truncgil';
        }
      }
    } catch {
      // Birincil hata verirse yedeklere devam
    }

    // 2. Yedek USD API (gerekirse): open.er-api.com
    if (usdRate === 48.80 && source !== 'truncgil') {
      try {
        const erRes = await fetch('https://open.er-api.com/v6/latest/USD', {
          next: { revalidate: 3600 },
        });
        if (erRes.ok) {
          const erData = await erRes.json();
          const r = erData?.rates?.TRY;
          if (r && typeof r === 'number') {
            usdRate = parseFloat(r.toFixed(2));
            source = 'open.er-api.com';
          }
        }
      } catch {
        // Devam et
      }
    }

    // 3. Yedek Altın API (gerekirse): api.gold-api.com
    if (goldGramRate === 6818.0 && source !== 'truncgil') {
      try {
        const goldRes = await fetch('https://api.gold-api.com/price/XAU', {
          next: { revalidate: 1800 },
        });
        if (goldRes.ok) {
          const goldData = await goldRes.json();
          const ounceUsd = Number(goldData.price);
          if (ounceUsd && ounceUsd > 0) {
            goldGramRate = parseFloat(((ounceUsd / 31.1034768) * usdRate).toFixed(2));
          }
        }
      } catch {
        // Devam et
      }
    }

    return NextResponse.json({
      success: true,
      rate: usdRate,
      usdRate,
      goldGramRate,
      source,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      rate: 48.80,
      usdRate: 48.80,
      goldGramRate: 6818.0,
      message: 'API fallback',
      updatedAt: new Date().toISOString(),
    });
  }
}

