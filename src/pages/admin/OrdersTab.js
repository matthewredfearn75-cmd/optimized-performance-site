import { useState, useEffect } from 'react';

const ORDERS_KEY = 'op_orders';
const STATUSES = ['pending', 'packed', 'shipped', 'fulfilled'];
const STATUS_LABELS = { pending: 'Pending', packed: 'Packed', shipped: 'Shipped', fulfilled: 'Fulfilled' };
const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  packed: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#ede9fe', color: '#5b21b6' },
  fulfilled: { bg: '#dcfce7', color: '#16a34a' },
};

function genOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OP-${y}${m}${day}-${rand}`;
}

export default function OrdersTab({ products, showSaveMsg }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    const saved = localStorage.getItem(ORDERS_KEY);
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  function emptyForm() {
    return {
      customerName: '',
      customerEmail: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      items: [{ productId: products[0]?.id || '', quantity: 1 }],
      tracking: '',
      notes: '',
    };
  }

  function saveOrders(updated) {
    setOrders(updated);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }

  function handleAddItem() {
    setForm({ ...form, items: [...form.items, { productId: products[0]?.id || '', quantity: 1 }] });
  }

  function handleRemoveItem(idx) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }

  function handleItemChange(idx, field, value) {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value };
    setForm({ ...form, items });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const items = form.items.map((item) => {
      const p = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: p?.name || item.productId,
        dosage: p?.dosage || '',
        price: p?.price || 0,
        quantity: item.quantity,
      };
    });
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = {
      id: Date.now().toString(),
      orderNumber: genOrderNumber(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      shipping: { address: form.address, city: form.city, state: form.state, zip: form.zip },
      items,
      subtotal,
      total: subtotal,
      tracking: form.tracking,
      notes: form.notes,
    };
    saveOrders([order, ...orders]);
    setForm(emptyForm());
    setShowForm(false);
    showSaveMsg('Order created.');
  }

  function updateStatus(orderId, newStatus) {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      const order = { ...o, status: newStatus, updatedAt: new Date().toISOString() };

      // Auto-decrement inventory when marked fulfilled
      if (newStatus === 'fulfilled' && o.status !== 'fulfilled') {
        decrementInventory(order.items);
      }
      return order;
    });
    saveOrders(updated);
    showSaveMsg(`Order moved to ${STATUS_LABELS[newStatus]}.`);
  }

  function decrementInventory(items) {
    // Decrement supply tracker lots
    const lotsRaw = localStorage.getItem('op_supply_lots');
    if (!lotsRaw) return;
    const lots = JSON.parse(lotsRaw);
    items.forEach((item) => {
      let remaining = item.quantity;
      for (let i = 0; i < lots.length && remaining > 0; i++) {
        if (lots[i].product === item.productId && lots[i].qtyRemaining > 0) {
          const deduct = Math.min(remaining, lots[i].qtyRemaining);
          lots[i].qtyRemaining -= deduct;
          remaining -= deduct;
        }
      }
    });
    localStorage.setItem('op_supply_lots', JSON.stringify(lots));
  }

  function updateTracking(orderId, tracking) {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, tracking, updatedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
  }

  function deleteOrder(orderId) {
    if (window.confirm('Delete this order?')) {
      saveOrders(orders.filter((o) => o.id !== orderId));
    }
  }

  function exportCSV() {
    const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
    const headers = ['Order #', 'Status', 'Date', 'Customer', 'Email', 'Address', 'City', 'State', 'ZIP', 'Items', 'Subtotal', 'Total', 'Tracking', 'Notes'];
    const rows = filtered.map((o) => [
      o.orderNumber,
      STATUS_LABELS[o.status],
      new Date(o.createdAt).toLocaleDateString(),
      o.customerName,
      o.customerEmail,
      o.shipping?.address || '',
      o.shipping?.city || '',
      o.shipping?.state || '',
      o.shipping?.zip || '',
      o.items.map((i) => `${i.name} x${i.quantity}`).join('; '),
      o.subtotal?.toFixed(2) || '0.00',
      o.total?.toFixed(2) || '0.00',
      o.tracking || '',
      o.notes || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${filter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const counts = { all: orders.length };
  STATUSES.forEach((s) => { counts[s] = orders.filter((o) => o.status === s).length; });

  function getProductName(id) {
    const p = products.find((p) => p.id === id);
    return p ? p.name : id;
  }

  return (
    <>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={s.sectionTitle}>Orders</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.exportBtn} onClick={exportCSV}>Export CSV</button>
          <button style={s.btn} onClick={() => { setForm(emptyForm()); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : '+ New Order'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { key: 'pending', label: 'Pending', icon: 'clock' },
          { key: 'packed', label: 'Packed', icon: 'box' },
          { key: 'shipped', label: 'Shipped', icon: 'truck' },
          { key: 'fulfilled', label: 'Fulfilled', icon: 'check' },
        ].map((st) => (
          <div
            key={st.key}
            style={{ ...s.statCard, cursor: 'pointer', borderColor: filter === st.key ? STATUS_COLORS[st.key].color : '#E4EDF3' }}
            onClick={() => setFilter(filter === st.key ? 'all' : st.key)}
          >
            <div style={{ ...s.statValue, color: STATUS_COLORS[st.key].color }}>{counts[st.key]}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...STATUSES].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            style={{
              ...s.pill,
              backgroundColor: filter === st ? '#0D1B2A' : '#fff',
              color: filter === st ? '#fff' : '#5A7D9A',
              border: filter === st ? '1px solid #0D1B2A' : '1px solid #E4EDF3',
            }}
          >
            {st === 'all' ? `All (${counts.all})` : `${STATUS_LABELS[st]} (${counts[st]})`}
          </button>
        ))}
      </div>

      {/* New order form */}
      {showForm && (
        <div style={{ ...s.tableWrap, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0D1B2A', fontFamily: f }}>Create Order</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div><label style={s.label}>Customer Name</label><input style={s.input} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required /></div>
              <div><label style={s.label}>Email</label><input type="email" style={s.input} value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required /></div>
              <div><label style={s.label}>Address</label><input style={s.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
              <div><label style={s.label}>City</label><input style={s.input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></div>
              <div><label style={s.label}>State</label><input style={s.input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required /></div>
              <div><label style={s.label}>ZIP</label><input style={s.input} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} required /></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Order Items</label>
              {form.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select style={{ ...s.input, flex: 2 }} value={item.productId} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>)}
                  </select>
                  <input type="number" min="1" style={{ ...s.input, flex: 0, width: 70 }} value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                  {form.items.length > 1 && (
                    <button type="button" style={{ ...s.actionBtn, color: '#dc2626' }} onClick={() => handleRemoveItem(idx)}>X</button>
                  )}
                </div>
              ))}
              <button type="button" style={s.addItemBtn} onClick={handleAddItem}>+ Add Item</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div><label style={s.label}>Tracking #</label><input style={s.input} value={form.tracking} onChange={(e) => setForm({ ...form, tracking: e.target.value })} placeholder="Optional" /></div>
              <div><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" /></div>
            </div>

            <button type="submit" style={s.btn}>Create Order</button>
          </form>
        </div>
      )}

      {/* Orders list */}
      <div style={s.tableWrap}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: 15, color: '#5A7D9A', margin: 0 }}>No {filter === 'all' ? '' : filter + ' '}orders</p>
            <p style={{ fontSize: 12, color: '#9AAAB8', marginTop: 4 }}>
              {orders.length === 0 ? 'Click "+ New Order" to create one manually, or orders will appear here from checkout.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Order #</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Items</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Total</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                <th style={s.th}>Tracking</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const sc = STATUS_COLORS[order.status];
                const isExpanded = expandedId === order.id;
                const nextStatus = STATUSES[STATUSES.indexOf(order.status) + 1];

                return (
                  <>
                    <tr key={order.id} style={{ ...s.tr, backgroundColor: i % 2 === 0 ? '#fff' : '#F9FBFC', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</td>
                      <td style={s.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div style={{ fontSize: 11, color: '#9AAAB8' }}>{order.customerEmail}</div>
                      </td>
                      <td style={s.td}>
                        {order.items.map((it, j) => (
                          <div key={j} style={{ fontSize: 12 }}>{it.name} x{it.quantity}</div>
                        ))}
                      </td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>${(order.total || 0).toFixed(2)}</td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={{ ...s.statusBadge, backgroundColor: sc.bg, color: sc.color }}>{STATUS_LABELS[order.status]}</span>
                      </td>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11, color: '#5A7D9A' }}>{order.tracking || '-'}</td>
                      <td style={s.td} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {nextStatus && (
                            <button style={{ ...s.moveBtn, backgroundColor: STATUS_COLORS[nextStatus].bg, color: STATUS_COLORS[nextStatus].color }} onClick={() => updateStatus(order.id, nextStatus)}>
                              → {STATUS_LABELS[nextStatus]}
                            </button>
                          )}
                          <button style={{ ...s.actionBtn, color: '#dc2626' }} onClick={() => deleteOrder(order.id)}>Del</button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={order.id + '-detail'} style={{ backgroundColor: '#F7FAFB' }}>
                        <td colSpan={8} style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div>
                              <div style={s.detailLabel}>Shipping</div>
                              <div style={s.detailValue}>
                                {order.shipping?.address}<br />
                                {order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}
                              </div>
                            </div>
                            <div>
                              <div style={s.detailLabel}>Items Breakdown</div>
                              {order.items.map((it, j) => (
                                <div key={j} style={s.detailValue}>
                                  {it.name} ({it.dosage}) — {it.quantity} x ${it.price?.toFixed(2)} = ${(it.quantity * (it.price || 0)).toFixed(2)}
                                </div>
                              ))}
                              <div style={{ ...s.detailValue, fontWeight: 700, marginTop: 4 }}>Total: ${(order.total || 0).toFixed(2)}</div>
                            </div>
                            <div>
                              <div style={s.detailLabel}>Tracking</div>
                              <input
                                style={s.input}
                                value={order.tracking || ''}
                                onChange={(e) => updateTracking(order.id, e.target.value)}
                                placeholder="Enter tracking #"
                                onClick={(e) => e.stopPropagation()}
                              />
                              {order.notes && (
                                <>
                                  <div style={{ ...s.detailLabel, marginTop: 12 }}>Notes</div>
                                  <div style={s.detailValue}>{order.notes}</div>
                                </>
                              )}
                            </div>
                            <div>
                              <div style={s.detailLabel}>Move to Status</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                {STATUSES.filter((st) => st !== order.status).map((st) => (
                                  <button
                                    key={st}
                                    style={{ ...s.moveBtn, backgroundColor: STATUS_COLORS[st].bg, color: STATUS_COLORS[st].color }}
                                    onClick={(e) => { e.stopPropagation(); updateStatus(order.id, st); }}
                                  >
                                    {STATUS_LABELS[st]}
                                  </button>
                                ))}
                              </div>
                              <div style={{ ...s.detailLabel, marginTop: 12 }}>Last Updated</div>
                              <div style={s.detailValue}>{new Date(order.updatedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
  exportBtn: { padding: '9px 16px', borderRadius: 8, border: '1px solid #E4EDF3', backgroundColor: '#fff', color: '#0D1B2A', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: f },
  statsRow: { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 },
  statCard: { flex: '1 1 140px', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', padding: '18px 20px' },
  statValue: { fontSize: 26, fontWeight: 700, fontFamily: f },
  statLabel: { fontSize: 12, color: '#9AAAB8', marginTop: 2, fontFamily: f, textTransform: 'uppercase', letterSpacing: 0.5 },
  pill: { padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: f },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#9AAAB8', marginBottom: 4, fontFamily: f, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E4EDF3', fontSize: 13, fontFamily: f, color: '#0D1B2A', outline: 'none', boxSizing: 'border-box' },
  addItemBtn: { background: 'none', border: '1px dashed #E4EDF3', borderRadius: 6, padding: '6px 14px', fontSize: 12, color: '#00B4D8', cursor: 'pointer', fontFamily: f, fontWeight: 600 },
  tableWrap: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E4EDF3', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#F4F9FC' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9AAAB8', fontFamily: f, letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #E4EDF3' },
  tr: { borderBottom: '1px solid #F0F4F8' },
  td: { padding: '14px 16px', fontSize: 13, color: '#0D1B2A', fontFamily: f, verticalAlign: 'middle' },
  statusBadge: { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', fontFamily: f },
  moveBtn: { border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: f },
  actionBtn: { background: 'none', border: '1px solid #E4EDF3', borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#0077B6', fontFamily: f, fontWeight: 500 },
  detailLabel: { fontSize: 11, fontWeight: 700, color: '#9AAAB8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontFamily: f },
  detailValue: { fontSize: 13, color: '#0D1B2A', fontFamily: f, lineHeight: 1.5 },
};
