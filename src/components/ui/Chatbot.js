import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import api from '../../services/api';

const Chatbot = () => {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am NagarBot Assistant. How can I help you with civic issues today? 🏙️' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input };
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: input, history });
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, unable to respond right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} style={styles.fab}>💬</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={styles.window}>
            <div style={styles.header}>
              <span>🤖 {t('chatTitle')}</span>
              <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.botBubble) }}>
                  {m.text}
                </div>
              ))}
              {loading && <div style={{ ...styles.bubble, ...styles.botBubble, color: '#aaa' }}>Typing...</div>}
              <div ref={bottomRef} />
            </div>
            <div style={styles.inputRow}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t('chatPlaceholder')}
                style={styles.input}
              />
              <button onClick={send} disabled={loading} style={styles.sendBtn}>{t('send')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  fab: { position: 'fixed', bottom: 28, right: 28, width: 56, height: 56, borderRadius: '50%', background: '#e94560', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 16px rgba(233,69,96,.5)', zIndex: 1000 },
  window: { position: 'fixed', bottom: 96, right: 28, width: 340, height: 460, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' },
  header: { background: '#1a1a2e', color: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 },
  closeBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 },
  messages: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  bubble: { maxWidth: '80%', padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  botBubble: { background: '#f0f2f5', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { background: '#e94560', color: '#fff', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  inputRow: { display: 'flex', borderTop: '1px solid #eee', padding: 8, gap: 8 },
  input: { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' },
  sendBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};

export default Chatbot;
