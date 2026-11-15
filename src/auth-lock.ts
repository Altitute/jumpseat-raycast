import { mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const LOCK_NAME = "auth-storage.lock";
const RETRY_MS = 20;
// Critical sections only touch local storage, so a lock this old was left by
// a process that died while holding it.
const STALE_MS = 10_000;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function lockAge(path: string): Promise<number | null> {
  try {
    return Date.now() - (await stat(path)).mtimeMs;
  } catch {
    return null;
  }
}

/**
 * Runs `critical` while holding a lock shared by every command process.
 *
 * Raycast runs each command in its own process, and its token store has no
 * compare-and-set. Token writes that depend on what is currently stored take
 * this lock so that reading and writing happen as one step. Creating a
 * directory is atomic, so it serves as the lock.
 */
export async function withAuthStorageLock<T>(
  directory: string,
  critical: () => Promise<T>,
): Promise<T> {
  const lock = join(directory, LOCK_NAME);
  await mkdir(directory, { recursive: true });
  for (;;) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const age = await lockAge(lock);
      if (age !== null && age > STALE_MS) {
        await rm(lock, { recursive: true, force: true });
        continue;
      }
      await sleep(RETRY_MS);
    }
  }
  try {
    return await critical();
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}
