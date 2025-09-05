interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class MistralClient {
  private apiKey: string;
  private baseUrl = 'https://api.mistral.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: ChatMessage[], options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<MistralResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'mistral-small-latest',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    return response.json();
  }

  async editText(text: string, operation: string): Promise<string> {
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

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert editor. Provide only the edited text as your response, without any explanations or additional commentary.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.chat(messages, { temperature: 0.3 });
    return response.choices[0]?.message?.content || text;
  }
}

// Export a singleton instance
const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
export const mistralClient = apiKey ? new MistralClient(apiKey) : null;
