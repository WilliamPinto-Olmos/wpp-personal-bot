import { describe, it, expect, vi } from "vitest";
import { ChannelFactory } from "../../core/channel.factory.js";
import { ConsoleChannel, WhatsAppChannel } from "../../channels/index.js";
import { Whatsapp } from "../../whatsapp/index.js";

describe("ChannelFactory", () => {
  const mockClient = {} as Whatsapp;

  it("should create a ConsoleChannel when dryRun is true", () => {
    const channel = ChannelFactory.create(mockClient, true);
    expect(channel).toBeInstanceOf(ConsoleChannel);
  });

  it("should create a WhatsAppChannel when dryRun is false", () => {
    const channel = ChannelFactory.create(mockClient, false);
    expect(channel).toBeInstanceOf(WhatsAppChannel);
  });
});
