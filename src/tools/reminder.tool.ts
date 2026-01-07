import { tool } from "ai";
import { z } from "zod";
import type { AgentContext } from "../agent/types.js";
import { DateTime } from "luxon";

/**
 * Tool for creating a new reminder.
 */
export const createReminderTool = (ctx: AgentContext) => tool({
  description: "Crea un nuevo recordatorio. El usuario especificará qué recordar y cuándo. triggerTime debe ser una cadena ISO 8601 en UTC-6 (America/Mexico_City).",
  inputSchema: z.object({
    reminderMessage: z.string().describe("El mensaje o asunto del recordatorio (ej: 'cambiar de juego')."),
    triggerTime: z.string().describe("La fecha y hora en formato ISO 8601 (ej: '2026-01-06T21:00:00-06:00')."),
  }),
  execute: async ({ reminderMessage, triggerTime }) => {
    if (!ctx.reminderService) {
      return { message: "Error: El servicio de recordatorios no está disponible." };
    }

    const triggerAt = DateTime.fromISO(triggerTime, { zone: "America/Mexico_City" }).toJSDate();

    const reminder = await ctx.reminderService.createReminder({
      chatId: ctx.chatId,
      contactId: ctx.contactId,
      message: reminderMessage,
      triggerAt,
    });

    return {
      message: `¡Entendido! Te recordaré "${reminder.message}" el día ${DateTime.fromJSDate(reminder.triggerAt).setZone("America/Mexico_City").toLocaleString(DateTime.DATETIME_SHORT)}.`,
      data: reminder
    };
  },
});

/**
 * Tool for listing user reminders.
 */
export const listRemindersTool = (ctx: AgentContext) => tool({
  description: "Lista todos los recordatorios pendientes del usuario en este chat.",
  inputSchema: z.object({}),
  execute: async () => {
    if (!ctx.reminderService) {
      return { message: "Error: El servicio de recordatorios no está disponible." };
    }

    const reminders = await ctx.reminderService.getReminders(ctx.chatId, ctx.contactId);
    const pendingReminders = reminders.filter(r => r.status === "pending");

    if (pendingReminders.length === 0) {
      return { message: "No tienes recordatorios pendientes en este chat." };
    }

    let message = "Tus recordatorios pendientes:\n";
    pendingReminders.forEach((r, i) => {
      const dateStr = DateTime.fromJSDate(r.triggerAt).setZone("America/Mexico_City").toLocaleString(DateTime.DATETIME_SHORT);
      message += `${i + 1}. [ID: ${r.id.slice(0, 8)}] "${r.message}" - ${dateStr}\n`;
    });

    return { message, data: pendingReminders };
  },
});

/**
 * Tool for deleting or cancelling a reminder.
 */
export const deleteReminderTool = (ctx: AgentContext) => tool({
  description: "Cancela un recordatorio existente usando su ID.",
  inputSchema: z.object({
    reminderId: z.string().describe("El ID del recordatorio a cancelar (puedes obtenerlo listando los recordatorios)."),
  }),
  execute: async ({ reminderId }) => {
    if (!ctx.reminderService) {
      return { message: "Error: El servicio de recordatorios no está disponible." };
    }

    // Attempt to find the full ID if a prefix was provided (for convenience)
    const reminders = await ctx.reminderService.getReminders(ctx.chatId, ctx.contactId);
    const target = reminders.find(r => r.id === reminderId || r.id.startsWith(reminderId));

    if (!target) {
      return { message: `No encontré ningún recordatorio con el ID "${reminderId}".` };
    }

    await ctx.reminderService.cancelReminder(target.id);
    return { message: `Recordatorio "${target.message}" cancelado correctamente.` };
  },
});

/**
 * Tool for editing a reminder.
 */
export const editReminderTool = (ctx: AgentContext) => tool({
  description: "Edita un recordatorio existente. Puedes cambiar el mensaje, la fecha/hora o ambos.",
  inputSchema: z.object({
    reminderId: z.string().describe("El ID del recordatorio a editar."),
    newMessage: z.string().optional().describe("Nuevo mensaje para el recordatorio."),
    newTriggerTime: z.string().optional().describe("Nueva fecha y hora en formato ISO 8601."),
  }),
  execute: async ({ reminderId, newMessage, newTriggerTime }) => {
    if (!ctx.reminderService) {
      return { message: "Error: El servicio de recordatorios no está disponible." };
    }

    const reminders = await ctx.reminderService.getReminders(ctx.chatId, ctx.contactId);
    const target = reminders.find(r => r.id === reminderId || r.id.startsWith(reminderId));

    if (!target) {
      return { message: `No encontré ningún recordatorio con el ID "${reminderId}".` };
    }

    const updates: any = {};
    if (newMessage) updates.message = newMessage;
    if (newTriggerTime) {
      updates.triggerAt = DateTime.fromISO(newTriggerTime, { zone: "America/Mexico_City" }).toJSDate();
    }

    await ctx.reminderService.updateReminder(target.id, updates);

    return { 
      message: "Recordatorio actualizado correctamente.",
      data: { id: target.id, ...updates }
    };
  },
});
