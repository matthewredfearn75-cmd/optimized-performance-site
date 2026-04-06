import { useState, useEffect } from 'react';
import products from '../../data/products';

const LOW_STOCK_THRESHOLD = 20;
const LOTS_STORAGE_KEY = 'op_supply_lots';

function generateLotNumber(productId) {
  const prefix = productId.replace(/-/g, '').toUpperCase().slice(0, 4);
  const date = new Date();
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getFullYear()).slice(2)}`;
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${prefix}-${dateStr}-${seq}`;
}

export default function AdminInventory() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [inventory, setInventory] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [lots, setLots] = useState([]);
  const [showLotForm, setShowLotForm] = useState(false);
  const [editingLotId, setEditingLotId] = useState(null);
  const [lotForm, setLotForm] = useState({
    product: products[0]?.id || '',
    lotNumber: '',
    supplierLot: '',
    dateReceived: new Date().toISOString().split('T')[0],
    qtyVials: '',
    qtyRemaining: '',
    coaOnFile: false,
    notes: '',
  });

  useEffect(() => {
    if (sessionStorage.getItem('op_admin') === '1') setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) {
      fetchInventory();
      const savedLots = localStorage.getItem(LOTS_STORAGE_KEY);
      if (savedLots) setLots(JSON.parse(savedLots));
    }
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

  // Supply tracker helpers
  function saveLots(updated) {
    setLots(updated);
    if (updated.length > 0) {
      localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(updated));
    } else {
      localStorage.removeItem(LOTS_STORAGE_KEY);
    }
  }

  function resetLotForm() {
    setLotForm({
      product: products[0]?.id || '',
      lotNumber: '',
      supplierLot: '',
      dateReceived: new Date().toISOString().split('T')[0],
      qtyVials: '',
      qtyRemaining: '',
      coaOnFile: false,
      notes: '',
    });
    setEditingLotId(null);
  }

  function handleLotSubmit(e) {
    e.preventDefault();
    const entry = {
      ...lotForm,
      id: editingLotId || Date.now().toString(),
      qtyVials: parseInt(lotForm.qtyVials) || 0,
      qtyRemaining: parseInt(lotForm.qtyRemaining) || parseInt(lotForm.qtyVials) || 0,
    };
    if (editingLotId) {
      saveLots(lots.map((l) => (l.id === editingLotId ? entry : l)));
    } else {
      saveLots([entry, ...lots]);
    }
    resetLotForm();
    setShowLotForm(false);
  }

  function handleLotEdit(lot) {
    setLotForm({
      product: lot.product,
      lotNumber: lot.lotNumber,
      supplierLot: lot.supplierLot,
      dateReceived: lot.dateReceived,
      qtyVials: String(lot.qtyVials),
      qtyRemaining: String(lot.qtyRemaining),
      coaOnFile: lot.coaOnFile,
      notes: lot.notes,
    });
    setEditingLotId(lot.id);
    setShowLotForm(true);
  }

  function handleLotDelete(id) {
    if (window.confirm('Delete this lot entry?')) {
      saveLots(lots.filter((l) => l.id !== id));
    }
  }

  function getProductName(id) {
    const p = products.find((p) => p.id === id);
    return p ? p.name : id;
  }

  const totalLotVials = lots.reduce((sum, l) => sum + (l.qtyRemaining || 0), 0);

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
        {/* Tab navigation */}
        <div style={styles.tabRow}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'inventory' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'supply' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('supply')}
          >
            Supply Tracker
          </button>
        </div>

        {activeTab === 'supply' && (
          <>
            {/* Supply tracker header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>Lot Tracking</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9AAAB8', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>Track supplier lots, COAs, and vial inventory</p>
              </div>
              <button
                style={styles.saveBtn}
                onClick={() => { resetLotForm(); setShowLotForm(!showLotForm); }}
              >
                {showLotForm ? 'Cancel' : '+ New Lot'}
              </button>
            </div>

            {/* Supply stats */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{lots.length}</div>
                <div style={styles.statLabel}>Total Lots</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{totalLotVials}</div>
                <div style={styles.statLabel}>Vials Remaining</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{lots.filter((l) => l.coaOnFile).length}</div>
                <div style={styles.statLabel}>COAs on File</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{new Set(lots.map((l) => l.product)).size}</div>
                <div style={styles.statLabel}>Products Tracked</div>
              </div>
            </div>

            {/* Lot form */}
            {showLotForm && (
              <div style={{ ...styles.tableWrap, padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                  {editingLotId ? 'Edit Lot' : 'Add New Lot'}
                </h3>
                <form onSubmit={handleLotSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
                    <div>
                      <label style={styles.lotLabel}>Product</label>
                      <select style={styles.lotInput} value={lotForm.product} onChange={(e) => setLotForm({ ...lotForm, product: e.target.value })}>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        <option value="glp-3">GLP-3</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.lotLabel}>Your Lot #</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...styles.lotInput, flex: 1 }} value={lotForm.lotNumber} onChange={(e) => setLotForm({ ...lotForm, lotNumber: e.target.value })} placeholder="e.g. GLP3-040626-001" required />
                        <button type="button" style={{ ...styles.logoutBtn, color: '#0D1B2A', borderColor: '#E4EDF3', fontSize: 11, padding: '6px 10px' }} onClick={() => setLotForm({ ...lotForm, lotNumber: generateLotNumber(lotForm.product) })}>Auto</button>
                      </div>
                    </div>
                    <div>
                      <label style={styles.lotLabel}>Supplier Lot #</label>
                      <input style={styles.lotInput} value={lotForm.supplierLot} onChange={(e) => setLotForm({ ...lotForm, supplierLot: e.target.value })} placeholder="From supplier COA" required />
                    </div>
                    <div>
                      <label style={styles.lotLabel}>Date Received</label>
                      <input type="date" style={styles.lotInput} value={lotForm.dateReceived} onChange={(e) => setLotForm({ ...lotForm, dateReceived: e.target.value })} required />
                    </div>
                    <div>
                      <label style={styles.lotLabel}>Qty Vials (Total)</label>
                      <input type="number" style={styles.lotInput} value={lotForm.qtyVials} onChange={(e) => setLotForm({ ...lotForm, qtyVials: e.target.value, qtyRemaining: lotForm.qtyRemaining || e.target.value })} min="0" required />
                    </div>
                    <div>
                      <label style={styles.lotLabel}>Qty Remaining</label>
                      <input type="number" style={styles.lotInput} value={lotForm.qtyRemaining} onChange={(e) => setLotForm({ ...lotForm, qtyRemaining: e.target.value })} min="0" required />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                      <label style={{ ...styles.lotLabel, margin: 0, cursor: 'pointer' }}>
                        <input type="checkbox" checked={lotForm.coaOnFile} onChange={(e) => setLotForm({ ...lotForm, coaOnFile: e.target.checked })} style={{ marginRight: 8 }} />
                        COA on File
                      </label>
                    </div>
                    <div>
                      <label style={styles.lotLabel}>Notes</label>
                      <input style={styles.lotInput} value={lotForm.notes} onChange={(e) => setLotForm({ ...lotForm, notes: e.target.value })} placeholder="Optional" />
                    </div>
                  </div>
                  <button type="submit" style={styles.saveBtn}>{editingLotId ? 'Update Lot' : 'Add Lot'}</button>
                </form>
              </div>
            )}

            {/* Lot table */}
            <div style={styles.tableWrap}>
              {lots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ fontSize: 15, color: '#5A7D9A', margin: 0 }}>No lots tracked yet</p>
                  <p style={{ fontSize: 12, color: '#9AAAB8', marginTop: 4 }}>Click "+ New Lot" to add your first supply entry</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>Your Lot #</th>
                      <th style={styles.th}>Supplier Lot</th>
                      <th style={styles.th}>Received</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Total</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Remaining</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>COA</th>
                      <th style={styles.th}>Notes</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot, i) => {
                      const lowStock = lot.qtyRemaining <= Math.ceil(lot.qtyVials * 0.2);
                      return (
                        <tr key={lot.id} style={{ ...styles.tr, backgroundColor: i % 2 === 0 ? '#fff' : '#F9FBFC' }}>
                          <td style={styles.td}>
                            <span style={styles.categoryChip}>{getProductName(lot.product)}</span>
                          </td>
                          <td style={{ ...styles.td, ...styles.mono, fontWeight: 600 }}>{lot.lotNumber}</td>
                          <td style={{ ...styles.td, ...styles.mono }}>{lot.supplierLot}</td>
                          <td style={styles.td}>{lot.dateReceived}</td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>{lot.qtyVials}</td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: lowStock ? '#fef3c7' : '#dcfce7',
                              color: lowStock ? '#d97706' : '#16a34a',
                            }}>
                              {lot.qtyRemaining}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={{ color: lot.coaOnFile ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                              {lot.coaOnFile ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: '#6B7B8D', fontSize: 12 }}>{lot.notes || '-'}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={{ ...styles.lotActionBtn }} onClick={() => handleLotEdit(lot)}>Edit</button>
                              <button style={{ ...styles.lotActionBtn, color: '#dc2626' }} onClick={() => handleLotDelete(lot.id)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'inventory' && (<>
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
        </>)}
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
  lotLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#9AAAB8',
    marginBottom: 4,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  lotInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #E4EDF3',
    fontSize: 13,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: '#0D1B2A',
    outline: 'none',
    boxSizing: 'border-box',
  },
  lotActionBtn: {
    background: 'none',
    border: '1px solid #E4EDF3',
    borderRadius: 5,
    padding: '4px 10px',
    fontSize: 11,
    cursor: 'pointer',
    color: '#0077B6',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: 500,
  },
};
