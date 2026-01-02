import { describe, it, expect } from "vitest";
import { InMemoryGroupFeaturesRepository } from "../../repositories/in-memory/group-features.repository.js";

describe("InMemoryGroupFeaturesRepository", () => {
  it("should save and retrieve features", async () => {
    const repo = new InMemoryGroupFeaturesRepository();

    await repo.setFeatures({
      groupId: "group@g.us",
      enabledFeatures: ["resumen", "poll"],
    });

    const features = await repo.getFeatures("group@g.us");

    expect(features).not.toBeNull();
    expect(features?.enabledFeatures).toContain("resumen");
    expect(features?.enabledFeatures).toContain("poll");
  });

  it("should return null for non-existent group", async () => {
    const repo = new InMemoryGroupFeaturesRepository();

    const features = await repo.getFeatures("non-existent@g.us");

    expect(features).toBeNull();
  });

  it("should check if feature is enabled (exists in config)", async () => {
    const repo = new InMemoryGroupFeaturesRepository();

    await repo.setFeatures({
      groupId: "group@g.us",
      enabledFeatures: ["resumen"],
    });

    const isResumenEnabled = await repo.isFeatureEnabled(
      "group@g.us",
      "resumen"
    );
    const isPollEnabled = await repo.isFeatureEnabled("group@g.us", "poll");

    expect(isResumenEnabled).toBe(true);
    expect(isPollEnabled).toBe(false);
  });

  it("should use default features for unconfigured groups", async () => {
    const repo = new InMemoryGroupFeaturesRepository();

    const isResumenEnabled = await repo.isFeatureEnabled(
      "unconfigured@g.us",
      "resumen"
    );

    expect(isResumenEnabled).toBe(true);
  });

  it("should seed features correctly", async () => {
    const repo = new InMemoryGroupFeaturesRepository();

    repo.seedFeatures("group@g.us", ["poll", "reminder"]);

    await expect(repo.isFeatureEnabled("group@g.us", "poll")).resolves.toBe(
      true
    );
    await expect(repo.isFeatureEnabled("group@g.us", "reminder")).resolves.toBe(
      true
    );
    await expect(repo.isFeatureEnabled("group@g.us", "resumen")).resolves.toBe(
      false
    );
  });

  it("should clear all features", async () => {
    const repo = new InMemoryGroupFeaturesRepository();

    await repo.setFeatures({
      groupId: "group@g.us",
      enabledFeatures: ["resumen"],
    });

    repo.clear();

    const features = await repo.getFeatures("group@g.us");
    expect(features).toBeNull();
  });
});
