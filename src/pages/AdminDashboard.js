import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const COLORS = ['#e94560', '#f39c12', '#27ae60', '#3498db', '#9b59b6', '#1abc9c'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);

  const fetchAll = () => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
    api.get('/admin/users').then(({ data }) => setUsers(data));
    api.get('/admin/pending-officers').then(({ data }) => setPending(data));
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (id) => { await api.put(`/admin/approve-officer/${id}`); fetchAll(); };
  const reject = async (id) => { if (window.confirm('Reject and delete this application?')) { await api.delete(`/admin/reject-officer/${id}`); fetchAll(); } };

  if (!stats) return <p style={{ textAlign: 'center', marginTop: 60 }}>Loading...</p>;

  const statusLabel = { reported: 'Reported', 'in-progress': 'In Progress', resolved: 'Resolved' };
  const statusColor = { reported: '#e94560', 'in-progress': '#f39c12', resolved: '#27ae60' };

  return (
    <div style={styles.container}>
      <h2>Admin Dashboard</h2>
      <div style={styles.statRow}>
        <div style={{ ...styles.statCard, borderTop: '4px solid #1a1a2e' }}>
          <h3 style={{ color: '#1a1a2e' }}>{stats.total}</h3>
          <p>Total Issues</p>
        </div>
        {['reported', 'in-progress', 'resolved'].map((s) => {
          const found = stats.byStatus.find((b) => b._id === s);
          return (
            <div key={s} style={{ ...styles.statCard, borderTop: `4px solid ${statusColor[s]}` }}>
              <h3 style={{ color: statusColor[s] }}>{found ? found.count : 0}</h3>
              <p>{statusLabel[s]}</p>
            </div>
          );
        })}
      </div>

      <div style={styles.charts}>
        <div style={styles.chartBox}>
          <h4>Issues by Category</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.byCategory.map((d) => ({ name: d._id, count: d.count }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#e94560" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartBox}>
          <h4>Issues by Department</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.byDepartment.map((d) => ({ name: d._id, value: d.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {stats.byDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {pending.length > 0 && (
        <>
          <h3 style={{ marginTop: 32, color: '#e94560' }}>⏳ Pending Officer Approvals ({pending.length})</h3>
          <table style={styles.table}>
            <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Officer ID</th><th>Proof</th><th>Actions</th></tr></thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.department}</td>
                  <td>{u.officerId}</td>
                  <td>{u.proofUrl ? <a href={u.proofUrl} target="_blank" rel="noreferrer" style={{ color: '#3498db' }}>View Proof</a> : '—'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => approve(u._id)} style={{ ...styles.actionBtn, background: '#27ae60' }}>✓ Approve</button>
                    <button onClick={() => reject(u._id)} style={{ ...styles.actionBtn, background: '#e94560' }}>✗ Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3 style={{ marginTop: 32 }}>All Users ({users.length})</h3>
      <table style={styles.table}>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td>
              <td><span style={{ ...styles.roleBadge, background: u.role === 'admin' ? '#e94560' : u.role === 'officer' ? '#f39c12' : '#3498db' }}>{u.role}</span></td>
              <td>{u.department || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: { maxWidth: 1000, margin: '40px auto', padding: '0 16px' },
  statRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 },
  statCard: { background: '#fff', borderRadius: 10, padding: '20px 28px', boxShadow: '0 2px 10px rgba(0,0,0,.08)', textAlign: 'center', minWidth: 120 },
  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  chartBox: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.08)' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.08)' },
  roleBadge: { color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  actionBtn: { color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
};

export default AdminDashboard;
