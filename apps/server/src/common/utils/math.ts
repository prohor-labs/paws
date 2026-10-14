export function cleanAndFormatMathText(text?: string | null): string {
  if (!text) return '';

  let res = text
    .replace(/\r\n/g, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*');

  res = res.replace(
    /(?:\\\\|\\)\[([\s\S]*?)(?:\\\\|\\)\]/g,
    (_, math) => `\n\n$$\n${math.trim()}\n$$\n\n`,
  );

  res = res.replace(
    /(?:\\\\|\\)\(([\s\S]*?)(?:\\\\|\\)\)/g,
    (_, math) => `$${math.trim()}$`,
  );

  res = res.replace(/([^\n])\$\$/g, (_, c) => c + '\n\n$$');
  res = res.replace(/\$\$([^\n])/g, (_, c) => '$$\n\n' + c);

  res = res.replace(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g, (match) => {
    return match.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
  });

  return res.trim();
}
