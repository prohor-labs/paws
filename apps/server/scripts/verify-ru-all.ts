import * as cheerio from 'cheerio';

async function verifyAll() {
  const units = [
    { name: 'RU A Unit', code: 'UNI_6321c505' },
    { name: 'RU B Unit', code: 'UNI_f20da169' },
    { name: 'RU C Unit', code: 'UNI_d8e1d188' },
  ];

  for (const u of units) {
    const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=${u.code}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const $ = cheerio.load(json.html || '');
    const subjects: string[] = [];
    $('[onclick*="toggleSubject"]').each((_, el) => {
      const onclick = $(el).attr('onclick') || '';
      const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
      if (match) subjects.push(match[2]);
    });

    const uniqueQs = new Set<string>();
    for (const sub of subjects) {
      let p = 1;
      let more = true;
      while (more) {
        const fetchUrl = `https://studyclubd.com/view-question1/?university=UNI_HSQQTE&unit=${u.code}&subject=${sub}&spa_ajax=1&page=${p}`;
        const fRes = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const fData = await fRes.json();
        const $q = cheerio.load(fData.html || '');
        const items = $q('.mcq-item');
        if (items.length === 0) break;
        items.each((_, qEl) => {
          const text = $q(qEl).find('.mcq-question-text').text().trim().replace(/\s+/g, ' ');
          if (text) uniqueQs.add(text);
        });
        more = fData.has_more === true || (fData.total_pages && p < fData.total_pages);
        p++;
      }
    }
    console.log(`${u.name}: ${subjects.length} subjects -> ${uniqueQs.size} TOTAL UNIQUE QUESTIONS`);
  }
}

verifyAll();
