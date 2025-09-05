import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Search, Globe, Sparkles, Brain } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onAiEdit?: (editData: any) => void;
}

export default function ChatMessages({ messages, isLoading, onAiEdit }: ChatMessagesProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ScrollArea className="flex-1 p-4" data-testid="chat-messages">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="chat-message" data-testid={`message-${message.id}`}>
            {message.role === 'assistant' ? (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-primary-foreground" size={12} />
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    {/* Agent tool usage indicators */}
                    {message.metadata && 
                     typeof message.metadata === 'object' && 
                     message.metadata !== null && 
                     'isAgent' in message.metadata && 
                     (message.metadata as Record<string, any>).isAgent && (
                      <div className="mb-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Brain size={14} className="text-blue-500" />
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">AI Agent</span>
                        </div>
                        {(message.metadata as Record<string, any>).toolsUsed && 
                         Array.isArray((message.metadata as Record<string, any>).toolsUsed) && 
                         (message.metadata as Record<string, any>).toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {((message.metadata as Record<string, any>).toolsUsed as Array<{tool: string; query?: string}>).map((tool, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs flex items-center gap-1"
                              >
                                {tool.tool === 'web_search' ? (
                                  <Search size={10} />
                                ) : tool.tool === 'web_crawl' ? (
                                  <Globe size={10} />
                                ) : (
                                  <Sparkles size={10} />
                                )}
                                <span>{tool.tool === 'web_search' ? 'Search' : tool.tool === 'web_crawl' ? 'Crawl' : tool.tool}</span>
                                {tool.query && <span className="opacity-70">: {tool.query}</span>}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show thinking indicator */}
                    {message.metadata && 
                     typeof message.metadata === 'object' && 
                     message.metadata !== null &&
                     'isThinking' in message.metadata && 
                     (message.metadata as Record<string, any>).isThinking && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Brain size={14} className="animate-pulse" />
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.metadata && 
                     typeof message.metadata === 'object' && 
                     message.metadata !== null &&
                     'actions' in message.metadata && 
                     Array.isArray((message.metadata as Record<string, any>).actions) && (
                      <div className="mt-2 space-y-1">
                        {((message.metadata as Record<string, any>).actions as Array<{label: string; type: string; content?: string}>).map((action, idx) => (
                          <Button
                            key={idx}
                            variant="secondary"
                            size="sm"
                            className="block w-full text-left text-xs"
                            onClick={() => onAiEdit?.(action)}
                            data-testid={`button-action-${idx}`}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2 justify-end">
                <div className="flex-1">
                  <div className="bg-primary rounded-lg p-3 ml-8">
                    <p className="text-sm text-primary-foreground whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-accent-foreground" size={12} />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="chat-message opacity-60">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-primary-foreground" size={12} />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1 typing-indicator">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
