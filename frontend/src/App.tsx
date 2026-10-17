import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TradeLabPage } from './pages/TradeLabPage';
import { BehaviouralCheckPage } from './pages/BehaviouralCheckPage';
import { WealthTrapPage } from './pages/WealthTrapPage';
import { LearnRiskPage } from './pages/LearnRiskPage';
import { ResearchLabPage } from './pages/ResearchLabPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Application App Shell */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trade-lab" element={<TradeLabPage />} />
          <Route path="/risk-intelligence" element={<BehaviouralCheckPage />} />
          <Route path="/behavioural-check" element={<BehaviouralCheckPage />} />
          <Route path="/wealth-trap" element={<WealthTrapPage />} />
          <Route path="/learn-risk" element={<LearnRiskPage />} />
          <Route path="/research-lab" element={<ResearchLabPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
