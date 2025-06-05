import { Sequelize } from 'sequelize-typescript';
import { HealthLogModel } from '../healthlog/repositories/healthlog.model';
import { HealthLogRepository } from '../healthlog/repositories/healthlog.repo';
import { EHealthLogSeverities } from '../entities/HealthLog';

// Using void operator to explicitly mark the promise as intentionally not awaited
void (async function initAndSeed() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db-healthlog.sqlite',
    models: [HealthLogModel],
    logging: true,
  });
  await sequelize.dropAllSchemas({ logging: true });
  await sequelize.sync();

  const healtLogRepo = new HealthLogRepository(HealthLogModel);

  await healtLogRepo.save([
    {
      timestamp: new Date('2025-03-01T14:25:43Z'),
      source: 'medication-service',
      severity: EHealthLogSeverities.ERROR,
      message: 'User XYZ failed medication eligibility check',
      patientId: 'aam434',
    },
    {
      timestamp: new Date('2025-04-12T09:00:00Z'),
      source: 'test-station',
      severity: EHealthLogSeverities.INFO,
      message: 'Proband tested negative for XX',
      patientId: 'bqa941',
    },
    {
      timestamp: new Date('2025-04-14T09:00:00Z'),
      source: 'test-station',
      severity: EHealthLogSeverities.INFO,
      message: 'Proband tested negative for ZZZZ',
      patientId: 'fxx345',
    },
    {
      timestamp: new Date('2025-05-20T18:12:00Z'),
      source: 'vitals-monitor',
      severity: EHealthLogSeverities.INFO,
      message: 'Heartbeat within normal range',
      patientId: 'abc123',
    },
    {
      timestamp: new Date('2025-05-20T18:12:00Z'),
      source: 'vitals-monitor',
      severity: EHealthLogSeverities.WARNING,
      message: 'Blood pressure outside of normal range',
      patientId: 'abc123',
    },
    {
      timestamp: new Date('2025-05-22T18:12:00Z'),
      source: 'vitals-monitor',
      severity: EHealthLogSeverities.INFO,
      message: 'Heartbeat within normal range',
      patientId: 'abx444',
    },
  ]);

  console.log('');
  console.log('✅ Seed completed');
  console.log('');
})();
