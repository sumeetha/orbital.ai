import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, FileText, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Badge } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { useStore } from '../../store';
import { conversationScript, topicOrder, topicLabels, type AgentMessage } from '../../mock/conversations';

export function SetupPage() {
  const navigate = useNavigate();
  const { completedTopics, confirmTopic, completeSetup } = useStore();
  const [visibleMessages, setVisibleMessages] = useState<AgentMessage[]>([]);
  const [confirmedCards, setConfirmedCards] = useState<Set<string>>(new Set());
  const [selectedQuickReplies, setSelectedQuickReplies] = useState<Record<string, Set<string>>>({});
  const [customEntries, setCustomEntries] = useState<Record<string, string[]>>({});
  const [customInputValue, setCustomInputValue] = useState<Record<string, string>>({});
  const [chipEdits, setChipEdits] = useState<Record<string, string[]>>({});
  const [chipInputValue, setChipInputValue] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [pendingIndex, setPendingIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const showNextBatch = useCallback((startIndex: number) => {
    if (startIndex >= conversationScript.length) return;

    let i = startIndex;
    const showWithDelay = () => {
      if (i >= conversationScript.length) return;
      const msg = conversationScript[i];

      setIsTyping(true);
      timerRef.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) => [...prev, msg]);
        scrollToBottom();
        i++;

        const isBlocking = msg.type === 'prefill-card' || msg.type === 'quick-reply' || msg.type === 'completion';
        if (isBlocking) {
          setPendingIndex(i);
        } else {
          showWithDelay();
        }
      }, 700);
    };
    showWithDelay();
  }, [scrollToBottom]);

  useEffect(() => {
    showNextBatch(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Initialize chip edits from prefill data when a card appears
  const getChipsForField = (msgId: string, fieldKey: string, defaultValue: string): string[] => {
    const key = `${msgId}:${fieldKey}`;
    if (chipEdits[key]) return chipEdits[key];
    return defaultValue.split(', ').map((s) => s.trim()).filter(Boolean);
  };

  const addChip = (msgId: string, fieldKey: string, defaultValue: string) => {
    const key = `${msgId}:${fieldKey}`;
    const inputVal = chipInputValue[key]?.trim();
    if (!inputVal) return;
    const current = getChipsForField(msgId, fieldKey, defaultValue);
    if (!current.includes(inputVal)) {
      setChipEdits((prev) => ({ ...prev, [key]: [...current, inputVal] }));
    }
    setChipInputValue((prev) => ({ ...prev, [key]: '' }));
  };

  const removeChip = (msgId: string, fieldKey: string, defaultValue: string, chip: string) => {
    const key = `${msgId}:${fieldKey}`;
    const current = getChipsForField(msgId, fieldKey, defaultValue);
    setChipEdits((prev) => ({ ...prev, [key]: current.filter((c) => c !== chip) }));
  };

  const handleConfirmCard = (msg: AgentMessage) => {
    setConfirmedCards((prev) => new Set([...prev, msg.id]));
    if (msg.topic !== 'intro' && msg.topic !== 'complete') confirmTopic(msg.topic);
    showNextBatch(pendingIndex);
  };

  const handleQuickReply = (msgId: string, value: string) => {
    setSelectedQuickReplies((prev) => {
      const current = prev[msgId] || new Set();
      const updated = new Set(current);
      if (updated.has(value)) updated.delete(value);
      else updated.add(value);
      return { ...prev, [msgId]: updated };
    });
  };

  const handleAddCustomEntry = (msgId: string) => {
    const value = customInputValue[msgId]?.trim();
    if (!value) return;
    setCustomEntries((prev) => ({
      ...prev,
      [msgId]: [...(prev[msgId] || []), value],
    }));
    setSelectedQuickReplies((prev) => {
      const current = prev[msgId] || new Set();
      const updated = new Set(current);
      updated.add(value);
      return { ...prev, [msgId]: updated };
    });
    setCustomInputValue((prev) => ({ ...prev, [msgId]: '' }));
  };

  const handleConfirmQuickReply = (msg: AgentMessage) => {
    setConfirmedCards((prev) => new Set([...prev, msg.id]));
    if (msg.topic !== 'intro' && msg.topic !== 'complete') confirmTopic(msg.topic);
    showNextBatch(pendingIndex);
  };

  const handleComplete = () => {
    completeSetup();
    navigate('/suggestions');
  };

  const handleTopicClick = (topic: string) => {
    const firstMsg = visibleMessages.find(
      (m) => m.topic === topic && m.type === 'agent' && !m.isFollowUp
    );
    if (firstMsg) {
      const el = document.getElementById(`msg-${firstMsg.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeTopic = (() => {
    const relevant = visibleMessages.filter((m) => m.topic !== 'intro' && m.topic !== 'complete');
    return relevant.at(-1)?.topic || topicOrder[0];
  })();

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <PageHeader title="Instructions" subtitle="Define your product goals, activation points, and key metrics" />

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar: Topic Progress */}
        <div className="w-56 shrink-0">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-orbital-text-muted uppercase tracking-wide mb-3">Topics</h3>
            <div className="space-y-1">
              {topicOrder.map((topic) => {
                const isComplete = completedTopics.includes(topic);
                const isActive = activeTopic === topic;
                const hasAppeared = visibleMessages.some((m) => m.topic === topic);
                return (
                  <button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    disabled={!hasAppeared}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      isComplete
                        ? 'text-orbital-success hover:bg-emerald-50/50 cursor-pointer'
                        : isActive
                          ? 'bg-orbital-primary/5 text-orbital-text-dark font-medium cursor-pointer'
                          : hasAppeared
                            ? 'text-orbital-text-muted hover:bg-slate-50 cursor-pointer'
                            : 'text-orbital-text-muted/50 cursor-default'
                    }`}
                  >
                    {isComplete ? (
                      <div className="w-5 h-5 rounded-full bg-orbital-success flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${isActive ? 'border-orbital-primary' : 'border-slate-200'}`} />
                    )}
                    {topicLabels[topic]}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {visibleMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    {/* Agent text message */}
                    {msg.type === 'agent' && (
                      <div className="flex gap-3 max-w-2xl">
                        <div className="w-8 h-8 rounded-full bg-orbital-primary flex items-center justify-center shrink-0">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-orbital-text-dark">
                          {msg.content}
                        </div>
                      </div>
                    )}

                    {/* Pre-fill card */}
                    {msg.type === 'prefill-card' && (
                      <div className="ml-11 max-w-xl">
                        <div className="bg-white border border-orbital-border-light rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-medium text-orbital-primary flex items-center gap-1">
                              <Sparkles size={10} /> AI Pre-filled
                            </div>
                            {confirmedCards.has(msg.id) && <Badge color="green">Confirmed</Badge>}
                          </div>
                          <div className="space-y-3">
                            {msg.prefillFields?.map((field) => {
                              const chipKey = `${msg.id}:${field.key}`;
                              const isConfirmed = confirmedCards.has(msg.id);

                              return (
                                <div key={field.key}>
                                  <label className="text-xs font-medium text-orbital-text-muted">{field.label}</label>
                                  {isConfirmed ? (
                                    <p className="text-sm mt-0.5">
                                      {field.type === 'chips'
                                        ? (chipEdits[chipKey] || field.value.split(', ')).join(', ')
                                        : field.value}
                                    </p>
                                  ) : field.type === 'chips' ? (
                                    <div className="mt-1.5">
                                      <div className="flex flex-wrap gap-1.5">
                                        {getChipsForField(msg.id, field.key, field.value).map((chip) => (
                                          <span
                                            key={chip}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-orbital-primary/10 text-orbital-primary"
                                          >
                                            {chip}
                                            <button
                                              onClick={() => removeChip(msg.id, field.key, field.value, chip)}
                                              className="hover:text-orbital-danger"
                                            >
                                              <X size={11} />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                        <Input
                                          placeholder="Add your own..."
                                          className="text-xs"
                                          value={chipInputValue[chipKey] || ''}
                                          onChange={(e) => setChipInputValue((prev) => ({ ...prev, [chipKey]: e.target.value }))}
                                          onKeyDown={(e) => e.key === 'Enter' && addChip(msg.id, field.key, field.value)}
                                        />
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => addChip(msg.id, field.key, field.value)}
                                          disabled={!chipInputValue[chipKey]?.trim()}
                                        >
                                          <Plus size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : field.type === 'textarea' ? (
                                    <textarea
                                      className="w-full mt-1 px-3 py-2 text-sm border border-orbital-border-light rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orbital-primary/30"
                                      rows={2}
                                      defaultValue={field.value}
                                    />
                                  ) : (
                                    <Input className="mt-1" defaultValue={field.value} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {msg.sourceAttribution && (
                            <div className="flex items-center gap-1 mt-3 text-[10px] text-orbital-text-muted">
                              <FileText size={10} /> {msg.sourceAttribution}
                            </div>
                          )}
                          {!confirmedCards.has(msg.id) && (
                            <Button size="sm" className="mt-3" onClick={() => handleConfirmCard(msg)}>
                              <Check size={14} /> Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick replies */}
                    {msg.type === 'quick-reply' && (
                      <div className="ml-11 max-w-xl">
                        {msg.content && <p className="text-xs text-orbital-text-muted mb-2">{msg.content}</p>}
                        <div className="flex flex-wrap gap-2">
                          {msg.quickReplies?.map((qr) => {
                            const selected = selectedQuickReplies[msg.id]?.has(qr.value);
                            const isConfirmed = confirmedCards.has(msg.id);
                            return (
                              <button
                                key={qr.value}
                                onClick={() => !isConfirmed && handleQuickReply(msg.id, qr.value)}
                                disabled={isConfirmed}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                  selected
                                    ? 'bg-orbital-primary text-white border-orbital-primary'
                                    : isConfirmed
                                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                                      : 'bg-white text-orbital-text-dark border-orbital-border-light hover:border-orbital-primary'
                                }`}
                              >
                                {selected && <Check size={12} className="inline mr-1" />}
                                {qr.label}
                              </button>
                            );
                          })}
                          {(customEntries[msg.id] || []).map((entry) => {
                            const isConfirmed = confirmedCards.has(msg.id);
                            return (
                              <span
                                key={entry}
                                className={`px-3 py-1.5 text-sm rounded-full border ${
                                  isConfirmed
                                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                                    : 'bg-orbital-primary text-white border-orbital-primary'
                                }`}
                              >
                                <Check size={12} className="inline mr-1" />
                                {entry}
                              </span>
                            );
                          })}
                        </div>
                        {!confirmedCards.has(msg.id) && (
                          <div className="flex gap-2 mt-3">
                            <Input
                              placeholder="Type your own and press Enter..."
                              value={customInputValue[msg.id] || ''}
                              onChange={(e) => setCustomInputValue((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomEntry(msg.id)}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAddCustomEntry(msg.id)}
                              disabled={!customInputValue[msg.id]?.trim()}
                            >
                              <Plus size={14} /> Add
                            </Button>
                          </div>
                        )}
                        {!confirmedCards.has(msg.id) && ((selectedQuickReplies[msg.id]?.size ?? 0) > 0) && (
                          <Button size="sm" className="mt-3" onClick={() => handleConfirmQuickReply(msg)}>
                            Continue <ArrowRight size={14} />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Completion CTA */}
                    {msg.type === 'completion' && (
                      <div className="ml-11">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                          <Button size="lg" onClick={handleComplete} className="shadow-lg shadow-orbital-primary/20">
                            <Sparkles size={16} /> {msg.content} <ArrowRight size={16} />
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <div className="flex gap-3 max-w-2xl">
                  <div className="w-8 h-8 rounded-full bg-orbital-primary flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div className="w-2 h-2 rounded-full bg-slate-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-slate-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-slate-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
