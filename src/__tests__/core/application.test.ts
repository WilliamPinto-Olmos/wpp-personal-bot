import { describe, it, expect, vi, beforeEach } from "vitest";
import { Application } from "../../core/application.js";
import { config } from "../../config/index.js";
import { createDriver } from "../../repositories/index.js";
import { createServer, startServer } from "../../server/index.js";

vi.mock("../../config/index.js", () => ({
  config: {
    database: { driver: "memory" },
    bot: { triggerPhrase: "test", dryRun: true },
    port: 3000,
    nodeEnv: "test",
    whatsapp: { sessionName: "test-session" }
  },
  validateConfig: vi.fn(),
}));

vi.mock("../../repositories/index.js", () => ({
  createDriver: vi.fn().mockReturnValue({
    name: "memory",
    initialize: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    messages: {},
    contactMemories: {},
    reminders: {
      findPending: vi.fn().mockResolvedValue([]),
    },
    groupFeatures: {
      getFeatures: vi.fn().mockResolvedValue(null)
    }
  }),
}));

vi.mock("../../whatsapp/index.js", () => ({
  createClient: vi.fn().mockResolvedValue({}),
  setupMessageListener: vi.fn(),
}));

vi.mock("../../server/index.js", () => ({
  createServer: vi.fn().mockReturnValue({}),
  startServer: vi.fn(),
}));

describe("Application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with configured driver", async () => {
    const app = new Application();
    await app.initialize();

    expect(createDriver).toHaveBeenCalledWith("memory");
  });

  it("should start server on start()", async () => {
    const app = new Application();
    await app.start();

    expect(startServer).toHaveBeenCalled();
  });

  it("should stop driver on stop()", async () => {
    const app = new Application();
    // @ts-ignore - accessing private for test
    const driver = app.dbDriver;
    
    await app.stop();

    expect(driver.disconnect).toHaveBeenCalled();
  });
});
