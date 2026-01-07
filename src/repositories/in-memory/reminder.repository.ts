import type { Reminder } from "../../types/reminder.types.js";
import type { IReminderRepository } from "../reminder.repository.interface.js";

/**
 * In-memory implementation of the reminder repository.
 * Useful for development and automated testing.
 */
export class InMemoryReminderRepository implements IReminderRepository {
  private reminders: Map<string, Reminder> = new Map();

  async save(reminder: Reminder): Promise<void> {
    this.reminders.set(reminder.id, { ...reminder });
  }

  async findByChatAndContact(chatId: string, contactId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (r) => r.chatId === chatId && r.contactId === contactId
    );
  }

  async findById(id: string): Promise<Reminder | null> {
    return this.reminders.get(id) || null;
  }

  async update(id: string, updates: Partial<Reminder>): Promise<void> {
    const reminder = this.reminders.get(id);
    if (reminder) {
      this.reminders.set(id, { ...reminder, ...updates });
    }
  }

  async delete(id: string): Promise<void> {
    this.reminders.delete(id);
  }

  async findPending(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter((r) => r.status === "pending");
  }
}
