import * as cheerio from 'cheerio';

async function inspectYearSets() {
  const units = [
    { name: 'RU A Unit', code: 'UNI_6321c505' },
    { name: 'RU B Unit', code: 'UNI_f20da169' },
    { name: 'RU C Unit', code: 'UNI_d8e1d188' },
  ];

  for (const u of units) {
    console.log(`\n================== ${u.name} (${u.code}) ==================`);
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');

    const yearUrls: Array<{ label: string; url: string }> = [];
    $('[onclick*="openQbModal"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const onclick = $(el).attr('onclick') || '';
      const match = onclick.match(/openQbModal\('([^']+)',\s*'([^']+)'\)/);
      if (match && match[1].includes('year=')) {
        yearUrls.push({ label: `${match[2]} (${text})`, url: match[1].replace('../', 'https://studyclubd.com/') });
      }
    });

    console.log(`Discovered ${yearUrls.length} Year/Set endpoints.`);
    
    const uniqueQuestions = new Set<string>();
    for (const y of yearUrls) {
      let page = 1;
      let hasMore = true;
      let yCount = 0;
      while (hasMore) {
        const fetchUrl = `${y.url}&spa_ajax=1&page=${page}`;
        const fRes = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const fJson = await fRes.json();
        const $q = cheerio.load(fJson.html || '');
        const items = $q('.mcq-item');
        if (items.length === 0) break;
        items.each((_, qEl) => {
          const qText = $q(qEl).find('.mcq-question-text').text().trim().replace(/\s+/g, ' ');
          if (qText) {
            uniqueQuestions.add(qText);
            yCount++;
          }
        });
        hasMore = fJson.has_more === true || (fJson.total_pages && page < fJson.total_pages);
        page++;
      }
      console.log(`  - ${y.label}: ${yCount} Qs (Cumulative Unique: ${uniqueQuestions.size})`);
    }
  }
}

inspectYearSets();
