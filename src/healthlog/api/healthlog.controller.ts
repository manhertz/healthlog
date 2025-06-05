import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HealthLogService } from '../healthlog.service';
import { EnumUtils } from '../../utils/enum.util';
import { ApiTokenGuard } from '../../guards/apitoken.guard';
import { DEFAULT_DB_PAGINATION_LIMIT } from '../../config/constants';
import { QueryLogsDto } from './dto/healthlog.query.dto';
import { CreateLogsArrayDto } from './dto/healthlog.create.dto';
import { EStatisticTypes } from '../repositories/healthlog.repo.interface';

@Controller('/')
@UseGuards(ApiTokenGuard)
export class HealthLogController {
  protected readonly logger = new Logger(HealthLogController.name);

  constructor(private readonly healthlogService: HealthLogService) {}

  @Post('/logs')
  public async upload(@Body() createLogsDto: CreateLogsArrayDto) {
    try {
      await this.healthlogService.save(
        createLogsDto.logs.map((elem) => ({
          timestamp: new Date(elem.timestamp),
          severity: elem.severity,
          source: elem.source,
          message: elem.message,
          patientId: elem.patient_id,
        })),
      );

      return {
        status: 'Ok',
      };
    } catch (err: unknown) {
      const logMessage = `Error uploading logs: ${(err as Error).message}`;
      this.logger.error(logMessage);

      throw err instanceof HttpException
        ? err
        : new HttpException(
            { status: 'Failed', message: logMessage },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Get('/logs')
  public async getLogs(@Query() queryParams?: QueryLogsDto) {
    try {
      this.logger.log(
        `Retrieving logs for query params: ${JSON.stringify(queryParams)}`,
      );
      return this.healthlogService.getLogs(
        {
          severity: queryParams?.severity,
          after: queryParams?.after ? new Date(queryParams?.after) : undefined,
        },
        {
          offset: queryParams?.offset
            ? parseInt(queryParams.offset ?? '', 10)
            : 0,
          limit: queryParams?.limit
            ? parseInt(queryParams.limit ?? '', 10)
            : DEFAULT_DB_PAGINATION_LIMIT,
        },
      );
    } catch (err: unknown) {
      const logMessage = `Error retrieving logs: ${(err as Error).message}`;
      this.logger.error(logMessage);

      throw err instanceof HttpException
        ? err
        : new HttpException(
            { status: 'Failed', message: logMessage },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Get('/stats/:type')
  public async getStats(@Param('type') type: string) {
    try {
      if (!EnumUtils.isValueFromEnum(EStatisticTypes, type)) {
        throw new HttpException(
          { status: 'Failed', message: `Invalid stat type: ${type}` },
          HttpStatus.BAD_REQUEST,
        );
      }
      return this.healthlogService.getStatsByType(type as EStatisticTypes);
    } catch (err: unknown) {
      const logMessage = `Error retrieving stats: ${(err as Error).message}`;
      this.logger.error(logMessage);

      throw err instanceof HttpException
        ? err
        : new HttpException(
            { status: 'Failed', message: logMessage },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }
}
