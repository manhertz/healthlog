import { HealthLog, EHealthLogSeverities } from '../../entities/HealthLog';

export interface HealthLogFilters {
  /**
   * Filters by severity level (based on the enum values defined in `EHealthLogSeverities`).
   */
  severity?: EHealthLogSeverities;
  /**
   * Only returns logs with a timestamp greater than or equal to this date.
   */
  after?: Date;
}

export interface HealthLogPaginationOptions {
  /**
   * The maximum number of records to retrieve. Defaults to `DEFAULT_DB_PAGINATION_LIMIT`.
   */
  limit?: number;
  /**
   * The index of the first record to retrieve. Defaults to `0`, based on the number of records.
   */
  offset?: number;
}

export enum EStatisticTypes {
  SEVERITY = 'severity',
  SOURCE = 'source',
}

export type HealthLogStatisticsResult = Record<string, number>;

export interface IHealthLogRepository {
  /**
   * It saves an array of health logs to the database. This method saves multiple health logs
   * at once and does not return any value.
   *
   * @param healthLogs The log object to be saved.
   */
  save(healthLogs: HealthLog[]): Promise<void>;

  /**
   * It retrieves all the health logs from the database.
   *
   * @param filters The filter options to apply while retrieving the data.
   * @returns An array of health logs that match the provided filters.
   */
  findAndCountAll(filters?: {
    severity?: string;
    after?: Date;
  }): Promise<{ rows: HealthLog[]; count: number }>;

  /**
   * Retrieves basic statistics about the health logs based on the specified stat type.
   *
   * @param type The type of statistic to retrieve. Can either be 'severity' or 'source'.
   * @returns an object containing the counts of the specified 'stat types'.
   */
  getStatsByType(type: EStatisticTypes): Promise<HealthLogStatisticsResult>;
}
