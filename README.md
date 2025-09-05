# AI Collaborative Editor

A modern AI-powered collaborative text editor built with React, Express, and TipTap. This application allows users to write and edit documents with real-time AI assistance through text selection tools and a dedicated chat interface.

## Features

- **Rich Text Editing**: Built with TipTap editor for advanced text formatting
- **AI-Powered Chat**: Interactive sidebar chat with web search capabilities
- **Text Enhancement Tools**: AI-powered text shortening, expansion, and table conversion
- **Modern UI**: Clean, responsive interface built with Radix UI and Tailwind CSS
- **Real-time Collaboration**: Document synchronization and chat functionality
- **Web Search Integration**: DuckDuckGo, Tavily, and Serper API support

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- TipTap rich text editor
- Radix UI components with shadcn/ui
- Tailwind CSS for styling
- TanStack Query for state management

### Backend
- Node.js with Express.js
- TypeScript with ES modules
- Drizzle ORM for database operations
- Mistral AI for chat and text processing

## Getting Started

### Prerequisites
- Node.js 18+ 
- A Mistral AI API key (get one at [console.mistral.ai](https://console.mistral.ai/))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-collaborative-editor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy the project**:
```bash
vercel
```

4. **Configure Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     - `MISTRAL_API_KEY`: Your Mistral AI API key
     - `NODE_ENV`: `production`

5. **Redeploy** (if needed):
```bash
vercel --prod
```

### Environment Variables for Production

The following environment variables need to be configured in your deployment platform:

| Variable | Description | Required |
|----------|-------------|----------|
| `MISTRAL_API_KEY` | API key for Mistral AI services | Yes |
| `NODE_ENV` | Set to `production` for production builds | Yes |
| `TAVILY_API_KEY` | Optional: Enhanced web search capabilities | No |
| `SERPER_API_KEY` | Optional: Google search integration | No |

## API Endpoints

### Chat
- `GET /api/chat/messages` - Get chat history
- `POST /api/chat/messages` - Add new message
- `DELETE /api/chat/messages` - Clear chat history

### AI Services
- `POST /api/ai/chat` - Send message to AI assistant
- `POST /api/ai/edit` - AI text editing (shorten/lengthen/table)

### Document
- `GET /api/document` - Get current document
- `PUT /api/document` - Update document content

### Search
- `POST /api/search` - Web search with multiple providers
- `POST /api/crawl` - Web page content extraction
- `POST /api/agent` - Intelligent agent with tool usage

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Page components
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                # Shared types and schemas
└── dist/                  # Built application files
```

## Key Features in Detail

### AI Chat Assistant
- Contextual conversations with document awareness
- Web search integration for real-time information
- Actionable suggestions that can be inserted into documents

### Text Enhancement Tools
Select text in the editor to access:
- **Shorten**: Condense text while preserving meaning
- **Lengthen**: Expand text with additional details
- **Table**: Convert text into structured table format
- **Edit**: General text improvement for clarity and grammar

### Search Capabilities
- **DuckDuckGo**: Free web search (default)
- **Tavily**: Enhanced search with AI summarization (requires API key)
- **Serper**: Google search integration (requires API key)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking with TypeScript
- `npm run db:push` - Push database schema changes

### Database Setup

This project uses Drizzle ORM with PostgreSQL. For development, you can use any PostgreSQL database. Update the database configuration in `drizzle.config.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to your branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [Issues](https://github.com/your-username/your-repo/issues) page
- Create a new issue if you encounter problems

## Acknowledgments

- [TipTap](https://tiptap.dev/) for the rich text editor
- [Mistral AI](https://mistral.ai/) for AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling# ass_deployment
