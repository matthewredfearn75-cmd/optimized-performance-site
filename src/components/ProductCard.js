import { useCart } from '../context/CartContext';

const LOW_STOCK_THRESHOLD = 20;

export default function ProductCard({ product, qty }) {
  const { addToCart } = useCart();

  const stock = qty ?? product.stock;
  const status = stock === 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'in';

  const badgeColors = {
    HERO: { bg: '#00B4D8', color: '#fff' },
    BUNDLE: { bg: '#0D1B2A', color: '#fff' },
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
    >
      {product.badge && (
        <div style={{
          ...styles.badge,
          backgroundColor: badgeColors[product.badge]?.bg || '#00B4D8',
          color: badgeColors[product.badge]?.color || '#fff',
        }}>
          {product.badge}
        </div>
      )}

      <div style={styles.imgWrap}>
        <svg viewBox="0 0 100 170" width="72" height="122" style={{ display: 'block', margin: '0 auto' }}>
          <rect x="32" y="4" width="36" height="16" rx="3" fill="#1B3A5C" />
          <rect x="37" y="20" width="26" height="10" rx="1" fill="#E2EEF5" stroke="#C8D8E4" strokeWidth="0.5" />
          <rect x="27" y="30" width="46" height="110" rx="8" fill="#EEF6FA" stroke="#C8D8E4" strokeWidth="1" />
          <rect x="28" y="108" width="44" height="31" rx="7" fill="#00B4D8" opacity="0.15" />
          <rect x="33" y="46" width="34" height="52" rx="4" fill="white" stroke="#C8D8E4" strokeWidth="0.5" />
          <polygon points="50,53 56,56 56,62 50,65 44,62 44,56" fill="none" stroke="#00B4D8" strokeWidth="0.8" opacity="0.8" />
          <circle cx="50" cy="59" r="1.5" fill="#00B4D8" opacity="0.7" />
          <line x1="44" y1="59" x2="40" y2="59" stroke="#00B4D8" strokeWidth="0.5" opacity="0.5" />
          <line x1="56" y1="59" x2="60" y2="59" stroke="#00B4D8" strokeWidth="0.5" opacity="0.5" />
          <line x1="50" y1="53" x2="50" y2="49" stroke="#00B4D8" strokeWidth="0.5" opacity="0.5" />
          <line x1="50" y1="65" x2="50" y2="69" stroke="#00B4D8" strokeWidth="0.5" opacity="0.5" />
          <text x="50" y="80" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#0D1B2A" fontFamily="Arial">{product.name}</text>
          <text x="50" y="89" textAnchor="middle" fontSize="5" fill="#5A7D9A" fontFamily="Arial">{product.dosage}</text>
        </svg>
        <div style={styles.categoryTag}>{product.category}</div>
      </div>

      <div style={styles.info}>
        <div style={styles.nameRow}>
          <h3 style={styles.name}>{product.name}</h3>
          <span style={styles.dosagePill}>{product.dosage}</span>
        </div>
        <p style={styles.sku}>SKU: {product.sku}</p>
        <p style={styles.desc}>{product.description}</p>

        <div style={styles.bottom}>
          <div>
            <span style={styles.price}>${product.price.toFixed(2)}</span>
            <span style={styles.perVial}> / vial</span>
          </div>
          <button
            style={{ ...styles.addBtn, ...(status === 'out' ? styles.addBtnDisabled : {}) }}
            onClick={() => status !== 'out' && addToCart(product)}
            disabled={status === 'out'}
            onMouseEnter={(e) => { if (status !== 'out') e.target.style.backgroundColor = '#0096B7'; }}
            onMouseLeave={(e) => { if (status !== 'out') e.target.style.backgroundColor = '#00B4D8'; }}
          >
            {status === 'out' ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        <div style={styles.stockRow}>
          <span style={{
            ...styles.stockDot,
            backgroundColor: status === 'out' ? '#ef4444' : status === 'low' ? '#f59e0b' : '#22c55e',
          }} />
          {status === 'out' && <span style={{ ...styles.stockText, color: '#ef4444' }}>Out of Stock</span>}
          {status === 'low' && <span style={{ ...styles.stockText, color: '#f59e0b' }}>Only {stock} left!</span>}
          {status === 'in' && <span style={{ ...styles.stockText, color: '#22c55e' }}>In Stock</span>}
          {status !== 'out' && <span style={styles.shipping}>· Ships within 24hrs</span>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E4EDF3',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  badge: {
    position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 700,
    letterSpacing: 1.2, padding: '3px 8px', borderRadius: 4,
    fontFamily: "'Helvetica Neue', Arial, sans-serif", zIndex: 1,
  },
  imgWrap: {
    backgroundColor: '#F4F9FC', padding: '28px 16px 14px',
    textAlign: 'center', borderBottom: '1px solid #E4EDF3',
  },
  categoryTag: {
    display: 'inline-block', marginTop: 10, fontSize: 10, fontWeight: 600,
    letterSpacing: 1, color: '#5A7D9A', textTransform: 'uppercase',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  info: { padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' },
  nameRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { margin: 0, fontSize: 17, fontWeight: 700, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  dosagePill: {
    flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#00B4D8',
    background: '#EBF8FC', borderRadius: 20, padding: '2px 9px',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  sku: { margin: '4px 0 8px', fontSize: 11, color: '#9AAAB8', fontFamily: "'Helvetica Neue', Arial, sans-serif", letterSpacing: 0.3 },
  desc: { margin: '0 0 14px', fontSize: 12, color: '#6B7B8D', lineHeight: 1.55, fontFamily: "'Helvetica Neue', Arial, sans-serif", flex: 1 },
  bottom: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0F4F8' },
  price: { fontSize: 22, fontWeight: 700, color: '#0D1B2A', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  perVial: { fontSize: 12, color: '#9AAAB8', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  addBtn: {
    backgroundColor: '#00B4D8', color: '#fff', border: 'none', borderRadius: 8,
    padding: '9px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif", letterSpacing: 0.5, transition: 'background-color 0.15s',
  },
  addBtnDisabled: { backgroundColor: '#CBD5E1', cursor: 'not-allowed' },
  stockRow: { display: 'flex', alignItems: 'center', marginTop: 10, gap: 5 },
  stockDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  stockText: { fontSize: 11, fontWeight: 600, fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  shipping: { fontSize: 11, color: '#9AAAB8', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
};
