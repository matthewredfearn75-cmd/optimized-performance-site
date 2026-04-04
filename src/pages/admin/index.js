import { useState, useEffect } from 'react';
import products from '../../data/products';

const LOW_STOCK_THRESHOLD = 20;

export default function AdminInventory() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [inventory, setInventory] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('op_admin') === '1') setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) fetchInventory();
  }, [authed]);

  async function fetchInventory() {
    const res = await fetch('/api/inventory');
    const data = await res.json();
    setInventory(data);
    setEdits(data);
  }

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, updates: {} }),
    });
    if (res.status === 401) {
      setAuthError('Incorrect password.');
    } else {
      sessionStorage.setItem('op_admin', '1');
      setAuthed(true);
      setAuthError('');
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    const res = await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sessionStorage.getItem('op_admin_pw') || password, updates: edits }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInventory(updated);
      setEdits(updated);
      setSaveMsg('Saved successfully.');
    } else {
      setSaveMsg('Save failed. Please try again.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleEdit(id, val) {
    setEdits((prev) => ({ ...prev, [id]: Math.max(0, Number(val) || 0) }));
  }

  function logout() {
    sessionStorage.removeItem('op_admin');
    setAuthed(false);
  }

  const totalUnits = Object.values(edits).reduce((a, b) => a + b, 0);
  const totalValue = products.reduce((sum, p) => sum + (edits[p.id] ?? p.stock) * p.price, 0);
  const lowStockItems = products.filter((p) => (edits[p.id] ?? p.stock) > 0 && (edits[p.id] ?? p.stock) <= LOW_STOCK_THRESHOLD);
  const outOfStockItems = products.filter((p) => (edits[p.id] ?? p.stock) === 0);

  if (!authed) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <div style={styles.loginLogo}>OP</div>
          <h2 style={styles.loginTitle}>Admin Access</h2>
          <p style={styles.loginSub}>Optimized Performance Inventory</p>
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

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.headerTitle}>Inventory Management</h1>
            <p style={styles.headerSub}>Optimized Performance Inc.</p>
          </div>
          <div style={styles.headerActions}>
            {saveMsg && (
              <span style={{ ...styles.saveMsg, color: saveMsg.includes('failed') ? '#ef4444' : '#22c55e' }}>
                {saveMsg}
              </span>
            )}
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{products.length}</div>
            <div style={styles.statLabel}>Total SKUs</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalUnits}</div>
            <div style={styles.statLabel}>Units in Stock</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={styles.statLabel}>Inventory Value</div>
          </div>
          <div style={{ ...styles.statCard, borderColor: lowStockItems.length > 0 ? '#f59e0b' : '#E4EDF3' }}>
            <div style={{ ...styles.statValue, color: lowStockItems.length > 0 ? '#f59e0b' : '#0D1B2A' }}>
              {lowStockItems.length}
            </div>
            <div style={styles.statLabel}>Low Stock</div>
          </div>
          <div style={{ ...styles.statCard, borderColor: outOfStockItems.length > 0 ? '#ef4444' : '#E4EDF3' }}>
            <div style={{ ...styles.statValue, color: outOfStockItems.length > 0 ? '#ef4444' : '#0D1B2A' }}>
              {outOfStockItems.length}
            </div>
            <div style={styles.statLabel}>Out of Stock</div>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div style={styles.alertsRow}>
            {outOfStockItems.map((p) => (
              <div key={p.id} style={{ ...styles.alert, ...styles.alertRed }}>
                <strong>OUT OF STOCK:</strong> {p.name} {p.dosage}
              </div>
            ))}
            {lowStockItems.map((p) => (
              <div key={p.id} style={{ ...styles.alert, ...styles.alertYellow }}>
                <strong>LOW STOCK:</strong> {p.name} {p.dosage} — {edits[p.id]} units remaining
              </div>
            ))}
          </div>
        )}

        {/* Inventory table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Stock Qty</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const qty = edits[p.id] ?? p.stock;
                const status = qty === 0 ? 'out' : qty <= LOW_STOCK_THRESHOLD ? 'low' : 'in';
                return (
                  <tr key={p.id} style={{ ...styles.tr, backgroundColor: i % 2 === 0 ? '#fff' : '#F9FBFC' }}>
                    <td style={styles.td}>
                      <div style={styles.productName}>{p.name}</div>
                      <div style={styles.productDosage}>{p.dosage}</div>
                    </td>
                    <td style={{ ...styles.td, ...styles.mono }}>{p.sku}</td>
                    <td style={styles.td}>
                      <span style={styles.categoryChip}>{p.category}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => handleEdit(p.id, e.target.value)}
                        style={styles.qtyInput}
                      />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: status === 'out' ? '#fee2e2' : status === 'low' ? '#fef3c7' : '#dcfce7',
                        color: status === 'out' ? '#dc2626' : status === 'low' ? '#d97706' : '#16a34a',
                      }}>
                        {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>
                      ${(qty * p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={styles.tfootRow}>
                <td colSpan={4} style={{ ...styles.td, fontWeight: 700 }}>TOTALS</td>
                <td style={{ ...styles.td, textAlign: 'center', fontWeight: 700 }}>{totalUnits} units</td>
                <td style={styles.td} />
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p style={styles.note}>
          Changes are saved to persistent storage (Upstash Redis). Set <code>ADMIN_PASSWORD</code> in Vercel environment variables to change the login password.
        </p>
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
  saveBtn: {
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#00B4D8',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
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
  statsRow: { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 },
  statCard: {
    flex: '1 1 140px',
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #E4EDF3',
    padding: '18px 20px',
  },
  statValue: { fontSize: 26, fontWeight: 700, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  statLabel: { fontSize: 12, color: '#9AAAB8', marginTop: 2, fontFamily: "'Helvetica Neue', Arial, sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 },
  alertsRow: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  alert: { padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  alertRed: { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' },
  alertYellow: { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
  tableWrap: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#F4F9FC' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: '#9AAAB8',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderBottom: '1px solid #E4EDF3',
  },
  tr: { borderBottom: '1px solid #F0F4F8' },
  td: { padding: '14px 16px', fontSize: 13, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif", verticalAlign: 'middle' },
  productName: { fontWeight: 600 },
  productDosage: { fontSize: 11, color: '#9AAAB8', marginTop: 2 },
  mono: { fontFamily: 'monospace', fontSize: 12, color: '#5A7D9A' },
  categoryChip: {
    fontSize: 11,
    fontWeight: 600,
    color: '#5A7D9A',
    background: '#EBF4FA',
    borderRadius: 20,
    padding: '2px 8px',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  qtyInput: {
    width: 72,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #E4EDF3',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    outline: 'none',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 20,
    padding: '3px 10px',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  tfootRow: { backgroundColor: '#F4F9FC', borderTop: '2px solid #E4EDF3' },
  note: { marginTop: 16, fontSize: 12, color: '#9AAAB8', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
};
