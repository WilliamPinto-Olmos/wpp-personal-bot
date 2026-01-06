import { describe, it, expect, vi } from "vitest";
import { FeaturePermissionValidator } from "../../pipeline/validators/feature-permission.validator.js";
import { createContext } from "../../pipeline/types.js";
import type { IncomingMessage, DetectedIntent } from "../../types/index.js";
import type { IGroupFeaturesRepository } from "../../repositories/interfaces.js";

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

function createMockRepository(isEnabled: boolean): IGroupFeaturesRepository {
  return {
    getFeatures: vi.fn(),
    setFeatures: vi.fn(),
    isFeatureEnabled: vi.fn().mockResolvedValue(isEnabled),
  };
}

describe("FeaturePermissionValidator", () => {
  it("should pass when feature is enabled for group", async () => {
    const mockRepo = createMockRepository(true);
    const validator = new FeaturePermissionValidator(mockRepo);
    const message = createTestMessage();
    const intent: DetectedIntent = {
      type: "resumen",
      params: { messageCount: 100, contactFilter: null, startDate: null },
      confidence: 0.9,
    };
    const ctx = { ...createContext(message), intent };
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
    expect(mockRepo.isFeatureEnabled).toHaveBeenCalledWith(
      "group@g.us",
      "resumen"
    );
  });

  it("should stop when feature is disabled for group", async () => {
    const mockRepo = createMockRepository(false);
    const validator = new FeaturePermissionValidator(mockRepo);
    const message = createTestMessage();
    const intent: DetectedIntent = {
      type: "resumen",
      params: { messageCount: 100, contactFilter: null, startDate: null },
      confidence: 0.9,
    };
    const ctx = { ...createContext(message), intent };
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(false);
    expect(result.response).toContain("resumen");
  });

  it("should pass when intent is not set", async () => {
    const mockRepo = createMockRepository(false);
    const validator = new FeaturePermissionValidator(mockRepo);
    const message = createTestMessage();
    const ctx = createContext(message);
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
  });

  it("should pass when intent is unknown", async () => {
    const mockRepo = createMockRepository(false);
    const validator = new FeaturePermissionValidator(mockRepo);
    const message = createTestMessage();
    const intent: DetectedIntent = {
      type: "unknown",
      params: {},
      confidence: 0,
    };
    const ctx = { ...createContext(message), intent };
    const result = await validator.execute(ctx);
    expect(result.shouldContinue).toBe(true);
  });
});
