import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGoogleSearchTool } from "../../tools/google-search.tool.js";
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

describe("googleSearchTool", () => {
  const mockGeminiModel = { modelId: "gemini-3-flash-preview" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if gemini model is not available", () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(null);
    
    const tool = createGoogleSearchTool();
    expect(tool).toBeNull();
  });

  it("should use googleSearch tool for queries", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);
    vi.mocked(ai.generateText).mockResolvedValue({ text: "Resultados de búsqueda" } as any);

    const tool = createGoogleSearchTool();
    const result = await (tool!.execute as any)({ query: "quien es el presidente de mexico?" });

    expect(ai.generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: mockGeminiModel,
      prompt: "quien es el presidente de mexico?",
      tools: expect.objectContaining({
        google_search: expect.any(Object)
      })
    }));
    expect(result.message).toBe("Resultados de búsqueda");
  });
});
