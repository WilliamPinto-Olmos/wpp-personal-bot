import type {
  IMessageRepository,
  IGroupFeaturesRepository,
  IContactMemoryRepository,
} from "./interfaces.js";

/**
 * Database driver abstraction.
 * Encapsulates the repositories and lifecycle management for a specific database backend.
 */
export interface IDatabaseDriver {
  /** The unique name of the driver */
  readonly name: "memory" | "firestore";

  /** Repository for message persistence */
  readonly messages: IMessageRepository;

  /** Repository for group feature configurations */
  readonly groupFeatures: IGroupFeaturesRepository;

  /** Repository for contact-specific memory */
  readonly contactMemories: IContactMemoryRepository;

  /**
   * Initializes the database connection and prepares repositories.
   */
  initialize(): Promise<void>;

  /**
   * Gracefully closes the database connection.
   */
  disconnect(): Promise<void>;
}
