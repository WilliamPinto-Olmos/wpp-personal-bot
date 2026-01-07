import cron from "node-cron";
import type { Reminder } from "../types/reminder.types.js";
import type { IReminderScheduler } from "./scheduler.interface.js";
import { DateTime } from "luxon";

/**
 * Scheduler implementation using node-cron.
 * Manages scheduled tasks in memory.
 */
export class NodeCronReminderScheduler implements IReminderScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Schedules a reminder.
   * Node-cron uses a cron expression. We convert the trigger date to cron.
   */
  schedule(reminder: Reminder, callback: () => Promise<void>): void {
    // If it's already in the past, don't schedule, just execute (or ignore depending on policy)
    const triggerDate = DateTime.fromJSDate(reminder.triggerAt);
    const now = DateTime.now();

    if (triggerDate <= now) {
      console.warn(`[NodeCronReminderScheduler] Reminder ${reminder.id} is in the past, skipping scheduler.`);
      return;
    }

    // Convert Date to cron: "ss mm HH dd MM *"
    const cronExpression = `${triggerDate.second} ${triggerDate.minute} ${triggerDate.hour} ${triggerDate.day} ${triggerDate.month} *`;

    const task = cron.schedule(cronExpression, async () => {
      try {
        await callback();
      } finally {
        this.tasks.delete(reminder.id);
        task.stop();
      }
    }, {
      timezone: "UTC" // The server runs in UTC
    });

    this.tasks.set(reminder.id, task);
    console.log(`[NodeCronReminderScheduler] Scheduled reminder ${reminder.id} at ${triggerDate.toISO()}`);
  }

  /**
   * Cancels a scheduled task.
   */
  cancel(reminderId: string): void {
    const task = this.tasks.get(reminderId);
    if (task) {
      task.stop();
      this.tasks.delete(reminderId);
      console.log(`[NodeCronReminderScheduler] Cancelled reminder ${reminderId}`);
    }
  }
}
