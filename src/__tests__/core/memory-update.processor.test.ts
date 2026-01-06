import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryUpdateProcessor } from "../../core/memory-update.processor.js";
import { IContactMemoryRepository } from "../../repositories/interfaces.js";
import { extractMemoryRequest } from "../../ai/memory-extractor.js";

vi.mock("../../ai/memory-extractor.js", () => ({
  extractMemoryRequest: vi.fn(),
}));

describe("MemoryUpdateProcessor", () => {
  let repo: IContactMemoryRepository;
  let processor: MemoryUpdateProcessor;

  beforeEach(() => {
    repo = {
      getMemory: vi.fn(),
      upsertGeneralPreference: vi.fn(),
      upsertFeaturePreference: vi.fn(),
    } as any;
    processor = new MemoryUpdateProcessor(repo);
  });

  it("should save general preference and return confirmation", async () => {
    vi.mocked(extractMemoryRequest).mockResolvedValue({
      isMemoryRequest: true,
      type: "general",
      preference: "Alan",
    });

    const response = await processor.process("user123", "llámame Alan");
    
    expect(repo.upsertGeneralPreference).toHaveBeenCalledWith("user123", "Alan");
    expect(response).toContain("Alan");
  });

  it("should save feature preference and return confirmation", async () => {
    vi.mocked(extractMemoryRequest).mockResolvedValue({
      isMemoryRequest: true,
      type: "feature",
      targetFeature: "resumen",
      preference: "resúmenes cortos",
    });

    const response = await processor.process("user123", "resumen corto");
    
    expect(repo.upsertFeaturePreference).toHaveBeenCalledWith("user123", "resumen", "resúmenes cortos");
    expect(response).toContain("resumen");
  });

  it("should return null if no memory request detected", async () => {
    vi.mocked(extractMemoryRequest).mockResolvedValue({
      isMemoryRequest: false,
    });

    const response = await processor.process("user123", "hola willy");
    expect(response).toBeNull();
    expect(repo.upsertGeneralPreference).not.toHaveBeenCalled();
  });
});
