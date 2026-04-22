import { useEffect, useState } from 'react';

const STORAGE_KEY = 'opp-age-verified';

export default function AgeGate() {
  // Default to "verified" so SSR and first client paint match.
  // useEffect then checks localStorage and reveals the gate only if needed.
  const [verified, setVerified] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== 'true') {
        setVerified(false);
      }
    } catch {
      // localStorage blocked (private browsing, etc.) — default to showing gate
      setVerified(false);
    }
    setReady(true);
  }, []);

  if (!ready || verified) return null;

  const handleEnter = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore — session-scoped acknowledgment still ok
    }
    setVerified(true);
  };

  const handleLeave = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="card-premium max-w-md w-full p-8 md:p-10 text-center">
        <span className="opp-eyebrow">Age Verification</span>
        <h2
          id="age-gate-title"
          className="font-display font-semibold tracking-display text-[clamp(28px,4vw,40px)] leading-tight mt-3 mb-4 text-ink"
        >
          Are you 21 or older?
        </h2>
        <p className="text-sm text-ink-soft leading-relaxed mb-6">
          All products sold on this site are strictly for in-vitro research and laboratory use only.
          They are not drugs, foods, or cosmetics and are not intended for human or animal consumption.
          You must be 21 years of age or older to enter.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleEnter}
            className="btn-primary w-full py-3 text-base"
          >
            I am 21 or older — Enter
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="text-sm text-ink-mute hover:text-ink-soft underline-offset-2 hover:underline"
          >
            I am not 21 — Leave
          </button>
        </div>

        <p className="opp-meta-mono text-[10px] text-ink-mute mt-6 leading-relaxed">
          By entering, you confirm you are at least 21 years of age and agree to our{' '}
          <a href="/terms" className="text-accent-strong hover:underline">
            Terms of Service
          </a>
          .
        </p>
      </div>
    </div>
  );
}
