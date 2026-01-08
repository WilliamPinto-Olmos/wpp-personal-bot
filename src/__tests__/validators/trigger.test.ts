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

describe("TriggerValidator - Trigger phrase", () => {
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
    const customValidator = new TriggerValidator({ triggerPhrase: "hey bot" });
    const message = createTestMessage("hey bot do something");
    const ctx = createContext(message);
    const result = await customValidator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("do something");
  });
});

describe("TriggerValidator - Mention trigger (@)", () => {
  const botWid = "123456789@c.us";
  const validator = new TriggerValidator({ botWid });

  it("should trigger when bot is mentioned", async () => {
    const message = createTestMessage("hey check this out");
    message.mentionedJidList = [botWid];
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("hey check this out");
  });

  it("should trigger when bot is mentioned among other users", async () => {
    const message = createTestMessage("hey @someone and @bot check this");
    message.mentionedJidList = ["other@c.us", botWid, "another@c.us"];
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("hey @someone and @bot check this");
  });

  it("should not trigger when only other users are mentioned", async () => {
    const message = createTestMessage("hey @someone check this");
    message.mentionedJidList = ["other@c.us"];
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });

  it("should not trigger on mention when botWid is not configured", async () => {
    const validatorWithoutBotWid = new TriggerValidator();
    const message = createTestMessage("hey check this");
    message.mentionedJidList = ["123456789@c.us"];
    const ctx = createContext(message);
    const result = await validatorWithoutBotWid.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });

  it("should prioritize trigger phrase over mention", async () => {
    const message = createTestMessage("willy willito check this");
    message.mentionedJidList = [botWid];
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    // When trigger phrase matches, cleanedBody should have phrase removed
    expect(result.cleanedBody).toBe("check this");
  });
});

describe("TriggerValidator - Quote trigger", () => {
  const validator = new TriggerValidator();

  it("should trigger when replying to bot message", async () => {
    const message = createTestMessage("yes I agree");
    message.quotedMessageFromMe = true;
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(result.cleanedBody).toBe("yes I agree");
  });

  it("should not trigger when replying to other user message", async () => {
    const message = createTestMessage("yes I agree");
    message.quotedMessageFromMe = false;
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });

  it("should not trigger when quotedMessageFromMe is undefined", async () => {
    const message = createTestMessage("yes I agree");
    // quotedMessageFromMe is undefined (message is not a reply)
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });

  it("should prioritize trigger phrase over quote", async () => {
    const message = createTestMessage("willy willito thanks for the info");
    message.quotedMessageFromMe = true;
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    // When trigger phrase matches, cleanedBody should have phrase removed
    expect(result.cleanedBody).toBe("thanks for the info");
  });
});

describe("TriggerValidator - Combined triggers", () => {
  const botWid = "123456789@c.us";
  const validator = new TriggerValidator({ botWid });

  it("should trigger when any condition is met", async () => {
    // Test trigger phrase
    const msg1 = createTestMessage("willy willito hello");
    expect((await validator.execute(createContext(msg1))).shouldContinue).toBe(true);

    // Test mention
    const msg2 = createTestMessage("hello bot");
    msg2.mentionedJidList = [botWid];
    expect((await validator.execute(createContext(msg2))).shouldContinue).toBe(true);

    // Test quote
    const msg3 = createTestMessage("hello");
    msg3.quotedMessageFromMe = true;
    expect((await validator.execute(createContext(msg3))).shouldContinue).toBe(true);
  });

  it("should not trigger when no condition is met", async () => {
    const message = createTestMessage("random message");
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
  });
});
