import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IssueMap from '../components/map/IssueMap';

const Home = () => (
  <div>
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.hero}>
      <h1 style={styles.title}>🏙️ NagarBot</h1>
      <p style={styles.subtitle}>AI-powered civic issue reporting for Indian cities</p>
      <div style={styles.actions}>
        <Link to="/report" style={styles.primaryBtn}>Report an Issue</Link>
        <Link to="/map" style={styles.secondaryBtn}>View City Map</Link>
      </div>
      <div style={styles.legend}>
        <span>🔴 Reported</span>
        <span>🟡 In Progress</span>
        <span>🟢 Resolved</span>
      </div>
    </motion.div>
    <div style={{ padding: '0 24px 40px' }}>
      <IssueMap height="420px" />
    </div>
  </div>
);

const styles = {
  hero: { textAlign: 'center', padding: '60px 24px 32px', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
  title: { color: '#e94560', fontSize: 48, margin: 0 },
  subtitle: { color: '#ccc', fontSize: 18, margin: '12px 0 28px' },
  actions: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { background: '#e94560', color: '#fff', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 16 },
  secondaryBtn: { background: 'transparent', color: '#e94560', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 16, border: '2px solid #e94560' },
  legend: { display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20, color: '#aaa', fontSize: 14 },
};

export default Home;
