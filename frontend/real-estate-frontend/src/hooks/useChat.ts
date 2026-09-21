// src/hooks/useChat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ChatRequest, ChatResponse } from '@/types/models';

export function useChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChatRequest) => api.chat(request),
    onSuccess: (data: ChatResponse) => {
      // Optionally cache chat responses
      queryClient.setQueryData(['chat-response'], data);
    },
  });
}

export function usePricePredict() {
  return useMutation({
    mutationFn: (request: any) => api.predictPrice(request),
  });
}