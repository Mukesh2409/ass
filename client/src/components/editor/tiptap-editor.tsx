import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface TiptapEditorProps {
  content?: any;
  onTextSelection: (text: string, range: { from: number; to: number }, position: { x: number; y: number }) => void;
  onClearSelection: () => void;
  onContentChange: (content: any) => void;
  onEditorReady?: (editor: any) => void;
}

export default function TiptapEditor({ 
  content, 
  onTextSelection, 
  onClearSelection,
  onContentChange,
  onEditorReady
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your document...",
      }),
    ],
    content: content || {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Welcome to AI Collaborative Editor" }]
        },
        {
          type: "paragraph",
          content: [{ 
            type: "text", 
            text: "Start typing to begin your document. Select any text to see AI-powered editing options, or use the chat sidebar to get writing assistance." 
          }]
        }
      ]
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onContentChange(json);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      
      if (from === to) {
        onClearSelection();
        return;
      }

      const text = editor.state.doc.textBetween(from, to, " ");
      
      if (text.trim().length === 0) {
        onClearSelection();
        return;
      }

      // Get the DOM position for the floating toolbar
      const element = editor.view.dom;
      const rect = element.getBoundingClientRect();
      const coords = editor.view.coordsAtPos(from);
      
      const position = {
        x: coords.left,
        y: coords.top - 60 // Position above the selection
      };

      onTextSelection(text, { from, to }, position);
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return (
      <div className="editor-content bg-card border border-border rounded-lg p-8 shadow-sm animate-pulse">
        <div className="h-8 bg-muted rounded mb-6"></div>
        <div className="h-4 bg-muted rounded mb-4"></div>
        <div className="h-4 bg-muted rounded mb-4"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div 
      className="editor-content bg-card border border-border rounded-lg shadow-sm tiptap-focused"
      data-testid="tiptap-editor"
    >
      <EditorContent 
        editor={editor}
        className="prose prose-neutral dark:prose-invert max-w-none"
      />
    </div>
  );
}
