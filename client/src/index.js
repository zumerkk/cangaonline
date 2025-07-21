import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode geçici olarak kapatıldı - drag & drop uyumluluğu için
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
); 