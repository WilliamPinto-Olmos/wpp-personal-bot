import type { ContactInfo, DetectedIntent, FeatureType } from "./index.js";

/**
 * Base entity with audit fields.
 * All persisted documents should extend this interface.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message document for persistence.
 * Extends the basic ProcessedMessage with audit fields.
 */
export interface MessageDocument extends BaseEntity {
  chatId: string;
  sender: ContactInfo;
  originalBody: string;
  cleanedBody: string;
  intent: DetectedIntent;
  response: string;
  processedAt: Date;
}

/**
 * Group features document for persistence.
 * Extends GroupFeatures with audit fields.
 */
export interface GroupFeaturesDocument extends BaseEntity {
  groupId: string;
  enabledFeatures: FeatureType[];
}
