import type { MermaidConfig } from 'mermaid';

export const mermaidConfig: MermaidConfig = {
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
  sequence: {
    useMaxWidth: true,
  },
};
