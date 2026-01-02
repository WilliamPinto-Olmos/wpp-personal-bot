import { describe, it, expect } from "vitest";
import { TriggerValidator } from "../../pipeline/validators/trigger.validator.js";
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

describe("TriggerValidator", () => {
  const validator = new TriggerValidator();

  it("should pass when message starts with trigger phrase (lowercase)", async () => {
    const message = createTestMessage("willy willito qué han dicho");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("qué han dicho");
  });

  it("should pass when message starts with trigger phrase (uppercase)", async () => {
    const message = createTestMessage("WILLY WILLITO qué han dicho");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("qué han dicho");
  });

  it("should pass when message starts with trigger phrase (mixed case)", async () => {
    const message = createTestMessage("WiLLy WiLLiTo qué han dicho");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("qué han dicho");
  });

  it("should stop when message does not start with trigger phrase", async () => {
    const message = createTestMessage("hola qué tal");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });

  it("should stop when trigger phrase is not at the beginning", async () => {
    const message = createTestMessage("hola willy willito qué tal");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });

  it("should handle message with only trigger phrase", async () => {
    const message = createTestMessage("willy willito");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("");
  });

  it("should trim whitespace from cleaned body", async () => {
    const message = createTestMessage("willy willito   qué han dicho  ");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("qué han dicho");
  });

  it("should allow custom trigger phrase", async () => {
    const customValidator = new TriggerValidator("hey bot");
    const message = createTestMessage("hey bot do something");
    const ctx = createContext(message);
    const result = await customValidator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("do something");
  });
});
