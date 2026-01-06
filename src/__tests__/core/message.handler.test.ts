import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageHandler } from "../../core/message.handler.js";
import { MessagePipeline } from "../../pipeline/index.js";
import { IntentProcessor } from "../../core/intent.processor.js";
import { IMessageChannel } from "../../channels/index.js";
import { IMessageRepository } from "../../repositories/index.js";
import { IncomingMessage } from "../../types/index.js";
import { PipelineContext } from "../../pipeline/types.js";

describe("MessageHandler", () => {
  let pipeline: MessagePipeline;
  let intentProcessor: IntentProcessor;
  let channel: IMessageChannel;
  let repository: IMessageRepository;
  let handler: MessageHandler;

  beforeEach(() => {
    pipeline = { process: vi.fn() } as any;
    intentProcessor = { process: vi.fn() } as any;
    channel = { sendReply: vi.fn() } as any;
    repository = { save: vi.fn() } as any;
    handler = new MessageHandler(pipeline, intentProcessor, channel, repository);
  });

  const mockMessage: IncomingMessage = {
    id: "123",
    chatId: "group123",
    body: "hello",
    sender: { id: "user123", phoneNumber: "12345" } as any,
    timestamp: new Date(),
    isGroup: true,
  };

  it("should stop if pipeline says so and has no response", async () => {
    vi.mocked(pipeline.process).mockResolvedValue({ shouldContinue: false } as PipelineContext);
    
    await handler.handle(mockMessage);

    expect(channel.sendReply).not.toHaveBeenCalled();
  });

  it("should send response directly from pipeline", async () => {
    vi.mocked(pipeline.process).mockResolvedValue({ 
      shouldContinue: false, 
      response: "blocked" 
    } as PipelineContext);

    await handler.handle(mockMessage);

    expect(channel.sendReply).toHaveBeenCalledWith("group123", "blocked", "123");
  });

  it("should use intent processor if pipeline has no response but has intent", async () => {
    const context = { 
      shouldContinue: true, 
      intent: { type: "info" } 
    } as PipelineContext;
    
    vi.mocked(pipeline.process).mockResolvedValue(context);
    vi.mocked(intentProcessor.process).mockResolvedValue("info response");

    await handler.handle(mockMessage);

    expect(intentProcessor.process).toHaveBeenCalledWith(context, undefined);
    expect(channel.sendReply).toHaveBeenCalledWith("group123", "info response", "123");
  });

  it("should save message to repository if conditions are met", async () => {
    const context = { 
      shouldContinue: true, 
      intent: { type: "info" },
      shouldSaveResponse: true,
      cleanedBody: "hello"
    } as PipelineContext;
    
    vi.mocked(pipeline.process).mockResolvedValue(context);
    vi.mocked(intentProcessor.process).mockResolvedValue("info response");

    await handler.handle(mockMessage);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      id: "123",
      response: "info response",
      intent: context.intent
    }));
  });
});
