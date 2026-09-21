// src/app/ai-chat/page.tsx
'use client';

import { ChatInterface } from '@/components/ai/ChatInterface';

export default function AIChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatInterface />
    </div>
  );
}