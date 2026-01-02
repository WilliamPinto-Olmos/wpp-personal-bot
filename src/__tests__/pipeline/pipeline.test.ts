import { describe, it, expect, vi } from "vitest";
import { MessagePipeline } from "../../pipeline/pipeline.js";
import {
  createContext,
  type PipelineStep,
  type PipelineContext,
} from "../../pipeline/types.js";
import type { IncomingMessage } from "../../types/index.js";

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

function createPassingStep(name: string): PipelineStep {
  return {
    name,
    execute: vi
      .fn()
      .mockImplementation((ctx: PipelineContext) => Promise.resolve(ctx)),
  };
}

function createStoppingStep(name: string): PipelineStep {
  return {
    name,
    execute: vi
      .fn()
      .mockImplementation((ctx: PipelineContext) =>
        Promise.resolve({ ...ctx, shouldContinue: false })
      ),
  };
}

function createErrorStep(name: string): PipelineStep {
  return {
    name,
    execute: vi.fn().mockRejectedValue(new Error("Test error")),
  };
}

describe("MessagePipeline", () => {
  it("should execute all steps in order", async () => {
    const step1 = createPassingStep("Step1");
    const step2 = createPassingStep("Step2");
    const step3 = createPassingStep("Step3");

    const pipeline = new MessagePipeline()
      .addStep(step1)
      .addStep(step2)
      .addStep(step3);

    const message = createTestMessage();
    await pipeline.process(message);

    expect(step1.execute).toHaveBeenCalled();
    expect(step2.execute).toHaveBeenCalled();
    expect(step3.execute).toHaveBeenCalled();
  });

  it("should stop execution when step sets shouldContinue to false", async () => {
    const step1 = createPassingStep("Step1");
    const step2 = createStoppingStep("Step2");
    const step3 = createPassingStep("Step3");

    const pipeline = new MessagePipeline()
      .addStep(step1)
      .addStep(step2)
      .addStep(step3);

    const message = createTestMessage();
    const result = await pipeline.process(message);

    expect(step1.execute).toHaveBeenCalled();
    expect(step2.execute).toHaveBeenCalled();
    expect(step3.execute).not.toHaveBeenCalled();
    expect(result.shouldContinue).toBe(false);
  });

  it("should handle step errors gracefully", async () => {
    const step1 = createPassingStep("Step1");
    const step2 = createErrorStep("Step2");
    const step3 = createPassingStep("Step3");

    const pipeline = new MessagePipeline()
      .addStep(step1)
      .addStep(step2)
      .addStep(step3);

    const message = createTestMessage();
    const result = await pipeline.process(message);

    expect(step1.execute).toHaveBeenCalled();
    expect(step2.execute).toHaveBeenCalled();
    expect(step3.execute).not.toHaveBeenCalled();
    expect(result.shouldContinue).toBe(false);
    expect(result.errorMessage).toContain("Step2");
    expect(result.errorMessage).toContain("Test error");
  });

  it("should return step names", () => {
    const pipeline = new MessagePipeline()
      .addStep(createPassingStep("Step1"))
      .addStep(createPassingStep("Step2"));

    expect(pipeline.getStepNames()).toEqual(["Step1", "Step2"]);
  });

  it("should support method chaining", () => {
    const pipeline = new MessagePipeline()
      .addStep(createPassingStep("Step1"))
      .addStep(createPassingStep("Step2"))
      .addStep(createPassingStep("Step3"));

    expect(pipeline.getStepNames()).toHaveLength(3);
  });

  it("should create initial context with shouldContinue true", async () => {
    const step = createPassingStep("Step1");
    const pipeline = new MessagePipeline().addStep(step);

    const message = createTestMessage();
    await pipeline.process(message);

    const passedContext = (step.execute as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as PipelineContext;
    expect(passedContext.shouldContinue).toBe(true);
    expect(passedContext.message).toEqual(message);
  });
});
