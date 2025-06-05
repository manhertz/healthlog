import { Module } from '@nestjs/common';
import { HealthLogService } from './healthlog.service';
import { HealthLogController } from './api/healthlog.controller';
import { HealthLogRepository } from './repositories/healthlog.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { HealthLogModel } from './repositories/healthlog.model';

@Module({
  imports: [SequelizeModule.forFeature([HealthLogModel])],
  controllers: [HealthLogController],
  providers: [HealthLogService, HealthLogRepository],
})
export class HealthLogModule {}
