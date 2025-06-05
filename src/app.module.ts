import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { appConfig } from './config';
import { HealthLogModule } from './healthlog/healthlog.module';
import { HealthLogModel } from './healthlog/repositories/healthlog.model';
import { HttpRequestLoggerMiddleware } from './http.logger.middleware';

const logger = new Logger();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      ignoreEnvFile: false,
      isGlobal: true,
      envFilePath: ['./.env'],
    }),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: './db-healthlog.sqlite',
      synchronize: true,
      models: [HealthLogModel],
      autoLoadModels: true,
      logging: (sql, _timing) => logger.debug(sql),
    }),
    HealthLogModule,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpRequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
