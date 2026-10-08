import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertOrder, InsertProduct, InsertUser, Order, orders, products, StoreMedia, storeMedia, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(input: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const openId = `local:${input.email.toLowerCase()}`;
  await db.insert(users).values({ openId, email: input.email.toLowerCase(), name: input.name, passwordHash: input.passwordHash, loginMethod: "password" });
  return getUserByOpenId(openId);
}

export async function listProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(products.createdAt);
}

export async function createProduct(input: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(products).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return created[0];
}

export async function updateProduct(id: number, input: Pick<InsertProduct, "name" | "spec" | "price" | "wasPrice" | "tag" | "image" | "category" | "stock" | "description">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(products).set(input).where(eq(products.id, id));
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!result[0]) throw new Error("Product not found");
  return result[0];
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function createOrder(input: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(orders).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return created[0];
}

export async function listOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
}

export async function getOrderByNumberAndPhone(orderNumber: string, phone: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select({ orderNumber: orders.orderNumber, customerName: orders.customerName, phone: orders.phone, branch: orders.branch, items: orders.items, total: orders.total, status: orders.status, createdAt: orders.createdAt }).from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = result[0];
  if (!order || order.phone !== phone) return null;
  return order;
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function getStoreVideo() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(storeMedia).where(eq(storeMedia.id, 1)).limit(1);
  return result[0] ?? null;
}

export async function saveStoreVideo(input: Pick<StoreMedia, "videoUrl" | "videoType" | "fileName">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(storeMedia).values({ id: 1, ...input }).onDuplicateKeyUpdate({
    set: { ...input, updatedAt: new Date() },
  });
  return getStoreVideo();
}
