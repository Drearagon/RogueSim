# RogueSim - Cyberpunk Hacking Simulation

A full-stack web-based cyberpunk hacking simulation game featuring terminal-style gameplay, multiplayer support, and real-time collaboration.

## Features

- **Terminal-Based Gameplay**: Authentic hacking simulation with command-line interface
- **Multiplayer Support**: Real-time cooperative and competitive game modes
- **Progression System**: Skill trees, achievements, and reputation levels
- **Mission System**: AI-generated missions with varying difficulty levels
- **User Profiles**: Persistent game saves and player statistics
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS + Radix UI components
- Framer Motion for animations
- Xterm.js for terminal emulation

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- WebSocket for real-time multiplayer
- Session-based authentication
- Email service integration

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RogueSim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE roguesim;
   ```

4. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@hostname:5432/roguesim
   SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long
   NODE_ENV=development
   PORT=5000
   ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

## Development

Start the development server (runs both client and server):
```bash
npm run dev
```

This will start:
- Frontend development server on `http://localhost:3000`
- Backend API server on `http://localhost:5000`

### Individual Services

Run only the backend:
```bash
npm run dev:server
```

Run only the frontend:
```bash
npm run dev:client
```

## Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:5000`

## Database Management

- **Push schema changes**: `npm run db:push`
- **Run migrations**: `npm run db:migrate`
- **Open database studio**: `npm run db:studio`

## Optional Features

### Email Service (SendGrid)
For email verification and notifications:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### AI Mission Generation (OpenAI)
For AI-generated missions:
```env
OPENAI_API_KEY=your-openai-api-key
```

## Game Features

### Authentication
- Custom user registration and login
- Session-based authentication
- Secure password hashing with bcrypt

### Game Modes
- **Single Player**: Individual mission progression
- **Multiplayer**: Real-time cooperative/competitive rooms
- **Tutorial**: Guided onboarding experience

### Terminal Commands
The game features an authentic terminal interface with commands like:
- `help` - Show available commands
- `scan` - Scan for network vulnerabilities
- `connect` - Connect to remote systems
- `status` - Check system status
- And many more unlockable commands

### Progression
- Mission completion tracking
- Credit-based economy
- Reputation system (ROOKIE → ELITE)
- Skill tree progression
- Achievement system

## Project Structure

```
RogueSim/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript type definitions
│   └── index.html
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── websocket.ts        # WebSocket server
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between client/server
│   └── schema.ts           # Database schema and types
└── package.json
```

## Current Progress

The project is currently in **Phase II** development. All core systems from Phase I
are complete, including the terminal interface, authentication, skill trees, and
command processing. Phase II introduces advanced mechanics, many of which are
already implemented:

- **Social Engineering Module**
- **Dynamic Network System**
- **Mental Load & Focus Mechanic**
- **Advanced Terminal Scripting**

Upcoming work focuses on the remaining Phase II features:

- RogueNet marketplace and message boards
- Psych profile and alignment system
- Cross-mission world events
- Simulated OS modes

Overall, Phase II is about 60% complete. See `IMPLEMENTATION_SUMMARY.md` for
more details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure everything works
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
