import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import { useChat } from "@/hooks/use-chat";

interface ChatSidebarProps {
  onAiEdit?: (editData: any) => void;
  onInsertContent?: (content: string) => void;
}

export default function ChatSidebar({ onAiEdit, onInsertContent }: ChatSidebarProps) {
  const { messages, sendMessage, isLoading } = useChat(onInsertContent);

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col" data-testid="chat-sidebar">
      {/* Chat Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4" data-testid="chat-header">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" data-testid="button-chat-menu">
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Chat Messages */}
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading}
        onAiEdit={(action) => {
          if (action.type === 'insert' && onInsertContent) {
            onInsertContent(action.content);
          } else {
            onAiEdit?.(action);
          }
        }}
      />

      {/* Chat Input */}
      <ChatInput onSendMessage={(message, mode) => sendMessage(message, mode)} isLoading={isLoading} />
    </div>
  );
}
