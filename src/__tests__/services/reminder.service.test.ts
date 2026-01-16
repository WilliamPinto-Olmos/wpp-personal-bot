import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReminderService } from "../../services/reminder.service.js";
import type { IReminderRepository } from "../../repositories/reminder.repository.interface.js";
import type { IReminderScheduler } from "../../scheduler/scheduler.interface.js";
import type { INotificationChannel } from "../../channels/notification.channel.interface.js";
import type { Reminder } from "../../types/reminder.types.js";

describe("ReminderService", () => {
  let mockRepository: IReminderRepository;
  let mockScheduler: IReminderScheduler;
  let mockNotificationChannel: INotificationChannel;
  let service: ReminderService;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findPending: vi.fn().mockResolvedValue([]),
      findByChatAndContact: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockScheduler = {
      schedule: vi.fn(),
      cancel: vi.fn(),
    };

    mockNotificationChannel = {
      send: vi.fn(),
    };

    service = new ReminderService(mockRepository, mockScheduler, mockNotificationChannel);
  });

  describe("createReminder", () => {
    it("should create a reminder with a JS Date and schedule it correctly", async () => {
      const futureDate = new Date(Date.now() + 60000);

      const result = await service.createReminder({
        chatId: "chat123",
        contactId: "user@s.whatsapp.net",
        message: "Test reminder",
        triggerAt: futureDate,
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe("pending");
      expect(result.triggerAt).toEqual(futureDate);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        chatId: "chat123",
        message: "Test reminder",
        triggerAt: futureDate,
      }));
      expect(mockScheduler.schedule).toHaveBeenCalled();
    });

    it("should trigger immediately if date is in the past", async () => {
      const pastDate = new Date(Date.now() - 60000);

      await service.createReminder({
        chatId: "chat123",
        contactId: "user@s.whatsapp.net",
        message: "Past reminder",
        triggerAt: pastDate,
      });

      expect(mockNotificationChannel.send).toHaveBeenCalled();
      expect(mockScheduler.schedule).not.toHaveBeenCalled();
    });
  });

  describe("normalizeTriggerAt (via scheduleReminder)", () => {
    it("should handle Firebase Timestamp with toMillis()", async () => {
      const firebaseTimestamp = {
        toMillis: () => Date.now() + 120000,
      };

      const mockReminder: Reminder = {
        id: "reminder-1",
        chatId: "chat123",
        contactId: "user@s.whatsapp.net",
        message: "Firebase reminder",
        triggerAt: firebaseTimestamp as unknown as Date,
        createdAt: new Date(),
        status: "pending",
      };

      (mockRepository.findPending as ReturnType<typeof vi.fn>).mockResolvedValue([mockReminder]);

      await service.initialize();

      expect(mockScheduler.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "reminder-1",
          triggerAt: expect.any(Date),
        }),
        expect.any(Function)
      );
    });

    it("should handle plain JS Date", async () => {
      const jsDate = new Date(Date.now() + 120000);

      const mockReminder: Reminder = {
        id: "reminder-2",
        chatId: "chat123",
        contactId: "user@s.whatsapp.net",
        message: "JS Date reminder",
        triggerAt: jsDate,
        createdAt: new Date(),
        status: "pending",
      };

      (mockRepository.findPending as ReturnType<typeof vi.fn>).mockResolvedValue([mockReminder]);

      await service.initialize();

      expect(mockScheduler.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "reminder-2",
          triggerAt: jsDate,
        }),
        expect.any(Function)
      );
    });
  });

  describe("getReminders", () => {
    it("should return reminders from repository", async () => {
      const mockReminders: Reminder[] = [
        {
          id: "r1",
          chatId: "chat123",
          contactId: "user@s.whatsapp.net",
          message: "Reminder 1",
          triggerAt: new Date(),
          createdAt: new Date(),
          status: "pending",
        },
      ];

      (mockRepository.findByChatAndContact as ReturnType<typeof vi.fn>).mockResolvedValue(mockReminders);

      const result = await service.getReminders("chat123", "user@s.whatsapp.net");

      expect(result).toEqual(mockReminders);
      expect(mockRepository.findByChatAndContact).toHaveBeenCalledWith("chat123", "user@s.whatsapp.net");
    });
  });

  describe("cancelReminder", () => {
    it("should update status and cancel scheduler", async () => {
      await service.cancelReminder("reminder-1");

      expect(mockRepository.update).toHaveBeenCalledWith("reminder-1", { status: "cancelled" });
      expect(mockScheduler.cancel).toHaveBeenCalledWith("reminder-1");
    });
  });
});
