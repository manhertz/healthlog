import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_HTTP_PORT, ELogLevels } from './config/constants';
import {
  ConsoleLogger,
  ConsoleLoggerOptions,
  Logger,
  ValidationPipe,
} from '@nestjs/common';

/**
 * NestJS uses its own logger service that has log level array that can be configured.
 *
 * TODO: implement a proper logging provider using Winston or another library and\
 * use the config env var to determine the log level.
 */
const logLevels: Record<ELogLevels, ConsoleLoggerOptions['logLevels']> = {
  [ELogLevels.DEBUG]: ['debug', 'verbose', 'log', 'warn', 'error', 'fatal'],
  [ELogLevels.INFO]: ['log', 'warn', 'error', 'fatal'],
  [ELogLevels.WARN]: ['warn', 'error', 'fatal'],
  [ELogLevels.ERROR]: ['error', 'fatal'],
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'HLOG',
      timestamp: true,
      colors: true,
      // this should come from the environment variable but temporarily we'll hardcode it here
      logLevels:
        logLevels[
          process.env.ENV === 'production' ? ELogLevels.INFO : ELogLevels.DEBUG
        ],
    }),
  });
  const logger = new Logger(bootstrap.name);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpPort = config.get<number>('port') ?? DEFAULT_HTTP_PORT;
  await app.listen(httpPort);
  logger.log(`Application listening on port ${httpPort}`);
}
void bootstrap();
