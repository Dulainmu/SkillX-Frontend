import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CareerProvider } from './contexts/CareerContext'

createRoot(document.getElementById("root")!).render(
  <CareerProvider>
    <App />
  </CareerProvider>
);
