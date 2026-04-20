import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ToastContainer from './components/Toast';
import OrbitalSlot from './orbital/OrbitalSlot';
import { TourProvider } from './orbital/TourEngine';
import { syncBridge, emitOrbitalEvent } from './orbital/bridge';
import { useStore } from './store';
import ScenarioSwitcher from './demo/ScenarioSwitcher';

import DashboardPage from './features/dashboard/DashboardPage';
import CampaignsListPage from './features/campaigns/CampaignsListPage';
import CampaignCreateWizard from './features/campaigns/CampaignCreateWizard';
import CampaignDetailPage from './features/campaigns/CampaignDetailPage';
import TemplatesPage from './features/templates/TemplatesPage';
import AudiencesPage from './features/audiences/AudiencesPage';
import AutomationsListPage from './features/automations/AutomationsListPage';
import AutomationBuilderPage from './features/automations/AutomationBuilderPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import SettingsPage from './features/settings/SettingsPage';

function AppShell() {
  const location = useLocation();
  const collapsed = useStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    const fullRoute = location.pathname + location.search;
    syncBridge(fullRoute);
    emitOrbitalEvent('route:changed', { route: fullRoute });
  }, [location]);

  useEffect(() => {
    const unsub = useStore.subscribe((state, prevState) => {
      if (state.campaigns.length > prevState.campaigns.length) {
        emitOrbitalEvent('campaign:created');
      }
      if (state.campaigns.some((c, i) => c.status === 'sent' && prevState.campaigns[i]?.status !== 'sent')) {
        emitOrbitalEvent('campaign:sent');
      }
      if (state.contactsUploaded && !prevState.contactsUploaded) {
        emitOrbitalEvent('contacts:imported');
      }
      if (state.teammates.length > prevState.teammates.length) {
        emitOrbitalEvent('teammate:invited');
      }
      if (state.checkoutInitiated && !prevState.checkoutInitiated) {
        emitOrbitalEvent('checkout:started');
      }
      if (state.checkoutAbandoned && !prevState.checkoutAbandoned) {
        emitOrbitalEvent('checkout:abandoned');
      }
      if (state.plan !== prevState.plan) {
        emitOrbitalEvent('plan:upgraded', { plan: state.plan });
      }
      syncBridge(location.pathname + location.search);
    });
    return unsub;
  }, [location]);

  return (
    // pt-12 clears the 48px ScenarioSwitcher bar
    <div className="min-h-screen bg-bg pt-12">
      <Sidebar />
      <TopBar />
      {/* pt-16 clears the 64px TopBar; Sidebar offsets handled by ml-* */}
      <main
        className={`pt-16 transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}
      >
        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsListPage />} />
            <Route path="/campaigns/new" element={<CampaignCreateWizard />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/audiences" element={<AudiencesPage />} />
            <Route path="/automations" element={<AutomationsListPage />} />
            <Route path="/automations/:id" element={<AutomationBuilderPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
      <ToastContainer />
      <OrbitalSlot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TourProvider>
        <ScenarioSwitcher />
        <AppShell />
      </TourProvider>
    </BrowserRouter>
  );
}
