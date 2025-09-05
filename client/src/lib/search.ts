interface SearchResult {
  query: string;
  abstract?: string;
  abstractSource?: string;
  abstractUrl?: string;
  relatedTopics: any[];
  results: any[];
}

export class SearchClient {
  private baseUrl = 'https://api.duckduckgo.com/';

  async search(query: string): Promise<SearchResult> {
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        query,
        abstract: data.Abstract || "No summary available",
        abstractSource: data.AbstractSource || "",
        abstractUrl: data.AbstractURL || "",
        relatedTopics: data.RelatedTopics?.slice(0, 5) || [],
        results: data.Results?.slice(0, 10) || [],
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async searchAndSummarize(query: string): Promise<string> {
    const results = await this.search(query);
    
    if (results.abstract) {
      return `**Search Results for "${query}"**\n\n${results.abstract}\n\nSource: ${results.abstractSource}`;
    }

    if (results.results.length > 0) {
      const topResults = results.results.slice(0, 3).map((result, idx) => 
        `${idx + 1}. ${result.Text || 'No description available'}`
      ).join('\n');
      
      return `**Search Results for "${query}"**\n\n${topResults}`;
    }

    return `No relevant results found for "${query}".`;
  }
}

// Export a singleton instance
export const searchClient = new SearchClient();
