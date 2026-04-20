import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  Mail,
  GitBranch,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { StatusChip } from '../../components/Badge';
import { ORBITAL_IDS } from '../../orbital/ids';
import { emitOrbitalEvent } from '../../orbital/bridge';
import type { AutomationStep, AutomationTrigger } from '../../types';

type NodeAddress = { path: number[]; branch?: 'yes' | 'no' };

function triggerLabel(trigger: AutomationTrigger): string {
  switch (trigger.type) {
    case 'contactAdded':
      return 'Contact added';
    case 'tagApplied':
      return `Tag applied: "${trigger.tag}"`;
    case 'campaignNotOpened':
      return 'Campaign not opened';
  }
}

function stepIcon(type: AutomationStep['type']) {
  switch (type) {
    case 'delay':
      return <Clock size={16} />;
    case 'sendEmail':
      return <Mail size={16} />;
    case 'branch':
      return <GitBranch size={16} />;
  }
}

function stepSummary(step: AutomationStep): string {
  switch (step.type) {
    case 'delay':
      return `Wait ${step.hours} hour${step.hours !== 1 ? 's' : ''}`;
    case 'sendEmail':
      return step.subject || 'Send email';
    case 'branch':
      return `Branch on "${step.on}"`;
  }
}

function stepColor(type: AutomationStep['type']) {
  switch (type) {
    case 'delay':
      return 'border-amber-300 bg-amber-50';
    case 'sendEmail':
      return 'border-blue-300 bg-blue-50';
    case 'branch':
      return 'border-violet-300 bg-violet-50';
  }
}

function getStepAtPath(steps: AutomationStep[], path: number[]): AutomationStep | null {
  let current: AutomationStep[] = steps;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i];
    if (idx < 0 || idx >= current.length) return null;
    if (i === path.length - 1) return current[idx];
    const step = current[idx];
    if (step.type === 'branch') {
      const nextBranch = path[i + 1] !== undefined ? undefined : null;
      if (nextBranch === null) return step;
    }
    if (step.type !== 'branch') return null;
  }
  return null;
}

function updateStepAtPath(
  steps: AutomationStep[],
  path: number[],
  updater: (s: AutomationStep) => AutomationStep,
): AutomationStep[] {
  if (path.length === 0) return steps;
  const [head, ...rest] = path;
  return steps.map((s, i) => {
    if (i !== head) return s;
    if (rest.length === 0) return updater(s);
    return s;
  });
}

function removeStepAtPath(steps: AutomationStep[], path: number[]): AutomationStep[] {
  if (path.length === 0) return steps;
  if (path.length === 1) return steps.filter((_, i) => i !== path[0]);
  return steps;
}

const STEP_TYPE_OPTIONS: { value: AutomationStep['type']; label: string }[] = [
  { value: 'delay', label: 'Delay' },
  { value: 'sendEmail', label: 'Send Email' },
  { value: 'branch', label: 'Branch' },
];

