CREATE TABLE `store_media` (
	`id` int NOT NULL,
	`videoUrl` varchar(2048) NOT NULL,
	`videoType` varchar(40) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_media_id` PRIMARY KEY(`id`)
);
