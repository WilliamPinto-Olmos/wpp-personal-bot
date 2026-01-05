import type { IncomingMessage, DetectedIntent } from "../types/index.js";

/**
 * Context object passed through the pipeline.
 * Each step can read and modify this context.
 */
export interface PipelineContext {
  message: IncomingMessage;
  cleanedBody?: string;
  intent?: DetectedIntent;
  response?: string;
  shouldContinue: boolean;
  errorMessage?: string;
  shouldSaveResponse?: boolean;
}

/**
 * Interface for pipeline steps.
 * Each step processes the context and returns the modified context.
 */
export interface PipelineStep {
  readonly name: string;
  execute(ctx: PipelineContext): Promise<PipelineContext>;
}

/**
 * Creates an initial pipeline context from an incoming message.
 * @param message - The incoming WhatsApp message
 * @returns Initial context with shouldContinue set to true
 */
export function createContext(message: IncomingMessage): PipelineContext {
  return {
    message,
    shouldContinue: true,
  };
}
