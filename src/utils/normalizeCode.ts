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

  // Escape regular double-quotes inside bracket content [...]
  normalized = normalized.replace(/\[([^\]]*)\]/g, (_match, content: string) => {
    const escaped = content.replace(/"/g, '#quot;');
    return '[' + escaped + ']';
  });

  return normalized;
}
