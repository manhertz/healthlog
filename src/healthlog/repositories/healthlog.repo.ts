import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HealthLogModel } from './healthlog.model';
import { HealthLog } from '../../entities/HealthLog';
import { DEFAULT_DB_PAGINATION_LIMIT } from '../../config/constants';
import { Op, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import {
  EStatisticTypes,
  HealthLogFilters,
  HealthLogPaginationOptions,
  IHealthLogRepository,
} from './healthlog.repo.interface';

/**
 * A helper mapping to determine the model attribute name used for grouping based on the statistic type.
 */
const HealthLogStatisticAttributeMappings: Record<EStatisticTypes, string> = {
  [EStatisticTypes.SEVERITY]: 'severity',
  [EStatisticTypes.SOURCE]: 'source',
};

@Injectable()
export class HealthLogRepository implements IHealthLogRepository {
  protected readonly logger = new Logger(HealthLogRepository.name);

  constructor(
    @InjectModel(HealthLogModel)
    private readonly healthLogModel: typeof HealthLogModel,
  ) {}

  /**
   * Saves an array of health logs into the database.
   *
   * Each log object must contain at least the following properties:
   * - `timestamp`: A Date object with valid timestamp.
   * - `source`: A non-empty string identifying the source of the log.
   * - `severity`: One of the predefined severity levels (e.g., "ERROR", "WARNING", etc.).
   * - `message`: A non-empty string describing the content of the log.
   *
   * Additionally, each log can optionally include a `patientId` property which should also be a non-empty string.
   *
   * Before saving, each log's ID is generated using UUIDv
   * @param healthLogs - An array of objects representing health logs.
   */
  public async save(healthLogs: Omit<HealthLog, 'id'>[]) {
    await this.healthLogModel.bulkCreate(
      healthLogs.map((log) => ({
        ...log,
        id: uuidv4(),
        timestamp: new Date(log.timestamp),
        patientId: this.anonymizePatientId(log.patientId) ?? null,
      })),
    );
  }

  /**
   * @note This private method is responsible for anonymizing the patientId field. We use randum UUID to anonymize the patientId
   * to protect the privacy of patients but we loose the ability to aggregate over per user basis (same patent will have different
   * random UUIDs).
   *
   * If requirement is changing, adjust this logic accordingly.
   *
   * @param patientId
   * @returns string or null
   */
  private anonymizePatientId(patientId: string | null): string | null {
    return patientId ? crypto.randomUUID().substring(0, 8) : null;
  }

  /**
   * Returns an array of health logs from the database.
   *
   * If no filters are provided, all logs will be returned otherwise nly logs that match the filter will be returned.
   *
   * @param filters
   * @param pagination
   * @returns
   */
  public async findAndCountAll(
    filters?: HealthLogFilters,
    pagination?: HealthLogPaginationOptions,
  ): Promise<{ rows: HealthLog[]; count: number }> {
    const result = await this.healthLogModel.findAndCountAll({
      where: {
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.after && {
          timestamp: { [Op.gte]: filters.after.toISOString() },
        }),
      },
      limit: pagination?.limit ?? DEFAULT_DB_PAGINATION_LIMIT,
      offset: pagination?.offset ?? 0,
    });

    return {
      rows: result.rows.map((row) => ({
        ...(row.get() as HealthLog),
        patientId: null,
      })),
      count: result.count,
    };
  }

  /**
   * Returns statistics about the health log entries grouped by either severity or source.
   *
   * This method uses Sequelize's `findAll` function with group by option to query the database
   * for aggregated data based on the specified grouping (`type`).
   *
   * It groups the results by either severity or source, depending on the provided `type`. If there is no
   * group is avaliable (i.e. no ERROR severity), then it will NOT be included in the results with zero.
   * So if no records found in the database yet, then an empty object will be returned.
   *
   * The resulting object contains keys which represent each unique entry in the specified grouping and their respective counts.
   *
   * @param type - A string indicating whether to group by severity ("severity") or source ("source").
   * @returns An object containing key-value pairs representing each unique entry in the specified grouping along with its corresponding count.
   */
  public async getStatsByType(type: EStatisticTypes) {
    const attrib = HealthLogStatisticAttributeMappings[type];
    if (!attrib) {
      throw new Error(`Invalid stat type ${type}`);
    }

    const results = await this.healthLogModel.findAll({
      attributes: [
        attrib,
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: [attrib],
      raw: true,
    });

    const stats: Record<string, number> = {};
    results.forEach((row) => {
      const key = `${row[attrib]}`;
      const count = `${row['count']}`;
      stats[key] = parseInt(count, 10);
    });

    return stats;
  }
}
