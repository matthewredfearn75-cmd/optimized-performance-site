import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import products, { getEffectiveStock } from '../../data/products';
import { useCart } from '../../context/CartContext';
import SEO from '../../components/SEO';
import { Vial, Icon } from '../../components/Primitives';
import { supabaseAdmin } from '../../lib/supabase';

const LOW_STOCK_THRESHOLD = 20;

export default function ProductDetail({ product, stock, relatedProducts }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (router.isFallback || !product) {
    return (
      <div className="max-w-container mx-auto px-8 py-24 text-center">
        <span className="opp-eyebrow">Product</span>
        <h1 className="font-display font-semibold tracking-display text-4xl mt-3 mb-3 text-ink">
          Product not found.
        </h1>
        <p className="text-ink-soft mb-6">
          We couldn&apos;t find that SKU. It may have been moved or discontinued.
        </p>
        <button className="btn-primary" onClick={() => router.push('/shop')}>
          Browse catalog
        </button>
      </div>
    );
  }

  const status = stock === 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'in';
  const statusText =
    status === 'out' ? 'Sold out' : status === 'low' ? `Only ${stock} left` : 'In stock';

  const handleAdd = () => {
    if (status === 'out') return;
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
  };

  return (
    <div className="max-w-container mx-auto px-8 pt-10 pb-20">
      <SEO
        title={`${product.name} ${product.dosage} — Research Peptide`}
        description={product.description}
        path={`/products/${product.id}`}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] opp-meta-mono mb-6">
        <Link href="/shop" className="text-ink-mute hover:text-ink-soft transition-colors">
          Shop
        </Link>
        <span className="text-ink-mute">/</span>
        <Link
          href={`/shop?cat=${encodeURIComponent(product.category)}`}
          className="text-ink-mute hover:text-ink-soft transition-colors"
        >
          {product.category}
        </Link>
        <span className="text-ink-mute">/</span>
        <span className="text-ink-soft">
          {product.name} {product.dosage}
        </span>
      </nav>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12">
        {/* Image panel */}
        <div className="card-premium relative flex items-center justify-center min-h-[420px] p-8 opp-grid-bg">
          <div className="absolute top-5 right-5 px-2.5 py-1 bg-surface border border-line rounded-sm opp-meta-mono">
            {product.purity ?? 99}% · HPLC
          </div>
          {product.badge && (
            <div
              className={`absolute top-5 left-5 font-mono text-[10px] font-bold tracking-[0.12em] px-2 py-1 rounded-sm ${
                product.badge === 'BUNDLE' ? 'bg-ink text-paper' : 'bg-accent text-surface'
              }`}
            >
              {product.badge}
            </div>
          )}
          <Vial
            label={product.name}
            dosage={product.dosage}
            size={320}
            purity={product.purity}
            kit={product.isKit}
            sku={product.sku}
          />
        </div>

        {/* Details panel */}
        <div className="flex flex-col">
          <div className="opp-meta-mono text-accent-strong mb-2">{product.category}</div>
          <div className="flex items-baseline gap-3 mb-3">
            <h1 className="font-display font-semibold tracking-display text-[clamp(36px,5vw,56px)] leading-none text-ink m-0">
              {product.name}
            </h1>
            <span className="font-mono text-[12px] px-2.5 py-0.5 border border-line rounded-full text-accent-strong font-semibold">
              {product.dosage}
            </span>
          </div>
          <p className="text-ink-soft leading-relaxed mb-6">{product.description}</p>

          {/* Spec table */}
          <div className="border border-line rounded-opp overflow-hidden mb-6">
            <SpecRow label="SKU" value={product.sku} />
            <SpecRow label="Class" value={product.category} />
            <SpecRow label="Purity" value={`${product.purity ?? 99}% — HPLC verified`} />
            <SpecRow label="Format" value={product.format || 'Lyophilized Powder'} />
            <SpecRow label="Vial size" value={product.vialSize || '2 mL Vial'} />
            <SpecRow label="Storage" value="−20°C recommended" last />
          </div>

          {/* Price + action */}
          <div className="flex items-end justify-between pb-5 border-b border-line mb-5">
            <div>
              <div className="font-display font-semibold text-4xl tracking-display text-ink leading-none">
                ${product.price.toFixed(2)}
              </div>
              <div className={`opp-stock opp-stock--${status} mt-2`}>
                <span className="opp-stock-dot" /> {statusText}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-full border border-line text-ink-soft hover:text-ink hover:border-ink transition-colors"
                aria-label="Decrease quantity"
                disabled={status === 'out'}
              >
                −
              </button>
              <span className="w-10 text-center font-mono font-semibold text-ink">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(Math.min(stock || 99, qty + 1))}
                className="w-9 h-9 rounded-full border border-line text-ink-soft hover:text-ink hover:border-ink transition-colors"
                aria-label="Increase quantity"
                disabled={status === 'out'}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="btn-primary w-full py-4 text-base"
            disabled={status === 'out'}
          >
            <Icon name="plus" size={16} />
            {status === 'out' ? 'Sold out' : `Add to cart — $${(product.price * qty).toFixed(2)}`}
          </button>

          {/* COA / compliance */}
          <div className="mt-6 grid gap-3">
            <ComplianceRow icon="doc" title="Certificate of Analysis">
              Independent third-party HPLC verified. COA available per batch upon request
              at <a href="mailto:admin@optimizedperformancepeptides.com" className="text-accent-strong hover:underline">admin@optimizedperformancepeptides.com</a>.
            </ComplianceRow>
            <ComplianceRow icon="truck" title="Shipping">
              Ships within 1 business day in discrete, unbranded packaging.{' '}
              <Link href="/shipping" className="text-accent-strong hover:underline">Full policy</Link>.
            </ComplianceRow>
            <ComplianceRow icon="lock" title="Research Use Only">
              For in-vitro research and laboratory use only. Not a drug, food, or cosmetic.
              Not intended for human or animal consumption. Must be 21+ to purchase.
            </ComplianceRow>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-line">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="opp-eyebrow">Related</span>
              <h2 className="font-display font-semibold tracking-display text-3xl mt-2 text-ink">
                Other {product.category}
              </h2>
            </div>
            <Link href="/shop" className="text-sm text-accent-strong hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/products/${rp.id}`}
                className="bg-surface border border-line rounded-opp-lg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink flex flex-col gap-2"
              >
                <div className="flex justify-center py-2 opp-grid-bg rounded-opp">
                  <Vial label={rp.name} dosage={rp.dosage} size={80} kit={rp.isKit} sku={rp.sku} />
                </div>
                <div className="opp-meta-mono text-ink-mute">{rp.category}</div>
                <div className="font-display font-semibold text-base text-ink leading-tight">
                  {rp.name}{' '}
                  <span className="font-mono text-[11px] text-accent-strong">({rp.dosage})</span>
                </div>
                <div className="font-mono text-sm text-ink">${rp.price.toFixed(2)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to shop */}
      <div className="mt-10 flex justify-center">
        <Link href="/shop" className="text-sm text-ink-soft hover:text-ink transition-colors">
          ← Back to catalog
        </Link>
      </div>
    </div>
  );
}

