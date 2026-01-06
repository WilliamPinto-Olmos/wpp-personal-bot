import { describe, it, expect, vi } from "vitest";
import { extractMemoryRequest } from "../../ai/memory-extractor.js";
import { generateText } from "ai";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

describe("MemoryExtractor", () => {
  it("should detect general memory request", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: JSON.stringify({
        isMemoryRequest: true,
        type: "general",
        targetFeature: null,
        preference: "Alan",
      }),
    } as any);

    const result = await extractMemoryRequest("willy willito yo me llamo Alan");
    expect(result.isMemoryRequest).toBe(true);
    expect(result.type).toBe("general");
    expect(result.preference).toBe("Alan");
  });

  it("should detect feature memory request", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: JSON.stringify({
        isMemoryRequest: true,
        type: "feature",
        targetFeature: "resumen",
        preference: "quiero resúmenes cortos",
      }),
    } as any);

    const result = await extractMemoryRequest("willy willito resumeme mas corto");
    expect(result.isMemoryRequest).toBe(true);
    expect(result.type).toBe("feature");
    expect(result.targetFeature).toBe("resumen");
    expect(result.preference).toBe("quiero resúmenes cortos");
  });

  it("should return false for normal messages", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: JSON.stringify({
        isMemoryRequest: false,
        type: null,
        targetFeature: null,
        preference: null,
      }),
    } as any);

    const result = await extractMemoryRequest("que hora es?");
    expect(result.isMemoryRequest).toBe(false);
  });
});
