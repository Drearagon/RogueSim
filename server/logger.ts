import pino from 'pino';

// Enhanced logging configuration for RogueSim
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      messageFormat: '[{level}] {msg}'
    }
  } : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

// Specialized loggers for different components
export const authLogger = logger.child({ component: 'authentication' });
export const gameLogger = logger.child({ component: 'game' });
export const dbLogger = logger.child({ component: 'database' });
export const sessionLogger = logger.child({ component: 'session' });

// Helper functions for structured logging
export const logUserAction = (userId: string, action: string, details?: any) => {
  gameLogger.info({
    userId: userId.substring(0, 8) + '...', // Anonymize for privacy
    action,
    details,
    timestamp: new Date().toISOString()
  }, `User action: ${action}`);
};

export const logAuthEvent = (event: string, email?: string, success?: boolean) => {
  authLogger.info({
    event,
    email: email ? email.substring(0, 3) + '***' : undefined, // Anonymize email
    success,
    timestamp: new Date().toISOString()
  }, `Auth event: ${event}`);
};

export const logDatabaseError = (operation: string, error: Error, context?: any) => {
  dbLogger.error({
    operation,
    error: error.message,
    context,
    timestamp: new Date().toISOString()
  }, `Database error in ${operation}: ${error.message}`);
};

console.log('✅ Enhanced logging system initialized for RogueSim');