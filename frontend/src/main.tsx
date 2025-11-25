import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TempLandPage } from './components/Temp/TempLandPage';
import './index.css';
import { StaffDashboard } from './components/Staff/StaffDashboard.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <StaffDashboard />
  </StrictMode>
);
