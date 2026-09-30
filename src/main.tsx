import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline caching and instant loading
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('FCTA CBT Portal is offline-ready.');
    },
    onNeedRefresh() {
      console.log('New CBT version available.');
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
