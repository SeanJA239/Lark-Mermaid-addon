import { useTransformer } from './hooks/useTransformer';

export default function App() {
  const { status, message, blocks, scan, insertAll } = useTransformer();

  const isWorking = status === 'scanning' || status === 'rendering' || status === 'inserting';
  const hasBlocks = blocks.filter((b) => !b.error).length > 0;

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
