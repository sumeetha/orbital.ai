import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { AskAI } from './components/AskAI';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { IntegrationsPage } from './features/integrations/IntegrationsPage';
import { AnnotationPage } from './features/annotation/AnnotationPage';
import { SetupPage } from './features/agent-setup/SetupPage';
import { SuggestionsPage } from './features/suggestions/SuggestionsPage';
import { SuggestionDetailPage } from './features/suggestions/SuggestionDetailPage';
import { EngagementsPage } from './features/engagements/EngagementsPage';
import { CreateEngagementPage } from './features/engagements/CreateEngagementPage';
import { InsightsPage } from './features/insights/InsightsPage';
import { BrandingPage } from './features/branding/BrandingPage';
import { TeamPage } from './features/settings/TeamPage';
import { BillingPage } from './features/settings/BillingPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/annotate" element={<AnnotationPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/suggestions/:id" element={<SuggestionDetailPage />} />
            <Route path="/engagements/tours" element={<Navigate to="/engagements?type=tour" replace />} />
            <Route path="/engagements/nudges" element={<Navigate to="/engagements?type=nudge" replace />} />
            <Route path="/engagements/feedback" element={<Navigate to="/engagements?type=feedback" replace />} />
            <Route path="/engagements/new" element={<CreateEngagementPage />} />
            <Route path="/engagements" element={<EngagementsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/branding" element={<BrandingPage />} />
            <Route path="/settings" element={<Navigate to="/settings/team" replace />} />
            <Route path="/settings/team" element={<TeamPage />} />
            <Route path="/settings/billing" element={<BillingPage />} />
          </Routes>
        </main>
        <AskAI />
      </div>
    </BrowserRouter>
  );
}
