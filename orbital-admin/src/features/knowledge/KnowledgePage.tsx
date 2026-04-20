import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileText, Globe, Trash2, Loader2, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, EditableText, Chip, Badge } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { useStore } from '../../store';

export function KnowledgePage() {
  const navigate = useNavigate();
  const { sources, extracted, isProcessing, loadSampleDocs, addSource, removeSource, updateExtractedField, completeKnowledge, journeyComplete } = useStore();
  const [urlInput, setUrlInput] = useState('');

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    addSource({
      id: `url-custom-${Date.now()}`,
      type: 'url',
      name: urlInput.trim(),
      status: 'ready',
      addedAt: new Date().toISOString(),
    });
    setUrlInput('');
  };

  const handleContinue = () => {
    completeKnowledge();
    navigate('/annotate');
  };

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        subtitle="Upload documents and share URLs to teach the agent about your product"
        actions={
          sources.length > 0 && extracted ? (
            <Button onClick={handleContinue}>
              Continue to Annotation <ArrowRight size={16} />
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Input */}
        <div className="col-span-3 space-y-6">
          {/* Document Upload */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Upload size={16} className="text-orbital-primary" />
              Upload Documents
            </h2>
            <div className="border-2 border-dashed border-orbital-border-light rounded-xl p-8 text-center mb-4">
              <Upload size={32} className="mx-auto text-orbital-text-muted mb-2" />
              <p className="text-sm text-orbital-text-muted">Drop files here or click to browse</p>
              <p className="text-xs text-orbital-text-muted mt-1">PDF, DOCX, TXT, MD</p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadSampleDocs} disabled={isProcessing || sources.length > 0}>
              {isProcessing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : 'Load sample docs'}
            </Button>
          </Card>

          {/* URL Input */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <LinkIcon size={16} className="text-orbital-primary" />
              Add Product URLs
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="https://docs.yourproduct.io/getting-started"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              />
              <Button variant="secondary" onClick={handleAddUrl}>Add</Button>
            </div>
          </Card>

          {/* Source List */}
          <AnimatePresence>
            {sources.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6">
                  <h2 className="text-sm font-semibold mb-4">Sources ({sources.length})</h2>
                  <div className="space-y-2">
                    {sources.map((src, i) => (
                      <motion.div
                        key={src.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                      >
                        {src.type === 'document' ? <FileText size={16} className="text-orbital-primary shrink-0" /> : <Globe size={16} className="text-orbital-info shrink-0" />}
                        <span className="text-sm flex-1 truncate">{src.name}</span>
                        <Badge color={src.status === 'ready' ? 'green' : src.status === 'processing' ? 'blue' : 'red'}>
                          {src.status === 'ready' && <CheckCircle2 size={12} className="mr-1" />}
                          {src.status === 'processing' && <Loader2 size={12} className="mr-1 animate-spin" />}
                          {src.status}
                        </Badge>
                        <button onClick={() => removeSource(src.id)} className="p-1 text-orbital-text-muted hover:text-orbital-danger">
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Extracted Knowledge */}
        <div className="col-span-2">
          <AnimatePresence>
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-6">
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 size={32} className="text-orbital-primary animate-spin" />
                    <p className="text-sm text-orbital-text-muted">Processing documents...</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {!isProcessing && extracted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Sparkles size={16} className="text-orbital-primary" />
                    Extracted Knowledge
                  </h2>
                  <p className="text-xs text-orbital-text-muted mb-4">Here's what I learned from your sources:</p>

                  {/* Product Summary */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-orbital-text-muted uppercase tracking-wide">Product Summary</label>
                    <div className="mt-1">
                      <EditableText value={extracted.productSummary} onChange={(v) => updateExtractedField('productSummary', v)} multiline />
                    </div>
                  </div>

                  {/* Plan Tiers */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-orbital-text-muted uppercase tracking-wide">Plan Tiers</label>
                    <div className="mt-2 space-y-2">
                      {extracted.planTiers.map((tier) => (
                        <div key={tier.name} className="p-3 rounded-lg bg-slate-50">
                          <div className="text-sm font-medium">{tier.name} <span className="text-orbital-text-muted font-normal">({tier.price})</span></div>
                          <div className="text-xs text-orbital-text-muted mt-1">{tier.features.join(' · ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activation Events */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-orbital-text-muted uppercase tracking-wide">Detected Activation Events</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {extracted.activationEvents.map((ev) => (
                        <Chip key={ev} label={ev} color="emerald" onRemove={() => updateExtractedField('activationEvents', extracted.activationEvents.filter((e) => e !== ev))} />
                      ))}
                    </div>
                  </div>

                  {/* Paid Features */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-orbital-text-muted uppercase tracking-wide">Paid-Only Features</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {extracted.paidFeatures.map((f) => (
                        <Chip key={f} label={f} color="violet" onRemove={() => updateExtractedField('paidFeatures', extracted.paidFeatures.filter((p) => p !== f))} />
                      ))}
                    </div>
                  </div>

                  {/* Friction Points */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-orbital-text-muted uppercase tracking-wide">Friction Points</label>
                    <div className="mt-2 space-y-2">
                      {extracted.frictionPoints.map((fp, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orbital-warning mt-2 shrink-0" />
                          <EditableText value={fp} onChange={(v) => {
                            const updated = [...extracted.frictionPoints];
                            updated[i] = v;
                            updateExtractedField('frictionPoints', updated);
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-orbital-border-light">
                    <p className="text-xs text-orbital-text-muted">{sources.filter((s) => s.status === 'ready').length} sources ingested. You can add more at any time.</p>
                  </div>
                </Card>

                {!journeyComplete.knowledge && (
                  <Button className="w-full" onClick={handleContinue}>
                    Continue to Annotation <ArrowRight size={16} />
                  </Button>
                )}
              </motion.div>
            )}

            {!isProcessing && !extracted && sources.length === 0 && (
              <Card className="p-6">
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <BookOpen size={32} className="text-orbital-text-muted" />
                  <p className="text-sm text-orbital-text-muted">Upload docs or add URLs to get started.<br/>The agent will extract key product information.</p>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
