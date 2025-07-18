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


### Optional Services
- **Ngrok**: Secure tunneling for remote access during development
- **Cloudflare**: CDN and SSL termination for production deployments

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secure session key (required)
- `SENDGRID_API_KEY`: Email service authentication (optional)

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

## Recent Security & Game Enhancements

### June 27, 2025 - Comprehensive Security & Game Improvements
- **Enhanced Security Middleware**: Implemented advanced rate limiting with progressive delays and IP blocking
- **Password Security**: Added comprehensive password strength validation with real-time feedback
- **Security Audit System**: Created detailed logging system for suspicious activities and security events
- **Admin Dashboard**: Built comprehensive monitoring interface for security metrics and game analytics
- **Input Sanitization**: Added protection against XSS, SQL injection, and malicious input patterns
- **Honeypot Protection**: Implemented bot detection and suspicious pattern recognition
- **Session Security**: Enhanced session management with automatic regeneration and security checks
- **Game Progression Engine**: Created advanced progression system with achievements, contracts, and dynamic content
- **Real-time Analytics**: Implemented comprehensive game metrics and user behavior tracking

### Security Features Added
- Progressive rate limiting with temporary IP blocking
- Honeypot fields for bot detection
- Advanced password validation with entropy scoring
- Security audit logging with severity levels
- Session hijacking protection
- Input sanitization middleware
- Admin-only security monitoring endpoints

### Game Enhancements Added
- Dynamic achievement system with multiple categories
- Contract-based mission system
- Enhanced progression tracking
- Real-time game event processing
- Advanced network simulation features
- Stealth and security breach mechanics
- Tool unlocking and upgrade system

## Recent Docker & Production Enhancements

### July 2, 2025 - Complete Docker Deployment Optimization
- **Multi-stage Dockerfile**: Optimized build process with separate builder and production stages
- **Security Hardening**: Non-root user, resource limits, security contexts, and minimal attack surface
- **Health Checks**: Comprehensive health monitoring with automatic container restart
- **Environment Management**: Robust environment variable validation and error handling
- **Production Configuration**: Separate production docker-compose with SSL support and resource limits
- **Deployment Automation**: Complete deployment script with validation and testing
- **Documentation**: Comprehensive deployment guide with troubleshooting and security considerations

### Docker Improvements Made
- Fixed static file serving path resolution for Docker containers
- Added proper environment variable defaults and validation
- Implemented proper health check endpoints for container monitoring
- Optimized build process with multi-stage Docker builds
- Added comprehensive logging and error handling
- Created production-ready configurations with security best practices
- Implemented proper build verification and testing

### Production Deployment Features
- Automated deployment script with validation (`docker-deploy.sh`)
- Comprehensive environment templates (`.env.production.template`)
- Health monitoring and automatic restart capabilities
- Security-hardened containers with minimal privileges
- Proper logging configuration with rotation
- Resource limits and performance optimization
- Complete deployment documentation

## Changelog

Changelog:
- July 18, 2025. Fixed Docker container health check issues - improved timing, added Node.js health check script, enhanced reliability
- July 18, 2025. Removed OpenAI API key requirement and AI integration - replaced with static mission generator
- July 2, 2025. Complete Docker deployment optimization and production hardening
- June 27, 2025. Major security overhaul and game enhancement implementation
- June 23, 2025. Initial setup

## Recent Docker Health Check Improvements

### July 18, 2025 - Docker Health Check Optimization
- **Fixed Health Check Timing**: Reduced interval from 30s to 15s, start period from 60s to 30s
- **Node.js Health Check Script**: Created dedicated `docker-health-check.js` for reliable health monitoring
- **Enhanced Endpoints**: Added basic `/api/health` (no DB dependency) and advanced `/api/health/full` (with DB testing)
- **Improved Reliability**: Health checks now use native Node.js HTTP instead of wget/curl
- **Better Error Handling**: Comprehensive error reporting and timeout management
- **Validation Scripts**: Created `validate-docker-health.sh` for testing health check functionality

### Health Check Features Added
- Basic health endpoint without database dependency for faster container startup
- Advanced health endpoint with database connectivity testing
- Custom Node.js health check script with proper error handling
- Comprehensive validation and testing scripts
- Optimized timing for faster health detection
- Enhanced logging for health check diagnostics