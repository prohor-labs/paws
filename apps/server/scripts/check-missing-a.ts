import * as cheerio from 'cheerio';

async function checkMissingA() {
  const url = 'https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=UNI_6321c505';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const json = await res.json();
  const $ = cheerio.load(json.html || '');

  const coreSubjs = ['SUB_22eb0d02', 'SUB_7a31a559', 'SUB_af941852', 'SUB_8a1edb7b', 'SUB_19679478'];
  const coreQuestions = new Set<string>();

  for (const s of coreSubjs) {
    let p = 1;
    let more = true;
    while (more) {
      const u = `https://studyclubd.com/view-question1/?university=UNI_HSQQTE&unit=UNI_6321c505&subject=${s}&spa_ajax=1&page=${p}`;
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const d = await r.json();
      const $q = cheerio.load(d.html || '');
      $q('.mcq-item').each((_, el) => {
        const text = $q(el).find('.mcq-question-text').text().trim().replace(/\s+/g, ' ');
        if (text) coreQuestions.add(text);
      });
      more = d.has_more === true || (d.total_pages && p < d.total_pages);
      p++;
    }
  }
  console.log('Total unique questions in 5 core subjects in A Unit:', coreQuestions.size);

  const yearUrls: string[] = [];
  $('[onclick*="openQbModal"]').each((_, el) => {
    const onclick = $(el).attr('onclick') || '';
    const match = onclick.match(/openQbModal\('([^']+)'/);
    if (match && match[1].includes('year=')) {
      yearUrls.push(match[1].replace('../', 'https://studyclubd.com/'));
    }
  });

  const missingFromCore: Array<{ text: string; meta: string }> = [];
  for (const yu of yearUrls) {
    let p = 1;
    let more = true;
    while (more) {
      const u = `${yu}&spa_ajax=1&page=${p}`;
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const d = await r.json();
      const $q = cheerio.load(d.html || '');
      $q('.mcq-item').each((_, el) => {
        const text = $q(el).find('.mcq-question-text').text().trim().replace(/\s+/g, ' ');
        const meta = $q(el).find('.mcq-meta').text().trim().replace(/\s+/g, ' ');
        if (text && !coreQuestions.has(text)) {
          missingFromCore.push({ text, meta });
        }
      });
      more = d.has_more === true || (d.total_pages && p < d.total_pages);
      p++;
    }
  }

  console.log('Total questions in Year Sets that are NOT in the 5 core subjects:', missingFromCore.length);
  console.log('Sample missing questions:');
  missingFromCore.slice(0, 15).forEach(m => console.log(`  - ${m.text.substring(0, 60)} | ${m.meta}`));
}

checkMissingA();
