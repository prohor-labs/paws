import * as cheerio from 'cheerio';

async function checkAllChapters(subjectCode: string, name: string) {
  const url = `https://studyclubd.com/qb-archive/includes/ajax.php?ajax=1&step=chapters&university=UNI_0bda0cb2&subject=${subjectCode}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const json = await res.json();
  const $ = cheerio.load(json.html || '');
  const chapters: { name: string; code: string; qCount: string }[] = [];
  $('[onclick*="toggleChapter"]').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const onclick = $(el).attr('onclick') || '';
    const match = onclick.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
    if (match) {
      chapters.push({ name: text, code: match[3], qCount: text.match(/\d+\s*Q/)?.[0] || '' });
    }
  });
  console.log(`\n=== ${name} (${subjectCode}): ${chapters.length} chapters ===`);
  for (const c of chapters) {
    console.log(`  - ${c.name} [${c.code}]`);
  }
}

async function main() {
  await checkAllChapters('SUB_7e246a89', 'পদার্থবিজ্ঞান');
  await checkAllChapters('SUB_455643fa', 'রসায়ন');
  await checkAllChapters('SUB_084ea3ab', 'উচ্চতর গণিত');
  await checkAllChapters('SUB_a2ff7d9b', 'জীববিজ্ঞান');
  await checkAllChapters('SUB_3f627e22', 'হিসাববিজ্ঞান');
  await checkAllChapters('SUB_395a86d5', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা');
  await checkAllChapters('SUB_acc1f045', 'ফিন্যান্স, ব্যাংকিং ও বিমা');
  await checkAllChapters('SUB_77c21b7c', 'উৎপাদন ব্যবস্থাপনা ও বিপণন');
  await checkAllChapters('SUB_c1b3c31c', 'অর্থনীতি');
  await checkAllChapters('SUB_c7f4b6b3', 'পৌরনীতি ও সুশাসন');
}

main().catch(console.error);
