# Overview

This is a full-stack hotel management system built with React (frontend) and Express.js (backend). The application provides a complete solution for managing hotel operations including customer management, service requests, and analytics. The system features a modern dashboard interface with real-time updates via WebSocket connections and uses a simple admin/password authentication system (admin/password) for user management. Successfully migrated from Replit Agent to standard Replit environment with MongoDB database persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (September 2, 2025)

✅ **Vercel Deployment Structure Completed**
- Successfully restructured application for Vercel serverless deployment
- Moved all Express.js routes to `/api` directory as serverless functions
- Created comprehensive API endpoints: hotel, customers, service-requests, analytics, room-types
- Moved client files to root level with proper build configuration
- Added `vercel.json` configuration for proper routing and function handling
- All MongoDB operations now work with Vercel's serverless architecture
- CORS handling implemented for cross-origin requests

✅ **API Serverless Functions Created**
- `/api/hotel.ts` - Hotel management (GET, POST, PUT)
- `/api/customers.ts` - Customer operations (GET, POST, PUT, DELETE)
- `/api/service-requests.ts` - Service request handling with MongoDB ObjectId validation
- `/api/admin-services.ts` - Staff service assignment and completion tracking
- `/api/room-types.ts` - Room availability and pricing management
- `/api/login.ts` - Authentication with bcrypt password hashing
- `/api/register.ts` - Hotel registration with admin account creation
- `/api/analytics/*` - Stats and service analytics endpoints
- All functions include proper error handling and CORS support

✅ **Database & Authentication Ready**
- MongoDB connection optimized for serverless functions
- Hotel admin authentication system fully functional
- Multi-hotel isolation maintained across all endpoints
- Password hashing with bcrypt for secure authentication
- Session management adapted for serverless deployment

# Recent Changes (August 16, 2025)

✅ **Migration Completed Successfully**
- Migrated hotel management system from Replit Agent to standard Replit environment
- Implemented multi-hotel authentication system with user registration
- Created registration form for new hotels with individual admin accounts
- Fixed customer creation functionality - customers now persist in MongoDB database
- Customer data persists across multiple hotel websites using shared MongoDB backend
- All core features working: customer management, service requests, analytics dashboard

✅ **Multi-Hotel Authentication System**
- Replaced simple admin/password with comprehensive registration system
- Each hotel can create their own admin account with unique credentials
- Hotels are isolated - each admin only sees their own hotel's data
- Registration automatically creates hotel with default room types
- Simple flow: new hotels register → login with credentials → access dashboard
- Existing hotels login directly with their credentials

✅ **Comprehensive Room Management System**
- Implemented complete room type system with categories (standard, deluxe, suite, studio)
- Added room availability tracking - 5 rooms per type, booking reduces available count
- Room types include: single, double, twin, triple, and various suites (junior, executive, presidential)
- Room pricing varies by type and category (₹2,500-8,500 per night)
- Customer check-in now requires room type selection with dynamic pricing display
- Created dedicated Rooms page to monitor availability and room types
- Auto-generates default room types when creating a new hotel

✅ **Revenue Tracking System**
- Replaced monthly revenue with total revenue calculation based on actual bookings
- Revenue calculated from individual customer room prices
- Dashboard displays real-time total revenue from all customer bookings
- Analytics include comprehensive statistics with revenue metrics

✅ **Technical Fixes Applied**
- Fixed session secret configuration issue
- Resolved TypeScript WebSocket errors and MongoDB type casting
- Fixed customer form validation schema with room type integration
- Implemented proper date/time handling for check-ins using Indian Standard Time (IST)
- Real-time updates via WebSocket connections working
- Added room type API endpoints and storage operations

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
- **Session Management**: Express sessions with in-memory storage

## Data Storage
- **Database**: MongoDB with cloud hosting (MongoDB Atlas)
- **ODM**: Mongoose for schema-based data modeling and operations
- **Schema**: Organized in shared directory for frontend/backend consistency
- **Connection**: Secure environment variable-based connection string

## Authentication & Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication system
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: Memory-based sessions for development environment
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
- **MongoDB Atlas**: Cloud-hosted MongoDB database with connection pooling
- **Mongoose**: Object Document Modeling library for schema-based operations

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