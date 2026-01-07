/**
 * Represents a reminder scheduled by a user.
 * Records are stored scoped by chat and contact.
 */
export interface Reminder {
  /** Unique reminder ID */
  id: string;
  /** The WhatsApp chat identifier where the reminder was created */
  chatId: string;
  /** The WhatsApp contact identifiers of the user who created it */
  contactId: string;
  /** The message to remind the user about */
  message: string;
  /** The date and time when the reminder should be triggered */
  triggerAt: Date;
  /** When the reminder was created */
  createdAt: Date;
  /** Current status of the reminder */
  status: 'pending' | 'delivered' | 'cancelled';
}
