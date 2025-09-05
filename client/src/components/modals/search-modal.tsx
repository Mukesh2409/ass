import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, CheckCircle, Loader2, X } from "lucide-react";
import { useSearch } from "@/hooks/use-ai";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { searchWeb, isSearching } = useSearch();
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      const results = await searchWeb(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClose = () => {
    setQuery("");
    setSearchResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="search-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="text-primary animate-pulse" size={20} />
            <span>AI Agent Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search for information to add to your document..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className="flex-1"
              data-testid="input-search-query"
            />
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              data-testid="button-search"
            >
              {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            </Button>
          </div>

          {/* Search Progress */}
          {isSearching && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={10} />
                </div>
                <span className="text-sm">Searching for "{query}"...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Analyzing search results...</span>
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-4 h-4 bg-muted rounded-full"></div>
                <span className="text-sm">Generating summary...</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults && !isSearching && (
            <div className="space-y-4" data-testid="search-results">
              {searchResults.abstract && (
                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Summary</h4>
                  <p className="text-sm">{searchResults.abstract}</p>
                  {searchResults.abstractSource && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {searchResults.abstractSource}
                    </p>
                  )}
                </div>
              )}

              {searchResults.results && searchResults.results.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Found Sources:</h4>
                  <div className="space-y-2">
                    {searchResults.results.slice(0, 5).map((result: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm" data-testid={`search-result-${idx}`}>
                        <Globe className="text-muted-foreground" size={12} />
                        <span>{result.FirstURL || result.Text || `Search result ${idx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Insert search results into editor
                    // This would be implemented with the editor instance
                    handleClose();
                  }}
                  data-testid="button-insert-results"
                >
                  Insert Summary
                </Button>
                <Button variant="outline" onClick={handleClose} data-testid="button-close-search">
                  <X size={16} className="mr-1" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
