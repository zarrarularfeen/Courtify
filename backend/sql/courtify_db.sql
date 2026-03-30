/* ==========================================================
   Lookup Tables
   ========================================================== */

CREATE TABLE IF NOT EXISTS court_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

INSERT INTO court_types (type_name) VALUES 
('Padel'), ('Tennis'), ('Badminton'), ('Futsal');


CREATE TABLE IF NOT EXISTS booking_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL
);

INSERT INTO booking_status (status_name) VALUES
('pending'), ('confirmed'), ('cancelled');


/* ==========================================================
   Players
   ========================================================== */
CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  is_active TINYINT(1) DEFAULT 0,
  verification_token VARCHAR(255)
);

/* Dummy Players */
INSERT INTO players (email, password_hash, name, phone, is_active)
VALUES
('player@example.com',
 '$2b$10$533qJn3SLMwXHwsUs.WtQexDbAPZYcKw7isfsPwVInWwhSZkcC9l.', /* 12345678 */
 'Test Player',
 '03001234567',
 1
);



/* ==========================================================
   Arena Owners
   ========================================================== */
CREATE TABLE IF NOT EXISTS arena_owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 0,
  verification_token VARCHAR(255)
);

/* Dummy Arena Owners */
INSERT INTO arena_owners (name, email, phone, password_hash, is_active)
VALUES
('Marksman Admin',
 'marksman_admin@example.com',
 '03001112222',
 '$2b$10$533qJn3SLMwXHwsUs.WtQexDbAPZYcKw7isfsPwVInWwhSZkcC9l.', /* 12345678 */
 1
),
('Titan Admin',
 'titan_admin@example.com',
 '03003334444',
 '$2b$10$533qJn3SLMwXHwsUs.WtQexDbAPZYcKw7isfsPwVInWwhSZkcC9l.', /* 12345678 */
 1
);


/* ==========================================================
   Arenas
   ========================================================== */
CREATE TABLE IF NOT EXISTS arenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  pricePerHour INT DEFAULT NULL,
  availability ENUM('available', 'unavailable', 'closed') DEFAULT 'available',
  rating DECIMAL(3,2) DEFAULT 0.00,
  timing VARCHAR(100),              -- NEW
  amenities JSON,                   -- NEW: ["Showers","Lockers",...]
  description TEXT,                 -- NEW
  rules JSON,                       -- NEW: ["Wear proper kit", "No smoking", ...]
  FOREIGN KEY (owner_id) REFERENCES arena_owners(id)
);

/* Dummy Arenas */
INSERT INTO arenas (
  owner_id, 
  name, 
  city, 
  address, 
  pricePerHour, 
  availability, 
  rating,
  timing,
  amenities,
  description,
  rules
)
VALUES
(1,
 'Legends Arena',
 'Karachi',
 'Clifton Block 5',
 4500,
 'available',
 4.50,
 '8 AM - 11 PM',
 JSON_ARRAY('Changing Rooms', 'Showers', 'Parking', 'Equipment Rental'),
 'A premium multi-sport facility in Clifton with padel and futsal courts designed for a high-quality sports experience.',
 JSON_ARRAY('Proper sports shoes required', 'Arrive 10 minutes early', 'Respect booking times')
),

(1,
 'Marksman Arena',
 'Lahore',
 'Gulshan Block 10',
 3500,
 'available',
 4.20,
 '9 AM - 12 AM',
 JSON_ARRAY('Locker Room', 'Café', 'WiFi', 'Rental Rackets'),
 'A popular arena in Gulshan offering cricket and futsal courts suitable for all skill levels.',
 JSON_ARRAY('No smoking inside venue', 'Follow staff instructions', 'Bring your own water bottle')
),

(2,
 'Titan Arena',
 'Karachi',
 'DHA Phase 6',
 5000,
 'closed',
 4.00,
 '7 AM - 10 PM',
 JSON_ARRAY('Rest Area', 'Parking', 'Professional Coaches'),
 'A well-established sports complex in DHA featuring tennis and padel courts with coaching facilities.',
 JSON_ARRAY('Coaching sessions must be pre-booked', 'Wear proper sports attire', 'Do not litter on the courts')
);



/* ==========================================================
   Arena Images
   ========================================================== */
CREATE TABLE IF NOT EXISTS arena_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  arena_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  FOREIGN KEY (arena_id) REFERENCES arenas(id)
);

/* Arena Images */
INSERT INTO arena_images (arena_id, image_path)
VALUES
(1, '/assets/arena/legendsArenaMain.png'),
(2, '/assets/arena/MarksmanArenaMain.png'),
(3, '/assets/arena/titanArenaMain.png');



/* ==========================================================
   Courts
   ========================================================== */
CREATE TABLE IF NOT EXISTS courts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  arena_id INT NOT NULL,
  court_type_id INT NOT NULL,
  name VARCHAR(100),
  image_path VARCHAR(255),     -- NEW COLUMN ADDED
  FOREIGN KEY (arena_id) REFERENCES arenas(id),
  FOREIGN KEY (court_type_id) REFERENCES court_types(id)
);

/* Courts */
INSERT INTO courts (arena_id, court_type_id, name, image_path)
VALUES
-- Legends Arena (ID 1)
(1, 4, 'Futsal Court', '/assets/courts/legendsArenaFutsal.png'),
(1, 1, 'Padel Court', '/assets/courts/legendsArenaPaddle.png'),

-- Marksman Arena (ID 2)
(2, 3, 'Cricket Court', '/assets/courts/MarksmanArenaCricket.png'),
(2, 4, 'Futsal Court', '/assets/courts/MarksmanArenaFutsal.png'),

-- Titan Arena (ID 3)
(3, 1, 'Padel Court', '/assets/courts/titanArenaPaddle.png'),
(3, 2, 'Tennis Court', '/assets/courts/titanArenaTennis.png');



/* ==========================================================
   Bookings
   ========================================================== */
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  court_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status_id INT NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (court_id) REFERENCES courts(id),
  FOREIGN KEY (status_id) REFERENCES booking_status(id)
);

INSERT INTO bookings (player_id, court_id, booking_date, start_time, end_time, status_id)
VALUES 
-- Past bookings
(1, 1, '2025-11-20', '18:00:00', '19:00:00', 2), -- Past futsal (confirmed)
(1, 2, '2025-11-22', '15:00:00', '16:30:00', 3), -- Past padel (cancelled)
(1, 3, '2025-11-25', '10:00:00', '11:30:00', 2), -- Past cricket (confirmed)

-- Upcoming bookings
(1, 4, '2025-12-05', '14:30:00', '16:00:00', 1), -- Future futsal (pending)
(1, 5, '2025-12-08', '09:00:00', '10:00:00', 2), -- Future padel (confirmed)
(1, 6, '2025-12-10', '16:00:00', '17:00:00', 1), -- Future tennis (pending)

-- More upcoming with different durations
(1, 1, '2025-12-12', '19:00:00', '20:30:00', 2), -- 1.5 hours futsal (confirmed)
(1, 2, '2025-12-15', '11:00:00', '12:00:00', 1), -- 1 hour padel (pending)
(1, 3, '2025-12-18', '13:00:00', '15:00:00', 2), -- 2 hours cricket (confirmed)
(1, 4, '2025-12-20', '17:00:00', '18:00:00', 3); -- 1 hour futsal (cancelled)
