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
export const appLogger = logger.child({ component: 'application' });
export const actionLogger = logger.child({ component: 'user-actions' });

// Helper functions for structured logging with robust error handling
export const logUserAction = (userId: string, action: string, details?: any) => {
  try {
    // Safely handle userId - ensure it's a string before processing
    let anonymizedUserId: string;
    if (typeof userId === 'string' && userId.length > 0) {
      anonymizedUserId = userId.length > 8 ? userId.substring(0, 8) + '...' : userId + '...';
    } else {
      anonymizedUserId = 'unknown-user';
    }

    const logData = {
      userId: anonymizedUserId,
      action: typeof action === 'string' ? action : 'unknown-action',
      details: details || {},
      timestamp: new Date().toISOString()
    };

    actionLogger.info(logData, `User action: ${action}`);
  } catch (error) {
    // Fallback logging if structured logging fails
    logger.error(`Failed to log user action: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const logAuthEvent = (event: string, email?: string | null, success?: boolean) => {
  try {
    let anonymizedEmail: string | undefined;

    // Ensure email is a string before attempting substring
    if (typeof email === 'string' && email.length > 0) {
      anonymizedEmail = email.length > 3 ? email.substring(0, 3) + '***' : '***';
    } else {
      anonymizedEmail = undefined; // Explicitly set to undefined if not a valid string
    }

    const logData = {
      timestamp: new Date().toISOString(),
      event: typeof event === 'string' ? event : 'unknown-event',
      email: anonymizedEmail, // Use the safely handled variable
      success,
    };

    if (success === true) {
      authLogger.info(logData, `Auth success: ${event}`);
    } else if (success === false) {
      authLogger.error(logData, `Auth failure: ${event}`);
    } else {
      authLogger.debug(logData, `Auth event: ${event}`); // For events without explicit success/failure
    }
  } catch (error) {
    // Fallback logging if structured logging fails
    logger.error(`Failed to log auth event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const logDatabaseError = (operation: string, error: Error, context?: any) => {
  try {
    const logData = {
      operation: typeof operation === 'string' ? operation : 'unknown-operation',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorStack: error instanceof Error ? error.stack : undefined,
      context: context || {},
      timestamp: new Date().toISOString()
    };

    dbLogger.error(logData, `Database error in ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } catch (logError) {
    // Fallback logging if structured logging fails
    console.error('Critical: Logger failed to log database error:', logError);
    console.error('Original database error:', error);
  }
};

// Additional robust logging functions
export const logServerError = (error: Error, context?: any) => {
  try {
    const logData = {
      error: error instanceof Error ? error.message : 'Unknown server error',
      errorStack: error instanceof Error ? error.stack : undefined,
      context: context || {},
      timestamp: new Date().toISOString()
    };

    appLogger.error(logData, `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } catch (logError) {
    console.error('Critical: Logger failed to log server error:', logError);
    console.error('Original server error:', error);
  }
};

export const logApiRequest = (method: string, path: string, userId?: string, duration?: number) => {
  try {
    const logData = {
      method: typeof method === 'string' ? method : 'UNKNOWN',
      path: typeof path === 'string' ? path : '/unknown',
      userId: userId && typeof userId === 'string' ? userId.substring(0, 8) + '...' : undefined,
      duration: typeof duration === 'number' ? duration : undefined,
      timestamp: new Date().toISOString()
    };

    appLogger.info(logData, `API ${method} ${path}${duration ? ` (${duration}ms)` : ''}`);
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
};

console.log('✅ Enhanced robust logging system initialized for RogueSim');