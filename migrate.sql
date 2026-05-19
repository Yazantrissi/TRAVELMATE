-- Travelmate Backend SRS Migration Script
-- Run: mysql -u root -p travelmate_db < migrate.sql

CREATE TABLE IF NOT EXISTS `chat_rooms` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `trip_id` int,
  `creator_id` int,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`),
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` int,
  `user_id` int,
  `message` TEXT,
  `type` VARCHAR(20) DEFAULT 'text',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `documents` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `booking_id` int,
  `doc_type` VARCHAR(50),
  `encrypted_data` TEXT,
  `filename` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)
);

CREATE TABLE IF NOT EXISTS `polls` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `trip_id` int,
  `creator_id` int,
  `question` TEXT,
  `options` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `poll_votes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `poll_id` int,
  `user_id` int,
  `option_index` int,
  FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  UNIQUE KEY `unique_vote` (`poll_id`, `user_id`)
);

-- Indexes for perf
CREATE INDEX idx_chat_room_trip ON chat_rooms(trip_id);
CREATE INDEX idx_chat_msg_room ON chat_messages(room_id);
CREATE INDEX idx_doc_booking ON documents(booking_id);
CREATE INDEX idx_poll_trip ON polls(trip_id);

