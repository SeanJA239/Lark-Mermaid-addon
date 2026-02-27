/**
 * Convert full-width CJK characters to ASCII equivalents and fix common
 * quote issues that break Mermaid syntax.
 *
 * Ported from lark-mermaid-renderer.user.js.
 */
export function normalizeCode(code: string): string {
  let normalized = code
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/｛/g, '{')
    .replace(/｝/g, '}')
    .replace(/＜/g, '<')
    .replace(/＞/g, '>')
    .replace(/：/g, ':')
    .replace(/；/g, ';')
    .replace(/，/g, ',')
    .replace(/｜/g, '|');

  // Smart-quote → HTML entity so they don't break Mermaid's own quote parsing
  normalized = normalized.replace(/\u201C/g, '#quot;').replace(/\u201D/g, '#quot;');
  normalized = normalized.replace(/\u2018/g, '#apos;');

  // Escape double-quotes inside bracket content [...], but preserve
  // mermaid's ["..."] syntax where quotes wrap the entire label.
  normalized = normalized.replace(/\[([^\]]*)\]/g, (_match, content: string) => {
    // If content is wrapped in quotes like ["label"], preserve them
    if (/^".*"$/.test(content)) {
      return '[' + content + ']';
    }
    const escaped = content.replace(/"/g, '#quot;');
    return '[' + escaped + ']';
  });

  return normalized;
}
