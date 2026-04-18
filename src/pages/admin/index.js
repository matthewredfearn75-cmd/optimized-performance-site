import { useState, useEffect } from 'react';
import products from '../../data/products';
import InventoryTab from './InventoryTab';
import SupplyTab from './SupplyTab';
import OrdersTab from './OrdersTab';
import AffiliatesTab from './AffiliatesTab';
import { Logo } from '../../components/Primitives';

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
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="bg-surface border border-line rounded-opp-lg p-10 w-full max-w-sm text-center">
          <div className="flex justify-center mb-4 text-ink">
            <Logo size={36} />
          </div>
          <h2 className="font-display font-semibold tracking-display text-2xl m-0 mb-1 text-ink">Admin Access</h2>
          <p className="opp-meta-mono uppercase m-0 mb-7">Optimized Performance Inc.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-2.5">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoFocus
            />
            {authError && <p className="text-danger text-[13px] m-0">{authError}</p>}
            <button type="submit" className="btn-primary">Sign In</button>
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
    <div className="min-h-screen bg-paper">
      <div className="bg-ink text-paper">
        <div className="max-w-container mx-auto px-8 py-5 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <h1 className="font-display font-semibold tracking-display text-xl m-0">Admin Dashboard</h1>
              <p className="font-mono text-[11px] text-paper/50 tracking-wider m-0 mt-0.5">
                Optimized Performance Inc.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span
                className={`font-mono text-[12px] ${saveMsg.toLowerCase().includes('failed') ? 'text-danger' : 'text-accent'}`}
              >
                {saveMsg}
              </span>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 border border-white/20 rounded-opp text-[13px] text-paper hover:bg-white/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-8 py-8">
        <div className="flex gap-1 mb-8 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
                activeTab === t.id
                  ? 'text-ink border-ink font-semibold'
                  : 'text-ink-soft border-transparent hover:text-ink'
              }`}
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
