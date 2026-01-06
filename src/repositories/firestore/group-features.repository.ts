import { db } from "../../config/firebase.js";
import type { GroupFeatures, FeatureType, GroupFeaturesDocument } from "../../types/index.js";
import type { IGroupFeaturesRepository } from "../interfaces.js";
import type { CollectionReference } from "firebase-admin/firestore";

/**
 * Firestore implementation of the group features repository.
 * Controls which bot features are enabled for each group persistently.
 */
export class FirestoreGroupFeaturesRepository implements IGroupFeaturesRepository {
  private readonly collection = db.collection("group_features") as CollectionReference<GroupFeaturesDocument>;

  /**
   * Default features enabled for groups without explicit configuration.
   */
  private readonly defaultFeatures: FeatureType[] = ["resumen", "info"];

  async getFeatures(groupId: string): Promise<GroupFeatures | null> {
    const doc = await this.collection.doc(groupId).get();
    
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return data ? { groupId: data.groupId, enabledFeatures: data.enabledFeatures } : null;
  }

  async setFeatures(features: GroupFeatures): Promise<void> {
    const docRef = this.collection.doc(features.groupId);
    
    const document: GroupFeaturesDocument = {
      ...features,
      id: features.groupId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(document);
  }

  async isFeatureEnabled(groupId: string, feature: string): Promise<boolean> {
    const groupFeatures = await this.getFeatures(groupId);

    if (!groupFeatures) {
      return this.defaultFeatures.includes(feature as FeatureType);
    }

    return groupFeatures.enabledFeatures.includes(feature as FeatureType);
  }
}
