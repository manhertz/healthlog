export enum EHealthLogSeverities {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Represents a single health log entry.
 */
export interface HealthLog {
  /**
   * Unique internal identifier for the log entry
   */
  id: string;
  /**
   * Timestamp when the event occurred
   */
  timestamp: Date;
  /**
   * Source of the event
   */
  source: string;
  /**
   * Severity level of the event
   */
  severity: EHealthLogSeverities;
  /**
   * Message describing the event
   */
  message: string;
  /**
   * Optional ID of the patient associated with the event
   */
  patientId: string | null;
}
