import React from 'react';
import { useLang } from '../../context/LangContext';

const statusColor = { 'Issue Reported': '#3498db', 'Status changed to "in-progress"': '#f39c12', 'Status changed to "resolved"': '#27ae60', 'Urgency Escalated': '#e94560' };

const Timeline = ({ timeline = [] }) => {
  const { t } = useLang();
  if (!timeline.length) return null;
  return (
    <div style={styles.container}>
      <h4 style={styles.heading}>📋 {t('timeline')}</h4>
      <div style={styles.track}>
        {timeline.map((item, i) => (
          <div key={i} style={styles.item}>
            <div style={{ ...styles.dot, background: statusColor[item.event] || '#888' }} />
            {i < timeline.length - 1 && <div style={styles.line} />}
            <div style={styles.content}>
              <strong style={{ fontSize: 13 }}>{item.event}</strong>
              {item.note && <p style={styles.note}>{item.note}</p>}
              <span style={styles.meta}>{item.by} · {new Date(item.at).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { marginTop: 16, padding: '12px 16px', background: '#f8f9fa', borderRadius: 10 },
  heading: { margin: '0 0 12px', fontSize: 14, color: '#333' },
  track: { display: 'flex', flexDirection: 'column', gap: 0 },
  item: { display: 'flex', gap: 12, position: 'relative', paddingBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 3, zIndex: 1 },
  line: { position: 'absolute', left: 5, top: 15, width: 2, height: '100%', background: '#ddd' },
  content: { flex: 1 },
  note: { margin: '2px 0', fontSize: 12, color: '#666' },
  meta: { fontSize: 11, color: '#aaa' },
};

export default Timeline;
