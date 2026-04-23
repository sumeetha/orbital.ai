import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Loader2, Check, X } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, Button, Input, Badge } from '../../components/ui';
import { useStore } from '../../store';
import { fontOptions, type ButtonStyle, type BrandSettings } from '../../mock/branding';

function PreviewCard({ brandSettings }: { brandSettings: BrandSettings }) {
  const btnRadius = brandSettings.buttonStyle === 'rounded-pill' ? '9999px' : `${brandSettings.borderRadius}px`;
  const btnStyle = brandSettings.buttonStyle === 'outlined'
    ? { border: `2px solid ${brandSettings.primaryColor}`, color: brandSettings.primaryColor, background: 'white', borderRadius: btnRadius }
    : { background: brandSettings.primaryColor, color: 'white', border: 'none', borderRadius: btnRadius };

  return (
    <div
      className="border border-orbital-border-light rounded-xl overflow-hidden shadow-sm"
      style={{ fontFamily: brandSettings.fontFamily + ', system-ui, sans-serif' }}
    >
      <div className="bg-slate-900 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-slate-400 ml-2">app.mailflow.io/campaigns</span>
      </div>
      <div className="bg-slate-50 p-6 relative">
        {/* Simulated tooltip */}
        <div
          className="bg-white shadow-lg p-4 max-w-xs"
          style={{ borderRadius: `${brandSettings.borderRadius}px`, border: `1px solid ${brandSettings.primaryColor}20` }}
        >
          <div className="flex items-center gap-2 mb-2">
            {brandSettings.logoUrl ? (
              <img src={brandSettings.logoUrl} alt="Logo" className="h-5 w-auto max-w-[20px] object-contain rounded" />
            ) : (
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: brandSettings.primaryColor }}>
                <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="5" fill="white" />
                  <ellipse cx="24" cy="24" rx="20" ry="8" stroke="white" strokeWidth="3" fill="none" transform="rotate(-30 24 24)" />
                  <ellipse cx="24" cy="24" rx="20" ry="8" stroke="white" strokeWidth="3" fill="none" transform="rotate(30 24 24)" opacity="0.6" />
                  <circle cx="40" cy="16.5" r="3" fill="white" />
                </svg>
              </div>
            )}
            <span className="text-xs font-medium" style={{ color: brandSettings.primaryColor }}>Orbital Guide</span>
            <span className="text-xs text-slate-400 ml-auto">1 / 3</span>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            Click here to create your first campaign. It only takes a few minutes!
          </p>
          <div className="flex items-center justify-between">
            <button className="text-xs text-slate-400 hover:text-slate-600">Skip</button>
            <button className="px-3 py-1.5 text-xs font-medium" style={btnStyle}>
              Next
            </button>
          </div>
        </div>

        {/* Simulated nudge */}
        <div
          className="bg-white shadow-lg p-4 max-w-xs mt-4"
          style={{ borderRadius: `${brandSettings.borderRadius}px`, borderLeft: `3px solid ${brandSettings.secondaryColor}` }}
        >
          <p className="text-sm text-slate-700 mb-2">
            Your open rates dipped this week. Want tips on improving subject lines?
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium" style={btnStyle}>
              Show me
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium text-slate-500"
              style={{ borderRadius: btnRadius }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoUpload({ logoUrl, onUpload, onRemove }: { logoUrl: string | null; onUpload: (dataUrl: string) => void; onRemove: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onUpload(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="col-span-2">
      <label className="text-xs text-orbital-text-muted mb-1.5 block">Logo</label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {logoUrl ? (
        <div className="border-2 border-orbital-border-light rounded-lg p-4 flex items-center gap-4">
          <img src={logoUrl} alt="Brand logo" className="h-12 w-auto max-w-[160px] object-contain rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orbital-text-dark truncate">Logo uploaded</p>
            <p className="text-xs text-orbital-text-muted">Displayed in tooltips, tours, and nudges</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-orbital-border-light text-orbital-text-muted hover:bg-slate-50 transition-colors"
            >
              Replace
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-red-50 text-orbital-text-muted hover:text-red-500 transition-colors"
              title="Remove logo"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-orbital-border-light rounded-lg p-6 text-center hover:border-orbital-primary/40 transition-colors w-full"
        >
          <div className="flex flex-col items-center gap-1">
            <Upload size={20} className="text-orbital-text-muted" />
            <span className="text-xs text-orbital-text-muted">Click to upload PNG, SVG, or JPG</span>
          </div>
        </button>
      )}
    </div>
  );
}

export function BrandingPage() {
  const { brandSettings, updateBrandSetting, fetchBrandFromUrl, isExtracting, styleGuideUrl } = useStore();
  const [urlInput, setUrlInput] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleUpload = () => {
    setFileUploaded(true);
    fetchBrandFromUrl('uploaded-file');
  };

  const handleFetchUrl = () => {
    if (urlInput.trim()) {
      fetchBrandFromUrl(urlInput.trim());
    }
  };

  return (
    <div>
      <PageHeader
        title="Branding"
        subtitle="Configure the visual theme applied to all user-facing engagements"
      />

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Settings */}
        <div className="col-span-3 space-y-6">
          {/* Brand Source */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-orbital-text-dark mb-4">Import Brand Guidelines</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-orbital-text-muted mb-2 block">Upload Style Guide</label>
                <button
                  onClick={handleUpload}
                  className="w-full border-2 border-dashed border-orbital-border-light rounded-lg p-6 text-center hover:border-orbital-primary/40 transition-colors"
                >
                  {fileUploaded ? (
                    <div className="flex flex-col items-center gap-1">
                      <Check size={20} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600">Style guide uploaded</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={20} className="text-orbital-text-muted" />
                      <span className="text-xs text-orbital-text-muted">PDF, PNG, or SVG</span>
                    </div>
                  )}
                </button>
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted mb-2 block">Reference URL</label>
                <div className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://brand.company.com"
                    className="text-xs"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFetchUrl}
                    disabled={isExtracting || !urlInput.trim()}
                  >
                    {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                  </Button>
                </div>
                {styleGuideUrl && !isExtracting && (
                  <div className="flex items-center gap-1 mt-2">
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600">Brand tokens auto-detected</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Brand Settings */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-orbital-text-dark mb-4">Brand Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-orbital-text-muted mb-1.5 block">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandSettings.primaryColor}
                    onChange={(e) => updateBrandSetting('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded border border-orbital-border-light cursor-pointer"
                  />
                  <Input
                    value={brandSettings.primaryColor}
                    onChange={(e) => updateBrandSetting('primaryColor', e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted mb-1.5 block">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandSettings.secondaryColor}
                    onChange={(e) => updateBrandSetting('secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded border border-orbital-border-light cursor-pointer"
                  />
                  <Input
                    value={brandSettings.secondaryColor}
                    onChange={(e) => updateBrandSetting('secondaryColor', e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted mb-1.5 block">Font Family</label>
                <select
                  value={brandSettings.fontFamily}
                  onChange={(e) => updateBrandSetting('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-orbital-primary/30 bg-white"
                >
                  {fontOptions.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted mb-1.5 block">
                  Border Radius — {brandSettings.borderRadius}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={16}
                  value={brandSettings.borderRadius}
                  onChange={(e) => updateBrandSetting('borderRadius', Number(e.target.value))}
                  className="w-full accent-orbital-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-orbital-text-muted mb-1.5 block">Tone of Voice</label>
                <textarea
                  value={brandSettings.toneOfVoice}
                  onChange={(e) => updateBrandSetting('toneOfVoice', e.target.value)}
                  placeholder="e.g. Friendly and direct; avoid hype; use inclusive language."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-orbital-primary/30 bg-white"
                />
                <p className="text-[11px] text-orbital-text-muted mt-1">
                  Describes how tours, nudges, and assistant copy should sound to end users.
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-orbital-text-muted mb-1.5 block">Button Style</label>
                <div className="flex gap-3">
                  {(['filled', 'outlined', 'rounded-pill'] as ButtonStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateBrandSetting('buttonStyle', style)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        brandSettings.buttonStyle === style
                          ? 'border-orbital-primary bg-orbital-primary/5 text-orbital-primary'
                          : 'border-orbital-border-light text-orbital-text-muted hover:bg-slate-50'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <LogoUpload
                logoUrl={brandSettings.logoUrl}
                onUpload={(dataUrl) => updateBrandSetting('logoUrl', dataUrl)}
                onRemove={() => updateBrandSetting('logoUrl', null)}
              />
            </div>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="col-span-2">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-orbital-text-dark">Live Preview</h3>
              <Badge color="green">Updates in real-time</Badge>
            </div>
            <PreviewCard brandSettings={brandSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}
