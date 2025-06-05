/**
 * Defines all possible environment variables for this app
 */
export interface EnvVariables {
  ENV: string;
  LOG_LEVEL: string;
  PORT: string;
  API_TOKEN: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
}
