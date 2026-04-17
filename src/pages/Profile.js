import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', city: '', pincode: '', bio: '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        pincode: user.pincode || '',
        bio: user.bio || '',
      });
    }
    api.get('/issues/my').then(({ data }) => {
      setStats({
        total: data.length,
        resolved: data.filter((i) => i.status === 'resolved').length,
        inProgress: data.filter((i) => i.status === 'in-progress').length,
      });
    });
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (avatar) fd.append('avatar', avatar);
    const { data } = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    updateUser(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const avatarSrc = preview || user?.avatarUrl || null;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  return (
    <div style={styles.page}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.container}>

        {/* Left — Avatar + Stats */}
        <div style={styles.sidebar}>
          <div style={styles.avatarWrap}>
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={styles.avatarImg} />
              : <div style={styles.avatarFallback}>{initials}</div>
            }
            <label style={styles.avatarEdit}>
              📷
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>

          <h3 style={styles.userName}>{user?.name}</h3>
          <p style={styles.userEmail}>{user?.email}</p>
          {memberSince && <p style={styles.memberSince}>Member since {memberSince}</p>}

          {/* Karma badge */}
          <div style={styles.karmaBadge}>
            <span style={styles.karmaNum}>{user?.karma || 0}</span>
            <span style={styles.karmaLabel}>Karma Points</span>
          </div>

          {/* Issue stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{stats.total}</span>
              <span style={styles.statLabel}>Reported</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: '#f39c12' }}>{stats.inProgress}</span>
              <span style={styles.statLabel}>In Progress</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: '#27ae60' }}>{stats.resolved}</span>
              <span style={styles.statLabel}>Resolved</span>
            </div>
          </div>

          {/* Karma level */}
          <div style={styles.levelBox}>
            <p style={styles.levelLabel}>{getLevel(user?.karma || 0)}</p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${Math.min((user?.karma || 0) % 100, 100)}%` }} />
            </div>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{100 - ((user?.karma || 0) % 100)} pts to next level</p>
          </div>
        </div>

        {/* Right — Edit Form */}
        <div style={styles.formSection}>
          <h2 style={styles.formTitle}>My Profile</h2>

          {saved && <div style={styles.successMsg}>✅ Profile updated successfully!</div>}

          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input value={user?.email || ''} disabled style={{ ...styles.input, background: '#f5f5f5', color: '#aaa' }} />
              <span style={styles.hint}>Email cannot be changed</span>
            </div>

            <div style={styles.row2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>City</label>
                <input placeholder="e.g. Delhi" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={styles.input} />
              </div>
            </div>

            <div style={styles.row2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>PIN Code</label>
                <input placeholder="e.g. 110085" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Role</label>
                <input value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} disabled style={{ ...styles.input, background: '#f5f5f5', color: '#aaa' }} />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bio <span style={{ color: '#aaa', fontSize: 12 }}>(optional)</span></label>
              <textarea
                placeholder="Tell your neighbors about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
};

const getLevel = (karma) => {
  if (karma >= 500) return '🏆 City Hero';
  if (karma >= 200) return '⭐ Active Citizen';
  if (karma >= 100) return '🌱 Community Member';
  if (karma >= 50) return '👋 Newcomer';
  return '🆕 Just Joined';
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh', padding: '40px 16px' },
  container: { maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  sidebar: { width: 260, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.08)', textAlign: 'center', flexShrink: 0 },
  avatarWrap: { position: 'relative', width: 90, height: 90, margin: '0 auto 12px' },
  avatarImg: { width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e94560' },
  avatarFallback: { width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#e94560,#1a1a2e)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, background: '#e94560', color: '#fff', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13 },
  userName: { fontSize: 17, fontWeight: 700, margin: '4px 0 2px' },
  userEmail: { fontSize: 13, color: '#888', margin: '0 0 4px' },
  memberSince: { fontSize: 12, color: '#aaa', margin: '0 0 16px' },
  karmaBadge: { background: 'linear-gradient(135deg,#e94560,#c0392b)', borderRadius: 12, padding: '12px 0', marginBottom: 16 },
  karmaNum: { display: 'block', fontSize: 28, fontWeight: 700, color: '#fff' },
  karmaLabel: { fontSize: 12, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: 1 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 },
  statBox: { background: '#f8f9fa', borderRadius: 8, padding: '10px 4px', textAlign: 'center' },
  statNum: { display: 'block', fontSize: 20, fontWeight: 700, color: '#e94560' },
  statLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase' },
  levelBox: { background: '#f8f9fa', borderRadius: 10, padding: '12px 16px', textAlign: 'left' },
  levelLabel: { fontSize: 13, fontWeight: 600, margin: '0 0 6px' },
  progressBar: { background: '#e0e0e0', borderRadius: 10, height: 8, overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#e94560,#f39c12)', height: '100%', borderRadius: 10, transition: 'width .4s' },
  formSection: { flex: 1, minWidth: 300, background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  formTitle: { margin: '0 0 20px', fontSize: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  row2: { display: 'flex', gap: 16 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  hint: { fontSize: 11, color: '#aaa' },
  saveBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15, marginTop: 4 },
  successMsg: { background: '#eafaf1', border: '1px solid #27ae60', borderRadius: 8, padding: '10px 14px', color: '#27ae60', fontSize: 14, marginBottom: 8 },
};

export default Profile;
