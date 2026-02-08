import { MERMAID_KEYWORDS } from './constants';

/** Check whether `text` looks like Mermaid diagram code. */
export function isMermaidCode(text: string): boolean {
  const trimmed = text.trim();
  return MERMAID_KEYWORDS.some((keyword) => trimmed.startsWith(keyword));
}
