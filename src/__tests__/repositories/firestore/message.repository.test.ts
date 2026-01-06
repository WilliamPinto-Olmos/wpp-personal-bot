import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirestoreMessageRepository } from "../../../repositories/firestore/message.repository.js";
import type { ProcessedMessage } from "../../../types/index.js";
import { Timestamp } from "firebase-admin/firestore";

const { mockDoc, mockCollection, mockSet, mockGet, mockWhere, mockOrderBy, mockLimit } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn().mockReturnThis();
  const mockOrderBy = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockDoc = vi.fn().mockReturnValue({
    set: mockSet,
    get: mockGet,
  });
  const mockCollection = vi.fn().mockReturnValue({
    doc: mockDoc,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    get: mockGet,
  });
  return { mockDoc, mockCollection, mockSet, mockGet, mockWhere, mockOrderBy, mockLimit };
});

vi.mock("../../../config/firebase.js", () => ({
  db: {
    collection: mockCollection,
  },
}));

describe("FirestoreMessageRepository", () => {
  let repo: FirestoreMessageRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FirestoreMessageRepository();
  });

  const testMessage: ProcessedMessage = {
    id: "msg-1",
    chatId: "group-1",
    sender: { id: "sender-1", phoneNumber: "123" },
    originalBody: "hello",
    cleanedBody: "hello",
    intent: { type: "info", confidence: 1, params: {} },
    response: "hi",
    processedAt: new Date(),
  };

  it("should save message to Firestore", async () => {
    await repo.save(testMessage);

    expect(mockCollection).toHaveBeenCalledWith("messages");
    expect(mockDoc).toHaveBeenCalledWith("msg-1");
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      id: "msg-1",
      chatId: "group-1",
    }));
  });

  it("should retrieve message by id", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        ...testMessage,
        processedAt: Timestamp.fromDate(testMessage.processedAt),
      }),
    });

    const result = await repo.findById("msg-1");

    expect(result).toMatchObject({
      id: "msg-1",
      chatId: "group-1",
    });
    expect(result?.processedAt).toBeInstanceOf(Date);
  });

  it("should return null for non-existent message", async () => {
    mockGet.mockResolvedValueOnce({
      exists: false,
    });

    const result = await repo.findById("non-existent");
    expect(result).toBeNull();
  });

  it("should find messages by groupId with limit and ordering", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            ...testMessage,
            processedAt: Timestamp.fromDate(testMessage.processedAt),
          }),
        },
      ],
    });

    const results = await repo.findByGroupId("group-1", 10);

    expect(mockWhere).toHaveBeenCalledWith("chatId", "==", "group-1");
    expect(mockOrderBy).toHaveBeenCalledWith("processedAt", "desc");
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("msg-1");
  });
});
