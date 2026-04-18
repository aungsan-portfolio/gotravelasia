CREATE TABLE `emailQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toEmail` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`htmlContent` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`lastError` text,
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailQueue_id` PRIMARY KEY(`id`)
);
