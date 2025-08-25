# Network Tools Dashboard

## Overview

This is a professional network management platform built as a full-stack application with a cyberpunk-inspired dark theme UI. The platform provides various network diagnostic and monitoring tools including ping, port scanning, DNS lookup, SSL analysis, and vulnerability scanning. It features a modern React frontend with Express.js backend, using PostgreSQL for data persistence and offering both real-time monitoring capabilities and historical data analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk color scheme and glassmorphism effects
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Pattern**: RESTful API with clear endpoint structure
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development**: Hot module replacement via Vite integration
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage
- **Database**: PostgreSQL as primary database
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Migrations**: Drizzle Kit for schema management
- **Validation**: Zod schemas for runtime type validation
- **Fallback**: In-memory storage implementation for development/testing

### Database Schema Design
- **Users**: Authentication and user management
- **Network Tools**: Tool definitions with categories and metadata
- **Tool Results**: Historical execution results with parameters and outcomes
- **Network Events**: System events and alerts with severity levels
- **Relationships**: Foreign key relationships between users, tools, and results

### Authentication & Authorization
- **Session-based**: Traditional session management with secure cookies
- **Storage**: PostgreSQL session store for persistence
- **Security**: Password hashing and secure session configuration

### Development & Deployment
- **Environment**: Multi-environment configuration (development, production)
- **Development Server**: Vite dev server with HMR for frontend
- **Build Process**: TypeScript compilation with ES modules
- **Asset Management**: Vite asset pipeline with automatic optimization
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migrations and schema management
- **express**: Web application framework for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express

### Frontend UI Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **framer-motion**: Animation library for React
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: CSS class variant management

### Development Tools
- **vite**: Next-generation frontend build tool
- **typescript**: Static type checking
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

### Validation & Utilities
- **zod**: TypeScript-first schema validation
- **clsx**: Conditional CSS class utility
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: URL-friendly unique ID generator

### Styling & Icons
- **tailwindcss**: Core styling framework with custom design system
- **autoprefixer**: CSS vendor prefix automation
- **lucide-react**: Modern icon library
- **@hookform/resolvers**: Form validation resolvers