export default function AutomationBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { automations, updateAutomation, addToast } = useStore(
    useShallow((s) => ({
      automations: s.automations,
      updateAutomation: s.updateAutomation,
      addToast: s.addToast,
    })),
  );
  const automation = useMemo(() => automations.find((a) => a.id === id), [automations, id]);

  const [selectedNode, setSelectedNode] = useState<NodeAddress | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);
  const [addStepBranch, setAddStepBranch] = useState<{ path: number[]; branch?: 'yes' | 'no' } | null>(null);

  if (!automation) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">Automation not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/automations')}>
          <ArrowLeft size={16} /> Back to automations
        </Button>
      </div>
    );
  }

  const selectedStep =
    selectedNode && !selectedTrigger
      ? getStepAtPath(automation.steps, selectedNode.path)
      : null;

  const handleUpdateStep = (path: number[], updates: Partial<AutomationStep>) => {
    const newSteps = updateStepAtPath(automation.steps, path, (s) => ({
      ...s,
      ...updates,
    } as AutomationStep));
    updateAutomation(automation.id, { steps: newSteps });
  };

  const handleDeleteStep = (path: number[]) => {
    const newSteps = removeStepAtPath(automation.steps, path);
    updateAutomation(automation.id, { steps: newSteps });
    setSelectedNode(null);
    setSelectedTrigger(false);
    addToast('Step removed', 'info');
  };

  const handleAddStep = (type: AutomationStep['type']) => {
    let newStep: AutomationStep;
    switch (type) {
      case 'delay':
        newStep = { type: 'delay', hours: 24 };
        break;
      case 'sendEmail':
        newStep = { type: 'sendEmail', templateId: '', subject: '' };
        break;
      case 'branch':
        newStep = { type: 'branch', on: 'opened', yes: [], no: [] };
        break;
    }

    let newSteps: AutomationStep[];
    if (addStepBranch) {
      const branchStep = automation.steps[addStepBranch.path[0]];
      if (branchStep?.type === 'branch' && addStepBranch.branch) {
        const arr = addStepBranch.branch === 'yes' ? branchStep.yes : branchStep.no;
        const updatedBranch = {
          ...branchStep,
          [addStepBranch.branch]: [...arr, newStep],
        };
        newSteps = automation.steps.map((s, i) =>
          i === addStepBranch!.path[0] ? updatedBranch : s,
        );
      } else {
        newSteps = [...automation.steps, newStep];
      }
    } else {
      newSteps = [...automation.steps, newStep];
    }

    updateAutomation(automation.id, { steps: newSteps });
    setShowAddStep(false);
    setAddStepBranch(null);
    emitOrbitalEvent('automation:step-added', { automationId: automation.id, stepType: type });
    if (type === 'sendEmail') {
      emitOrbitalEvent('automation:send-email-added', { automationId: automation.id });
    }
    addToast('Step added', 'success');
  };

  const handleUpdateTrigger = (updates: Partial<AutomationTrigger>) => {
    updateAutomation(automation.id, {
      trigger: { ...automation.trigger, ...updates } as AutomationTrigger,
    });
  };

  const handleToggleStatus = () => {
    const next = automation.status === 'active' ? 'paused' : 'active';
    updateAutomation(automation.id, { status: next });
    addToast(`Automation ${next === 'active' ? 'activated' : 'paused'}`, 'success');
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Main builder area */}
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/automations')}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-text truncate">{automation.name}</h1>
              <StatusChip status={automation.status} />
            </div>
          </div>
          <Button
            variant={automation.status === 'active' ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleStatus}
          >
            {automation.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
        </div>

        {/* Vertical stepper */}
        <div className="max-w-lg mx-auto space-y-0">
          {/* Trigger node */}
          <div
            data-orbital-id={ORBITAL_IDS.automationsTriggerNode}
            onClick={() => {
              setSelectedTrigger(true);
              setSelectedNode(null);
            }}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedTrigger
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-emerald-300 hover:border-emerald-400'}
              bg-emerald-50`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Trigger</p>
                <p className="text-sm font-medium text-text">{triggerLabel(automation.trigger)}</p>
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-300" />
          </div>

          {/* Step nodes */}
          {automation.steps.map((step, idx) => (
            <StepNode
              key={idx}
              step={step}
              path={[idx]}
              selectedNode={selectedNode}
              onSelect={(path) => {
                setSelectedNode({ path });
                setSelectedTrigger(false);
              }}
              onAddBranchStep={(path, branch) => {
                setAddStepBranch({ path, branch });
                setShowAddStep(true);
              }}
              isLast={idx === automation.steps.length - 1}
            />
          ))}

          {/* Add step button + picker */}
          <div className="pt-2" data-orbital-id={ORBITAL_IDS.automationsAddStepArea}>
            <div className="flex justify-center">
            <button
              data-orbital-id={ORBITAL_IDS.automationsAddStepBtn}
              onClick={() => {
                setAddStepBranch(null);
                setShowAddStep(!showAddStep);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary
                border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 hover:bg-primary/5
                transition-colors"
            >
              <Plus size={16} />
              Add step
            </button>
            </div>

            {/* Step type picker */}
            {showAddStep && (
              <div className="flex justify-center pt-2">
                <div className="bg-white border border-border rounded-lg shadow-lg p-2 flex gap-2">
                  {STEP_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAddStep(opt.value)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50 transition-colors"
                    >
                      {stepIcon(opt.value)}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right rail - detail panel */}
      <div className="w-80 border-l border-border bg-white overflow-auto shrink-0">
        {selectedTrigger ? (
          <TriggerDetail
            trigger={automation.trigger}
            onUpdate={handleUpdateTrigger}
          />
        ) : selectedStep && selectedNode ? (
          <StepDetail
            step={selectedStep}
            path={selectedNode.path}
            onUpdate={handleUpdateStep}
            onDelete={handleDeleteStep}
          />
        ) : (
          <div className="p-6 text-center text-sm text-text-muted mt-12">
            <Zap size={24} className="mx-auto mb-3 text-slate-300" />
            <p>Select a node to edit its details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepNode({
  step,
  path,
  selectedNode,
  onSelect,
  onAddBranchStep,
  isLast,
}: {
  step: AutomationStep;
  path: number[];
  selectedNode: NodeAddress | null;
  onSelect: (path: number[]) => void;
  onAddBranchStep: (path: number[], branch: 'yes' | 'no') => void;
  isLast: boolean;
}) {
  const isSelected =
    selectedNode &&
    selectedNode.path.length === path.length &&
    selectedNode.path.every((v, i) => v === path[i]);

  return (
    <>
      <div
        onClick={() => onSelect(path)}
        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all
          ${isSelected ? 'border-primary ring-2 ring-primary/20' : `${stepColor(step.type)} hover:shadow-sm`}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white
              ${step.type === 'delay' ? 'bg-amber-500' : step.type === 'sendEmail' ? 'bg-blue-500' : 'bg-violet-500'}`}
          >
            {stepIcon(step.type)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {step.type === 'delay' ? 'Delay' : step.type === 'sendEmail' ? 'Send Email' : 'Branch'}
            </p>
            <p className="text-sm font-medium text-text truncate">{stepSummary(step)}</p>
          </div>
        </div>

        {step.type === 'branch' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <BranchArm
              label="Yes"
              steps={step.yes}
              path={path}
              branch="yes"
              selectedNode={selectedNode}
              onSelect={onSelect}
              onAddBranchStep={onAddBranchStep}
            />
            <BranchArm
              label="No"
              steps={step.no}
              path={path}
              branch="no"
              selectedNode={selectedNode}
              onSelect={onSelect}
              onAddBranchStep={onAddBranchStep}
            />
          </div>
        )}
      </div>

      {!isLast && (
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-slate-300" />
        </div>
      )}
    </>
  );
}

