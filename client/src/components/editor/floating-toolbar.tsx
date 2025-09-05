import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Combine, ExpandIcon, Table, Sparkles } from "lucide-react";

interface FloatingToolbarProps {
  position: { x: number; y: number };
  selectedText: string;
  onEdit: (operation: string) => void;
}

export default function FloatingToolbar({ position, selectedText, onEdit }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const handleEdit = (operation: string) => {
    onEdit(operation);
  };

  useEffect(() => {
    // Simple positioning - just center horizontally and position above/below selection
    const gap = 12;
    const x = position.x;
    const y = position.y - 50; // Fixed distance above selection
    
    setAdjustedPosition({ x, y });
  }, [position]);

  return (
    <div 
      ref={toolbarRef}
      className="floating-toolbar fixed z-50 bg-card border border-border rounded-lg p-2 shadow-lg backdrop-blur-sm"
      style={{ 
        left: '50%',
        top: `${adjustedPosition.y}px`,
        transform: 'translateX(-50%)',
        minWidth: 'max-content',
        maxWidth: '90vw'
      }}
      data-testid="floating-toolbar"
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit('shorten')}
          className="flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 h-7 flex-shrink-0"
          data-testid="button-shorten"
        >
          <Combine size={12} />
          <span>Shorten</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit('lengthen')}
          className="flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 h-7 flex-shrink-0"
          data-testid="button-lengthen"
        >
          <ExpandIcon size={12} />
          <span>Lengthen</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit('table')}
          className="flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 h-7 flex-shrink-0"
          data-testid="button-to-table"
        >
          <Table size={12} />
          <span>To Table</span>
        </Button>
        
        <div className="w-px h-4 bg-border flex-shrink-0"></div>
        
        <Button
          onClick={() => handleEdit('edit')}
          size="sm"
          className="flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 h-7 flex-shrink-0"
          data-testid="button-edit-ai"
        >
          <Sparkles size={12} />
          <span>Edit with AI</span>
        </Button>
      </div>
    </div>
  );
}
