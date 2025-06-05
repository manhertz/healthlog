import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { HealthLog, EHealthLogSeverities } from '../../entities/HealthLog';

@Table({
  tableName: 'health_logs',
  timestamps: false,
  indexes: [
    {
      fields: ['severity'],
    },
    {
      fields: ['source'],
    },
  ],
})
export class HealthLogModel extends Model implements HealthLog {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.STRING,
  })
  declare public id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare public timestamp: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare public source: string;

  @Column({
    type: DataType.ENUM(...Object.values(EHealthLogSeverities)),
    allowNull: false,
    defaultValue: EHealthLogSeverities.INFO,
    validate: {
      isIn: [Object.values(EHealthLogSeverities)],
    },
  })
  declare public severity: EHealthLogSeverities;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare public message: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare public patientId: string | null;
}
