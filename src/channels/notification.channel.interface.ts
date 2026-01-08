/**
 * Interface for push notification channels.
 * Used for autonomous bot messages like reminders.
 */
export interface INotificationChannel {
  /**
   * Sends a simple notification message to a specific chat.
   * @param chatId - Destination chat ID
   * @param content - Message content
   */
  send(chatId: string, content: string): Promise<void>;
}
