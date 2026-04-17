import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useSocket from '../hooks/useSocket';
import Timeline from '../components/ui/Timeline';
import { useLang } from '../context/LangContext';

const statusColor = { reported: '#e94560', 'in-progress': '#f39c12', resolved: '#27ae60' };

const MyIssues = () => {
  const { t } = useLang();
  const [issues, setIssues] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { api.get('/issues/my').then(({ data }) => setIssues(data)); }, []);

  useSocket('issue:updated', (updated) =>
    setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
  );

  const handleUpvote = async (id) => {
    try {
      const { data } = await api.post(`/issues/${id}/upvote`);
      setIssues((prev) => prev.map((i) => (i._id === id ? data : i)));
    } catch { alert('Already upvoted'); }
  };

  return (
    <div style={styles.container}>
      <h2>{t('myIssues')}</h2>
      {issues.length === 0 && <p>{t('noIssues')}</p>}
      {issues.map((issue) => (
        <div key={issue._id} style={styles.card}>
          <div style={styles.header}>
            <div>
              <strong>{issue.title}</strong>
              {issue.refNumber && <span style={styles.ref}>{issue.refNumber}</span>}
            </div>
            <span style={{ ...styles.badge, background: statusColor[issue.status] }}>{t(issue.status === 'in-progress' ? 'inProgress' : issue.status)}</span>
          </div>
          <p style={styles.meta}>{issue.category} · {issue.department} · {t('urgency')}: {issue.urgency}/10
            {issue.slaDeadline && <span style={{ marginLeft: 8, color: new Date(issue.slaDeadline) < new Date() && issue.status !== 'resolved' ? '#e94560' : '#888' }}>
              · SLA: {new Date(issue.slaDeadline).toLocaleDateString('en-IN')}
            </span>}
          </p>
          <p style={{ fontSize: 13, color: '#555' }}>{issue.description}</p>
          {issue.resolutionNote && <p style={styles.note}>✅ {issue.resolutionNote}</p>}
          <div style={styles.footer}>
            <span>👍 {issue.upvotes} {t('upvotes')}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setExpanded(expanded === issue._id ? null : issue._id)} style={styles.timelineBtn}>
                {expanded === issue._id ? '▲ Hide' : '▼'} {t('timeline')}
              </button>
              <button onClick={() => handleUpvote(issue._id)} style={styles.upvoteBtn}>{t('upvote')}</button>
            </div>
          </div>
          {expanded === issue._id && <Timeline timeline={issue.timeline} />}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: { maxWidth: 700, margin: '40px auto', padding: '0 16px' },
  card: { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,.08)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  meta: { fontSize: 12, color: '#888', margin: '4px 0 8px' },
  ref: { marginLeft: 10, fontSize: 11, color: '#e94560', fontWeight: 700, background: '#fff0f3', padding: '2px 8px', borderRadius: 10 },
  note: { background: '#eafaf1', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#27ae60' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  upvoteBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  timelineBtn: { background: '#f0f2f5', color: '#333', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
};

export default MyIssues;
