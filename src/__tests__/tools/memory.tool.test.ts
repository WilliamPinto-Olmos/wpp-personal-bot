import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryTool } from "../../tools/memory.tool.js";

describe("memoryTool", () => {
  const mockContext: any = {
    chatId: "chat123",
    contactId: "user123",
    contactMemoryRepo: {
      saveMemory: vi.fn(),
    },
  };

  it("should save updated memory using the repository", async () => {
    const tool = createMemoryTool(mockContext);
    const updatedMemory = {
      generalPreferences: ["Dime Will"],
      featurePreferences: { resumen: ["detallado"] },
    };

    const result = await (tool.execute as any)({ updatedMemory });

    expect(mockContext.contactMemoryRepo.saveMemory).toHaveBeenCalledWith(
      "chat123",
      expect.objectContaining({
        contactId: "user123",
        generalPreferences: ["Dime Will"],
        featurePreferences: { resumen: ["detallado"] },
      })
    );
    expect(result.message).toContain("actualizado");
  });

  it("should work even if featurePreferences is omitted (default to empty object)", async () => {
    const tool = createMemoryTool(mockContext);
    const input = {
      updatedMemory: {
        generalPreferences: ["Test preference"],
      }
    };

    // We manually simulate the Zod parsing/defaulting that AI SDK does
    const schema = (tool as any).inputSchema;
    const parsedInput = schema.parse(input);

    const result = await (tool.execute as any)(parsedInput);

    expect(mockContext.contactMemoryRepo.saveMemory).toHaveBeenCalledWith(
      "chat123",
      expect.objectContaining({
        generalPreferences: ["Test preference"],
        featurePreferences: {}, // Should be defaulted to empty object
      })
    );
    expect(result.message).toContain("actualizado");
  });
});
