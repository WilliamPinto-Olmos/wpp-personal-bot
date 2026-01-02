import { describe, it, expect } from "vitest";
import { GroupValidator } from "../../pipeline/validators/group.validator.js";
import { createContext } from "../../pipeline/types.js";
import type { IncomingMessage } from "../../types/index.js";

function createTestMessage(isGroup: boolean): IncomingMessage {
  return {
    id: "test-id",
    chatId: isGroup ? "group@g.us" : "user@c.us",
    sender: {
      id: "sender@c.us",
      pushName: "Test User",
      phoneNumber: "1234567890",
    },
    body: "test message",
    timestamp: new Date(),
    isGroup,
  };
}

describe("GroupValidator", () => {
  describe("with default options (only groups)", () => {
    const validator = new GroupValidator();

    it("should pass when message is from a group", async () => {
      const message = createTestMessage(true);
      const ctx = createContext(message);
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(true);
    });

    it("should stop when message is not from a group", async () => {
      const message = createTestMessage(false);
      const ctx = createContext(message);
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(false);
    });
  });

  describe("with allowDirectMessages option", () => {
    const validator = new GroupValidator({ allowDirectMessages: true });

    it("should pass when message is from a group", async () => {
      const message = createTestMessage(true);
      const ctx = createContext(message);
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(true);
    });

    it("should pass when message is from a direct message", async () => {
      const message = createTestMessage(false);
      const ctx = createContext(message);
      const result = await validator.execute(ctx);
      expect(result.shouldContinue).toBe(true);
    });
  });
});
