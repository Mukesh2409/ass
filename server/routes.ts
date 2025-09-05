import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertDocumentSchema, insertAiEditSchema } from "@shared/schema";

// Helper functions for enhanced Agent system

async function searchWithDuckDuckGo(query: string) {
  const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
  
  if (!searchResponse.ok) {
    throw new Error(`DuckDuckGo API error: ${searchResponse.statusText}`);
  }

  const searchData = await searchResponse.json();
  
  return {
    provider: 'duckduckgo',
    query,
    abstract: searchData.Abstract || "No summary available",
    abstractSource: searchData.AbstractSource || "",
    abstractUrl: searchData.AbstractURL || "",
    relatedTopics: searchData.RelatedTopics?.slice(0, 5) || [],
    results: searchData.Results?.slice(0, 10) || [],
  };
}

async function searchWithTavily(query: string) {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    throw new Error("Tavily API key not configured");
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tavilyApiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      include_answer: true,
      include_images: false,
      include_raw_content: false,
      max_results: 10
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    provider: 'tavily',
    query,
    answer: data.answer || "",
    results: data.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score
    })) || [],
  };
}

async function searchWithSerper(query: string) {
  const serperApiKey = process.env.SERPER_API_KEY;
  if (!serperApiKey) {
    throw new Error("Serper API key not configured");
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: 10
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    provider: 'serper',
    query,
    knowledgeGraph: data.knowledgeGraph || null,
    answerBox: data.answerBox || null,
    results: data.organic?.map((r: any) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
      position: r.position
    })) || [],
  };
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : "No title found";
}

async function crawlUrl(url: string) {
  const crawlResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AI Assistant Bot)'
    }
  });
  
  if (!crawlResponse.ok) {
    throw new Error(`Failed to fetch URL: ${crawlResponse.statusText}`);
  }

  const html = await crawlResponse.text();
  
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);

  return {
    url,
    title: extractTitle(html),
    content: textContent,
    timestamp: new Date().toISOString()
  };
}

async function analyzeToolNeed(message: string, apiKey: string) {
  const analysisPrompt = `
Analyze the following user message and determine what tools the AI agent should use to provide the best response.

Message: "${message}"

Based on this message, determine:
1. Does it need web search? (true/false)
2. If search is needed, what should be the search query?
3. Does it need to crawl a specific URL? (true/false)
4. If crawling is needed, what URL?
5. Brief reasoning for tool selection

Respond in valid JSON format:
{
  "needsSearch": boolean,
  "searchQuery": "string or null",
  "needsCrawl": boolean, 
  "urlToCrawl": "string or null",
  "reasoning": "brief explanation"
}
`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing user requests and determining what tools an AI agent should use. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  const aiResponse = await response.json();
  const analysisText = aiResponse.choices[0]?.message?.content || '{}';
  
  try {
    return JSON.parse(analysisText);
  } catch (error) {
    return {
      needsSearch: false,
      searchQuery: null,
      needsCrawl: false,
      urlToCrawl: null,
      reasoning: "Failed to analyze tool requirements"
    };
  }
}

