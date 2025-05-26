// Enhanced client-side logging system for RogueSim
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  component?: string;
  userId?: string;
  data?: any;
}

class ClientLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Prevent memory issues
  
  private log(level: LogEntry['level'], message: string, component?: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component,
      data
    };
    
    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Console output for development
    const consoleMessage = `[${component || 'APP'}] ${message}`;
    switch (level) {
      case 'error':
        console.error(consoleMessage, data);
        break;
      case 'warn':
        console.warn(consoleMessage, data);
        break;
      case 'debug':
        console.debug(consoleMessage, data);
        break;
      default:
        console.log(consoleMessage, data);
    }
  }
  
  info(message: string, component?: string, data?: any) {
    this.log('info', message, component, data);
  }
  
  warn(message: string, component?: string, data?: any) {
    this.log('warn', message, component, data);
  }
  
  error(message: string, component?: string, data?: any) {
    this.log('error', message, component, data);
  }
  
  debug(message: string, component?: string, data?: any) {
    this.log('debug', message, component, data);
  }
  
  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }
  
  // Clear logs
  clear() {
    this.logs = [];
  }
}

// Global logger instance
export const logger = new ClientLogger();

// Specialized loggers for different components
export const authLogger = {
  info: (message: string, data?: any) => logger.info(message, 'AUTH', data),
  warn: (message: string, data?: any) => logger.warn(message, 'AUTH', data),
  error: (message: string, data?: any) => logger.error(message, 'AUTH', data),
};

export const gameLogger = {
  info: (message: string, data?: any) => logger.info(message, 'GAME', data),
  warn: (message: string, data?: any) => logger.warn(message, 'GAME', data),
  error: (message: string, data?: any) => logger.error(message, 'GAME', data),
};

export const storageLogger = {
  info: (message: string, data?: any) => logger.info(message, 'STORAGE', data),
  warn: (message: string, data?: any) => logger.warn(message, 'STORAGE', data),
  error: (message: string, data?: any) => logger.error(message, 'STORAGE', data),
};

// Helper functions for common logging patterns
export const logUserAction = (action: string, details?: any) => {
  gameLogger.info(`User action: ${action}`, details);
};

export const logStorageOperation = (operation: string, success: boolean, details?: any) => {
  if (success) {
    storageLogger.info(`Storage operation successful: ${operation}`, details);
  } else {
    storageLogger.error(`Storage operation failed: ${operation}`, details);
  }
};

console.log('✅ Client-side logging system initialized for RogueSim');