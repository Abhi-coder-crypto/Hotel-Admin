# Grand Hotel Service Request System

## Overview

This is a full-stack web application for a hotel service request system built with modern web technologies. The system allows hotel guests to submit service requests through an elegant web interface, with all requests being logged and stored for hotel staff to manage. The application features a responsive design with a professional hotel branding and provides a seamless user experience for requesting various hotel services like room service, housekeeping, laundry, and more.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI components
- **Form Management**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript for type safety across the entire application
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Validation**: Zod schemas for runtime type validation on both client and server
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **Development**: In-memory storage using Map data structures for rapid development and testing
- **Production Ready**: Configured for PostgreSQL with Drizzle ORM
- **Database Access**: Neon Database serverless PostgreSQL integration
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Type Safety**: Drizzle-Zod integration for type-safe database operations

### Key Architectural Decisions

**Monorepo Structure**: The application uses a monorepo approach with shared TypeScript schemas between client and server, ensuring type consistency and reducing code duplication.

**Component Architecture**: Utilizes shadcn/ui for a comprehensive component library built on Radix UI primitives, providing accessible and customizable components.

**Data Flow**: Implements unidirectional data flow with React Query managing server state, while local component state handles UI interactions.

**Development Experience**: Configured for optimal DX with hot reloading, TypeScript checking, and integrated error overlays in development mode.

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database for production (via Neon Database)
- **Drizzle ORM**: Type-safe database operations and query building
- **connect-pg-simple**: PostgreSQL session store integration

### UI & Styling
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Modern icon library for consistent iconography

### Development & Build Tools
- **Vite**: Modern build tool with HMR and optimized bundling
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

### Validation & Forms
- **Zod**: Runtime type validation for forms and API data
- **React Hook Form**: Performant form library with minimal re-renders

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Query**: Data fetching and caching solution

The application is designed to be easily deployable on platforms like Replit with all necessary configuration files included for seamless development and production deployment.