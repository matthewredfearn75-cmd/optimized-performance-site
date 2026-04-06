import { useState, useEffect } from 'react';

const LOTS_STORAGE_KEY = 'op_supply_lots';

function generateLotNumber(productId) {
  const prefix = productId.replace(/-/g, '').toUpperCase().slice(0, 4);
  const d = new Date();
  const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getFullYear()).slice(2)}`;
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${prefix}-${dateStr}-${seq}`;
}

export default function SupplyTab({ products }) {
  const [lots, setLots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm(products));

  useEffect(() => {
    const saved = localStorage.getItem(LOTS_STORAGE_KEY);
    if (saved) setLots(JSON.parse(saved));
  }, []);

  function emptyForm() {
    return {
      product: products[0]?.id || '',
      lotNumber: '',
      supplierLot: '',
      dateReceived: new Date().toISOString().split('T')[0],
      qtyVials: '',
      qtyRemaining: '',
      coaOnFile: false,
      notes: '',
    };
  }

  function saveLots(updated) {
    setLots(updated);
    if (updated.length > 0) localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(updated));
    else localStorage.removeItem(LOTS_STORAGE_KEY);
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const entry = {
      ...form,
      id: editingId || Date.now().toString(),
      qtyVials: parseInt(form.qtyVials) || 0,
      qtyRemaining: parseInt(form.qtyRemaining) || parseInt(form.qtyVials) || 0,
    };
    if (editingId) saveLots(lots.map((l) => (l.id === editingId ? entry : l)));
    else saveLots([entry, ...lots]);
    resetForm();
    setShowForm(false);
  }

  function handleEdit(lot) {
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
  }

  function handleDelete(id) {
    if (window.confirm('Delete this lot entry?')) saveLots(lots.filter((l) => l.id !== id));
  }

  function getName(id) {
    const p = products.find((p) => p.id === id);
    return p ? p.name : id;
  }

  const totalVials = lots.reduce((sum, l) => sum + (l.qtyRemaining || 0), 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={s.sectionTitle}>Lot Tracking</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9AAAB8', fontFamily: f }}>Track supplier lots, COAs, and vial inventory</p>
        </div>
        <button style={s.btn} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ New Lot'}
        </button>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard}><div style={s.statValue}>{lots.length}</div><div style={s.statLabel}>Total Lots</div></div>
        <div style={s.statCard}><div style={s.statValue}>{totalVials}</div><div style={s.statLabel}>Vials Remaining</div></div>
        <div style={s.statCard}><div style={s.statValue}>{lots.filter((l) => l.coaOnFile).length}</div><div style={s.statLabel}>COAs on File</div></div>
        <div style={s.statCard}><div style={s.statValue}>{new Set(lots.map((l) => l.product)).size}</div><div style={s.statLabel}>Products Tracked</div></div>
      </div>

      {showForm && (
        <div style={{ ...s.tableWrap, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0D1B2A', fontFamily: f }}>
            {editingId ? 'Edit Lot' : 'Add New Lot'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={s.label}>Product</label>
                <select style={s.input} value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  <option value="glp-3">GLP-3</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Your Lot #</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input style={{ ...s.input, flex: 1 }} value={form.lotNumber} onChange={(e) => setForm({ ...form, lotNumber: e.target.value })} placeholder="e.g. GLP3-040626-001" required />
                  <button type="button" style={s.autoBtn} onClick={() => setForm({ ...form, lotNumber: generateLotNumber(form.product) })}>Auto</button>
                </div>
              </div>
              <div>
                <label style={s.label}>Supplier Lot #</label>
                <input style={s.input} value={form.supplierLot} onChange={(e) => setForm({ ...form, supplierLot: e.target.value })} placeholder="From supplier COA" required />
              </div>
              <div>
                <label style={s.label}>Date Received</label>
                <input type="date" style={s.input} value={form.dateReceived} onChange={(e) => setForm({ ...form, dateReceived: e.target.value })} required />
              </div>
              <div>
                <label style={s.label}>Qty Vials (Total)</label>
                <input type="number" style={s.input} value={form.qtyVials} onChange={(e) => setForm({ ...form, qtyVials: e.target.value, qtyRemaining: form.qtyRemaining || e.target.value })} min="0" required />
              </div>
              <div>
                <label style={s.label}>Qty Remaining</label>
                <input type="number" style={s.input} value={form.qtyRemaining} onChange={(e) => setForm({ ...form, qtyRemaining: e.target.value })} min="0" required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                <label style={{ ...s.label, margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.coaOnFile} onChange={(e) => setForm({ ...form, coaOnFile: e.target.checked })} style={{ marginRight: 8 }} />
                  COA on File
                </label>
              </div>
              <div>
                <label style={s.label}>Notes</label>
                <input style={s.input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <button type="submit" style={s.btn}>{editingId ? 'Update Lot' : 'Add Lot'}</button>
          </form>
        </div>
      )}

      <div style={s.tableWrap}>
        {lots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: 15, color: '#5A7D9A', margin: 0 }}>No lots tracked yet</p>
            <p style={{ fontSize: 12, color: '#9AAAB8', marginTop: 4 }}>Click "+ New Lot" to add your first supply entry</p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Product</th>
                <th style={s.th}>Your Lot #</th>
                <th style={s.th}>Supplier Lot</th>
                <th style={s.th}>Received</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Total</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Remaining</th>
                <th style={{ ...s.th, textAlign: 'center' }}>COA</th>
                <th style={s.th}>Notes</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, i) => {
                const low = lot.qtyRemaining <= Math.ceil(lot.qtyVials * 0.2);
                return (
                  <tr key={lot.id} style={{ ...s.tr, backgroundColor: i % 2 === 0 ? '#fff' : '#F9FBFC' }}>
                    <td style={s.td}><span style={s.chip}>{getName(lot.product)}</span></td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{lot.lotNumber}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12, color: '#5A7D9A' }}>{lot.supplierLot}</td>
                    <td style={s.td}>{lot.dateReceived}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{lot.qtyVials}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.badge, backgroundColor: low ? '#fef3c7' : '#dcfce7', color: low ? '#d97706' : '#16a34a' }}>{lot.qtyRemaining}</span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ color: lot.coaOnFile ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{lot.coaOnFile ? 'Yes' : 'No'}</span>
                    </td>
                    <td style={{ ...s.td, color: '#6B7B8D', fontSize: 12 }}>{lot.notes || '-'}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={s.actionBtn} onClick={() => handleEdit(lot)}>Edit</button>
                        <button style={{ ...s.actionBtn, color: '#dc2626' }} onClick={() => handleDelete(lot.id)}>Del</button>
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
  );
}

