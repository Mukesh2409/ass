import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export function useChat(onInsertContent?: (content: string) => void) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages'],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const addMessage = useMutation({
    mutationFn: async (message: { content: string; role: string; metadata?: any }) => {
      const response = await apiRequest('POST', '/api/chat/messages', message);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
    },
  });

  const sendAiMessage = useMutation({
    mutationFn: async ({ message, context = [] }: { message: string; context?: any[] }) => {
      const response = await apiRequest('POST', '/api/ai/chat', { message, context });
      return response.json();
    },
    onSuccess: (data) => {
      // Add AI response to chat with potential actions
      addMessage.mutate({
        content: data.reply,
        role: 'assistant',
        metadata: { 
          usage: data.usage,
          actions: data.actions
        }
      });
    },
  });


  const sendMessage = async (content: string, mode: 'chat' | 'search' = 'chat') => {
    if (!content.trim()) return;

    setIsLoading(true);
    
    try {
      // Add user message first
      await addMessage.mutateAsync({
        content,
        role: 'user'
      });

      if (mode === 'search' && onInsertContent) {
        // Handle search and insert workflow
        await handleSearchAndInsert(content);
      } else {
        // Regular chat workflow
        const context = messages.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        await sendAiMessage.mutateAsync({ message: content, context });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage.mutate({
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        role: 'assistant'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAndInsert = async (userQuery: string) => {
    try {
      // Extract search query from user message
      const searchQuery = extractSearchQuery(userQuery);
      
      // Add working message
      addMessage.mutate({
        content: `🔍 Searching for: "${searchQuery}"...`,
        role: 'assistant'
      });

      // Perform web search
      const searchResponse = await apiRequest('POST', '/api/search', { query: searchQuery });
      const searchResults = await searchResponse.json();

      // Create content to insert from search results
      let contentToInsert = `# ${searchQuery}\n\n`;
      
      if (searchResults.abstract && searchResults.abstract !== "No summary available") {
        contentToInsert += `${searchResults.abstract}\n\n`;
        if (searchResults.abstractSource) {
          contentToInsert += `*Source: ${searchResults.abstractSource}*\n\n`;
        }
      }
      
      if (searchResults.results && searchResults.results.length > 0) {
        contentToInsert += `## Key Information:\n\n`;
        searchResults.results.slice(0, 3).forEach((result: any, index: number) => {
          if (result.Text || result.Result) {
            contentToInsert += `${index + 1}. ${result.Text || result.Result}\n\n`;
          }
        });
      }
      
      if (searchResults.relatedTopics && searchResults.relatedTopics.length > 0) {
        contentToInsert += `## Related Topics:\n\n`;
        searchResults.relatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
          if (topic.Text) {
            contentToInsert += `- ${topic.Text}\n`;
          }
        });
      }

      // Insert content into editor
      if (onInsertContent && contentToInsert.trim()) {
        onInsertContent(contentToInsert.trim());
      }

      // Add success message
      addMessage.mutate({
        content: `✅ Found information about "${searchQuery}" and inserted it into your document!`,
        role: 'assistant'
      });

    } catch (error) {
      console.error('Search and insert failed:', error);
      addMessage.mutate({
        content: "I'm sorry, I couldn't complete the search and insert request. Please try again.",
        role: 'assistant'
      });
    }
  };

  const extractSearchQuery = (userMessage: string): string => {
    // Look for content between quotes first
    const quotedMatch = userMessage.match(/["'](.*?)["']/); 
    if (quotedMatch) return quotedMatch[1];
    
    // Look for patterns like "find X", "get X", etc.
    const patterns = [
      /(?:find|get|search for)\s+(?:the\s+)?(?:latest\s+)?(.*?)(?:\s+(?:and\s+)?(?:insert|add)(?:\s+(?:into|to)\s+(?:editor|document))?)?$/i,
      /(?:news|information|details)\s+(?:about|on|for)\s+(.*?)(?:\s+(?:and\s+)?(?:insert|add))?$/i
    ];
    
    for (const pattern of patterns) {
      const match = userMessage.match(pattern);
      if (match && match[1].trim()) {
        return match[1].trim();
      }
    }
    
    // Simple fallback - just remove action words at start/end, keep the main content
    let query = userMessage.replace(/^(?:find|get|search for)\s+/i, '');
    query = query.replace(/\s+(?:and\s+)?(?:insert|add)(?:\s+(?:into|to)\s+(?:editor|document))?$/i, '');
    
    return query.trim() || userMessage.trim();
  };

  return {
    messages,
    sendMessage,
    isLoading,
    addMessage: addMessage.mutate,
  };
}
