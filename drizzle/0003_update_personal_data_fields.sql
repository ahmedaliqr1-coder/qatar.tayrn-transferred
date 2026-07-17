-- Update personalDataSubmissions table to include missing fields and relax constraints
ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "password" text;
ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "title" varchar(20);
ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "middleName" text;
ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "lastName" text;
ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "promoCode" varchar(50);
ALTER TABLE "personalDataSubmissions" ADD COLUMN IF NOT EXISTS "country" varchar(100);

-- Make nameArabic and idNumber optional as they are not used in the current join form
ALTER TABLE "personalDataSubmissions" ALTER COLUMN "nameArabic" DROP NOT NULL;
ALTER TABLE "personalDataSubmissions" ALTER COLUMN "idNumber" DROP NOT NULL;
ALTER TABLE "personalDataSubmissions" ALTER COLUMN "gender" DROP NOT NULL;
ALTER TABLE "personalDataSubmissions" ALTER COLUMN "customerStatus" DROP NOT NULL;
