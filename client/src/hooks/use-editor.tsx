import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Document } from "@shared/schema";

export function useEditor() {
  const queryClient = useQueryClient();

  const { data: document, isLoading } = useQuery<Document>({
    queryKey: ['/api/document'],
    staleTime: 30000, // Cache for 30 seconds
  });

  const updateDocument = useMutation({
    mutationFn: async (content: any) => {
      const response = await apiRequest('PUT', '/api/document', { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document'] });
    },
  });

  return {
    document,
    isLoading,
    updateDocument,
  };
}
