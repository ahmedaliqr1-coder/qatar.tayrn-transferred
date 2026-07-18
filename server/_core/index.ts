import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { db } from "./db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
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
    // إضافة الأعمدة المفقودة لجدول loginMethodSubmissions
    await db.execute(`
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "deliveryMethod" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "branchName" text;
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "deliveryAddress" text;
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "phoneConfirmation" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "issuanceFee" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "deliveryFee" varchar(20);
      ALTER TABLE "loginMethodSubmissions" ADD COLUMN IF NOT EXISTS "totalAmount" varchar(20);
    `);
    console.log("✅ loginMethodSubmissions migrations applied");

    // إضافة الأعمدة المفقودة لجدول personalDataSubmissions
    await db.execute(`
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "password" text;
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "title" varchar(20);
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "middleName" text;
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "lastName" text;
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "promoCode" varchar(50);
      ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "country" varchar(100);
    `);
    console.log("✅ personalDataSubmissions migrations applied");

    // إزالة قيود NOT NULL من الأعمدة
    await db.execute(`
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "nameArabic" DROP NOT NULL;
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "idNumber" DROP NOT NULL;
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "gender" DROP NOT NULL;
      ALTER TABLE "personalDataSubmissions" ALTER COLUMN "customerStatus" DROP NOT NULL;
    `);
    console.log("✅ NOT NULL constraints relaxed");

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    // لا نتوقف - بعض الأعمدة قد تكون موجودة بالفعل
  }
}

async function startServer() {
  // تشغيل الـ migrations قبل بدء السيرفر
  await runMigrations();

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
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
