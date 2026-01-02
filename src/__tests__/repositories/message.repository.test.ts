import { describe, it, expect } from "vitest";
import { InMemoryMessageRepository } from "../../repositories/in-memory/message.repository.js";
import type { ProcessedMessage, DetectedIntent } from "../../types/index.js";

function createTestMessage(id: string, chatId: string): ProcessedMessage {
  const intent: DetectedIntent = {
    type: "resumen",
    params: { messageCount: 100 },
    confidence: 0.9,
  };
  return {
    id,
    chatId,
    sender: {
      id: "sender@c.us",
      pushName: "Test User",
      phoneNumber: "1234567890",
    },
    originalBody: "willy willito test",
    cleanedBody: "test",
    intent,
    response: "Test response",
    processedAt: new Date(),
  };
}

describe("InMemoryMessageRepository", () => {
  it("should save and retrieve a message by id", async () => {
    const repo = new InMemoryMessageRepository();
    const message = createTestMessage("msg-1", "group@g.us");

    await repo.save(message);
    const retrieved = await repo.findById("msg-1");

    expect(retrieved).toEqual(message);
  });

  it("should return null for non-existent message", async () => {
    const repo = new InMemoryMessageRepository();

    const retrieved = await repo.findById("non-existent");

    expect(retrieved).toBeNull();
  });

  it("should find messages by group id", async () => {
    const repo = new InMemoryMessageRepository();

    await repo.save(createTestMessage("msg-1", "group1@g.us"));
    await repo.save(createTestMessage("msg-2", "group1@g.us"));
    await repo.save(createTestMessage("msg-3", "group2@g.us"));

    const group1Messages = await repo.findByGroupId("group1@g.us");

    expect(group1Messages).toHaveLength(2);
    expect(group1Messages.every((m) => m.chatId === "group1@g.us")).toBe(true);
  });

  it("should limit results when finding by group id", async () => {
    const repo = new InMemoryMessageRepository();

    for (let i = 0; i < 10; i++) {
      await repo.save(createTestMessage(`msg-${i}`, "group@g.us"));
    }

    const messages = await repo.findByGroupId("group@g.us", 5);

    expect(messages).toHaveLength(5);
  });

  it("should clear all messages", async () => {
    const repo = new InMemoryMessageRepository();

    await repo.save(createTestMessage("msg-1", "group@g.us"));
    await repo.save(createTestMessage("msg-2", "group@g.us"));

    repo.clear();

    expect(repo.count()).toBe(0);
  });

  it("should return correct count", async () => {
    const repo = new InMemoryMessageRepository();

    expect(repo.count()).toBe(0);

    await repo.save(createTestMessage("msg-1", "group@g.us"));
    expect(repo.count()).toBe(1);

    await repo.save(createTestMessage("msg-2", "group@g.us"));
    expect(repo.count()).toBe(2);
  });
});
