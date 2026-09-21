'use client';
// src/components/ai/FloatingChat.tsx — NEW COMPONENT
// Floating mini AI agent widget — bottom-right corner — all pages
// Uses same useChat hook and handleSendMessage logic as ChatInterface.tsx

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Minimize2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage } from '@/types/models';
import ReactMarkdown from 'react-markdown';

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Ask me anything about US real estate markets.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── PRESERVED: same hook as ChatInterface.tsx ──
  const { mutate: sendChat, isPending } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // ── PRESERVED: same handleSendMessage logic as ChatInterface.tsx ──
  const handleSendMessage = (text: string) => {
    if (!text.trim() || isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    sendChat(
      {
        message: text,
        context: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: data.message,
              timestamp: new Date(),
            },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Sorry, I ran into an error. Please try again.',
              timestamp: new Date(),
            },
          ]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const quickPrompts = [
    'Hottest US markets?',
    'CA vs TX trends',
    'Best ROI states?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Chat Panel ── */}
      {open && (
        <div className="w-[340px] sm:w-[380px] bg-white border border-border rounded-2xl shadow-2xl shadow-black/15 flex flex-col overflow-hidden animate-fade-in"
          style={{ height: 480 }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display font-bold text-sm leading-tight">D.A.P.E. AI</p>
                <p className="text-[10px] text-primary-foreground/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse inline-block" />
                  Online · Groq-powered
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/30">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-white border border-border text-foreground rounded-bl-sm shadow-sm'
                  }`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="m-0 text-sm">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mt-1">{children}</ul>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                      }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts — only when 1 message (welcome) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-border bg-white shrink-0">
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => handleSendMessage(p)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-secondary text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all font-medium">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-border bg-white flex gap-2 items-center shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any market..."
              disabled={isPending}
              className="flex-1 text-sm bg-muted border border-border rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground text-foreground disabled:opacity-50 transition-colors"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isPending}
              className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-all shrink-0 shadow-sm">
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
          open
            ? 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30 hover:scale-105'
        }`}>
        {open
          ? <X className="h-5 w-5" />
          : <MessageSquare className="h-6 w-6" />}
        {/* Unread badge — always show on first open */}
        {!open && messages.length <= 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">1</span>
        )}
      </button>
    </div>
  );
}
