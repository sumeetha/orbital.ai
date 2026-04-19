import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Users, Clock } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { StatusChip } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { ORBITAL_IDS } from '../../orbital/ids';
import { formatRelative } from '../../lib/dates';
import type { AutomationTrigger } from '../../types';

const TRIGGER_OPTIONS: { value: AutomationTrigger['type']; label: string }[] = [
  { value: 'contactAdded', label: 'Contact added' },
  { value: 'tagApplied', label: 'Tag applied' },
  { value: 'campaignNotOpened', label: 'Campaign not opened' },
];

function triggerSummary(trigger: AutomationTrigger): string {
  switch (trigger.type) {
    case 'contactAdded':
      return 'When a contact is added';
    case 'tagApplied':
      return `When tag "${trigger.tag}" is applied`;
    case 'campaignNotOpened':
      return 'When a campaign is not opened';
  }
}

export default function AutomationsListPage() {
  const navigate = useNavigate();
  const { automations, updateAutomation, addAutomation, addToast } = useStore(
    useShallow((s) => ({
      automations: s.automations,
      updateAutomation: s.updateAutomation,
      addAutomation: s.addAutomation,
      addToast: s.addToast,
    })),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTriggerType, setNewTriggerType] = useState<AutomationTrigger['type']>('contactAdded');

  const handleToggleStatus = (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateAutomation(id, { status: nextStatus });
    addToast(
      `Automation ${nextStatus === 'active' ? 'activated' : 'paused'}`,
      nextStatus === 'active' ? 'success' : 'info',
    );
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = `auto-${Date.now()}`;
    const trigger: AutomationTrigger =
      newTriggerType === 'tagApplied'
        ? { type: 'tagApplied', tag: 'new' }
        : newTriggerType === 'campaignNotOpened'
          ? { type: 'campaignNotOpened', campaignId: '' }
          : { type: 'contactAdded' };

    addAutomation({
      id,
      name: newName.trim(),
      status: 'draft',
      trigger,
      steps: [],
      contactsInWorkflow: 0,
    });
    addToast('Automation created', 'success');
    setShowCreateModal(false);
    setNewName('');
    setNewTriggerType('contactAdded');
    navigate(`/automations/${id}`);
  };

  if (automations.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Zap size={28} />}
          title="No automations yet"
          description="Automate your email workflows — send welcome sequences, re-engage inactive contacts, and more."
          actionLabel="Create automation"
          onAction={() => setShowCreateModal(true)}
          data-orbital-id={showCreateModal ? undefined : ORBITAL_IDS.automationsCreateBtn}
        />
        <CreateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          name={newName}
          onNameChange={setNewName}
          triggerType={newTriggerType}
          onTriggerTypeChange={setNewTriggerType}
          onCreate={handleCreate}
          tourAnchorCreateId={ORBITAL_IDS.automationsCreateBtn}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Automations</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {automations.length} workflow{automations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          data-orbital-id={showCreateModal ? undefined : ORBITAL_IDS.automationsCreateBtn}
        >
          <Plus size={16} />
          Create automation
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {automations.map((auto) => (
          <Card
            key={auto.id}
            onClick={() => navigate(`/automations/${auto.id}`)}
            className="p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text truncate">{auto.name}</h3>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {triggerSummary(auto.trigger)}
                </p>
              </div>
              <StatusChip status={auto.status} />
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                {auto.contactsInWorkflow} in workflow
              </span>
              {auto.lastRunAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} />
                  {formatRelative(auto.lastRunAt)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-text-muted">
                {auto.status === 'active' ? 'Active' : auto.status === 'paused' ? 'Paused' : 'Draft'}
              </span>
              {auto.status !== 'draft' && (
                <button
                  data-orbital-id={ORBITAL_IDS.automationsStatusToggle}
                  onClick={(e) => handleToggleStatus(e, auto.id, auto.status)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2
                    ${auto.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  role="switch"
                  aria-checked={auto.status === 'active'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform
                      ${auto.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <CreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        name={newName}
        onNameChange={setNewName}
        triggerType={newTriggerType}
        onTriggerTypeChange={setNewTriggerType}
        onCreate={handleCreate}
        tourAnchorCreateId={ORBITAL_IDS.automationsCreateBtn}
      />
    </div>
  );
}

function CreateModal({
  open,
  onClose,
  name,
  onNameChange,
  triggerType,
  onTriggerTypeChange,
  onCreate,
  tourAnchorCreateId,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (v: string) => void;
  triggerType: AutomationTrigger['type'];
  onTriggerTypeChange: (v: AutomationTrigger['type']) => void;
  onCreate: () => void;
  /** While the modal is open, the tour spotlight follows the in-modal Create control (not the toolbar button). */
  tourAnchorCreateId: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Create automation">
      <div className="space-y-4">
        <Input
          label="Automation name"
          placeholder="e.g. Welcome Series"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">Trigger type</label>
          <select
            value={triggerType}
            onChange={(e) => onTriggerTypeChange(e.target.value as AutomationTrigger['type'])}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            {TRIGGER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={!name.trim()} data-orbital-id={tourAnchorCreateId}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
