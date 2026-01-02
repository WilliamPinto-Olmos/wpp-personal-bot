import type { GroupFeatures, FeatureType } from "../../types/index.js";
import type { IGroupFeaturesRepository } from "../interfaces.js";

/**
 * In-memory implementation of the group features repository.
 * Used for development and testing purposes.
 * Data is lost when the application restarts.
 */
export class InMemoryGroupFeaturesRepository
  implements IGroupFeaturesRepository
{
  private features: Map<string, GroupFeatures> = new Map();

  /**
   * Default features enabled for groups without explicit configuration.
   * All features are enabled by default for development convenience.
   */
  private readonly defaultFeatures: FeatureType[] = ["resumen", "info"];

  async getFeatures(groupId: string): Promise<GroupFeatures | null> {
    return this.features.get(groupId) ?? null;
  }

  async setFeatures(features: GroupFeatures): Promise<void> {
    this.features.set(features.groupId, features);
  }

  async isFeatureEnabled(groupId: string, feature: string): Promise<boolean> {
    const groupFeatures = await this.getFeatures(groupId);

    if (!groupFeatures) {
      return this.defaultFeatures.includes(feature as FeatureType);
    }

    return groupFeatures.enabledFeatures.includes(feature as FeatureType);
  }

  /**
   * Clears all stored feature configurations.
   * Useful for testing purposes.
   */
  clear(): void {
    this.features.clear();
  }

  /**
   * Pre-configures features for a group.
   * Useful for testing and initial setup.
   */
  seedFeatures(groupId: string, features: FeatureType[]): void {
    this.features.set(groupId, { groupId, enabledFeatures: features });
  }
}
