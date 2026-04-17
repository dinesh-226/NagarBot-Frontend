import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', phone: '', department: '', officerId: '' });
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (form.role === 'officer') {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (proof) fd.append('proof', proof);
        await api.post('/auth/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setPending(true);
      } else {
        await api.post('/auth/register', form);
        await login(form.email, form.password);
        navigate('/');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
  };

  if (pending) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
      <h2 style={{ color: '#f39c12' }}>⏳ Application Submitted</h2>
      <p>Your officer registration is <strong>pending admin approval</strong>. You will be able to login once an admin verifies your ID and proof document.</p>
      <Link to="/login" style={styles.btn}>Back to Login</Link>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
      <h2>Create Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={styles.input} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={styles.input} />
        <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} />
        <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={styles.input} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={styles.input}>
          <option value="citizen">Citizen</option>
          <option value="officer">Department Officer</option>
        </select>

        {form.role === 'officer' && (
          <>
            <div style={styles.infoBox}>
              🏛️ Officer accounts require admin verification before login access is granted.
            </div>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required style={styles.input}>
              <option value="">Select Department</option>
              <option value="PWD">PWD (Public Works Department)</option>
              <option value="Electricity Board">Electricity Board</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Water Works">Water Works</option>
              <option value="Municipal Corporation">Municipal Corporation</option>
            </select>
            <input
              placeholder="Official Officer ID (e.g. PWD/2024/1234)"
              value={form.officerId}
              onChange={(e) => setForm({ ...form, officerId: e.target.value })}
              required
              style={styles.input}
            />
            <div style={styles.uploadBox}>
              <label style={{ fontSize: 13, color: '#555', marginBottom: 6, display: 'block' }}>
                📎 Upload Proof Document (ID card / appointment letter)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProof(e.target.files[0])}
                required
              />
              {proof && <p style={{ fontSize: 12, color: '#27ae60', marginTop: 4 }}>✓ {proof.name}</p>}
            </div>
          </>
        )}

        <button type="submit" style={styles.btn}>
          {form.role === 'officer' ? 'Submit for Approval' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>Already have an account? <Link to="/login">Login</Link></p>
    </motion.div>
  );
};

const styles = {
  card: { maxWidth: 440, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block' },
  infoBox: { background: '#fff8e1', border: '1px solid #f39c12', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#7d5a00' },
  uploadBox: { border: '1px dashed #ddd', borderRadius: 8, padding: '12px 14px', background: '#fafafa' },
};

export default Register;
