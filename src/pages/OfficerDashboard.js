import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/ui/Timeline';
import useSocket from '../hooks/useSocket';

const urgencyColor = (u) => u >= 8 ? '#e94560' : u >= 5 ? '#f39c12' : '#27ae60';
const statusColor = { reported: '#e94560', 'in-progress': '#f39c12', resolved: '#27ae60' };

const slaStatus = (deadline, status) => {
  if (status === 'resolved') return { label: 'Resolved', color: '#27ae60' };
  const days = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, color: '#e94560' };
  if (days === 0) return { label: 'Due today', color: '#e67e22' };
  return { label: `${days}d remaining`, color: days <= 1 ? '#e67e22' : '#27ae60' };
};

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [notes, setNotes] = useState({});
  const [resolutionImages, setResolutionImages] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (!user) return;
    // Fetch issues for this officer's department, plus fallback 'General' issues
    const dept = user.department || '';
    Promise.all([
      api.get(`/issues?department=${dept}`),
      dept !== 'General' ? api.get('/issues?department=General') : Promise.resolve({ data: [] }),
      api.get('/issues?department=Other'),
    ]).then(([deptRes, generalRes, otherRes]) => {
      const seen = new Set();
      const combined = [...deptRes.data, ...generalRes.data, ...otherRes.data].filter((i) => {
        if (seen.has(i._id)) return false;
        seen.add(i._id);
        return true;
      });
      setIssues(combined);
    });
  }, [user]);

  useSocket('issue:updated', (updated) =>
    setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
  );

  const updateStatus = async (id, status) => {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      let res;
      if (resolutionImages[id]) {
        const fd = new FormData();
        fd.append('status', status);
        if (notes[id]) fd.append('resolutionNote', notes[id]);
        fd.append('resolutionImage', resolutionImages[id]);
        res = await api.put(`/issues/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.put(`/issues/${id}`, { status, resolutionNote: notes[id] || '' });
      }
      setIssues((prev) => prev.map((i) => (i._id === id ? res.data : i)));
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed. Check your account role.');
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  const sortedIssues = [...issues].sort((a, b) => b.urgency - a.urgency || b.upvotes - a.upvotes);

  return (
    <div style={styles.container}>
      <h2>Officer Portal — {user?.department}</h2>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{issues.length} assigned issues · sorted by urgency</p>

      {sortedIssues.map((issue) => {
        const sla = issue.slaDeadline ? slaStatus(issue.slaDeadline, issue.status) : null;
        return (
          <div key={issue._id} style={{ ...styles.card, borderLeft: `4px solid ${urgencyColor(issue.urgency)}` }}>

            {/* Header */}
            <div style={styles.row}>
              <div>
                <strong style={{ fontSize: 15 }}>{issue.title}</strong>
                {issue.refNumber && <span style={styles.ref}>{issue.refNumber}</span>}
              </div>
              <span style={{ ...styles.badge, background: statusColor[issue.status] }}>{issue.status}</span>
            </div>

            {/* Stats row */}
            <div style={styles.statsRow}>
              <span style={{ ...styles.stat, color: urgencyColor(issue.urgency) }}>🔴 Urgency: {issue.urgency}/10</span>
              <span style={styles.stat}>👥 {issue.upvotes} neighbors affected</span>
              {sla && <span style={{ ...styles.stat, color: sla.color }}>⏰ SLA: {sla.label}</span>}
              {issue.slaDeadline && <span style={styles.stat}>📅 Deadline: {new Date(issue.slaDeadline).toLocaleDateString('en-IN')}</span>}
            </div>

            {/* AI Summary */}
            {issue.aiSummary && <p style={styles.summary}>🤖 {issue.aiSummary}</p>}
            {issue.actionRequired && <p style={styles.action}>⚡ {issue.actionRequired}</p>}

            <p style={{ fontSize: 13, color: '#555', margin: '6px 0' }}>{issue.description}</p>
            <p style={{ fontSize: 12, color: '#aaa' }}>📍 {issue.location?.address || `${issue.location?.lat}, ${issue.location?.lng}`}</p>

            {/* Issue photo */}
            {issue.imageUrl && <img src={issue.imageUrl} alt="issue" style={styles.img} />}

            {/* Resolution photo */}
            {issue.resolutionImageUrl && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, color: '#27ae60', marginBottom: 4 }}>✅ Resolution Photo:</p>
                <img src={issue.resolutionImageUrl} alt="resolution" style={styles.img} />
              </div>
            )}

            {/* Controls */}
            <div style={styles.controls}>
              <select
                value={issue.status}
                onChange={(e) => updateStatus(issue._id, e.target.value)}
                style={{ ...styles.select, borderColor: statusColor[issue.status] }}
              >
                <option value="reported">Reported</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <input
                placeholder="Resolution note / action taken..."
                value={notes[issue._id] || ''}
                onChange={(e) => setNotes({ ...notes, [issue._id]: e.target.value })}
                style={styles.noteInput}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={styles.uploadLabel}>
                📷 Upload resolution photo
                <input type="file" accept="image/*" onChange={(e) => setResolutionImages({ ...resolutionImages, [issue._id]: e.target.files[0] })} style={{ display: 'none' }} />
              </label>
              {resolutionImages[issue._id] && <span style={{ fontSize: 12, color: '#27ae60' }}>✓ {resolutionImages[issue._id].name}</span>}
              <button onClick={() => updateStatus(issue._id, issue.status)} disabled={saving[issue._id]} style={styles.btn}>
                {saving[issue._id] ? 'Saving...' : 'Save Update'}
              </button>
              <button onClick={() => setExpanded(expanded === issue._id ? null : issue._id)} style={styles.timelineBtn}>
                {expanded === issue._id ? '▲' : '▼'} Timeline
              </button>
            </div>

            {expanded === issue._id && <Timeline timeline={issue.timeline} />}
          </div>
        );
      })}

      {issues.length === 0 && (
        <div style={styles.empty}>
          <p>No issues found for <strong>{user?.department}</strong> department.</p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Issues are assigned based on AI classification. If Gemini API key is not configured, issues default to "General" department.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: 860, margin: '40px auto', padding: '0 16px' },
  card: { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.09)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  ref: { marginLeft: 10, fontSize: 11, color: '#e94560', fontWeight: 700, background: '#fff0f3', padding: '2px 8px', borderRadius: 10 },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  statsRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 },
  stat: { fontSize: 13, fontWeight: 600 },
  summary: { background: '#f0f8ff', border: '1px solid #3498db', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#1a5276', margin: '6px 0' },
  action: { background: '#fff8e1', border: '1px solid #f39c12', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#7d5a00', margin: '4px 0' },
  img: { width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, margin: '8px 0' },
  controls: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  select: { padding: '8px 12px', borderRadius: 6, border: '2px solid #ddd', fontSize: 13, fontWeight: 600 },
  noteInput: { flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  timelineBtn: { background: '#f0f2f5', color: '#333', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  uploadLabel: { background: '#f0f2f5', color: '#333', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
};

export default OfficerDashboard;
