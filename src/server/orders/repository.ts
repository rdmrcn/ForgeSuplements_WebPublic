import { promises as fs } from "node:fs";
import path from "node:path";
import type { DemoOrder, OrderRepository } from "./types";

/**
 * Local demo persistence.
 *
 * Orders are written to a JSON file under `.data/` (git-ignored) so they
 * survive a dev-server restart. This is NOT a production database: there is
 * no locking, no backups and no access control beyond the unguessable order id.
 * Implement `OrderRepository` against PostgreSQL (for example with Prisma) to
 * replace it. If the filesystem is read-only, orders fall back to process memory.
 */

const memory = new Map<string, DemoOrder>();

function storePath(): string {
  return path.resolve(process.env.ORDER_STORE_PATH ?? path.join(process.cwd(), ".data", "orders.json"));
}

async function readAll(): Promise<Record<string, DemoOrder>> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, DemoOrder>) : {};
  } catch {
    return {};
  }
}

export const fileOrderRepository: OrderRepository = {
  async create(order) {
    memory.set(order.id, order);
    try {
      const all = await readAll();
      all[order.id] = order;
      await fs.mkdir(path.dirname(storePath()), { recursive: true });
      await fs.writeFile(storePath(), JSON.stringify(all, null, 2), "utf8");
    } catch (error) {
      console.warn("[orders] Could not persist to disk; keeping in memory only.", error);
    }
  },
  async get(id) {
    const cached = memory.get(id);
    if (cached) return cached;
    const all = await readAll();
    return all[id] ?? null;
  },
};

export function getOrderRepository(): OrderRepository {
  return fileOrderRepository;
}
