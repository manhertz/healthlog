import { EnumUtils } from '../utils/enum.util';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_LOG_LEVEL,
  ELogLevels,
  ENodeEnvironments,
} from './constants';

interface Config {
  port: number | null;
  environment: ENodeEnvironments;
  logging: {
    level: ELogLevels;
  };
  api: {
    token: string;
  };
}

const parsedPortNr = parseInt(process.env.PORT ?? '', 10);
export const appConfig = () => {
  const config: Config = {
    port: !Number.isNaN(parsedPortNr) ? parsedPortNr : null,
    environment: getNodeEnv(),
    logging: {
      level: getLogLevel(),
    },
    api: {
      token: getApiToken(),
    },
  };
  return config;
};

// Helper functions to process env vars
// TODO: move and inpleent these into utils and make them more generic

function getNodeEnv(): ENodeEnvironments {
  if (!EnumUtils.isValueFromEnum(ENodeEnvironments, process.env.ENV)) {
    console.warn(
      `ENV=${process.env.ENV} is illegal, falling back to ${DEFAULT_ENVIRONMENT} mode`,
    );
    return DEFAULT_ENVIRONMENT;
  }
  return process.env.NODE_ENV as ENodeEnvironments;
}

function getLogLevel(): ELogLevels {
  if (!EnumUtils.isValueFromEnum(ELogLevels, process.env.LOG_LEVEL)) {
    console.warn(
      `LOG_LEVEL=${process.env.LOG_LEVEL} is illegal, falling back to ${DEFAULT_LOG_LEVEL}`,
    );
    return DEFAULT_LOG_LEVEL;
  }
  return process.env.LOG_LEVEL as ELogLevels;
}

function getApiToken(): string {
  if (
    process.env.API_TOKEN === undefined ||
    process.env.API_TOKEN.length <= 0
  ) {
    throw new Error(`API_TOKEN must be set`);
  }
  return process.env.API_TOKEN;
}
