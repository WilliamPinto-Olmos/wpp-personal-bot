/**
 * Interface for push notification channels.
 * Used for autonomous bot messages like reminders.
 */
export interface INotificationChannel {
  /**
   * Sends a simple notification message to a specific chat.
   * @param chatId - Destination chat ID
   * @param content - Message content
   * @param options - Optional parameters
   * @param options.mentions - Array of contact IDs to mention (format: "xxx@c.us")
   */
  send(chatId: string, content: string, options?: { mentions?: string[] }): Promise<void>;
}
