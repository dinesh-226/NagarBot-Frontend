import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useIssueForm from '../hooks/useIssueForm';
import useGeolocation from '../hooks/useGeolocation';
import { useLang } from '../context/LangContext';

const ReportIssue = () => {
  const { submitIssue, loading, error } = useIssueForm();
  const { coords } = useGeolocation();
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', address: '' });
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('lat', coords?.lat || 20.5937);
    fd.append('lng', coords?.lng || 78.9629);
    if (image) fd.append('image', image);
    const issue = await submitIssue(fd);
    setSuccess(issue);
  };

  if (success) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
      <h2 style={{ color: '#27ae60' }}>{t('issueReported')}</h2>
      <div style={styles.refBox}>
        <span style={styles.refLabel}>Reference Number</span>
        <span style={styles.refNum}>{success.refNumber}</span>
      </div>
      <p><strong>{t('category')}:</strong> {success.category}</p>
      <p><strong>{t('urgency')}:</strong> {success.urgency}/10 {success.urgency >= 8 ? '🚨 High urgency alert sent to department' : ''}</p>
      <p><strong>{t('department')}:</strong> {success.department}</p>
      <p><strong>SLA Deadline:</strong> {new Date(success.slaDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      {success.aiSummary && <p style={styles.summaryBox}>🤖 {success.aiSummary}</p>}
      {success.complainantLetter ? (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', color: '#e94560' }}>{t('viewLetter')}</summary>
          <pre style={styles.letter}>{success.complainantLetter}</pre>
          <button onClick={() => {
            const blob = new Blob([success.complainantLetter], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `complaint-${success._id}.txt`;
            a.click();
          }} style={{ ...styles.btn, background: '#1a1a2e', marginTop: 8, fontSize: 13 }}>{t('downloadLetter')}</button>
        </details>
      ) : (
        <p style={{ color: '#e67e22', fontSize: 13, marginTop: 12 }}>⚠️ Complaint letter unavailable — Gemini API key not configured.</p>
      )}
      <button onClick={() => navigate('/map')} style={styles.btn}>{t('viewOnMap')}</button>
    </motion.div>
  );

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.card}>
      <h2>{t('reportIssue')}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="title" placeholder={t('issueTitle')} value={form.title} onChange={handleChange} required style={styles.input} />
        <textarea name="description" placeholder={t('description')} value={form.description} onChange={handleChange} required rows={4} style={styles.input} />
        <input name="address" placeholder={t('address')} value={form.address} onChange={handleChange} style={styles.input} />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ marginBottom: 12 }} />
        {coords && <p style={{ fontSize: 12, color: '#888' }}>{t('locationDetected')}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? t('submitting') : t('submitIssue')}
        </button>
      </form>
    </motion.div>
  );
};

const styles = {
  card: { maxWidth: 560, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 8 },
  letter: { background: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' },
  refBox: { background: '#1a1a2e', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  refLabel: { color: '#aaa', fontSize: 12 },
  refNum: { color: '#e94560', fontWeight: 700, fontSize: 18, letterSpacing: 1 },
  summaryBox: { background: '#f0f8ff', border: '1px solid #3498db', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1a5276', marginTop: 8 },
};

export default ReportIssue;
