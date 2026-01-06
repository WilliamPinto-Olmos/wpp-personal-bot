import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirestoreGroupFeaturesRepository } from "../../../repositories/firestore/group-features.repository.js";
import type { GroupFeatures } from "../../../types/index.js";

const { mockDoc, mockCollection, mockSet, mockGet } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockDoc = vi.fn().mockReturnValue({
    set: mockSet,
    get: mockGet,
  });
  const mockCollection = vi.fn().mockReturnValue({
    doc: mockDoc,
    get: mockGet,
  });
  return { mockDoc, mockCollection, mockSet, mockGet };
});

vi.mock("../../../config/firebase.js", () => ({
  db: {
    collection: mockCollection,
  },
}));

describe("FirestoreGroupFeaturesRepository", () => {
  let repo: FirestoreGroupFeaturesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FirestoreGroupFeaturesRepository();
  });

  const testFeatures: GroupFeatures = {
    groupId: "group-1",
    enabledFeatures: ["resumen"],
  };

  it("should get features for existing group", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => testFeatures,
    });

    const result = await repo.getFeatures("group-1");

    expect(mockCollection).toHaveBeenCalledWith("group_features");
    expect(result).toEqual(testFeatures);
  });

  it("should return null for unconfigured group", async () => {
    mockGet.mockResolvedValueOnce({
      exists: false,
    });

    const result = await repo.getFeatures("new-group");
    expect(result).toBeNull();
  });

  it("should set features for group", async () => {
    await repo.setFeatures(testFeatures);

    expect(mockDoc).toHaveBeenCalledWith("group-1");
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      groupId: "group-1",
      enabledFeatures: ["resumen"],
    }));
  });

  it("should verify if a feature is enabled", async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => testFeatures,
    });

    const isEnabled = await repo.isFeatureEnabled("group-1", "resumen");
    const isDisabled = await repo.isFeatureEnabled("group-1", "info");

    expect(isEnabled).toBe(true);
    expect(isDisabled).toBe(false);
  });

  it("should use defaults when group has no configuration", async () => {
    mockGet.mockResolvedValue({
      exists: false,
    });

    const isResumenEnabled = await repo.isFeatureEnabled("new-group", "resumen");
    const isInfoEnabled = await repo.isFeatureEnabled("new-group", "info");
    const isReminderEnabled = await repo.isFeatureEnabled("new-group", "reminder");

    expect(isResumenEnabled).toBe(true);
    expect(isInfoEnabled).toBe(true);
    expect(isReminderEnabled).toBe(false);
  });
});
