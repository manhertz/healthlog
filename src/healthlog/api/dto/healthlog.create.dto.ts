// src/logs/api/dto/create-log.dto.ts
import { IsISO8601, IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { EHealthLogSeverities } from '../../../entities/HealthLog';
import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize } from 'class-validator';

class CreateLogDto {
  @IsISO8601()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsEnum(EHealthLogSeverities)
  severity: EHealthLogSeverities;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  patient_id: string;
}

export class CreateLogsArrayDto {
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one log entry is required' })
  @Type(() => CreateLogDto)
  logs: CreateLogDto[];
}
