// src/logs/api/dto/query-logs.dto.ts
import {
  IsEnum,
  IsOptional,
  IsISO8601,
  ValidationOptions,
} from 'class-validator';
import { EHealthLogSeverities } from '../../../entities/HealthLog';

// TODO: this should be moved into a separate validator utility file

function IsStringNumber(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    const value = object[propertyName] as string | undefined;
    if (value !== undefined) {
      if (typeof value !== 'string') {
        validationOptions = { message: 'The parameter must be a number' };
      }
      if (isNaN(parseInt(value, 10))) {
        validationOptions = { message: 'The parameter must be a valid number' };
      }
    }
  };
}

export class QueryLogsDto {
  @IsOptional()
  @IsEnum(EHealthLogSeverities)
  severity?: EHealthLogSeverities;

  @IsOptional()
  @IsISO8601()
  after?: string;

  @IsOptional()
  @IsStringNumber()
  limit?: string;

  @IsOptional()
  @IsStringNumber()
  offset?: string;
}