const f = "'Helvetica Neue', Arial, sans-serif";
const s = {
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#0D1B2A', fontFamily: f },
  btn: { padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#00B4D8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: f },
  autoBtn: { padding: '6px 10px', borderRadius: 6, border: '1px solid #E4EDF3', backgroundColor: '#fff', color: '#0D1B2A', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: f },
  statsRow: { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 },
  statCard: { flex: '1 1 140px', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', padding: '18px 20px' },
  statValue: { fontSize: 26, fontWeight: 700, color: '#0D1B2A', fontFamily: f },
  statLabel: { fontSize: 12, color: '#9AAAB8', marginTop: 2, fontFamily: f, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#9AAAB8', marginBottom: 4, fontFamily: f, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E4EDF3', fontSize: 13, fontFamily: f, color: '#0D1B2A', outline: 'none', boxSizing: 'border-box' },
  tableWrap: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#F4F9FC' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9AAAB8', fontFamily: f, letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #E4EDF3' },
  tr: { borderBottom: '1px solid #F0F4F8' },
  td: { padding: '14px 16px', fontSize: 13, color: '#0D1B2A', fontFamily: f, verticalAlign: 'middle' },
  chip: { fontSize: 11, fontWeight: 600, color: '#5A7D9A', background: '#EBF4FA', borderRadius: 20, padding: '2px 8px', fontFamily: f },
  badge: { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', fontFamily: f },
  actionBtn: { background: 'none', border: '1px solid #E4EDF3', borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#0077B6', fontFamily: f, fontWeight: 500 },
};
