import { describe, it, expect, vi, beforeEach } from "vitest";
import { healthRouter } from "../../../server/routes/health.routes.js";
import { isConnected } from "../../../whatsapp/client.js";

vi.mock("../../../whatsapp/client.js", () => ({
  isConnected: vi.fn(),
}));

vi.mock("../../../config/index.js", () => ({
  config: {
    nodeEnv: "test",
    whatsapp: { sessionName: "test-session" },
    database: { driver: "memory" },
  },
}));

describe("Health Router", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it("GET /health should return 200 with status ok", async () => {
    const handler = (healthRouter as any).stack.find(
      (s: any) => s.route.path === "/health"
    ).route.stack[0].handle;

    await handler(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ok",
        environment: "test",
      })
    );
    expect(res.json.mock.calls[0][0]).toHaveProperty("timestamp");
  });

  it("GET /status should return WhatsApp connection state", async () => {
    vi.mocked(isConnected).mockResolvedValueOnce(true);

    const handler = (healthRouter as any).stack.find(
      (s: any) => s.route.path === "/status"
    ).route.stack[0].handle;

    await handler(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        whatsapp: {
          connected: true,
          session: "test-session",
        },
        database: {
          driver: "memory",
        },
      })
    );
  });
});
