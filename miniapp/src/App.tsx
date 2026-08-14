import { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { useTelegram } from './hooks/useTelegram';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { authApi } from './services/authApi';
import { Product } from './types/product';

export function App() {
  const { initData } = useTelegram();
  useRealtimeSync();
  const [activeTab, setActiveTab] = useState<'home' | 'cart' | 'profile'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Authenticate initData with backend upon load if available
  useEffect(() => {
    if (initData) {
      authApi.loginWithTelegram(initData).catch((err) => {
        console.warn('Backend Telegram Auth bypassed or failed:', err);
      });
    }
  }, [initData]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      <Header
        title={selectedProduct ? 'Product Details' : 'Mela Shop'}
        onCartClick={() => {
          setSelectedProduct(null);
          setActiveTab('cart');
        }}
      />

      <main className="flex-1 overflow-y-auto">
        {selectedProduct ? (
          <ProductDetailPage product={selectedProduct} onBack={handleBackToCatalog} />
        ) : activeTab === 'home' ? (
          <HomePage onSelectProduct={handleSelectProduct} />
        ) : activeTab === 'cart' ? (
          <CartPage onBackToShop={() => setActiveTab('home')} />
        ) : (
          <ProfilePage />
        )}
      </main>

      <BottomNav
        activeTab={selectedProduct ? 'home' : activeTab}
        onTabChange={(tab) => {
          setSelectedProduct(null);
          setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default App;
