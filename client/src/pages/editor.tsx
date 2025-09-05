import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Edit, UserCircle, Share, MoreHorizontal } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import TiptapEditor from "@/components/editor/tiptap-editor";
import FloatingToolbar from "@/components/editor/floating-toolbar";
import ChatSidebar from "@/components/chat/chat-sidebar";
import PreviewModal from "@/components/modals/preview-modal";
import SearchModal from "@/components/modals/search-modal";
import { useEditor } from "@/hooks/use-editor";
import { useAiEdit } from "@/hooks/use-ai";

export default function EditorPage() {
  const { theme, setTheme } = useTheme();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentAiEdit, setCurrentAiEdit] = useState<any>(null);
  
  const { document, updateDocument } = useEditor();
  const { editText } = useAiEdit();
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const handleInsertContent = (content: string) => {
    if (editorInstance) {
      // Insert content at current cursor position
      editorInstance.chain().focus().insertContent(`\n\n${content}\n\n`).run();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleTextSelection = (text: string, range: { from: number; to: number }, position: { x: number; y: number }) => {
    setSelectedText(text);
    setSelectionRange(range);
    setFloatingToolbarPosition(position);
  };

  const handleClearSelection = () => {
    setSelectedText("");
    setSelectionRange(null);
    setFloatingToolbarPosition(null);
  };

  const handlePreviewEdit = async (operation: string) => {
    if (!selectedText) return;
    
    try {
      const result = await editText.mutateAsync({ text: selectedText, operation });
      setCurrentAiEdit(result);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Failed to get AI edit:', error);
    }
  };

  const handleApplyEdit = () => {
    if (currentAiEdit && selectionRange && editorInstance) {
      // Replace the selected text with the AI suggestion
      editorInstance.chain()
        .focus()
        .setTextSelection({ from: selectionRange.from, to: selectionRange.to })
        .insertContent(currentAiEdit.suggestedText)
        .run();
      
      setShowPreviewModal(false);
      handleClearSelection();
      setCurrentAiEdit(null);
    }
  };

  const handleOpenSearch = () => {
    setShowSearchModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" data-testid="editor-page">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4" data-testid="header">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Edit className="text-primary-foreground" size={16} />
            </div>
            <h1 className="font-semibold text-lg" data-testid="title">AI Collaborative Editor</h1>
          </div>
          <div className="text-sm text-muted-foreground" data-testid="document-status">
            <span>{document?.title || "Document"}</span> • <span className="text-green-500">Saved</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button variant="ghost" size="sm" data-testid="button-user-menu">
            <UserCircle size={16} />
          </Button>
          <Button size="sm" data-testid="button-share">
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-border bg-card flex items-center px-4 justify-between" data-testid="editor-toolbar">
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" data-testid="button-bold">
                <span className="font-bold">B</span>
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-italic">
                <span className="italic">I</span>
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-underline">
                <span className="underline">U</span>
              </Button>
              <div className="w-px h-6 bg-border mx-2"></div>
              <Button variant="ghost" size="sm" data-testid="button-bullet-list">
                •
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-numbered-list">
                1.
              </Button>
              <div className="w-px h-6 bg-border mx-2"></div>
              <Button variant="ghost" size="sm" data-testid="button-link">
                🔗
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-image">
                🖼️
              </Button>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={handleOpenSearch}
              data-testid="button-ai-search"
            >
              <span>🤖</span>
              <span>AI Search</span>
            </Button>
          </div>

          {/* Editor Content */}
          <div className="flex-1 p-8 overflow-auto bg-background" data-testid="editor-container">
            <div className="max-w-4xl mx-auto">
              <TiptapEditor
                onTextSelection={handleTextSelection}
                onClearSelection={handleClearSelection}
                content={document?.content}
                onContentChange={(content) => updateDocument.mutate(content)}
                onEditorReady={setEditorInstance}
              />
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar onAiEdit={handlePreviewEdit} onInsertContent={handleInsertContent} />
      </div>

      {/* Floating Toolbar */}
      {floatingToolbarPosition && selectedText && (
        <FloatingToolbar
          position={floatingToolbarPosition}
          selectedText={selectedText}
          onEdit={handlePreviewEdit}
        />
      )}

      {/* Modals */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onApply={handleApplyEdit}
        editData={currentAiEdit}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
}
