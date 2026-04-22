import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'How do I set up a product tour?',
  'What annotations are most effective?',
  'Show me engagement best practices',
];

const MOCK_RESPONSES: Record<string, string> = {
  default:
    "Great question! I can help you with that. Based on your current setup, I'd recommend checking the Knowledge Base for relevant articles, and then configuring your instructions under the Setup page. Want me to walk you through it step by step?",
  tour:
    "To set up a product tour, head to **Engagements → Tours** and click 'Create Tour'. You can target specific pages, define step sequences, and set audience rules. I'd suggest starting with your onboarding flow — that typically sees the highest completion rates.",
  annotation:
    'Annotations that highlight **key actions** (like "Click here to invite your team") outperform generic tooltips by 3×. Use contextual triggers — show them when users land on a page for the first time, not on every visit.',
  engagement:
    "Here are some best practices:\n\n• **Keep tours under 5 steps** — completion drops 40% after step 5\n• **Use nudges sparingly** — 1-2 per session max\n• **Collect feedback early** — micro-surveys after key milestones convert well\n• **A/B test messaging** — small copy changes can lift engagement 20%+",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('tour')) return MOCK_RESPONSES.tour;
  if (lower.includes('annotation') || lower.includes('tooltip'))
    return MOCK_RESPONSES.annotation;
  if (lower.includes('engagement') || lower.includes('best practice'))
    return MOCK_RESPONSES.engagement;
  return MOCK_RESPONSES.default;
}

export function AskAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: getResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-orbital-primary hover:bg-orbital-primary-hover text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-orbital-primary/25 transition-colors"
          >
            <Bot size={18} />
            <span className="font-medium text-sm">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[540px] bg-white rounded-2xl shadow-2xl border border-orbital-border-light flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-orbital-primary text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">Ask AI</div>
                  <div className="text-[11px] text-white/70">AI Assistant</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && !typing && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-orbital-primary/10 flex items-center justify-center mb-4">
                    <Bot size={22} className="text-orbital-primary" />
                  </div>
                  <p className="text-sm font-semibold text-orbital-text-dark mb-1">
                    Hi! I'm your AI assistant.
                  </p>
                  <p className="text-xs text-orbital-text-muted mb-5">
                    Ask me anything about your product adoption setup, engagement strategies, or
                    how to get the most out of Orbital.
                  </p>
                  <div className="w-full space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-lg border border-orbital-border-light hover:border-orbital-primary/40 hover:bg-orbital-primary/5 text-orbital-text-dark transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-orbital-primary text-white rounded-br-md'
                        : 'bg-slate-100 text-orbital-text-dark rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-orbital-border-light">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI anything..."
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-orbital-border-light focus:outline-none focus:ring-2 focus:ring-orbital-primary/30 focus:border-orbital-primary placeholder:text-orbital-text-muted"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="p-2.5 rounded-xl bg-orbital-primary text-white hover:bg-orbital-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
