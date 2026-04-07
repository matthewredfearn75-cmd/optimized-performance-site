import { useState, useEffect } from 'react';

const LOW_STOCK_THRESHOLD = 20;

export default function InventoryTab({ products, showSaveMsg }) {
  const [inventory, setInventory] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const token = sessionStorage.getItem('op_admin_token') || '';
      const res = await fetch('/api/inventory', {
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      setInventory(data);
      setEdits(data);
    } catch {
      // fallback to empty
    }
  }

  async function handleSave() {
    setSaving(true);
    const token = sessionStorage.getItem('op_admin_token') || '';
    const res = await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, updates: edits }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInventory(updated);
      setEdits(updated);
      showSaveMsg('Inventory saved.');
    } else {
      showSaveMsg('Save failed. Please try again.');
    }
    setSaving(false);
  }

  function handleEdit(id, val) {
    setEdits((prev) => ({ ...prev, [id]: Math.max(0, Number(val) || 0) }));
  }

  const totalUnits = Object.values(edits).reduce((a, b) => a + b, 0);
  const totalValue = products.reduce((sum, p) => sum + (edits[p.id] ?? p.stock ?? 0) * p.price, 0);
  const lowStockItems = products.filter((p) => (edits[p.id] ?? p.stock ?? 0) > 0 && (edits[p.id] ?? p.stock ?? 0) <= LOW_STOCK_THRESHOLD);
  const outOfStockItems = products.filter((p) => (edits[p.id] ?? p.stock ?? 0) === 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={s.sectionTitle}>Inventory</h2>
        <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={s.statValue}>{products.length}</div>
          <div style={s.statLabel}>Total SKUs</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{totalUnits}</div>
          <div style={s.statLabel}>Units in Stock</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={s.statLabel}>Inventory Value</div>
        </div>
        <div style={{ ...s.statCard, borderColor: lowStockItems.length > 0 ? '#f59e0b' : '#E4EDF3' }}>
          <div style={{ ...s.statValue, color: lowStockItems.length > 0 ? '#f59e0b' : '#0D1B2A' }}>{lowStockItems.length}</div>
          <div style={s.statLabel}>Low Stock</div>
        </div>
        <div style={{ ...s.statCard, borderColor: outOfStockItems.length > 0 ? '#ef4444' : '#E4EDF3' }}>
          <div style={{ ...s.statValue, color: outOfStockItems.length > 0 ? '#ef4444' : '#0D1B2A' }}>{outOfStockItems.length}</div>
          <div style={s.statLabel}>Out of Stock</div>
        </div>
      </div>

      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div style={s.alertsRow}>
          {outOfStockItems.map((p) => (
            <div key={p.id} style={{ ...s.alert, backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
              <strong>OUT OF STOCK:</strong> {p.name} {p.dosage}
            </div>
          ))}
          {lowStockItems.map((p) => (
            <div key={p.id} style={{ ...s.alert, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
              <strong>LOW STOCK:</strong> {p.name} {p.dosage} — {edits[p.id]} units remaining
            </div>
          ))}
        </div>
      )}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Product</th>
              <th style={s.th}>SKU</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Price</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Stock Qty</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const qty = edits[p.id] ?? p.stock ?? 0;
              const status = qty === 0 ? 'out' : qty <= LOW_STOCK_THRESHOLD ? 'low' : 'in';
              return (
                <tr key={p.id} style={{ ...s.tr, backgroundColor: i % 2 === 0 ? '#fff' : '#F9FBFC' }}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#9AAAB8', marginTop: 2 }}>{p.dosage}</div>
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12, color: '#5A7D9A' }}>{p.sku}</td>
                  <td style={s.td}><span style={s.chip}>{p.category}</span></td>
                  <td style={{ ...s.td, fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <input type="number" min="0" value={qty} onChange={(e) => handleEdit(p.id, e.target.value)} style={s.qtyInput} />
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={{
                      ...s.badge,
                      backgroundColor: status === 'out' ? '#fee2e2' : status === 'low' ? '#fef3c7' : '#dcfce7',
                      color: status === 'out' ? '#dc2626' : status === 'low' ? '#d97706' : '#16a34a',
                    }}>
                      {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>
                    ${(qty * p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#F4F9FC', borderTop: '2px solid #E4EDF3' }}>
              <td colSpan={4} style={{ ...s.td, fontWeight: 700 }}>TOTALS</td>
              <td style={{ ...s.td, textAlign: 'center', fontWeight: 700 }}>{totalUnits} units</td>
              <td style={s.td} />
              <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

const f = "'Helvetica Neue', Arial, sans-serif";
const s = {
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#0D1B2A', fontFamily: f },
  saveBtn: { padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#00B4D8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: f },
  statsRow: { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 },
  statCard: { flex: '1 1 140px', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', padding: '18px 20px' },
  statValue: { fontSize: 26, fontWeight: 700, color: '#0D1B2A', fontFamily: f },
  statLabel: { fontSize: 12, color: '#9AAAB8', marginTop: 2, fontFamily: f, textTransform: 'uppercase', letterSpacing: 0.5 },
  alertsRow: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  alert: { padding: '10px 16px', borderRadius: 8, fontSize: 13, fontFamily: f },
  tableWrap: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#F4F9FC' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9AAAB8', fontFamily: f, letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #E4EDF3' },
  tr: { borderBottom: '1px solid #F0F4F8' },
  td: { padding: '14px 16px', fontSize: 13, color: '#0D1B2A', fontFamily: f, verticalAlign: 'middle' },
  chip: { fontSize: 11, fontWeight: 600, color: '#5A7D9A', background: '#EBF4FA', borderRadius: 20, padding: '2px 8px', fontFamily: f },
  qtyInput: { width: 72, padding: '6px 10px', borderRadius: 6, border: '1px solid #E4EDF3', fontSize: 14, fontWeight: 600, textAlign: 'center', fontFamily: f, outline: 'none' },
  badge: { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', fontFamily: f },
};
