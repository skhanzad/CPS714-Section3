import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TempLandPage } from './components/Temp/TempLandPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TempLandPage />
  </StrictMode>
);
