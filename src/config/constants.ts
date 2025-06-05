export enum ENodeEnvironments {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum ELogLevels {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export const DEFAULT_ENVIRONMENT = ENodeEnvironments.DEVELOPMENT;
export const DEFAULT_LOG_LEVEL = ELogLevels.INFO;
export const DEFAULT_HTTP_PORT = 3000;

export const DEFAULT_DB_PAGINATION_LIMIT = 100;
