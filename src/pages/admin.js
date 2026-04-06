import { useState, useEffect } from 'react';
import products from '../data/products';

const STORAGE_KEY = 'op_supply_lots';

function generateLotNumber(productId) {
  const prefix = productId.replace(/-/g, '').toUpperCase().slice(0, 4);
  const date = new Date();
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getFullYear()).slice(2)}`;
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${prefix}-${dateStr}-${seq}`;
}

export default function Admin() {
  const [lots, setLots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLots(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (lots.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lots));
    }
  }, [lots]);

  const resetForm = () => {
    setForm({
      product: products[0]?.id || '',
      lotNumber: '',
      supplierLot: '',
      dateReceived: new Date().toISOString().split('T')[0],
      qtyVials: '',
      qtyRemaining: '',
      coaOnFile: false,
      notes: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const entry = {
      ...form,
      id: editingId || Date.now().toString(),
      qtyVials: parseInt(form.qtyVials) || 0,
      qtyRemaining: parseInt(form.qtyRemaining) || parseInt(form.qtyVials) || 0,
    };

    if (editingId) {
      setLots(lots.map((l) => (l.id === editingId ? entry : l)));
    } else {
      setLots([entry, ...lots]);
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (lot) => {
    setForm({
      product: lot.product,
      lotNumber: lot.lotNumber,
      supplierLot: lot.supplierLot,
      dateReceived: lot.dateReceived,
      qtyVials: String(lot.qtyVials),
      qtyRemaining: String(lot.qtyRemaining),
      coaOnFile: lot.coaOnFile,
      notes: lot.notes,
    });
    setEditingId(lot.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this lot entry?')) {
      const updated = lots.filter((l) => l.id !== id);
      setLots(updated);
      if (updated.length === 0) localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getProductName = (id) => {
    const p = products.find((p) => p.id === id);
    return p ? p.name : id;
  };

  const totalVials = lots.reduce((sum, l) => sum + (l.qtyRemaining || 0), 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Supply Tracker</h1>
            <p style={styles.subtitle}>Lot management & inventory</p>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm ? 'Cancel' : '+ New Lot'}
          </button>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{lots.length}</div>
            <div style={styles.statLabel}>Total Lots</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalVials}</div>
            <div style={styles.statLabel}>Vials Remaining</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{lots.filter((l) => l.coaOnFile).length}</div>
            <div style={styles.statLabel}>COAs on File</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {new Set(lots.map((l) => l.product)).size}
            </div>
            <div style={styles.statLabel}>Products Tracked</div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>{editingId ? 'Edit Lot' : 'Add New Lot'}</h3>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Product</label>
                <select
                  style={styles.input}
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="glp-3">GLP-3</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Your Lot #</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={form.lotNumber}
                    onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                    placeholder="e.g. GLP3-040626-001"
                    required
                  />
                  <button
                    type="button"
                    style={styles.genBtn}
                    onClick={() => setForm({ ...form, lotNumber: generateLotNumber(form.product) })}
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Supplier Lot #</label>
                <input
                  style={styles.input}
                  value={form.supplierLot}
                  onChange={(e) => setForm({ ...form, supplierLot: e.target.value })}
                  placeholder="From supplier COA"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Date Received</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.dateReceived}
                  onChange={(e) => setForm({ ...form, dateReceived: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Qty Vials (Total)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={form.qtyVials}
                  onChange={(e) => setForm({ ...form, qtyVials: e.target.value, qtyRemaining: form.qtyRemaining || e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Qty Remaining</label>
                <input
                  type="number"
                  style={styles.input}
                  value={form.qtyRemaining}
                  onChange={(e) => setForm({ ...form, qtyRemaining: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={form.coaOnFile}
                    onChange={(e) => setForm({ ...form, coaOnFile: e.target.checked })}
                    style={{ marginRight: 8 }}
                  />
                  COA on File
                </label>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Notes</label>
                <input
                  style={styles.input}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn}>
              {editingId ? 'Update Lot' : 'Add Lot'}
            </button>
          </form>
        )}

        {/* Table */}
        <div style={styles.tableWrap}>
          {lots.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 16, color: '#5A7D9A' }}>No lots tracked yet</p>
              <p style={{ fontSize: 13, color: '#8A9BAD', marginTop: 4 }}>Click "+ New Lot" to add your first supply entry</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Your Lot #</th>
                  <th style={styles.th}>Supplier Lot</th>
                  <th style={styles.th}>Received</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Remaining</th>
                  <th style={styles.th}>COA</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const lowStock = lot.qtyRemaining <= Math.ceil(lot.qtyVials * 0.2);
                  return (
                    <tr key={lot.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.productBadge}>{getProductName(lot.product)}</span>
                      </td>
                      <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: 600 }}>{lot.lotNumber}</td>
                      <td style={{ ...styles.td, fontFamily: 'monospace', color: '#5A7D9A' }}>{lot.supplierLot}</td>
                      <td style={styles.td}>{lot.dateReceived}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{lot.qtyVials}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          ...styles.qtyBadge,
                          backgroundColor: lowStock ? '#FFF3E0' : '#E8F5E9',
                          color: lowStock ? '#E65100' : '#2E7D32',
                        }}>
                          {lot.qtyRemaining}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {lot.coaOnFile ? (
                          <span style={{ color: '#2E7D32' }}>Yes</span>
                        ) : (
                          <span style={{ color: '#C62828' }}>No</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, color: '#6B7B8D', fontSize: 12 }}>{lot.notes || '-'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={styles.actionBtn} onClick={() => handleEdit(lot)}>Edit</button>
                          <button style={{ ...styles.actionBtn, color: '#C62828' }} onClick={() => handleDelete(lot.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px 24px',
    minHeight: '80vh',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0D1B2A',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#5A7D9A',
    margin: '4px 0 0',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  addBtn: {
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: 0.5,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: '20px 16px',
    textAlign: 'center',
    border: '1px solid #E8F0F6',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0D1B2A',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  statLabel: {
    fontSize: 12,
    color: '#5A7D9A',
    marginTop: 4,
    letterSpacing: 0.5,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    border: '1px solid #E8F0F6',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#0D1B2A',
    marginTop: 0,
    marginBottom: 16,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#5A7D9A',
    letterSpacing: 0.5,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  input: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #D0D9E2',
    fontSize: 14,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: '#0D1B2A',
    outline: 'none',
  },
  genBtn: {
    backgroundColor: '#0D1B2A',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    whiteSpace: 'nowrap',
  },
  submitBtn: {
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  tableWrap: {
    backgroundColor: '#fff',
    borderRadius: 10,
    border: '1px solid #E8F0F6',
    overflowX: 'auto',
  },
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: 11,
    fontWeight: 700,
    color: '#5A7D9A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderBottom: '2px solid #E8F0F6',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #F0F4F8',
  },
  td: {
    padding: '12px 14px',
    color: '#0D1B2A',
    whiteSpace: 'nowrap',
  },
  productBadge: {
    backgroundColor: '#E8F4F8',
    color: '#0077B6',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  qtyBadge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },
  actionBtn: {
    background: 'none',
    border: '1px solid #E8F0F6',
    borderRadius: 5,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    color: '#0077B6',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: 500,
  },
};
