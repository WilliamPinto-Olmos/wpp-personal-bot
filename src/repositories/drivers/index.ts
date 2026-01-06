import { MemoryDriver } from "./memory.driver.js";
import { FirestoreDriver } from "./firestore.driver.js";
import type { IDatabaseDriver } from "../driver.interface.js";

/**
 * Factory function to create a database driver.
 * @param driverName - The name of the driver to create
 * @returns An instance of the requested database driver
 */
export function createDriver(driverName: "memory" | "firestore"): IDatabaseDriver {
  switch (driverName) {
    case "memory":
      return new MemoryDriver();
    case "firestore":
      return new FirestoreDriver();
    default:
      throw new Error(`Unsupported database driver: ${driverName}`);
  }
}

export { MemoryDriver, FirestoreDriver };
