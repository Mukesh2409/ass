import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, X, Check } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  editData?: {
    originalText: string;
    suggestedText: string;
    operation: string;
    explanation?: string;
  };
}

export default function PreviewModal({ isOpen, onClose, onApply, editData }: PreviewModalProps) {
  if (!editData) return null;

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" data-testid="preview-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="text-primary" size={20} />
            <span>AI Edit Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[60vh] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Original Text */}
            <div>
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">Original</h4>
              <div className="bg-muted rounded-lg p-4 text-sm" data-testid="text-original">
                {editData.originalText}
              </div>
            </div>

            {/* AI Suggestion */}
            <div>
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">AI Suggestion</h4>
              <div className="bg-accent border-l-4 border-primary rounded-lg p-4 text-sm" data-testid="text-suggestion">
                {editData.suggestedText}
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          {editData.explanation && (
            <div className="p-3 bg-muted rounded-lg" data-testid="ai-explanation">
              <h5 className="font-medium text-sm mb-1">AI Analysis</h5>
              <p className="text-sm text-muted-foreground">
                {editData.explanation}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-edit"
          >
            <X size={16} className="mr-1" />
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            data-testid="button-apply-edit"
          >
            <Check size={16} className="mr-1" />
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
