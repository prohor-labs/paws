"use client";

import type { ComponentProps } from "react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeMathjaxSvg from "rehype-mathjax/svg";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Check, Copy } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { RichTextProps } from "@/types";

export type { RichTextProps };

function CodeBlock({ language, value }: { language?: string; value: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-border/70 bg-muted text-foreground text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/70 border-b border-border/40 select-none text-[11px] text-muted-foreground">
        <span className="font-semibold uppercase">{language || "code"}</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => copyToClipboard(value)}
          className="font-mono"
        >
          {isCopied ? <Check className="text-primary" /> : <Copy />}
          {isCopied ? "কপি হয়েছে!" : "কোড কপি করুন"}
        </Button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="m-0 leading-relaxed font-mono whitespace-pre">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}

function convertHtmlTableToMarkdown(html: string): string {
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const cellRegex = /<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
      const cells: string[] = [];
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].trim());
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) return "";
    const maxCols = Math.max(...rows.map((r) => r.length));
    const padRow = (r: string[]) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push("");
      return `| ${copy.join(" | ")} |`;
    };

    const header = padRow(rows[0]);
    const separator = `| ${new Array(maxCols).fill("---").join(" | ")} |`;
    const body = rows.slice(1).map(padRow).join("\n");

    return `\n\n${header}\n${separator}${body ? `\n${body}` : ""}\n\n`;
  });
}

function preprocessRichContent(content: string): string {
  if (!content) return "";

  // 1. Convert <table> HTML tags to Markdown tables
  let s = convertHtmlTableToMarkdown(content);

  // 2. Convert <img ... src='...'> to standard markdown image
  s = s.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\s*\/?>/gi, (_, src) => {
    return `\n\n![](${src})\n\n`;
  });

  // 3. Normalize HTML paragraphs and breaks
  s = s
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "  \n");

  // 4. Scan for \( ... \) and \[ ... \] and normalize to $ ... $ and $$ ... $$
  let result = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && s[i + 1] === "[") {
      const closeIdx = s.indexOf("\\]", i + 2);
      if (closeIdx !== -1) {
        const math = s.slice(i + 2, closeIdx).trim();
        result += `\n$$\n${math}\n$$\n`;
        i = closeIdx + 2;
        continue;
      }
    }
    if (s[i] === "\\" && s[i + 1] === "(") {
      const closeIdx = s.indexOf("\\)", i + 2);
      if (closeIdx !== -1) {
        const math = s.slice(i + 2, closeIdx).trim();
        result += `$${math}$`;
        i = closeIdx + 2;
        continue;
      }
    }
    result += s[i];
    i++;
  }

  return result.trim();
}

export const RichText = React.memo(function RichText({ content, className }: RichTextProps) {
  const rehypePlugins: ComponentProps<typeof ReactMarkdown>["rehypePlugins"] = React.useMemo(
    () => [
      rehypeRaw,
      [
        rehypeMathjaxSvg,
        {
          fontCache: "global",
          internalSpeechTitles: false,
        },
      ],
    ],
    [],
  );

  const remarkPlugins: ComponentProps<typeof ReactMarkdown>["remarkPlugins"] = React.useMemo(
    () => [remarkGfm, [remarkMath, { singleDollarTextMath: true }]],
    [],
  );

  const processedContent = React.useMemo(() => {
    return preprocessRichContent(content || "");
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert break-words text-foreground leading-relaxed",
        "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0",
        "prose-table:my-3 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-th:bg-muted/40",
        "prose-blockquote:border-l-4 prose-blockquote:border-brand/60 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isInline = !match && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-brand dark:text-brand"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                value={String(children).replace(/\n$/, "")}
              />
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

RichText.displayName = "RichText";
