export interface AppLogger {
  log(message: unknown, context?: string, statusCode?: number,): void;
  error(message: unknown, context?: string, statusCode?: number, trace?: string): void;
  warn(message: unknown, context?: string, statusCode?: number,): void;
  debug(message: unknown, context?: string, statusCode?: number,): void;
  verbose(message: unknown, context?: string, statusCode?: number,): void;
}
