import { mkdtemp, mkdir, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { withAuthStorageLock } from "./auth-lock";

describe("auth storage lock", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "jumpseat-lock-"));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("runs critical sections one at a time and releases the lock", async () => {
    const events: string[] = [];
    const section = (name: string) =>
      withAuthStorageLock(directory, async () => {
        events.push(`${name}:start`);
        await new Promise((resolve) => setTimeout(resolve, 30));
        events.push(`${name}:end`);
        return name;
      });

    await expect(Promise.all([section("a"), section("b")])).resolves.toEqual([
      "a",
      "b",
    ]);
    expect(events).toEqual(["a:start", "a:end", "b:start", "b:end"]);
    await expect(
      withAuthStorageLock(directory, async () => "again"),
    ).resolves.toBe("again");
  });

  it("releases the lock when the critical section throws", async () => {
    await expect(
      withAuthStorageLock(directory, async () => {
        throw new Error("failed");
      }),
    ).rejects.toThrow("failed");
    await expect(withAuthStorageLock(directory, async () => 1)).resolves.toBe(
      1,
    );
  });

  it("takes over a lock left behind by a process that died", async () => {
    const stale = join(directory, "auth-storage.lock");
    await mkdir(stale);
    const longAgo = new Date(Date.now() - 60_000);
    await utimes(stale, longAgo, longAgo);

    await expect(
      withAuthStorageLock(directory, async () => "ok"),
    ).resolves.toBe("ok");
  });
});