function SpecRow({ label, value, last = false }) {
  return (
    <div
      className={`grid grid-cols-[140px_1fr] px-4 py-3 ${
        last ? '' : 'border-b border-line'
      } bg-surfaceAlt/30`}
    >
      <span className="opp-meta-mono text-ink-mute">{label}</span>
      <span className="font-mono text-[13px] text-ink">{value}</span>
    </div>
  );
}

function ComplianceRow({ icon, title, children }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-surfaceAlt border border-line rounded-opp">
      <span className="text-accent-strong mt-0.5">
        <Icon name={icon} size={16} />
      </span>
      <div className="flex-1">
        <div className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-ink mb-1">
          {title}
        </div>
        <div className="text-[13px] text-ink-soft leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return { notFound: true };
  }

  // Resolve stock: try Supabase, fall back to static product.stock
  let inventory = {};
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('inventory').select('product_id, stock');
      if (!error && data) {
        data.forEach((row) => {
          inventory[row.product_id] = row.stock;
        });
      }
    }
  } catch {
    // silent fall-through to static
  }

  const stock = product.isKit
    ? getEffectiveStock(product, inventory)
    : inventory[product.id] ?? product.stock ?? 0;

  // Related products: up to 4 other products in same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      dosage: p.dosage,
      price: p.price,
      category: p.category,
      isKit: p.isKit || false,
    }));

  return {
    props: {
      product,
      stock,
      relatedProducts,
    },
  };
}
