import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';
import { translatePage } from '../api/googleTranslate';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Translation on route change
  useEffect(() => {
    const activeLang = localStorage.getItem('lang') || 'en';
    translatePage(activeLang).catch((err) =>
      console.error('Translation failed on route change:', err)
    );
  }, [location.pathname]);

  // Language change listener
  useEffect(() => {
    const handleLangChange = async (event) => {
      const lang = event?.detail?.lang || 'en';
      await translatePage(lang);
    };
    window.addEventListener('krishiLangChanged', handleLangChange);
    return () => window.removeEventListener('krishiLangChanged', handleLangChange);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;