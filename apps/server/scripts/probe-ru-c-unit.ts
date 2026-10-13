import * as cheerio from 'cheerio';

async function listSubjects() {
  const url = 'https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=year&family=University&university=UNI_HSQQTE&unit=UNI_d8e1d188';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const json = await res.json();
  const $ = cheerio.load(json.html || '');
  
  const subjects: Array<{ text: string; code: string }> = [];
  $('[onclick*="toggleSubject"]').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const onclick = $(el).attr('onclick') || '';
    const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
    if (match) {
      subjects.push({ text, code: match[2] });
    }
  });
  console.table(subjects);
}

listSubjects();
