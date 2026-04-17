import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import LangSwitcher from './LangSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🏙️ {t('appName')}</Link>
      <div style={styles.links}>
        <Link to="/leaderboard" style={styles.link}>🏆 {t('leaderboard')}</Link>
        {user ? (
          <>
            {user.role === 'citizen' && <Link to="/report" style={styles.link}>{t('reportIssue')}</Link>}
            {user.role === 'citizen' && <Link to="/map" style={styles.link}>{t('cityMap')}</Link>}
            {user.role === 'citizen' && <Link to="/my-issues" style={styles.link}>{t('myIssues')}</Link>}
            {user.role === 'officer' && <Link to="/officer" style={styles.link}>{t('myCases')}</Link>}
            {(user.role === 'officer' || user.role === 'admin') && <Link to="/map" style={styles.link}>{t('cityMap')}</Link>}
            {user.role === 'admin' && <Link to="/admin" style={styles.link}>{t('dashboard')}</Link>}
            <button onClick={handleLogout} style={styles.btn}>{t('logout')}</button>
            <Link to="/profile" style={styles.avatarLink}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" style={styles.navAvatar} />
                : <div style={styles.navAvatarFallback}>{user?.name?.charAt(0).toUpperCase()}</div>
              }
            </Link>
          </>
        ) : (
          <>
            <Link to="/map" style={styles.link}>{t('cityMap')}</Link>
            <Link to="/login" style={styles.link}>{t('login')}</Link>
            <Link to="/register" style={styles.link}>{t('register')}</Link>
          </>
        )}
        <LangSwitcher />
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#1a1a2e', color: '#fff', flexWrap: 'wrap', gap: 8 },
  brand: { color: '#e94560', fontWeight: 700, fontSize: 20, textDecoration: 'none' },
  links: { display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' },
  link: { color: '#ccc', textDecoration: 'none', fontSize: 14 },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  avatarLink: { textDecoration: 'none' },
  navAvatar: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e94560', verticalAlign: 'middle' },
  navAvatarFallback: { width: 32, height: 32, borderRadius: '50%', background: '#e94560', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
};

export default Navbar;
