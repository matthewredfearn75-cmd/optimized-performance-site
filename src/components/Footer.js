import Link from 'next/link';
import { Logo } from './Primitives';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surfaceAlt">
      <div className="max-w-container mx-auto px-8 pt-16 pb-10 grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr] grid-cols-1">
        <div>
          <div className="flex items-center gap-3 mb-4 text-ink">
            <Logo size={24} />
            <span className="flex flex-col leading-none">
              <span className="font-display font-semibold text-[14px] tracking-[0.08em]">
                OPTIMIZED PERFORMANCE
              </span>
              <span className="font-mono text-[10px] text-ink-mute tracking-[0.12em] uppercase mt-1">
                Research Peptides
              </span>
            </span>
          </div>
          <p className="text-ink-soft text-sm max-w-md leading-relaxed">
            High-purity lyophilized research peptides. Third-party verified. Shipped from the United States.
          </p>
        </div>

        <FooterCol title="Shop">
          <FooterLink href="/shop">All products</FooterLink>
          <FooterLink href="/shop?cat=GLPs">GLPs</FooterLink>
          <FooterLink href="/shop?cat=Combos">Combos</FooterLink>
          <FooterLink href="/shop?cat=Supplements">Supplements</FooterLink>
        </FooterCol>

        <FooterCol title="Resources">
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/shipping">Shipping &amp; Returns</FooterLink>
        </FooterCol>

        <FooterCol title="Company">
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
        </FooterCol>
      </div>

      <div className="border-t border-line max-w-container mx-auto px-8 py-6 flex flex-col gap-4">
        <div className="flex gap-3.5 items-start">
          <span className="opp-ruo-tag">RUO</span>
          <p className="text-xs text-ink-soft leading-relaxed m-0">
            All products are intended strictly for in-vitro research and laboratory use only. They are not drugs,
            foods, or cosmetics and are not intended for human or animal consumption. Purchasers must be 21 years of age or older.
          </p>
        </div>
        <div className="flex justify-between font-mono text-[11px] text-ink-mute tracking-wide">
          <span>© {new Date().getFullYear()} Optimized Performance Inc.</span>
          <span>Made in the USA</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-mute mb-4">{title}</h4>
      {children}
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block text-ink text-sm py-1.5 hover:text-accent-strong transition-colors"
    >
      {children}
    </Link>
  );
}
