# RogueSim - Cyberpunk Hacking Terminal Game

## Overview

RogueSim is a full-stack web-based cyberpunk hacking simulation game featuring terminal-style gameplay, multiplayer support, and real-time collaboration. The application combines an authentic command-line interface experience with modern web technologies to create an immersive hacking simulation environment.

## System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript, Vite for development/building, Tailwind CSS + Radix UI
- **Backend**: Express.js + TypeScript, PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for multiplayer functionality
- **Authentication**: Session-based with bcrypt password hashing
- **Email**: SendGrid integration for verification emails
- **Deployment**: Docker containerization with Nginx reverse proxy

### Database Strategy
The application employs a hybrid database approach:
- **Primary**: Neon PostgreSQL (cloud-hosted) for production
- **Fallback**: Local SQLite database for development and backup
- **Migration**: Automatic fallback handling when primary database is unavailable

## Key Components

### Frontend Architecture
- **Terminal Component**: Authentic terminal emulation using Xterm.js
- **Command System**: Comprehensive command validation and execution
- **Game Interface**: Modern React UI with cyberpunk theming
- **Real-time Updates**: WebSocket integration for multiplayer features
- **Responsive Design**: Mobile-optimized interface with touch handling

### Backend Architecture
- **API Routes**: RESTful endpoints for authentication, game state, and user management
- **Session Management**: Secure session handling with PostgreSQL session store
- **Database Abstraction**: Storage layer supporting multiple database backends
- **Email Service**: Verification and notification system using SendGrid
- **Rate Limiting**: Built-in protection against abuse and spam

### Game Systems
- **Command Unlock System**: Progressive command availability based on player level and achievements
- **Skill Trees**: Three specialized paths (Codebreaker, Saboteur, Ghostwalker)
- **Mission System**: AI-generated missions with varying difficulty levels
- **Multiplayer Rooms**: Real-time collaborative hacking sessions
- **Reputation System**: Player progression tracking and leaderboards

## Data Flow

### Authentication Flow
1. User registers with email verification code system
2. Verification emails sent via SendGrid with 6-digit codes
3. Session established upon successful verification
4. Session persistence across browser tabs and refreshes

### Game State Management
1. Player actions trigger command validation
2. Game state updates stored in database
3. Real-time updates broadcast to multiplayer participants
4. Progress tracking and achievement unlocking

### Database Operations
1. Primary operations attempt Neon PostgreSQL connection
2. Automatic fallback to local SQLite if primary unavailable
3. Data synchronization between local and remote when reconnected
4. Session storage handled by connect-pg-simple middleware

## External Dependencies

### Required Services
- **Neon PostgreSQL**: Primary database hosting (requires DATABASE_URL)
- **SendGrid**: Email service for verification (requires SENDGRID_API_KEY)
- **OpenAI**: AI mission generation (optional, requires OPENAI_API_KEY)

### Optional Services
- **Ngrok**: Secure tunneling for remote access during development
- **Cloudflare**: CDN and SSL termination for production deployments

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secure session key (required)
- `SENDGRID_API_KEY`: Email service authentication (optional)
- `OPENAI_API_KEY`: AI service authentication (optional)
- `NODE_ENV`: Environment mode (development/production)

## Deployment Strategy

### Development Approach
- **Hot Reloading**: Vite development server with HMR
- **Local Database**: SQLite fallback for offline development
- **Environment Isolation**: Separate configuration for dev/prod environments

### Production Deployment
- **Containerization**: Docker with multi-stage builds
- **Database**: Neon PostgreSQL with connection pooling
- **Reverse Proxy**: Nginx for static asset serving and SSL termination
- **Process Management**: PM2 or Docker Compose for service orchestration

### Security Considerations
- Session secrets managed via environment variables
- CORS configuration for cross-origin requests
- Rate limiting on authentication endpoints
- SQL injection prevention through parameterized queries
- CSRF protection on state-changing operations

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 23, 2025. Initial setup