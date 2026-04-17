import React from 'react';
import { useLang } from '../../context/LangContext';

const LangSwitcher = () => {
  const { lang, switchLang } = useLang();
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[['en', 'EN'], ['hi', 'हि'], ['pa', 'ਪੰ']].map(([code, label]) => (
        <button key={code} onClick={() => switchLang(code)} style={{
          padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          background: lang === code ? '#e94560' : '#2a2a4a', color: '#fff',
        }}>{label}</button>
      ))}
    </div>
  );
};

export default LangSwitcher;
