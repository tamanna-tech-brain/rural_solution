import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';  // ✅ Fixed: was missing entirely
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './redux/stores';       // ✅ Fixed: correct path
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>             {/* ✅ Fixed: Redux now works */}
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f8fafc' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);