import type { Reminder } from "../types/reminder.types.js";

/**
 * Interface for scheduling and managing reminder execution.
 * Abstracts the underlying mechanism (e.g., node-cron, setTimeout).
 */
export interface IReminderScheduler {
  /**
   * Schedules a reminder to be executed at its triggerAt time.
   * @param reminder The reminder to schedule
   * @param callback The function to execute when the reminder triggers
   */
  schedule(reminder: Reminder, callback: () => Promise<void>): void;

  /**
   * Cancels a scheduled reminder.
   * @param reminderId The ID of the reminder to cancel
   */
  cancel(reminderId: string): void;
}
