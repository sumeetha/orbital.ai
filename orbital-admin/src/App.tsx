import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { IntegrationsPage } from './features/integrations/IntegrationsPage';
import { AnnotationPage } from './features/annotation/AnnotationPage';
import { SetupPage } from './features/agent-setup/SetupPage';
import { SuggestionsPage } from './features/suggestions/SuggestionsPage';
import { SuggestionDetailPage } from './features/suggestions/SuggestionDetailPage';

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
