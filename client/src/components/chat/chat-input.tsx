import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, MessageCircle, Search } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, mode?: 'chat' | 'search') => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<'chat' | 'search'>('chat');

  const handleSend = (sendMode?: 'chat' | 'search') => {
    if (message.trim() && !isLoading) {
      onSendMessage(message, sendMode || mode);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border" data-testid="chat-input">
      <div className="space-y-2">
        {/* Mode Toggle */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={mode === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('chat')}
            className="flex-1 flex items-center space-x-1"
            data-testid="button-mode-chat"
          >
            <MessageCircle size={12} />
            <span>AI Chat</span>
          </Button>
          <Button
            variant={mode === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('search')}
            className="flex-1 flex items-center space-x-1"
            data-testid="button-mode-search"
          >
            <Search size={12} />
            <span>Web Search</span>
          </Button>
        </div>
        
        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={mode === 'chat' ? "Ask AI anything..." : "Search and insert into document..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button 
            onClick={() => handleSend()}
            disabled={!message.trim() || isLoading}
            data-testid="button-send-message"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" data-testid="button-attach">
            <Paperclip size={12} />
          </Button>
          <Button variant="ghost" size="sm" data-testid="button-voice">
            <Mic size={12} />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground" data-testid="text-token-count">
          Tokens: 0/2000
        </div>
      </div>
    </div>
  );
}
