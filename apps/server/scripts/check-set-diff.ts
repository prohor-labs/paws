import * as cheerio from 'cheerio';

async function checkMissingSetQuestions() {
  const units = [
    { code: 'UNI_6321c505', name: 'RU A Unit' },
    { code: 'UNI_f20da169', name: 'RU B Unit' },
    { code: 'UNI_d8e1d188', name: 'RU C Unit' },
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

    const subjectQuestions = new Set<string>();
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
          const text = $q(qEl).find('.mcq-question-text').text().replace(/^[০-৯0-9]+\s*/, '').trim().replace(/\s+/g, ' ').toLowerCase();
          if (text) subjectQuestions.add(text);
        });
        more = fData.has_more === true || (fData.total_pages && p < fData.total_pages);
        p++;
      }
    }

    const yearUrls: string[] = [];
    $('[onclick*="openQbModal"]').each((_, el) => {
      const onclick = $(el).attr('onclick') || '';
      const match = onclick.match(/openQbModal\('([^']+)'/);
      if (match && match[1].includes('year=')) {
        yearUrls.push(match[1].replace('../', 'https://studyclubd.com/'));
      }
    });

    const setQuestions = new Set<string>();
    const notInSubjects: string[] = [];

    for (const yu of yearUrls) {
      let p = 1;
      let more = true;
      while (more) {
        const fRes = await fetch(`${yu}&spa_ajax=1&page=${p}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const fData = await fRes.json();
        const $q = cheerio.load(fData.html || '');
        const items = $q('.mcq-item');
        if (items.length === 0) break;
        items.each((_, qEl) => {
          const text = $q(qEl).find('.mcq-question-text').text().replace(/^[০-৯0-9]+\s*/, '').trim().replace(/\s+/g, ' ').toLowerCase();
          if (text) {
            setQuestions.add(text);
            if (!subjectQuestions.has(text)) {
              notInSubjects.push(text);
            }
          }
        });
        more = fData.has_more === true || (fData.total_pages && p < fData.total_pages);
        p++;
      }
    }

    console.log(`${u.name}: Subject questions unique = ${subjectQuestions.size} | Year set questions unique = ${setQuestions.size} | In year sets but NOT in subjects = ${notInSubjects.length}`);
  }
}

checkMissingSetQuestions();
