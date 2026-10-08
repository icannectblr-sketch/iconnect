CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`spec` varchar(240) NOT NULL,
	`price` int NOT NULL,
	`wasPrice` int NOT NULL,
	`tag` varchar(60) NOT NULL,
	`image` text NOT NULL,
	`category` varchar(40) NOT NULL,
	`stock` varchar(60) NOT NULL,
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
