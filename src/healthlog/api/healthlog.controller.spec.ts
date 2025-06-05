/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthLogController } from './healthlog.controller';
import { HealthLogService } from '../healthlog.service';
import { CreateLogsArrayDto } from './dto/healthlog.create.dto';
import { QueryLogsDto } from './dto/healthlog.query.dto';
import { EHealthLogSeverities } from '../../entities/HealthLog';
import { EStatisticTypes } from '../repositories/healthlog.repo.interface';
import { EnumUtils } from '../../utils/enum.util';
import { ApiTokenGuard } from '../../guards/apitoken.guard';
import { DEFAULT_DB_PAGINATION_LIMIT } from '../../config/constants';

describe('HealthLogController', () => {
  let healthlogController: HealthLogController;
  let healthlogService: HealthLogService;

  beforeEach(async () => {
    // Create a mock for the HealthLogService
    const mockHealthLogService = {
      save: jest.fn(),
      getLogs: jest.fn(),
      getStatsByType: jest.fn(),
    };

    // Create a mock for the ApiTokenGuard
    const mockApiTokenGuard = { canActivate: jest.fn().mockReturnValue(true) };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthLogController],
      providers: [
        {
          provide: HealthLogService,
          useValue: mockHealthLogService,
        },
      ],
    })
      .overrideGuard(ApiTokenGuard)
      .useValue(mockApiTokenGuard)
      .compile();

    healthlogController = app.get<HealthLogController>(HealthLogController);
    healthlogService = app.get<HealthLogService>(HealthLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(HealthLogController.prototype.upload.name, () => {
    it('should successfully validate health logs and return OK status', async () => {
      // Arrange
      const createLogDto = {
        timestamp: '2023-01-01T12:00:00Z',
        source: 'test-source',
        severity: EHealthLogSeverities.INFO,
        message: 'Test message',
        patient_id: 'patient123',
      };
      const createLogsArrayDto: CreateLogsArrayDto = {
        logs: [createLogDto],
      };
      jest.spyOn(healthlogService, 'save').mockResolvedValue(undefined);

      // Act
      const result = await healthlogController.upload(createLogsArrayDto);

      // Assert
      expect(healthlogService.save).toHaveBeenCalledWith([
        {
          timestamp: new Date(createLogDto.timestamp),
          severity: EHealthLogSeverities.INFO,
          source: 'test-source',
          message: 'Test message',
          patientId: 'patient123',
        },
      ]);
      expect(result).toEqual({ status: 'Ok' });
    });

    it('should throw HttpException when upload fails', async () => {
      // Arrange
      const createLogDto = {
        timestamp: '2023-01-01T12:00:00Z',
        source: 'test-source',
        severity: EHealthLogSeverities.INFO,
        message: 'Test message',
        patient_id: 'patient123',
      };
      const createLogsArrayDto: CreateLogsArrayDto = {
        logs: [createLogDto],
      };

      const errorMessage = 'Database connection error';
      jest
        .spyOn(healthlogService, 'save')
        .mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(() =>
        healthlogController.upload(createLogsArrayDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe(HealthLogController.prototype.getLogs.name, () => {
    it('should return logs with default pagination when no query params provided', async () => {
      // Arrange
      const mockLogs = {
        rows: [
          {
            id: '1',
            timestamp: new Date(),
            source: 'test',
            severity: EHealthLogSeverities.INFO,
            message: 'Test message',
            patientId: 'patient1',
          },
        ],
        count: 1,
      };
      jest.spyOn(healthlogService, 'getLogs').mockResolvedValue(mockLogs);

      // Act
      const result = await healthlogController.getLogs();

      // Assert
      expect(healthlogService.getLogs).toHaveBeenCalledWith(
        {},
        { offset: 0, limit: DEFAULT_DB_PAGINATION_LIMIT },
      );
      expect(result).toEqual(mockLogs);
    });

    it('should apply filters and pagination from query params', async () => {
      // Arrange
      const queryParams: QueryLogsDto = {
        severity: EHealthLogSeverities.ERROR,
        after: '2023-01-01T00:00:00Z',
        limit: '10',
        offset: '5',
      };

      const mockLogs = {
        rows: [
          {
            id: '1',
            timestamp: new Date(),
            source: 'test',
            severity: EHealthLogSeverities.INFO,
            message: 'Test message',
            patientId: 'patient1',
          },
        ],
        count: 1,
      };
      jest.spyOn(healthlogService, 'getLogs').mockResolvedValue(mockLogs);

      // Act
      const result = await healthlogController.getLogs(queryParams);

      // Assert
      expect(healthlogService.getLogs).toHaveBeenCalledWith(
        {
          severity: EHealthLogSeverities.ERROR,
          after: expect.any(Date),
        },
        {
          offset: 5,
          limit: 10,
        },
      );
      expect(result).toEqual(mockLogs);
    });

    it('should throw HttpException when getLogs fails', async () => {
      // Arrange
      const errorMessage = 'Database query error';
      const httpException = new HttpException(
        { status: 'Failed', message: errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(healthlogService, 'getLogs').mockRejectedValue(httpException);

      // Act & Assert
      await expect(healthlogController.getLogs()).rejects.toThrow(
        HttpException,
      );
      await expect(healthlogController.getLogs()).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          response: expect.objectContaining({
            status: 'Failed',
            message: expect.stringContaining(errorMessage),
          }),
        }),
      );
    });
  });

  describe(HealthLogController.prototype.getStats.name, () => {
    it('should return statistics for valid stat type', async () => {
      // the statType is a request url parameter, so it's always a string
      const statType = `${EStatisticTypes.SEVERITY}`;
      const mockStats = {
        info: 10,
        warning: 5,
        error: 2,
      };
      jest
        .spyOn(healthlogService, 'getStatsByType')
        .mockResolvedValue(mockStats);
      jest.spyOn(EnumUtils, 'isValueFromEnum');

      // Act
      const result = await healthlogController.getStats(statType);

      // Assert
      expect(EnumUtils.isValueFromEnum).toHaveBeenCalledWith(
        EStatisticTypes,
        statType,
      );
      expect(healthlogService.getStatsByType).toHaveBeenCalledWith(statType);
      expect(result).toEqual(mockStats);
    });

    it('should throw BadRequest HttpException for invalid stat type', async () => {
      // Arrange
      const invalidStatType = 'invalid_type';

      // Override the mock for this specific test
      jest.spyOn(EnumUtils, 'isValueFromEnum').mockReturnValueOnce(false);

      // Act & Assert
      await expect(
        healthlogController.getStats(invalidStatType),
      ).rejects.toThrow(HttpException);
      await expect(
        healthlogController.getStats(invalidStatType),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          response: expect.objectContaining({
            status: 'Failed',
            message: expect.stringContaining(invalidStatType),
          }),
        }),
      );

      expect(healthlogService.getStatsByType).not.toHaveBeenCalled();
    });

    it('should propagate HttpException thrown by service', async () => {
      // Arrange
      const statType = 'severity';
      const httpException = new HttpException(
        'Service error',
        HttpStatus.SERVICE_UNAVAILABLE,
      );

      jest
        .spyOn(healthlogService, 'getStatsByType')
        .mockRejectedValue(httpException);

      // Act & Assert
      await expect(healthlogController.getStats(statType)).rejects.toThrow(
        HttpException,
      );
      await expect(healthlogController.getStats(statType)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.SERVICE_UNAVAILABLE,
        }),
      );
    });

    it('should propagate HttpException errors', async () => {
      // Arrange
      const statType = 'severity';
      const errorMessage = 'Database error';

      const httpException = new HttpException(
        { status: 'Failed', message: errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(healthlogService, 'getStatsByType')
        .mockRejectedValue(httpException);

      // Act & Assert
      await expect(healthlogController.getStats(statType)).rejects.toThrow(
        HttpException,
      );
      await expect(healthlogController.getStats(statType)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          response: expect.objectContaining({
            status: 'Failed',
            message: expect.stringContaining(errorMessage),
          }),
        }),
      );
    });
  });
});
