import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import api from '../services/api';

const medals = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const { t } = useLang();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => { api.get('/users/leaderboard').then(({ data }) => setLeaders(data)); }, []);

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={styles.title}>🏆 {t('topReporters')}</h2>
        <p style={styles.sub}>Citizens making their city better — ranked by karma points</p>
      </motion.div>

      {leaders.map((u, i) => (
        <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ ...styles.card, ...(i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : {}) }}>
          <div style={styles.rank}>{medals[i] || `#${i + 1}`}</div>
          <div style={styles.info}>
            <strong style={{ fontSize: 16 }}>{u.name}</strong>
            <div style={styles.stats}>
              <span>📝 {u.issueCount} {t('issues')}</span>
              <span>✅ {u.resolvedCount} {t('resolved')}</span>
            </div>
          </div>
          <div style={styles.karmaBox}>
            <span style={styles.karmaNum}>{u.karma}</span>
            <span style={styles.karmaLabel}>{t('karma')}</span>
          </div>
        </motion.div>
      ))}

      {leaders.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No data yet. Be the first to report an issue!</p>}

      <div style={styles.howBox}>
        <h4>How to earn karma?</h4>
        <ul style={{ fontSize: 13, color: '#555', paddingLeft: 20 }}>
          <li>+10 for reporting an issue</li>
          <li>+2 each time someone upvotes your issue</li>
          <li>+20 when your issue gets resolved</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: 640, margin: '40px auto', padding: '0 16px' },
  title: { textAlign: 'center', fontSize: 28, marginBottom: 4 },
  sub: { textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 28 },
  card: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,.07)' },
  gold: { border: '2px solid #f1c40f', background: '#fffdf0' },
  silver: { border: '2px solid #bdc3c7', background: '#f9f9f9' },
  bronze: { border: '2px solid #cd7f32', background: '#fdf6f0' },
  rank: { fontSize: 28, width: 40, textAlign: 'center' },
  info: { flex: 1 },
  stats: { display: 'flex', gap: 16, fontSize: 12, color: '#888', marginTop: 4 },
  karmaBox: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  karmaNum: { fontSize: 24, fontWeight: 700, color: '#e94560' },
  karmaLabel: { fontSize: 11, color: '#aaa', textTransform: 'uppercase' },
  howBox: { background: '#f0f2f5', borderRadius: 10, padding: '16px 20px', marginTop: 24 },
};

export default Leaderboard;
