import type { IReminderRepository } from "../repositories/index.js";
import type { IReminderScheduler } from "../scheduler/scheduler.interface.js";
import type { Reminder } from "../types/reminder.types.js";
import type { INotificationChannel } from "../channels/notification.channel.interface.js";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";

/**
 * Service that orchestrates the lifecycle of reminders.
 * Coordinates persistence, scheduling, and delivery via notification channels.
 */
export class ReminderService {
  constructor(
    private repository: IReminderRepository,
    private scheduler: IReminderScheduler,
    private notificationChannel: INotificationChannel
  ) {}

  /**
   * Loads all pending reminders from the repository and schedules them.
   * Call this during application initialization.
   */
  async initialize(): Promise<void> {
    const pendingReminders = await this.repository.findPending();
    console.log(`[ReminderService] Loading ${pendingReminders.length} pending reminders...`);
    
    for (const reminder of pendingReminders) {
      this.scheduleReminder(reminder);
    }
  }

  /**
   * Creates a new reminder and schedules it.
   */
  async createReminder(params: {
    chatId: string;
    contactId: string;
    message: string;
    triggerAt: Date;
  }): Promise<Reminder> {
    const reminder: Reminder = {
      id: randomUUID(),
      chatId: params.chatId,
      contactId: params.contactId,
      message: params.message,
      triggerAt: params.triggerAt,
      createdAt: new Date(),
      status: "pending",
    };

    await this.repository.save(reminder);
    this.scheduleReminder(reminder);
    return reminder;
  }

  /**
   * Schedules a reminder in the scheduler.
   */
  private scheduleReminder(reminder: Reminder): void {
    const now = new Date();
    if (reminder.triggerAt <= now) {
      // If it's in the past (e.g., missed while bot was down), trigger immediately or mark as delivered
      this.triggerReminder(reminder);
      return;
    }

    this.scheduler.schedule(reminder, () => this.triggerReminder(reminder));
  }

  /**
   * Action to perform when a reminder is triggered.
   */
  private async triggerReminder(reminder: Reminder): Promise<void> {
    console.log(`[ReminderService] Triggering reminder ${reminder.id} for chat ${reminder.chatId}`);
    
    try {
      // Send the WhatsApp message
      // We use a friendly message format
      const text = `🔔 *RECORDATORIO* 🔔\n\nHola! Me pediste que te recordara:\n"${reminder.message}"`;
      
      await this.notificationChannel.send(reminder.chatId, text);

      // Update status in repository
      await this.repository.update(reminder.id, { status: "delivered" });
      console.log(`[ReminderService] Reminder ${reminder.id} delivered.`);
    } catch (error) {
      console.error(`[ReminderService] Failed to deliver reminder ${reminder.id}:`, error);
    }
  }

  /**
   * Retrieves active reminders for a specific user.
   */
  async getReminders(chatId: string, contactId: string): Promise<Reminder[]> {
    return this.repository.findByChatAndContact(chatId, contactId);
  }

  /**
   * Cancels a reminder.
   */
  async cancelReminder(reminderId: string): Promise<void> {
    await this.repository.update(reminderId, { status: "cancelled" });
    this.scheduler.cancel(reminderId);
  }

  /**
   * Updates an existing reminder.
   */
  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    await this.repository.update(reminderId, updates);
    
    // If trigger date changed, we need to reschedule
    if (updates.triggerAt) {
      const updatedReminder = await this.repository.findById(reminderId);
      if (updatedReminder && updatedReminder.status === "pending") {
        this.scheduler.cancel(reminderId);
        this.scheduleReminder(updatedReminder);
      }
    }
  }
}
