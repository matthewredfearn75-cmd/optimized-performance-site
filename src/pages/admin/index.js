import { useState, useEffect } from 'react';
import products from '../../data/products';
import InventoryTab from './InventoryTab';
import SupplyTab from './SupplyTab';
import OrdersTab from './OrdersTab';
import AffiliatesTab from './AffiliatesTab';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('op_admin') === '1') setAuthed(true);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.status === 401) {
      setAuthError('Incorrect password.');
    } else if (!res.ok) {
      setAuthError('Server error. Check ADMIN_PASSWORD env var.');
    } else {
      const { token } = await res.json();
      sessionStorage.setItem('op_admin', '1');
      sessionStorage.setItem('op_admin_token', token);
      setAuthed(true);
      setAuthError('');
    }
  }

  function logout() {
    sessionStorage.removeItem('op_admin');
    sessionStorage.removeItem('op_admin_token');
    localStorage.removeItem('op_orders');
    localStorage.removeItem('op_supply_lots');
    localStorage.removeItem('op_affiliates');
    setAuthed(false);
  }

  function showSaveMsg(msg) {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  if (!authed) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <div style={styles.loginLogo}>OP</div>
          <h2 style={styles.loginTitle}>Admin Access</h2>
          <p style={styles.loginSub}>Optimized Performance Inc.</p>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.loginInput}
              autoFocus
            />
            {authError && <p style={styles.authError}>{authError}</p>}
            <button type="submit" style={styles.loginBtn}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'orders', label: 'Orders' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'supply', label: 'Supply Tracker' },
    { id: 'affiliates', label: 'Affiliates' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSub}>Optimized Performance Inc.</p>
          </div>
          <div style={styles.headerActions}>
            {saveMsg && (
              <span style={{ ...styles.saveMsg, color: saveMsg.includes('failed') ? '#ef4444' : '#22c55e' }}>
                {saveMsg}
              </span>
            )}
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.tabRow}>
          {tabs.map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && <OrdersTab products={products} showSaveMsg={showSaveMsg} />}
        {activeTab === 'inventory' && <InventoryTab products={products} showSaveMsg={showSaveMsg} />}
        {activeTab === 'supply' && <SupplyTab products={products} />}
        {activeTab === 'affiliates' && <AffiliatesTab showSaveMsg={showSaveMsg} />}
      </div>
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: '100vh',
    backgroundColor: '#0D1B2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  loginLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0D1B2A',
    color: '#00B4D8',
    fontSize: 20,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  loginTitle: {
    margin: '0 0 4px',
    fontSize: 22,
    fontWeight: 700,
    color: '#0D1B2A',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  loginSub: {
    margin: '0 0 28px',
    fontSize: 13,
    color: '#9AAAB8',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  loginForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  loginInput: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #E4EDF3',
    fontSize: 14,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    outline: 'none',
  },
  authError: { margin: 0, color: '#ef4444', fontSize: 13, fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  loginBtn: {
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#00B4D8',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  page: { minHeight: '100vh', backgroundColor: '#F7FAFB' },
  header: { backgroundColor: '#0D1B2A', padding: '0 24px' },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  headerSub: { margin: '2px 0 0', fontSize: 12, color: '#7BA3C4', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  saveMsg: { fontSize: 13, fontWeight: 600, fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  logoutBtn: {
    padding: '9px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  content: { maxWidth: 1200, margin: '0 auto', padding: '28px 24px' },
  tabRow: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
    borderBottom: '2px solid #E4EDF3',
  },
  tab: {
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: '#9AAAB8',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    cursor: 'pointer',
    letterSpacing: 0.3,
  },
  tabActive: {
    color: '#00B4D8',
    borderBottomColor: '#00B4D8',
  },
};
