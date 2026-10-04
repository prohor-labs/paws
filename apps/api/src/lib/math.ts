export function cleanAndFormatMathText(text?: string | null): string {
  if (!text) return "";

  let res = text
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*");

  res = res.replace(/\$[^$]*\$|\s*\(([^()]*)\)/g, (whole: string, inner?: string) => {
    if (whole.trimStart().startsWith("$")) return whole;
    return inner && !/[\u0980-\u09FF]/.test(inner) && /[A-Za-z]{3,}/.test(inner) ? "" : whole;
  });

  res = res.replace(/\\left\$/g, "\\left(").replace(/\\right\$/g, "\\right)");

  res = res.replace(/(?:\\\\|\\)\[([\s\S]*?)(?:\\\\|\\)\]/g, (_, math) => `$$\n${math.trim()}\n$$`);
  res = res.replace(/(?:\\\\|\\)\(([\s\S]*?)(?:\\\\|\\)\)/g, (_, math) => `$${math.trim()}$`);
  res = res.replace(/\(\(([a-zA-Z0-9_^+\-*/\\{}\s]+)\)\)/g, (_, math) => `$(${math.trim()})$`);

  res = res.replace(/\\left\(/g, "__LEFT_PAREN__").replace(/\\right\)/g, "__RIGHT_PAREN__");

  res = res.replace(
    /(?<!\$)\(((?:[^()]|\([^()]*\))*?\\[a-zA-Z]+(?:[^()]|\([^()]*\))*?)\)(?!\$)/g,
    (_, math) => `$${math.trim()}$`,
  );
  res = res.replace(
    /(?<!\$)\(\s*([a-zA-Z0-9_^\s]*[+\-*/=><?][a-zA-Z0-9_^+\-*/=><?\s]*)\s*\)(?!\$)/g,
    (whole, math) => (/[0-9_^\\]/.test(math) ? `$${math.trim()}$` : whole),
  );
  res = res.replace(
    /(?<!\$)\(([a-zA-Z][0-9a-zA-Z]*[_^][a-zA-Z0-9_^+\-*/{}\s]+)\)(?!\$)/g,
    (_, math) => `$${math.trim()}$`,
  );
  res = res.replace(/(?<!\$)(?<=[^\w$]|^)\(([A-Za-z])\)(?=[^\w$]|$)(?!\$)/g, (_, v) => `$${v}$`);
  res = res.replace(/(?<!\$)(?<=[^\w$]|^)\((-?\d+)\)(?=[^\w$]|$)(?!\$)/g, (_, num) => `${num}`);

  res = res.replace(/__LEFT_PAREN__/g, "\\left(").replace(/__RIGHT_PAREN__/g, "\\right)");

  const trimmed = res.trim();
  if (
    trimmed.startsWith("\\") &&
    !trimmed.startsWith("$$") &&
    !trimmed.includes("$") &&
    /\\[a-zA-Z]+/.test(trimmed)
  ) {
    res = `$${trimmed}$`;
  }

  res = res.replace(/\$\s*\$/g, "");
  res = res.replace(/\$([^$]+)\$/g, (_, inner) => `$${inner.trim()}$`);

  return res.replace(/[ \t]{2,}/g, " ").trim();
}
