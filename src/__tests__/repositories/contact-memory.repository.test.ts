import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryContactMemoryRepository } from "../../repositories/in-memory/contact-memory.repository.js";

describe("InMemoryContactMemoryRepository", () => {
  let repo: InMemoryContactMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryContactMemoryRepository();
  });

  it("should store and retrieve contact memory per chat", async () => {
    const chatId = "chat123";
    const contactId = "user123";
    const memory = {
      contactId,
      generalPreferences: ["Llamame Alan"],
      featurePreferences: { resumen: ["breve"] },
      updatedAt: new Date(),
    };

    await repo.saveMemory(chatId, memory);
    
    const retrieved = await repo.getMemory(chatId, contactId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.generalPreferences).toContain("Llamame Alan");
  });

  it("should isolate memories between different chats", async () => {
    const chat1 = "chat1";
    const chat2 = "chat2";
    const contactId = "user123";
    
    await repo.saveMemory(chat1, {
      contactId,
      generalPreferences: ["Pref1"],
      featurePreferences: {},
      updatedAt: new Date(),
    });

    const inChat2 = await repo.getMemory(chat2, contactId);
    expect(inChat2).toBeNull();

    const inChat1 = await repo.getMemory(chat1, contactId);
    expect(inChat1?.generalPreferences).toContain("Pref1");
  });

  it("should return null for non-existent contacts in a chat", async () => {
    const memory = await repo.getMemory("chat1", "unknown");
    expect(memory).toBeNull();
  });
});
