import { describe, it, expect, vi, beforeEach } from "vitest";
import { MainAgent } from "../../agent/main.agent.js";
import { generateText } from "ai";

// Mock AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(),
  tool: vi.fn((config) => config),
  stepCountIs: vi.fn((n) => `stepCountIs(${n})`),
}));

// Mock repositories and client
const mockContext: any = {
  chatId: "chat123",
  contactId: "user123",
  whatsappClient: {},
  contactMemoryRepo: {},
  groupFeaturesRepo: {},
  messageRepo: {},
};

describe("MainAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate text by calling tools", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Final response",
      toolCalls: [],
      toolResults: [],
      finishReason: "stop",
      usage: {} as any,
      steps: [],
      request: {} as any,
      response: {} as any,
      warnings: []
    } as any);

    const agent = new MainAgent(mockContext);
    const response = await agent.process("hola willy");

    expect(response).toBe("Final response");
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: expect.anything(),
      prompt: expect.stringContaining("hola willy"),
      stopWhen: expect.anything()
    }));
  });

  it("should include contact memory in prompt if available", async () => {
    const contextWithMemory = {
      ...mockContext,
      contactMemory: {
        contactId: "user123",
        generalPreferences: ["Dime Alan"],
        featurePreferences: { resumen: ["breve"] },
        updatedAt: new Date(),
      }
    };

    vi.mocked(generateText).mockResolvedValue({ text: "Hi Alan" } as any);

    const agent = new MainAgent(contextWithMemory);
    await agent.process("hola");

    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining("Dime Alan")
    }));
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining("resumen: breve")
    }));
  });
});
