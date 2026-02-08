import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BlockitClient,
  BlockType,
  BlockSnapshot,
  DocumentRef,
} from '@lark-opdev/block-docs-addon-api';
import { isMermaidCode } from '../utils/mermaidDetector';
import { normalizeCode } from '../utils/normalizeCode';
import { svgToDataUrl } from '../utils/svgToImage';

interface MermaidCodeBlock {
  snapshot: BlockSnapshot;
  parentSnapshot: BlockSnapshot;
  code: string;
}

/** A scanned + rendered mermaid block, ready for preview or insertion */
export interface RenderedBlock {
  code: string;
  svg: string;
  dataUrl: string;
  width: number;
  height: number;
  snapshot: BlockSnapshot;
  parentSnapshot: BlockSnapshot;
  error?: string;
}

type Status = 'idle' | 'scanning' | 'rendering' | 'inserting' | 'done' | 'error';

export interface UseTransformerReturn {
  status: Status;
  message: string;
  blocks: RenderedBlock[];
  scan: () => Promise<void>;
  insertAll: () => Promise<void>;
}

let mermaidInstance: typeof import('mermaid')['default'] | null = null;
let mermaidInitPromise: Promise<void> | null = null;
let renderCounter = 0;

async function ensureMermaid() {
  if (mermaidInstance) return mermaidInstance;
  if (!mermaidInitPromise) {
    mermaidInitPromise = (async () => {
      const { default: mermaid } = await import('mermaid');
      const { mermaidConfig } = await import('../utils/mermaidConfig');
      mermaid.initialize(mermaidConfig);
      mermaidInstance = mermaid;
    })();
  }
  await mermaidInitPromise;
  return mermaidInstance!;
}

function collectMermaidBlocks(
  snapshot: BlockSnapshot,
  parent: BlockSnapshot | null,
): MermaidCodeBlock[] {
  const results: MermaidCodeBlock[] = [];

  if (snapshot.type === BlockType.CODE && parent) {
    const text = (snapshot.data as any)?.plain_text ?? '';
    if (text && isMermaidCode(text)) {
      results.push({ snapshot, parentSnapshot: parent, code: text });
    }
  }

  if (snapshot.childSnapshots) {
    for (const child of snapshot.childSnapshots) {
      results.push(...collectMermaidBlocks(child, snapshot));
    }
  }

  return results;
}

