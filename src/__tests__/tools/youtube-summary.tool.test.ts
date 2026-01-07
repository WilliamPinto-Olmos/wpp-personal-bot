import { describe, it, expect, vi, beforeEach } from "vitest";
import { createYouTubeSummaryTool } from "../../tools/youtube-summary.tool.js";
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

describe("youTubeSummaryTool", () => {
  const mockGeminiModel = { modelId: "gemini-3-flash-preview" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if gemini model is not available", () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(null);
    
    const tool = createYouTubeSummaryTool();
    expect(tool).toBeNull();
  });

  it("should use file input format for YouTube URLs", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);
    vi.mocked(ai.generateText).mockResolvedValue({ text: "Resumen del video" } as any);

    const tool = createYouTubeSummaryTool();
    const result = await (tool!.execute as any)({ url: "https://www.youtube.com/watch?v=123" });

    expect(ai.generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: mockGeminiModel,
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.arrayContaining([
            expect.objectContaining({ type: 'file', mediaType: 'video/mp4', data: "https://www.youtube.com/watch?v=123" })
          ])
        })
      ])
    }));
    expect(result.message).toBe("Resumen del video");
  });

  it("should reject non-YouTube URLs", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);

    const tool = createYouTubeSummaryTool();
    const result = await (tool!.execute as any)({ url: "https://example.com" });

    expect(result.message).toContain("no parece ser un video de YouTube");
  });
});
