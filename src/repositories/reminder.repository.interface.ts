import type { Reminder } from "../types/reminder.types.js";

/**
 * Repository interface for managing reminders persistence.
 * Implementations handle storage and retrieval of user reminders.
 */
export interface IReminderRepository {
  /**
   * Saves a new reminder or updates an existing one.
   * @param reminder The reminder object to save
   */
  save(reminder: Reminder): Promise<void>;

  /**
   * Retrieves all reminders for a specific contact within a chat.
   * @param chatId WhatsApp chat ID
   * @param contactId WhatsApp contact ID
   */
  findByChatAndContact(chatId: string, contactId: string): Promise<Reminder[]>;

  /**
   * Retrieves a specific reminder by its ID.
   * @param id Reminder ID
   */
  findById(id: string): Promise<Reminder | null>;

  /**
   * Updates specific fields of a reminder.
   * @param id Reminder ID
   * @param updates Partial reminder object
   */
  update(id: string, updates: Partial<Reminder>): Promise<void>;

  /**
   * Removes a reminder from persistence.
   * @param id Reminder ID
   */
  delete(id: string): Promise<void>;

  /**
   * Retrieves all pending reminders.
   * Useful for rescheduling reminders when the application restarts.
   */
  findPending(): Promise<Reminder[]>;
}
