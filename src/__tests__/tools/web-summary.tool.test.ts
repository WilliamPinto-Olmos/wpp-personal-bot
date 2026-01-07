import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWebSummaryTool } from "../../tools/web-summary.tool.js";
import * as geminiFactory from "../../ai/gemini.factory.js";
import * as ai from "ai";

vi.mock("../../ai/gemini.factory.js");
vi.mock("ai", async () => {
  const actual = await vi.importActual("ai");
  return {
    ...actual,
    generateText: vi.fn(),
  };
});

describe("webSummaryTool", () => {
  const mockGeminiModel = { modelId: "gemini-3-flash-preview" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if gemini model is not available", () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(null);
    
    const tool = createWebSummaryTool();
    expect(tool).toBeNull();
  });

  it("should use urlContext tool for web pages", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);
    vi.mocked(ai.generateText).mockResolvedValue({ text: "Resumen de la web" } as any);

    const tool = createWebSummaryTool();
    const result = await (tool!.execute as any)({ url: "https://example.com/page" });

    expect(ai.generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: mockGeminiModel,
      prompt: expect.stringContaining("https://example.com/page"),
      tools: expect.objectContaining({
        url_context: expect.any(Object)
      })
    }));
    expect(result.message).toBe("Resumen de la web");
  });
});