function BranchArm({
  label,
  steps,
  path,
  branch,
  selectedNode: _selectedNode,
  onSelect,
  onAddBranchStep,
}: {
  label: string;
  steps: AutomationStep[];
  path: number[];
  branch: 'yes' | 'no';
  selectedNode: NodeAddress | null;
  onSelect: (path: number[]) => void;
  onAddBranchStep: (path: number[], branch: 'yes' | 'no') => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white/60 rounded-md border border-slate-200 p-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="flex items-center gap-1 text-xs font-medium text-text-muted w-full"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {label} ({steps.length} step{steps.length !== 1 ? 's' : ''})
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5">
          {steps.map((s, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onSelect([...path, i]);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {stepIcon(s.type)}
              <span className="truncate">{stepSummary(s)}</span>
            </div>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddBranchStep(path, branch);
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/5 rounded w-full transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

function TriggerDetail({
  trigger,
  onUpdate,
}: {
  trigger: AutomationTrigger;
  onUpdate: (updates: Partial<AutomationTrigger>) => void;
}) {
  return (
    <div className="p-6 space-y-5">
      <h3 className="text-sm font-semibold text-text">Trigger settings</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">Type</label>
        <select
          value={trigger.type}
          onChange={(e) => {
            const type = e.target.value as AutomationTrigger['type'];
            if (type === 'contactAdded') onUpdate({ type: 'contactAdded' } as AutomationTrigger);
            else if (type === 'tagApplied')
              onUpdate({ type: 'tagApplied', tag: '' } as unknown as Partial<AutomationTrigger>);
            else
              onUpdate({ type: 'campaignNotOpened', campaignId: '' } as unknown as Partial<AutomationTrigger>);
          }}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          <option value="contactAdded">Contact added</option>
          <option value="tagApplied">Tag applied</option>
          <option value="campaignNotOpened">Campaign not opened</option>
        </select>
      </div>

      {trigger.type === 'tagApplied' && (
        <Input
          label="Tag"
          value={trigger.tag}
          onChange={(e) =>
            onUpdate({ type: 'tagApplied', tag: e.target.value } as unknown as Partial<AutomationTrigger>)
          }
          placeholder="e.g. vip"
        />
      )}

      {trigger.type === 'campaignNotOpened' && (
        <Input
          label="Campaign ID"
          value={trigger.campaignId}
          onChange={(e) =>
            onUpdate({
              type: 'campaignNotOpened',
              campaignId: e.target.value,
            } as unknown as Partial<AutomationTrigger>)
          }
          placeholder="e.g. camp-1"
        />
      )}
    </div>
  );
}

function StepDetail({
  step,
  path,
  onUpdate,
  onDelete,
}: {
  step: AutomationStep;
  path: number[];
  onUpdate: (path: number[], updates: Partial<AutomationStep>) => void;
  onDelete: (path: number[]) => void;
}) {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">
          {step.type === 'delay' ? 'Delay' : step.type === 'sendEmail' ? 'Send Email' : 'Branch'} settings
        </h3>
        <button
          onClick={() => onDelete(path)}
          className="p-1.5 rounded-md text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {step.type === 'delay' && (
        <Input
          label="Delay (hours)"
          type="number"
          min={1}
          value={step.hours}
          onChange={(e) => onUpdate(path, { hours: parseInt(e.target.value) || 1 })}
        />
      )}

      {step.type === 'sendEmail' && (
        <>
          <Input
            label="Subject line"
            value={step.subject}
            onChange={(e) => onUpdate(path, { subject: e.target.value })}
            placeholder="Enter email subject…"
          />
          <Input
            label="Template ID"
            value={step.templateId}
            onChange={(e) => onUpdate(path, { templateId: e.target.value })}
            placeholder="e.g. tpl-1"
          />
        </>
      )}

      {step.type === 'branch' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">Condition</label>
          <select
            value={step.on}
            onChange={(e) => onUpdate(path, { on: e.target.value as 'opened' | 'clicked' })}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
          </select>
          <p className="text-xs text-text-muted mt-1">
            Yes path: {step.yes.length} step{step.yes.length !== 1 ? 's' : ''} · No path: {step.no.length} step{step.no.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