export function useTransformer(): UseTransformerReturn {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [blocks, setBlocks] = useState<RenderedBlock[]>([]);
  const apiRef = useRef<ReturnType<BlockitClient['initAPI']> | null>(null);

  function getApi() {
    if (!apiRef.current) {
      apiRef.current = new BlockitClient().initAPI();
    }
    return apiRef.current;
  }

  /** Scan the document and render all mermaid code blocks */
  const scan = useCallback(async () => {
    setStatus('scanning');
    setMessage('Scanning document...');
    setBlocks([]);

    try {
      const api = getApi();
      const docRef: DocumentRef = await api.getActiveDocumentRef();
      const rootBlock = await api.Document.getRootBlock(docRef);
      const mermaidBlocks = collectMermaidBlocks(rootBlock, null);

      if (mermaidBlocks.length === 0) {
        setStatus('done');
        setMessage('No mermaid code blocks found.');
        return;
      }

      setStatus('rendering');
      setMessage(`Rendering ${mermaidBlocks.length} block(s)...`);

      const mermaid = await ensureMermaid();
      const rendered: RenderedBlock[] = [];

      for (const block of mermaidBlocks) {
        try {
          const normalized = normalizeCode(block.code.trim());
          const id = `mermaid-preview-${Date.now()}-${++renderCounter}`;
          const { svg } = await mermaid.render(id, normalized);
          const { dataUrl, width, height } = await svgToDataUrl(svg);

          rendered.push({
            code: block.code,
            svg,
            dataUrl,
            width,
            height,
            snapshot: block.snapshot,
            parentSnapshot: block.parentSnapshot,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          rendered.push({
            code: block.code,
            svg: '',
            dataUrl: '',
            width: 0,
            height: 0,
            snapshot: block.snapshot,
            parentSnapshot: block.parentSnapshot,
            error: msg,
          });
        }
      }

      setBlocks(rendered);
      setStatus('done');
      const ok = rendered.filter((b) => !b.error).length;
      const fail = rendered.filter((b) => b.error).length;
      setMessage(`Found ${ok} diagram(s)${fail ? `, ${fail} failed to render` : ''}.`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to scan document');
      console.error('[Mermaid] Scan error:', err);
    }
  }, []);

  /** Insert all successfully rendered diagrams into the document */
  const insertAll = useCallback(async () => {
    const good = blocks.filter((b) => !b.error);
    if (good.length === 0) return;

    setStatus('inserting');
    setMessage(`Inserting ${good.length} diagram(s)...`);

    const api = getApi();
    let inserted = 0;
    let failed = 0;

    // Reverse so inserting doesn't shift earlier positions
    const reversed = [...good].reverse();

    for (let i = 0; i < reversed.length; i++) {
      const block = reversed[i];
      try {
        await insertImage(api, block, i);
        inserted++;
        setMessage(`Inserted ${inserted}/${good.length}...`);
      } catch (err) {
        failed++;
        console.error('[Mermaid] Insert error:', err);
      }
    }

    setStatus('done');
    if (failed === 0) {
      setMessage(`Inserted ${inserted} diagram(s) into document.`);
    } else {
      setMessage(`${inserted} inserted, ${failed} failed.`);
    }
  }, [blocks]);

  // Auto-scan on mount
  useEffect(() => {
    scan();
  }, [scan]);

  return { status, message, blocks, scan, insertAll };
}

/** Insert a single diagram image using fallback strategies */
async function insertImage(
  api: ReturnType<BlockitClient['initAPI']>,
  block: RenderedBlock,
  index: number,
): Promise<void> {
  const parentRef = block.parentSnapshot.ref;
  const insertPosition = block.snapshot.childIndex + 1;

  // Strategy 1: insertBlocksByHTML with <img>
  try {
    await (api as any).Document.insertBlocksByHTML(
      block.snapshot.ref,
      `<img src="${block.dataUrl}" width="${block.width}" height="${block.height}" alt="Mermaid diagram" />`,
    );
    return;
  } catch (err) {
    console.warn('[Mermaid] insertBlocksByHTML failed:', err);
  }

  // Strategy 2: ImageBlock.insertByUploadImage
  try {
    const file = dataUrlToFile(block.dataUrl, `mermaid-${index + 1}.png`);
    await (api as any).Block.ImageBlock.insertByUploadImage(parentRef, insertPosition, file);
    return;
  } catch (err) {
    console.warn('[Mermaid] insertByUploadImage failed:', err);
  }

  // Strategy 3: insertBlocksByMarkdown
  try {
    await (api as any).Document.insertBlocksByMarkdown(
      `![Mermaid Diagram](${block.dataUrl})`,
      block.snapshot.ref,
    );
    return;
  } catch (err) {
    console.warn('[Mermaid] insertBlocksByMarkdown failed:', err);
  }

  // Strategy 4: insertBlocksByHTML with SVG
  try {
    await (api as any).Document.insertBlocksByHTML(block.snapshot.ref, block.svg);
    return;
  } catch (err) {
    console.warn('[Mermaid] insertBlocksByHTML SVG failed:', err);
  }

  // Strategy 5: Preview.uploadImage + Block.insertBlock
  try {
    const uploadResult = await (api as any).Service.Preview.uploadImage({
      dataUrl: block.dataUrl,
      filename: `mermaid-${index + 1}.png`,
      width: block.width,
      height: block.height,
    });
    await api.Block.insertBlock(parentRef, insertPosition, {
      type: BlockType.IMAGE,
      data: { token: uploadResult?.token || uploadResult, width: block.width, height: block.height },
    } as any);
    return;
  } catch (err) {
    console.warn('[Mermaid] Preview.uploadImage failed:', err);
  }

  throw new Error('All image insertion strategies failed.');
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type: mime });
}
