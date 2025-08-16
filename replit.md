# Overview

This is a full-stack hotel management system built with React (frontend) and Express.js (backend). The application provides a complete solution for managing hotel operations including customer management, service requests, and analytics. The system features a modern dashboard interface with real-time updates via WebSocket connections and uses Replit's authentication system for user management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite as the build tool
- **UI Components**: Built with shadcn/ui component library using Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Communication**: WebSocket client for live updates

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and logging
- **Real-time Features**: WebSocket server for live notifications and updates
- **Session Management**: Express sessions with PostgreSQL storage

## Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Organized in shared directory for frontend/backend consistency
- **Migrations**: Drizzle Kit for database schema management

## Authentication & Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication system
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management

## Development Architecture
- **Monorepo Structure**: Client, server, and shared code in organized directories
- **Hot Reload**: Vite development server with HMR
- **TypeScript**: Strict type checking across the entire stack
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)

## Key Features
- **Hotel Management**: Single hotel per user with configurable properties
- **Customer Management**: Check-in/check-out tracking with guest information
- **Service Requests**: Categorized requests (maintenance, housekeeping, etc.) with status tracking
- **Analytics**: Real-time statistics and occupancy metrics
- **Real-time Updates**: Live notifications for new requests and status changes

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

## Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express

## UI & Styling
- **shadcn/ui**: Pre-built accessible component library
- **Radix UI**: Primitive components for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

## Runtime & Hosting
- **Replit**: Development and hosting platform with built-in authentication
- **WebSocket**: Real-time communication using native WebSocket API
- **Express.js**: Web application framework for Node.js