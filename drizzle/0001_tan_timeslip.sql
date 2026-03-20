CREATE TABLE `destinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`type` enum('country','city','airport') NOT NULL,
	`name` varchar(255) NOT NULL,
	`iataCode` varchar(5),
	`countryCode` varchar(2),
	`primaryAirports` json,
	`cities` json,
	`capital` varchar(255),
	`weatherData` json,
	`priceRatio` json,
	`highlights` text,
	`climate` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinations_id` PRIMARY KEY(`id`),
	CONSTRAINT `destinations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `flightPriceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`departDate` varchar(10) NOT NULL,
	`returnDate` varchar(10),
	`targetPrice` int NOT NULL,
	`lastNotifiedPrice` int,
	`currency` varchar(3) NOT NULL DEFAULT 'THB',
	`routeId` varchar(20),
	`source` varchar(20) NOT NULL DEFAULT 'track_button',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flightPriceAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotelDeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` varchar(64) NOT NULL,
	`hotelName` text NOT NULL,
	`city` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`discountPercentage` int DEFAULT 0,
	`imageUrl` text,
	`bookingUrl` text NOT NULL,
	`checkIn` varchar(10),
	`checkOut` varchar(10),
	`isBotVerified` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotelDeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(64) DEFAULT 'popup',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_unique` UNIQUE(`email`)
);
