import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import '../styles/globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const MoonPayProvider = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith('/admin');

  return (
    <MoonPayProvider
      apiKey={process.env.NEXT_PUBLIC_MOONPAY_API_KEY || 'pk_test_placeholder'}
      debug={process.env.NODE_ENV === 'development'}
    >
      <CartProvider>
        <div className={`${interTight.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col bg-paper text-ink font-body`}>
          {isAdmin ? (
            <Component {...pageProps} />
          ) : (
            <>
              <Header />
              <CartDrawer />
              <main className="flex-1">
                <Component {...pageProps} />
              </main>
              <Footer />
            </>
          )}
        </div>
      </CartProvider>
    </MoonPayProvider>
  );
}
