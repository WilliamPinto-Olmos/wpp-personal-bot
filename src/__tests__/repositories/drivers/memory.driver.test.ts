import { describe, it, expect } from "vitest";
import { MemoryDriver } from "../../../repositories/drivers/memory.driver.js";
import { InMemoryMessageRepository } from "../../../repositories/in-memory/message.repository.js";
import { InMemoryGroupFeaturesRepository } from "../../../repositories/in-memory/group-features.repository.js";

describe("MemoryDriver", () => {
  it("should have name 'memory'", () => {
    const driver = new MemoryDriver();
    expect(driver.name).toBe("memory");
  });

  it("should expose memory repositories", () => {
    const driver = new MemoryDriver();
    expect(driver.messages).toBeInstanceOf(InMemoryMessageRepository);
    expect(driver.groupFeatures).toBeInstanceOf(InMemoryGroupFeaturesRepository);
  });

  it("should initialize without error", async () => {
    const driver = new MemoryDriver();
    await expect(driver.initialize()).resolves.toBeUndefined();
  });

  it("should disconnect without error", async () => {
    const driver = new MemoryDriver();
    await expect(driver.disconnect()).resolves.toBeUndefined();
  });
});
