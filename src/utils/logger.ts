// Sistema de logging inteligente para reduzir ruído no console

const IS_DEVELOPMENT = import.meta.env.MODE === 'development';
const DEBUG_ENABLED = localStorage.getItem('debug_mode') === 'true';

// Tipos de log
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Configuração de log por módulo
const LOG_CONFIG = {
  AUTH: IS_DEVELOPMENT ? LogLevel.WARN : LogLevel.ERROR,
  API: IS_DEVELOPMENT ? LogLevel.WARN : LogLevel.ERROR,
  PRIVATE_ROUTE: IS_DEVELOPMENT ? LogLevel.WARN : LogLevel.ERROR,
  GENERAL: IS_DEVELOPMENT ? LogLevel.WARN : LogLevel.ERROR
};

// Logger inteligente
export class Logger {
  private module: string;
  private level: LogLevel;

  constructor(module: string) {
    this.module = module;
    this.level = LOG_CONFIG[module as keyof typeof LOG_CONFIG] || LOG_CONFIG.GENERAL;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level || DEBUG_ENABLED;
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`❌ [${this.module}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`⚠️ [${this.module}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`ℹ️ [${this.module}] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`🔍 [${this.module}] ${message}`, ...args);
    }
  }

  success(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`✅ [${this.module}] ${message}`, ...args);
    }
  }
}

// Loggers para cada módulo
export const authLogger = new Logger('AUTH');
export const apiLogger = new Logger('API');
export const routeLogger = new Logger('PRIVATE_ROUTE');

// Função para ativar/desativar debug
export const setDebugMode = (enabled: boolean) => {
  localStorage.setItem('debug_mode', enabled.toString());
  console.log(`🔧 Debug mode ${enabled ? 'enabled' : 'disabled'}. Reload page to apply.`);
};
