import { describe, it, expect, vi } from "vitest";
import { IntentRegistry } from "../../intents/registry.js";
import type { IIntentHandler } from "../../intents/handler.interface.js";
import { createContext } from "../../pipeline/types.js";
import type { IncomingMessage, DetectedIntent } from "../../types/index.js";

function createTestMessage(): IncomingMessage {
  return {
    id: "test-id",
    chatId: "group@g.us",
    sender: {
      id: "sender@c.us",
      pushName: "Test User",
      phoneNumber: "1234567890",
    },
    body: "test message",
    timestamp: new Date(),
    isGroup: true,
  };
}

function createMockHandler(
  intentType: string,
  response: string
): IIntentHandler {
  return {
    intentType,
    canHandle: vi.fn().mockReturnValue(true),
    handle: vi.fn().mockResolvedValue(response),
  };
}

describe("IntentRegistry", () => {
  it("should register and find handler", () => {
    const registry = new IntentRegistry();
    const handler = createMockHandler("resumen", "Summary response");

    registry.register(handler);

    const intent: DetectedIntent = {
      type: "resumen",
      params: { messageCount: 100, contactFilter: null, startDate: null },
      confidence: 0.9,
    };
    const found = registry.findHandler(intent);

    expect(found).toBe(handler);
  });

  it("should return undefined for unknown intent", () => {
    const registry = new IntentRegistry();

    const intent: DetectedIntent = {
      type: "unknown",
      params: {},
      confidence: 0,
    };
    const found = registry.findHandler(intent);

    expect(found).toBeUndefined();
  });

  it("should process intent with matching handler", async () => {
    const registry = new IntentRegistry();
    const handler = createMockHandler("resumen", "Summary response");
    registry.register(handler);

    const message = createTestMessage();
    const intent: DetectedIntent = {
      type: "resumen",
      params: { messageCount: 100, contactFilter: null, startDate: null },
      confidence: 0.9,
    };
    const ctx = { ...createContext(message), intent };

    const response = await registry.process(ctx);

    expect(response).toBe("Summary response");
    expect(handler.handle).toHaveBeenCalledWith(ctx);
  });

  it("should return error message when no intent is set", async () => {
    const registry = new IntentRegistry();
    const message = createTestMessage();
    const ctx = createContext(message);

    const response = await registry.process(ctx);

    expect(response).toContain("No se detectó ninguna intención");
  });

  it("should return error message when no handler matches", async () => {
    const registry = new IntentRegistry();
    const message = createTestMessage();
    const intent: DetectedIntent = {
      type: "unknown",
      params: {},
      confidence: 0,
    };
    const ctx = { ...createContext(message), intent };

    const response = await registry.process(ctx);

    expect(response).toContain("no entendí tu solicitud");
  });

  it("should list registered intents", () => {
    const registry = new IntentRegistry();
    registry.register(createMockHandler("resumen", "Response 1"));
    registry.register(createMockHandler("poll", "Response 2"));

    const intents = registry.getRegisteredIntents();

    expect(intents).toContain("resumen");
    expect(intents).toContain("poll");
  });
});
