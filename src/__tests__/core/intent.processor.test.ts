import { describe, it, expect, vi } from "vitest";
import { IntentProcessor } from "../../core/intent.processor.js";
import { IIntentHandler } from "../../intents/index.js";
import { PipelineContext } from "../../pipeline/index.js";

describe("IntentProcessor", () => {
  it("should register handlers and process intents", async () => {
    const mockHandler: IIntentHandler = {
      intentType: "test",
      canHandle: vi.fn().mockReturnValue(true),
      handle: vi.fn().mockResolvedValue("test response"),
    };

    const processor = new IntentProcessor([mockHandler]);
    const context = { intent: { type: "test" } } as any;

    const response = await processor.process(context);

    expect(response).toBe("test response");
    expect(mockHandler.handle).toHaveBeenCalledWith(context);
  });

  it("should return default error message if no handler matches", async () => {
    const processor = new IntentProcessor([]);
    const context = { intent: { type: "unknown" } } as any;

    const response = await processor.process(context);

    expect(response).toContain("no entendí tu solicitud");
  });
});