async function generateAgentResponse(message: string, context: any[], toolResults: any[], apiKey: string) {
  let systemPrompt = `You are an intelligent AI agent with access to web search and crawling tools. You have just used tools to gather information and should now provide a comprehensive response.

Tools used and results:
${toolResults.map(t => `
Tool: ${t.tool}
${t.query ? `Query: ${t.query}` : `URL: ${t.url}`}
Result: ${JSON.stringify(t.result, null, 2)}
`).join('\n')}

Provide a helpful response that incorporates the tool results. Be specific and cite sources when possible.`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...context,
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const aiResponse = await response.json();
  
  return {
    reply: aiResponse.choices[0]?.message?.content || "I apologize, I couldn't generate a proper response.",
    usage: aiResponse.usage
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoints
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const result = insertChatMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid message data", details: result.error });
      }
      
      const message = await storage.addChatMessage(result.data);
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to add chat message" });
    }
  });

  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatHistory();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  // AI chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Make request to Mistral AI
      const mistralApiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
      if (!mistralApiKey) {
        return res.status(500).json({ error: "Mistral AI API key not configured" });
      }

      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI writing assistant integrated into a collaborative text editor. You can help users edit text, improve grammar, provide writing suggestions, and search for information. Be concise and helpful in your responses.'
            },
            ...context,
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!mistralResponse.ok) {
        throw new Error(`Mistral AI API error: ${mistralResponse.statusText}`);
      }

      const aiResponse = await mistralResponse.json();
      const reply = aiResponse.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

      // Check if the response contains actionable content that could be applied to editor
      const actions = [];
      
      // Detect if AI is providing content that could be inserted
      if (message.toLowerCase().includes('write') || 
          message.toLowerCase().includes('create') ||
          message.toLowerCase().includes('generate') ||
          reply.includes('Here\'s') ||
          reply.includes('Here is')) {
        
        // Extract potential content to insert (simple heuristic)
        const lines = reply.split('\n');
        const contentLines = lines.filter((line: string) => 
          line.trim() && 
          !line.startsWith('Here') && 
          !line.startsWith('I') &&
          !line.startsWith('This') &&
          line.length > 20
        );
        
        if (contentLines.length > 0) {
          const contentToInsert = contentLines.join('\n').trim();
          if (contentToInsert.length > 50) {
            actions.push({
              label: "📝 Insert into Document",
              type: "insert",
              content: contentToInsert
            });
          }
        }
      }

      res.json({ 
        reply, 
        usage: aiResponse.usage,
        actions: actions.length > 0 ? actions : undefined
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // AI text editing endpoint
  app.post("/api/ai/edit", async (req, res) => {
    try {
      const { text, operation } = req.body;
      
      if (!text || !operation) {
        return res.status(400).json({ error: "Text and operation are required" });
      }

      const mistralApiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
      if (!mistralApiKey) {
        return res.status(500).json({ error: "Mistral AI API key not configured" });
      }

      let prompt = '';
      switch (operation) {
        case 'shorten':
          prompt = `Please shorten the following text while maintaining its key meaning and impact: "${text}"`;
          break;
        case 'lengthen':
          prompt = `Please expand and elaborate on the following text, adding more detail and depth: "${text}"`;
          break;
        case 'table':
          prompt = `Convert the following text into a well-structured table format: "${text}"`;
          break;
        case 'edit':
          prompt = `Please improve the following text for clarity, grammar, and impact: "${text}"`;
          break;
        default:
          prompt = `Please improve the following text: "${text}"`;
      }

      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are an expert editor. Provide only the edited text as your response, without any explanations or additional commentary.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!mistralResponse.ok) {
        throw new Error(`Mistral AI API error: ${mistralResponse.statusText}`);
      }

      const aiResponse = await mistralResponse.json();
      const suggestedText = aiResponse.choices[0]?.message?.content || text;

      // Store the AI edit
      const aiEdit = await storage.createAiEdit({
        originalText: text,
        suggestedText,
        operation,
      });

      res.json({ 
        editId: aiEdit.id,
        originalText: text, 
        suggestedText,
        operation,
        explanation: `I've ${operation === 'shorten' ? 'shortened' : operation === 'lengthen' ? 'expanded' : operation === 'table' ? 'converted to table format' : 'improved'} the text as requested.`
      });
    } catch (error) {
      console.error('AI edit error:', error);
      res.status(500).json({ error: "Failed to process AI edit request" });
    }
  });

  // Enhanced web search endpoint with multiple providers
  app.post("/api/search", async (req, res) => {
    try {
      const { query, provider = "duckduckgo" } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      let searchResults;

      switch (provider) {
        case "tavily":
          searchResults = await searchWithTavily(query);
          break;
        case "serper":
          searchResults = await searchWithSerper(query);
          break;
        default:
          searchResults = await searchWithDuckDuckGo(query);
      }
      
      res.json(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: "Failed to perform web search" });
    }
  });

  // Web crawling endpoint
  app.post("/api/crawl", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const crawlResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI Assistant Bot)'
        }
      });
      
      if (!crawlResponse.ok) {
        throw new Error(`Failed to fetch URL: ${crawlResponse.statusText}`);
      }

      const html = await crawlResponse.text();
      
      // Basic text extraction (you could enhance this with a proper HTML parser)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit content size

      res.json({
        url,
        title: extractTitle(html),
        content: textContent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Crawl error:', error);
      res.status(500).json({ error: "Failed to crawl URL" });
    }
  });

  // Agent endpoint for intelligent tool usage
  app.post("/api/agent", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const mistralApiKey = process.env.MISTRAL_API_KEY;
      if (!mistralApiKey) {
        return res.status(500).json({ error: "Mistral AI API key not configured" });
      }

      // Determine if the agent needs to use tools
      const toolDecision = await analyzeToolNeed(message, mistralApiKey);
      
      let toolResults = [];
      
      // Execute tools based on analysis
      if (toolDecision.needsSearch) {
        const searchResult = await searchWithDuckDuckGo(toolDecision.searchQuery);
        toolResults.push({
          tool: 'web_search',
          query: toolDecision.searchQuery,
          result: searchResult
        });
      }
      
      if (toolDecision.needsCrawl && toolDecision.urlToCrawl) {
        try {
          const crawlResult = await crawlUrl(toolDecision.urlToCrawl);
          toolResults.push({
            tool: 'web_crawl',
            url: toolDecision.urlToCrawl,
            result: crawlResult
          });
        } catch (crawlError) {
          console.error('Crawl error:', crawlError);
        }
      }

      // Generate response with tool results
      const agentResponse = await generateAgentResponse(message, context, toolResults, mistralApiKey);
      
      res.json({
        reply: agentResponse.reply,
        toolsUsed: toolResults.map(t => ({ tool: t.tool, query: t.query || t.url })),
        reasoning: toolDecision.reasoning,
        usage: agentResponse.usage
      });
    } catch (error) {
      console.error('Agent error:', error);
      res.status(500).json({ error: "Failed to process agent request" });
    }
  });

  // Document endpoints
  app.get("/api/document", async (req, res) => {
    try {
      const document = await storage.getDefaultDocument();
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.put("/api/document", async (req, res) => {
    try {
      const { content } = req.body;
      const document = await storage.getDefaultDocument();
      const updated = await storage.updateDocument(document.id, content);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // AI Edit status endpoints
  app.put("/api/ai/edit/:id/apply", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateAiEditStatus(id, 'applied');
      if (!updated) {
        return res.status(404).json({ error: "AI edit not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to apply AI edit" });
    }
  });

  app.put("/api/ai/edit/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateAiEditStatus(id, 'rejected');
      if (!updated) {
        return res.status(404).json({ error: "AI edit not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject AI edit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
