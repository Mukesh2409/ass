import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAiEdit() {
  const editText = useMutation({
    mutationFn: async ({ text, operation }: { text: string; operation: string }) => {
      const response = await apiRequest('POST', '/api/ai/edit', { text, operation });
      return response.json();
    },
  });

  const applyEdit = useMutation({
    mutationFn: async (editId: string) => {
      const response = await apiRequest('PUT', `/api/ai/edit/${editId}/apply`);
      return response.json();
    },
  });

  const rejectEdit = useMutation({
    mutationFn: async (editId: string) => {
      const response = await apiRequest('PUT', `/api/ai/edit/${editId}/reject`);
      return response.json();
    },
  });

  return {
    editText,
    applyEdit,
    rejectEdit,
  };
}

export function useSearch() {
  const [isSearching, setIsSearching] = useState(false);

  const searchWeb = async (query: string, provider = "duckduckgo") => {
    setIsSearching(true);
    try {
      const response = await apiRequest('POST', '/api/search', { query, provider });
      const results = await response.json();
      return results;
    } finally {
      setIsSearching(false);
    }
  };

  const crawlUrl = async (url: string) => {
    setIsSearching(true);
    try {
      const response = await apiRequest('POST', '/api/crawl', { url });
      const results = await response.json();
      return results;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchWeb,
    crawlUrl,
    isSearching,
  };
}

export function useAgent() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processWithAgent = async (message: string, context: any[] = []) => {
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/agent', { message, context });
      const result = await response.json();
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processWithAgent,
    isProcessing,
  };
}
