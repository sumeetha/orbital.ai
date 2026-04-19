import { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  UserPlus,
  Plus,
  MoreHorizontal,
  FileSpreadsheet,
  Users,
  Tag,
  Calendar,
  Mail,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Tabs from '../../components/Tabs';
import Input from '../../components/Input';
import EmptyState from '../../components/EmptyState';
import { ORBITAL_IDS } from '../../orbital/ids';
import { formatDate } from '../../lib/dates';
import type { Segment, SegmentRule } from '../../types';

const AUDIENCE_TABS = [
  { id: 'contacts', label: 'Contacts', orbitalId: ORBITAL_IDS.audiencesTabContacts },
  { id: 'segments', label: 'Segments', orbitalId: ORBITAL_IDS.audiencesTabSegments },
];

const AVAILABLE_TAGS = [
  'vip',
  'newsletter',
  'beta-tester',
  'webinar-attendee',
  'product-update',
  'early-adopter',
  'imported',
];

export default function AudiencesPage() {
  const { contacts, segments, importContacts, addContact, addSegment, addToast } = useStore(
    useShallow((s) => ({
      contacts: s.contacts,
      segments: s.segments,
      importContacts: s.importContacts,
      addContact: s.addContact,
      addSegment: s.addSegment,
      addToast: s.addToast,
    })),
  );

  const [activeTab, setActiveTab] = useState('contacts');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Import modal
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Add contact modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newTags, setNewTags] = useState('');

  // New segment modal
  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentTagRule, setSegmentTagRule] = useState('');
  const [segmentDateRule, setSegmentDateRule] = useState('');
  const [segmentOpenedRule, setSegmentOpenedRule] = useState(false);

  const filteredContacts = useMemo(() => {
    let list = contacts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          (c.firstName?.toLowerCase().includes(q)) ||
          (c.lastName?.toLowerCase().includes(q)),
      );
    }
    if (tagFilter) {
      list = list.filter((c) => c.tags.includes(tagFilter));
    }
    return list;
  }, [contacts, search, tagFilter]);

  const previewSegmentCount = useMemo(() => {
    let count = contacts.length;
    if (segmentTagRule) {
      count = contacts.filter((c) => c.tags.includes(segmentTagRule)).length;
    }
    if (segmentDateRule) {
      const cutoff = new Date(segmentDateRule).getTime();
      count = contacts.filter((c) => new Date(c.createdAt).getTime() >= cutoff).length;
    }
    if (segmentOpenedRule) {
      count = Math.floor(count * 0.6);
    }
    return count;
  }, [contacts, segmentTagRule, segmentDateRule, segmentOpenedRule]);

  function handleImportSample() {
    importContacts();
    setImportModalOpen(false);
    addToast('50 contacts imported successfully', 'success');
  }

  function handleAddContact() {
    if (!newEmail.trim()) return;
    addContact({
      id: `contact-${Date.now()}`,
      email: newEmail.trim(),
      firstName: newFirst.trim() || undefined,
      lastName: newLast.trim() || undefined,
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      subscribed: true,
      createdAt: new Date().toISOString(),
    });
    addToast('Contact added', 'success');
    setAddModalOpen(false);
    setNewEmail('');
    setNewFirst('');
    setNewLast('');
    setNewTags('');
  }

  function handleAddSegment() {
    if (!segmentName.trim()) return;
    const rules: SegmentRule[] = [];
    if (segmentTagRule) rules.push({ type: 'tag', op: 'is', value: segmentTagRule });
    if (segmentDateRule) rules.push({ type: 'signupDate', op: 'after', value: new Date(segmentDateRule).toISOString() });
    if (segmentOpenedRule) rules.push({ type: 'engagement', op: 'opened' });

    const seg: Segment = {
      id: `segment-${Date.now()}`,
      name: segmentName.trim(),
      rules,
      contactCount: previewSegmentCount,
    };
    addSegment(seg);
    addToast('Segment created', 'success');
    setSegmentModalOpen(false);
    setSegmentName('');
    setSegmentTagRule('');
    setSegmentDateRule('');
    setSegmentOpenedRule(false);
  }

  function describeRule(rule: SegmentRule): string {
    switch (rule.type) {
      case 'tag':
        return `Tag ${rule.op === 'is' ? 'is' : 'is not'} "${rule.value}"`;
      case 'signupDate':
        return `Signed up ${rule.op} ${formatDate(rule.value)}`;
      case 'engagement':
        return rule.op === 'opened'
          ? 'Opened last campaign'
          : rule.op === 'clicked'
            ? 'Clicked last campaign'
            : 'Did not open last campaign';
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Audiences</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your contacts and target segments
        </p>
      </div>

      <Tabs tabs={AUDIENCE_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* ─── Contacts tab ─── */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative max-w-xs w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                    placeholder:text-slate-400"
                />
              </div>

              {/* Tag filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md bg-white
                    hover:bg-slate-50 text-text-muted"
                >
                  <Tag size={14} />
                  {tagFilter || 'All tags'}
                  <ChevronDown size={14} />
                </button>
                {tagDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[160px]"
                    onMouseLeave={() => setTagDropdownOpen(false)}
                  >
                    <button
                      onClick={() => { setTagFilter(''); setTagDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 ${!tagFilter ? 'font-medium text-primary' : ''}`}
                    >
                      All tags
                    </button>
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setTagFilter(tag); setTagDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 ${tagFilter === tag ? 'font-medium text-primary' : ''}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                data-orbital-id={ORBITAL_IDS.audiencesImportBtn}
                onClick={() => setImportModalOpen(true)}
              >
                <Upload size={16} />
                Import CSV
              </Button>
              <Button onClick={() => setAddModalOpen(true)}>
                <UserPlus size={16} />
                Add contact
              </Button>
            </div>
          </div>

          {/* Contacts table */}
          {filteredContacts.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No contacts found"
              description={contacts.length === 0
                ? 'Import your first contacts to get started.'
                : 'No contacts match your current filters.'}
              actionLabel={contacts.length === 0 ? 'Import CSV' : undefined}
              onAction={contacts.length === 0 ? () => setImportModalOpen(true) : undefined}
            />
          ) : (
            <div className="bg-white rounded-lg border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(79,70,229,0.06)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/60">
                    <th className="text-left font-medium text-text-muted px-4 py-3">Email</th>
                    <th className="text-left font-medium text-text-muted px-4 py-3">Name</th>
                    <th className="text-left font-medium text-text-muted px-4 py-3">Tags</th>
                    <th className="text-center font-medium text-text-muted px-4 py-3">Subscribed</th>
                    <th className="text-left font-medium text-text-muted px-4 py-3">Added on</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.slice(0, 50).map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text">{c.email}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.length > 0
                            ? c.tags.map((tag) => (
                                <Badge key={tag} variant="blue">
                                  {tag}
                                </Badge>
                              ))
                            : <span className="text-text-muted">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.subscribed ? (
                          <Check size={16} className="inline text-emerald-500" />
                        ) : (
                          <X size={16} className="inline text-slate-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-1 text-center relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-text-muted"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenuId === c.id && (
                          <div
                            className="absolute right-4 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[120px]"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50">
                              Edit
                            </button>
                            <button className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContacts.length > 50 && (
                <div className="px-4 py-3 text-xs text-text-muted border-t border-border bg-slate-50/40 text-center">
                  Showing 50 of {filteredContacts.length} contacts
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Segments tab ─── */}
      {activeTab === 'segments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              data-orbital-id={ORBITAL_IDS.audiencesNewSegmentBtn}
              onClick={() => setSegmentModalOpen(true)}
            >
              <Plus size={16} />
              New segment
            </Button>
          </div>

          {segments.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No segments yet"
              description="Create segments to target specific groups of contacts."
              actionLabel="New segment"
              onAction={() => setSegmentModalOpen(true)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {segments.map((seg) => (
                <Card key={seg.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-text">{seg.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {seg.contactCount} contact{seg.contactCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="blue">
                      <Users size={12} className="mr-1" />
                      {seg.contactCount}
                    </Badge>
                  </div>
                  {seg.rules.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {seg.rules.map((rule, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-700"
                        >
                          {rule.type === 'tag' && <Tag size={11} />}
                          {rule.type === 'signupDate' && <Calendar size={11} />}
                          {rule.type === 'engagement' && <Mail size={11} />}
                          {describeRule(rule)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">All contacts — no rules</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Import CSV modal ─── */}
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import contacts">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg py-12 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <FileSpreadsheet size={24} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-text mb-1">
            Drag & drop your CSV file here
          </p>
          <p className="text-xs text-text-muted mb-6">
            or click below to upload a sample dataset
          </p>
          <Button
            data-orbital-id={ORBITAL_IDS.audiencesImportUploadSample}
            onClick={handleImportSample}
          >
            <Upload size={16} />
            Upload sample
          </Button>
        </div>
      </Modal>

      {/* ─── Add contact modal ─── */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add contact">
        <div className="space-y-4">
          <Input
            label="Email"
            id="new-contact-email"
            type="email"
            placeholder="jane@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              id="new-contact-first"
              placeholder="Jane"
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
            />
            <Input
              label="Last name"
              id="new-contact-last"
              placeholder="Doe"
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
            />
          </div>
          <Input
            label="Tags (comma-separated)"
            id="new-contact-tags"
            placeholder="vip, newsletter"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={!newEmail.trim()}>
              Add contact
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── New segment modal ─── */}
      <Modal open={segmentModalOpen} onClose={() => setSegmentModalOpen(false)} title="New segment">
        <div className="space-y-5">
          <Input
            label="Segment name"
            id="segment-name"
            placeholder="e.g. Engaged VIPs"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
          />

          <div>
            <p className="text-sm font-medium text-text mb-3">Rules</p>
            <div className="space-y-3">
              {/* Tag rule */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-full shrink-0">
                  <Tag size={12} />
                  Tag is
                </span>
                <select
                  value={segmentTagRule}
                  onChange={(e) => setSegmentTagRule(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">— select tag —</option>
                  {AVAILABLE_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Date rule */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-full shrink-0">
                  <Calendar size={12} />
                  Signed up after
                </span>
                <input
                  type="date"
                  value={segmentDateRule}
                  onChange={(e) => setSegmentDateRule(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Engagement rule */}
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-full shrink-0">
                  <Mail size={12} />
                  Opened last campaign
                </span>
                <input
                  type="checkbox"
                  checked={segmentOpenedRule}
                  onChange={(e) => setSegmentOpenedRule(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40"
                />
              </label>
            </div>
          </div>

          {/* Preview count */}
          <div className="bg-slate-50 rounded-md px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-text-muted">Estimated contacts</span>
            <span className="text-sm font-semibold text-text">{previewSegmentCount}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSegmentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSegment} disabled={!segmentName.trim()}>
              Create segment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
