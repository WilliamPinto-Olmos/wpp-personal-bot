import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageHandler } from "../../core/message.handler.js";
import { MessagePipeline } from "../../pipeline/index.js";
import { IMessageChannel } from "../../channels/index.js";
import { 
  IMessageRepository, 
  IContactMemoryRepository, 
  IGroupFeaturesRepository 
} from "../../repositories/index.js";
import { IncomingMessage } from "../../types/index.js";
import { PipelineContext } from "../../pipeline/types.js";
import { MainAgent } from "../../agent/main.agent.js";
import type { Whatsapp } from "../../whatsapp/index.js";

describe("MessageHandler", () => {
  let pipeline: MessagePipeline;
  let agent: MainAgent;
  let agentFactory: any;
  let channel: IMessageChannel;
  let messageRepo: IMessageRepository;
  let contactMemoryRepo: IContactMemoryRepository;
  let groupFeaturesRepo: IGroupFeaturesRepository;
  let whatsappClient: Whatsapp;
  let handler: MessageHandler;

  beforeEach(() => {
    pipeline = { process: vi.fn() } as any;
    agent = { process: vi.fn() } as any;
    agentFactory = vi.fn().mockReturnValue(agent);
    channel = { sendReply: vi.fn() } as any;
    messageRepo = { save: vi.fn() } as any;
    contactMemoryRepo = { getMemory: vi.fn() } as any;
    groupFeaturesRepo = { getFeatures: vi.fn() } as any;
    const remindersRepo = { findByChatAndContact: vi.fn(), save: vi.fn() } as any;
    const reminderService = { initialize: vi.fn(), createReminder: vi.fn() } as any;
    const chatService = { getMessages: vi.fn(), getParticipants: vi.fn() } as any;
    const chatServiceFactory = vi.fn().mockReturnValue(chatService);

    handler = new MessageHandler(
      pipeline,
      agentFactory,
      channel,
      messageRepo,
      contactMemoryRepo,
      groupFeaturesRepo,
      remindersRepo,
      reminderService,
      chatServiceFactory
    );
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
    vi.mocked(pipeline.process).mockResolvedValue({ 
      shouldContinue: false 
    } as PipelineContext);
    
    await handler.handle(mockMessage);

    expect(agentFactory).not.toHaveBeenCalled();
    expect(channel.sendReply).not.toHaveBeenCalled();
  });

  it("should send response directly from pipeline", async () => {
    vi.mocked(pipeline.process).mockResolvedValue({ 
      shouldContinue: false, 
      response: "blocked" 
    } as PipelineContext);

    await handler.handle(mockMessage);

    expect(channel.sendReply).toHaveBeenCalledWith("group123", "blocked", "123");
    expect(agentFactory).not.toHaveBeenCalled();
  });

  it("should load memory and call agent if pipeline continues", async () => {
    const pipelineContext: PipelineContext = { 
      shouldContinue: true, 
      cleanedBody: "clean hello" 
    } as any;
    const mockMemory = { contactId: "user123", generalPreferences: ["P1"] } as any;
    
    vi.mocked(pipeline.process).mockResolvedValue(pipelineContext);
    vi.mocked(contactMemoryRepo.getMemory).mockResolvedValue(mockMemory);
    vi.mocked(agent.process).mockResolvedValue("agent response");

    await handler.handle(mockMessage);

    expect(contactMemoryRepo.getMemory).toHaveBeenCalledWith("group123", "user123");
    expect(agentFactory).toHaveBeenCalledWith(expect.objectContaining({
      chatId: "group123",
      contactMemory: mockMemory
    }));
    expect(agent.process).toHaveBeenCalledWith("clean hello");
    expect(channel.sendReply).toHaveBeenCalledWith("group123", "agent response", "123");
  });

  it("should save message to repository with unknown intent", async () => {
    vi.mocked(pipeline.process).mockResolvedValue({ 
      shouldContinue: true, 
      shouldSaveResponse: true 
    } as any);
    vi.mocked(agent.process).mockResolvedValue("agent response");

    await handler.handle(mockMessage);

    expect(messageRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: "123",
      response: "agent response",
      intent: expect.objectContaining({ type: "unknown" })
    }));
  });
});
