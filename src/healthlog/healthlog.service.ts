import { Injectable, Logger } from '@nestjs/common';
import { HealthLog } from 'src/entities/HealthLog';
import { HealthLogRepository } from './repositories/healthlog.repo';
import {
  EStatisticTypes,
  HealthLogFilters,
  HealthLogPaginationOptions,
} from './repositories/healthlog.repo.interface';

@Injectable()
export class HealthLogService {
  protected readonly logger = new Logger(HealthLogService.name);

  constructor(private readonly healthLogRepo: HealthLogRepository) {}

  /**
   * Saves an array of health logs into the database.
   *
   * @param healthLogs - array of health logs to be saved in the database.
   */
  public async save(healthLogs: Omit<HealthLog, 'id'>[]) {
    await this.healthLogRepo.save(healthLogs);
    this.logger.log(`Saved ${healthLogs.length} health logs from API.`);
  }

  /**
   * Returns an array of health logs from the database.
   *
   * @param filters - optional filter object.
   * @param pagination - optional pagination options.
   * @returns
   */
  public async getLogs(
    filters: HealthLogFilters,
    pagination?: HealthLogPaginationOptions,
  ) {
    return this.healthLogRepo.findAndCountAll(filters, pagination);
  }

  public async getStatsByType(type: EStatisticTypes) {
    return this.healthLogRepo.getStatsByType(type);
  }
}
