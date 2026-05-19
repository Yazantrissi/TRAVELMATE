-- =============================================
-- TravelMate Database Setup
-- =============================================
CREATE DATABASE IF NOT EXISTS travelmate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travelmate_db;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(200),
    transport_type VARCHAR(100) DEFAULT 'Flight',
    image_url TEXT,
    max_seats INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trip_id INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    booking_type ENUM('solo','group') DEFAULT 'group',
    stripe_payment_id VARCHAR(255),
    status ENUM('pending','confirmed','cancelled','ready') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Booking Passengers
CREATE TABLE IF NOT EXISTS booking_passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    passport_number VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    category VARCHAR(100) DEFAULT 'Friends',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat Rooms (مرتبطة بالرحلات)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    creator_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    user_id INT,
    message TEXT,
    type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    booking_id INT,
    doc_type VARCHAR(50),
    encrypted_data TEXT,
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Polls
CREATE TABLE IF NOT EXISTS polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    creator_id INT,
    question TEXT,
    options JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poll_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT,
    user_id INT,
    option_index INT,
    FOREIGN KEY (poll_id) REFERENCES polls(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_vote (poll_id, user_id)
);

-- =============================================
-- بيانات تجريبية
-- =============================================

-- رحلات
INSERT INTO trips (title, description, price, start_date, end_date, location, transport_type, image_url, max_seats) VALUES
('رحلة إلى دبي', 'استمتع بأجمل المعالم السياحية في دبي', 299.99, '2025-07-01', '2025-07-07', 'دبي، الإمارات', 'Flight', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 30),
('رحلة إلى القاهرة', 'اكتشف أسرار الحضارة الفرعونية', 199.99, '2025-08-10', '2025-08-17', 'القاهرة، مصر', 'Flight', 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800', 40),
('رحلة إلى إسطنبول', 'تجربة فريدة بين القارتين', 349.99, '2025-09-05', '2025-09-12', 'إسطنبول، تركيا', 'Flight', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', 25),
('رحلة إلى بانكوك', 'اكتشف سحر المعابد والأسواق', 450.00, '2025-10-01', '2025-10-10', 'بانكوك، تايلاند', 'Flight', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', 20),
('رحلة إلى لندن', 'زيارة أيقونات لندن', 599.99, '2025-11-15', '2025-11-22', 'لندن، المملكة المتحدة', 'Flight', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 35);

-- Admin (password: password)
INSERT INTO users (username, email, phone_number, password_hash, role) VALUES
('Admin', 'admin@travelmate.com', '0000000000', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

SELECT 'Database setup complete!' AS message;
