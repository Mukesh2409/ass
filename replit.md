# AI Collaborative Editor

## Overview

This is a modern AI-powered collaborative text editor built with React, Express, and TipTap. The application allows users to write and edit documents with real-time AI assistance through text selection tools and a dedicated chat interface. Users can select text to trigger AI-powered editing suggestions like shortening, lengthening, or converting to tables, while also having access to a sidebar chat for general writing assistance and web search capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **Rich Text Editor**: TipTap editor with StarterKit and Placeholder extensions for document editing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation through @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Build**: esbuild for fast production builds
- **Storage**: In-memory storage implementation (MemStorage) with interface for future database integration
- **API**: RESTful endpoints for chat, documents, and AI operations

### Data Layer
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Definition**: Shared schema between client and server using Drizzle and Zod
- **Data Models**: 
  - Chat messages with role-based content and metadata
  - Documents with TipTap JSON content structure
  - AI edits tracking original text, suggestions, and application status
- **Migration**: Drizzle Kit for database schema management

### AI Integration
- **Chat Interface**: Sidebar chat component for general AI assistance
- **Text Selection Tools**: Floating toolbar for context-specific AI editing (shorten, lengthen, table conversion)
- **AI Operations**: Structured API endpoints for processing text edits and chat responses
- **Search Integration**: Web search functionality through DuckDuckGo API integration

### Development Tools
- **Type Safety**: Full TypeScript coverage with strict compiler options
- **Code Quality**: ESLint and path mapping for clean imports
- **Hot Reload**: Vite HMR in development with Replit integration
- **Error Handling**: Runtime error overlay for development debugging

## External Dependencies

### Core Framework Dependencies
- **@vitejs/plugin-react**: React plugin for Vite bundler
- **express**: Web application framework for Node.js
- **react**: Core React library for UI components
- **wouter**: Lightweight routing library for React

### Database and ORM
- **drizzle-orm**: TypeScript ORM for SQL databases
- **drizzle-kit**: CLI companion for Drizzle ORM migrations
- **@neondatabase/serverless**: Serverless PostgreSQL database driver

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Tool for creating type-safe component variants
- **clsx**: Utility for constructing className strings conditionally

### Rich Text Editing
- **@tiptap/react**: React wrapper for TipTap rich text editor
- **@tiptap/starter-kit**: Essential TipTap extensions bundle
- **@tiptap/extension-placeholder**: Placeholder text extension for TipTap

### State Management and Data Fetching
- **@tanstack/react-query**: Powerful data synchronization for React
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form

### Validation and Type Safety
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Zod integration for Drizzle ORM schemas

### Development and Build Tools
- **typescript**: TypeScript language and compiler
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **vite**: Next generation frontend build tool

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tools