import { describe, it, expect, vi } from "vitest";
import { FirestoreDriver } from "../../../repositories/drivers/firestore.driver.js";
import { FirestoreMessageRepository } from "../../../repositories/firestore/message.repository.js";
import { FirestoreGroupFeaturesRepository } from "../../../repositories/firestore/group-features.repository.js";

vi.mock("../../../config/firebase.js", () => ({
  db: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
  },
}));

describe("FirestoreDriver", () => {
  it("should have name 'firestore'", () => {
    const driver = new FirestoreDriver();
    expect(driver.name).toBe("firestore");
  });

  it("should expose firestore repositories", () => {
    const driver = new FirestoreDriver();
    expect(driver.messages).toBeInstanceOf(FirestoreMessageRepository);
    expect(driver.groupFeatures).toBeInstanceOf(FirestoreGroupFeaturesRepository);
  });

  it("should initialize connection", async () => {
    const driver = new FirestoreDriver();
    await expect(driver.initialize()).resolves.toBeUndefined();
  });

  it("should disconnect gracefully", async () => {
    const driver = new FirestoreDriver();
    await expect(driver.disconnect()).resolves.toBeUndefined();
  });
});
