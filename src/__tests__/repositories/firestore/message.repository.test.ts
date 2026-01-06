import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirestoreMessageRepository } from "../../../repositories/firestore/message.repository.js";
import type { ProcessedMessage } from "../../../types/index.js";
import { Timestamp } from "firebase-admin/firestore";

const { mockDb, mockGet, mockSet, mockWhere, mockOrderBy, mockLimit, mockChain } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn().mockReturnThis();
  const mockOrderBy = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  
  const mockChain = {
    doc: vi.fn().mockReturnThis(),
    collection: vi.fn().mockReturnThis(),
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    get: mockGet,
    set: mockSet,
  };

  const mockDb = {
    collection: vi.fn().mockReturnValue(mockChain),
    collectionGroup: vi.fn().mockReturnValue(mockChain),
  };

  return { mockDb, mockGet, mockSet, mockWhere, mockOrderBy, mockLimit, mockChain };
});

vi.mock("../../../config/firebase.js", () => ({
  db: mockDb,
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

  it("should save message to Firestore in nested subcollection", async () => {
    await repo.save(testMessage);

    expect(mockDb.collection).toHaveBeenCalledWith("chats");
    expect(mockChain.doc).toHaveBeenCalledWith("group-1");
    expect(mockChain.collection).toHaveBeenCalledWith("messages");
    expect(mockChain.doc).toHaveBeenCalledWith("msg-1");
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      id: "msg-1",
      chatId: "group-1",
    }));
  });

  it("should retrieve message by id using collectionGroup", async () => {
    mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          data: () => ({
            ...testMessage,
            processedAt: Timestamp.fromDate(testMessage.processedAt),
          }),
        }
      ],
    });

    const result = await repo.findById("msg-1");

    expect(mockDb.collectionGroup).toHaveBeenCalledWith("messages");
    expect(mockWhere).toHaveBeenCalledWith("id", "==", "msg-1");
    expect(result).toMatchObject({
      id: "msg-1",
      chatId: "group-1",
    });
    expect(result?.processedAt).toBeInstanceOf(Date);
  });

  it("should return null for non-existent message", async () => {
    mockGet.mockResolvedValueOnce({
      empty: true,
    });

    const result = await repo.findById("non-existent");
    expect(result).toBeNull();
  });

  it("should find messages by groupId in chat subcollection", async () => {
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

    expect(mockDb.collection).toHaveBeenCalledWith("chats");
    expect(mockChain.doc).toHaveBeenCalledWith("group-1");
    expect(mockChain.collection).toHaveBeenCalledWith("messages");
    expect(mockOrderBy).toHaveBeenCalledWith("processedAt", "desc");
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("msg-1");
  });
});
