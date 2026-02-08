import { useState } from 'react';
import { useTransformer, RenderedBlock } from './hooks/useTransformer';

type ViewMode = 'diagram' | 'code';

export default function App() {
  const { status, message, blocks, scan, insertAll } = useTransformer();
  const [viewMode, setViewMode] = useState<ViewMode>('diagram');

  const isWorking = status === 'scanning' || status === 'rendering' || status === 'inserting';
  const hasBlocks = blocks.length > 0;

  return (
    <div className="panel">
      <div className="panel-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="panel-title">Mermaid Renderer</span>
      </div>

      <div className="panel-body">
        {message && (
          <div className={`status ${status}`}>
            {isWorking && <span className="spinner" />}
            <span>{message}</span>
          </div>
        )}

        {hasBlocks && (
          <>
            <div className="toggle-bar">
              <button
                className={`toggle-btn ${viewMode === 'diagram' ? 'active' : ''}`}
                onClick={() => setViewMode('diagram')}
              >
                Diagram
              </button>
              <button
                className={`toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
                onClick={() => setViewMode('code')}
              >
                Code
              </button>
            </div>

            <div className="block-list">
              {blocks.map((block, i) => (
                <BlockCard key={i} block={block} viewMode={viewMode} index={i} />
              ))}
            </div>
          </>
        )}

        <div className="actions">
          <button className="action-btn scan-btn" onClick={scan} disabled={isWorking}>
            {isWorking && status !== 'inserting' ? 'Scanning...' : 'Rescan'}
          </button>
          {hasBlocks && (
            <button className="action-btn insert-btn" onClick={insertAll} disabled={isWorking}>
              {status === 'inserting' ? 'Inserting...' : 'Insert into Document'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockCard({ block, viewMode, index }: { block: RenderedBlock; viewMode: ViewMode; index: number }) {
  if (block.error) {
    return (
      <div className="block-card error-card">
        <div className="card-label">Block {index + 1} - Render Error</div>
        <div className="error-item">{block.error}</div>
      </div>
    );
  }

  return (
    <div className="block-card">
      <div className="card-label">Block {index + 1}</div>
      {viewMode === 'diagram' ? (
        <div className="diagram-view" dangerouslySetInnerHTML={{ __html: block.svg }} />
      ) : (
        <pre className="code-view">{block.code}</pre>
      )}
    </div>
  );
}
