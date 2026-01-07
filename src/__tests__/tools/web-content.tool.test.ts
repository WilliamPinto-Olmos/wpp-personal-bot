import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWebContentTool } from "../../tools/web-content.tool.js";
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

describe("webContentTool", () => {
  const mockGeminiModel = { modelId: "gemini-3-flash-preview" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if gemini model is not available", () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(null);
    
    const tool = createWebContentTool();
    expect(tool).toBeNull();
  });

  it("should detect YouTube URL and use narrative prompt", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);
    vi.mocked(ai.generateText).mockResolvedValue({ text: "Resumen del video" } as any);

    const tool = createWebContentTool();
    expect(tool).not.toBeNull();

    const result = await (tool!.execute as any)({ url: "https://www.youtube.com/watch?v=123" });

    expect(ai.generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: mockGeminiModel,
      prompt: expect.stringContaining("Analiza el video de YouTube")
    }));
    expect(result.message).toBe("Resumen del video");
    expect(result.data.type).toBe("youtube");
  });

  it("should detect general URL and use key points prompt", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);
    vi.mocked(ai.generateText).mockResolvedValue({ text: "Resumen de la web" } as any);

    const tool = createWebContentTool();
    
    const result = await (tool!.execute as any)({ url: "https://example.com/article" });

    expect(ai.generateText).toHaveBeenCalledWith(expect.objectContaining({
      model: mockGeminiModel,
      prompt: expect.stringContaining("resumen en formato de puntos clave")
    }));
    expect(result.message).toBe("Resumen de la web");
    expect(result.data.type).toBe("webpage");
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(geminiFactory.createGeminiModel).mockReturnValue(mockGeminiModel as any);
    vi.mocked(ai.generateText).mockRejectedValue(new Error("API Error"));

    const tool = createWebContentTool();
    
    const result = await (tool!.execute as any)({ url: "https://example.com" });

    expect(result.message).toContain("Ocurrió un error");
    expect(result.data.error).toBe("API Error");
  });
});
