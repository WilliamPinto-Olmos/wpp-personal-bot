import { describe, it, expect } from "vitest";
import { CharacterLimitValidator } from "../../pipeline/validators/character-limit.validator.js";
import { createContext } from "../../pipeline/types.js";
import type { IncomingMessage } from "../../types/index.js";

function createTestMessage(body: string): IncomingMessage {
  return {
    id: "test-id",
    chatId: "group@g.us",
    sender: {
      id: "sender@c.us",
      pushName: "Test User",
      phoneNumber: "1234567890",
    },
    body,
    timestamp: new Date(),
    isGroup: true,
  };
}

describe("CharacterLimitValidator", () => {
  describe("with default limit (200 chars)", () => {
    const validator = new CharacterLimitValidator();

    it("should pass when cleanedBody is within limit", async () => {
      const message = createTestMessage("original message");
      const ctx = { ...createContext(message), cleanedBody: "short message" };
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should pass when cleanedBody is exactly at limit", async () => {
      const message = createTestMessage("original");
      const ctx = { ...createContext(message), cleanedBody: "a".repeat(200) };
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(true);
    });

    it("should stop and return error when cleanedBody exceeds limit", async () => {
      const message = createTestMessage("original");
      const ctx = { ...createContext(message), cleanedBody: "a".repeat(201) };
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(false);
      expect(result.response).toContain("200");
    });

    it("should use message body when cleanedBody is not set", async () => {
      const message = createTestMessage("a".repeat(201));
      const ctx = createContext(message);
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(false);
      expect(result.response).toContain("200");
    });
  });

  describe("with custom limit", () => {
    const validator = new CharacterLimitValidator(50);

    it("should use custom limit for validation", async () => {
      const message = createTestMessage("original");
      const ctx = { ...createContext(message), cleanedBody: "a".repeat(51) };
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(false);
      expect(result.response).toContain("50");
    });
  });
});
