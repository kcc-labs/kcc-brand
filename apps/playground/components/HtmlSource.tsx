"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const VOID = new Set(["area", "br", "col", "hr", "img", "input", "line", "rect", "circle", "path", "meta", "link", "source", "wbr"]);
const INLINE = new Set(["a", "abbr", "b", "strong", "em", "i", "span", "sup", "code", "small", "title", "text", "label"]);

/** Indents HTML: one block element a line, inline elements kept on their parent's line. */
function pretty(html: string): string {
  const tokens = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+(style|tabindex)="[^"]*"/g, (m, a) => (a === "tabindex" ? ' tabindex="0"' : m))
    .split(/(<[^>]+>)/)
    .filter((t) => t.trim() !== "");
  let depth = 0;
  let line = "";
  const out: string[] = [];
  const flush = () => {
    if (line.trim()) out.push("  ".repeat(depth) + line.trim());
    line = "";
  };
  for (const t of tokens) {
    const m = t.match(/^<\/?([a-zA-Z0-9-]+)/);
    const tag = m?.[1].toLowerCase();
    if (!tag || INLINE.has(tag)) {
      line += t;
      continue;
    }
    if (t.startsWith("</")) {
      flush();
      depth = Math.max(0, depth - 1);
      out.push("  ".repeat(depth) + t);
    } else {
      flush();
      out.push("  ".repeat(depth) + t);
      if (!VOID.has(tag) && !t.endsWith("/>")) depth++;
    }
  }
  flush();
  // Close tags right after their opening tag with text in between join back on one line.
  return out
    .join("\n")
    .replace(/(<(\w[\w-]*)[^>]*>)\n\s*([^<\n]+)\n\s*(<\/\2>)/g, "$1$3$4")
    .replace(/(<(\w[\w-]*)[^>]*>)\n\s*(<\/\2>)/g, "$1$3");
}

/**
 * Renders a live demo and, under it, the HTML that the React component produced (read from the DOM after it
 * renders), so the copy-paste HTML can never drift from the package.
 */
export function HtmlSource({ children, react }: { children: ReactNode; react: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (ref.current) setHtml(pretty(ref.current.innerHTML));
  }, []);
  return (
    <div className="pg-demo">
      <div className="pg-demo__live" data-kc-specimen ref={ref}>
        {children}
      </div>
      <details className="pg-demo__code">
        <summary>HTML</summary>
        <pre className="kc-code">
          <code>{html || "Rendering…"}</code>
        </pre>
      </details>
      <details className="pg-demo__code">
        <summary>React</summary>
        <pre className="kc-code">
          <code>{react}</code>
        </pre>
      </details>
    </div>
  );
}
