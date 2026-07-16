-- Add delivery and payment fields to loginMethodSubmissions table
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "deliveryMethod" varchar(20);
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "branchName" text;
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "deliveryAddress" text;
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "phoneConfirmation" varchar(20);
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "issuanceFee" varchar(20);
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "deliveryFee" varchar(20);
ALTER TABLE "loginMethodSubmissions" ADD COLUMN "totalAmount" varchar(20);
