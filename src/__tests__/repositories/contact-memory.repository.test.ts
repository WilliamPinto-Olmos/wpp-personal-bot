import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryContactMemoryRepository } from "../../repositories/in-memory/contact-memory.repository.js";

describe("InMemoryContactMemoryRepository", () => {
  let repo: InMemoryContactMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryContactMemoryRepository();
  });

  it("should store and retrieve general preferences", async () => {
    const contactId = "user123";
    await repo.upsertGeneralPreference(contactId, "Llamame Alan");
    
    const memory = await repo.getMemory(contactId);
    expect(memory).not.toBeNull();
    expect(memory?.generalPreferences).toContain("Llamame Alan");
  });

  it("should store and retrieve multiple feature preferences", async () => {
    const contactId = "user123";
    await repo.upsertFeaturePreference(contactId, "resumen", "Breve");
    await repo.upsertFeaturePreference(contactId, "resumen", "Sin emojis");
    await repo.upsertFeaturePreference(contactId, "info", "Formal");

    const memory = await repo.getMemory(contactId);
    expect(memory?.featurePreferences["resumen"]).toEqual(["Breve", "Sin emojis"]);
    expect(memory?.featurePreferences["info"]).toEqual(["Formal"]);
  });

  it("should not duplicate identical preferences", async () => {
    const contactId = "user123";
    await repo.upsertGeneralPreference(contactId, "Pref1");
    await repo.upsertGeneralPreference(contactId, "Pref1");

    const memory = await repo.getMemory(contactId);
    expect(memory?.generalPreferences).toHaveLength(1);
  });

  it("should return null for non-existent contacts", async () => {
    const memory = await repo.getMemory("unknown");
    expect(memory).toBeNull();
  });
});
