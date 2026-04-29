import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from './config/db.js';
import sendVerificationEmail from './utils/sendMail.js';
import sendResetMail from './utils/sendResetMail.js';
import path from "path";
import { fileURLToPath } from "url";

// =====================================
// Resolve __dirname (required for ES Modules)
// =====================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// =====================================
// Initialize server
// =====================================
const app = express();

// =====================================
// Static file hosting (Assets folder)
// Accessible as: http://localhost:5000/assets/xxx.jpg
// =====================================
app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.use(cors());
app.use(express.json());

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => {
    if (err) return reject(err);
    resolve(results);
  });
});

// ------------------------ 
// LOGIN
// ------------------------
app.get('/auth/validate', async (req, res) => {
  const { email, password, userType } = req.query;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  if (userType === 'player'){
    const query = "SELECT id, email, password_hash, name, phone, is_active FROM players WHERE email = ?";

    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0)
        return res.status(401).json({ error: "Invalid email or password" });

      const user = results[0];

      if (user.is_active === 0)
        return res.status(403).json({ error: "Please verify your email first" });

      const match = await bcrypt.compare(password, user.password_hash);

      if (!match)
        return res.status(401).json({ error: "Invalid email or password" });

      return res.json({
        authenticated: true,
        message: "Login successful",
        userId: user.id,
        email: user.email,
        name: user.name,
        userType: "player"
      });
    });
  } else if (userType === 'owner') {
    const query = "SELECT id, name, email, phone, password_hash FROM arena_owners WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(401).json({ error: "Invalid email or password" });
      const user = results[0];
      if(user.is_active === 0)
        return res.status(403).json({ error: "Please verify your email first" });
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match)
        return res.status(401).json({ error: "Invalid email or password" });
      return res.json({
        authenticated: true,
        message: "Login successful",
        userId: user.id,
        email: user.email,
        name: user.name,
        userType: "owner"
      });
    });
  } else {
    return res.status(400).json({ error: "Invalid user type" });
  }  
});

// ------------------------
// SIGNUP
// ------------------------
app.post('/auth/signup', async (req, res) => {
  const { email, password, name, phone, userType } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Invalid email format" });

  if (userType === 'player') {
    db.query("SELECT id FROM players WHERE email = ?", [email], async (err, results) => {
      if (results.length > 0)
        return res.status(409).json({ error: "Email already registered" });

      const passwordHash = await bcrypt.hash(password, 10);
      const token = String(crypto.randomInt(100000, 999999)); // 6-digit OTP

      const insert = `
        INSERT INTO players (email, password_hash, name, phone, is_active, verification_token, verification_token_expiry)
        VALUES (?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
      `;

      db.query(insert, [email, passwordHash, name, phone, token], async (err, _) => {
        if (err) return res.status(500).json({ error: "Database insert failed" });

        await sendVerificationEmail(email, token);

        return res.status(201).json({
          message: "Account created. Check your email for the 6-digit OTP to verify."
        });
      });
    });
  } else if (userType === 'owner') {
    db.query("SELECT id FROM arena_owners WHERE email = ?", [email], async (err, results) => {
      if (results.length > 0)
        return res.status(409).json({ error: "Email already registered" });

      const passwordHash = await bcrypt.hash(password, 10);
      const token = String(crypto.randomInt(100000, 999999)); // 6-digit OTP

      const insert = `
        INSERT INTO arena_owners (name, email, phone, password_hash,  is_active, verification_token, verification_token_expiry)
        VALUES (?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
      `;

      db.query(insert, [name, email, phone, passwordHash, token], async (err, _) => {
        if (err) return res.status(500).json({ error: "Database insert failed" });

        await sendVerificationEmail(email, token);

        return res.status(201).json({
          message: "Account created. Check your email for the 6-digit OTP to verify."
        });
      });
    });
  } else {
    return res.status(400).json({ error: "Invalid user type" });
  }
});

// ------------------------
// FORGOT PASSWORD
// ------------------------
app.post('/auth/forgot-password', async (req, res) => {
  const { email, userType } = req.body;
  if (!email || !userType) return res.status(400).json({ error: "Email and user type required" });

  const tableName = userType === 'player' ? 'players' : 'arena_owners';
  db.query(`SELECT id FROM ${tableName} WHERE email = ?`, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    db.query(`UPDATE ${tableName} SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?`, 
      [token, email], async (err) => {
      if (err) return res.status(500).json({ error: "Database error" });

      try {
        await sendResetMail(email, token);
        return res.json({ message: "Reset link sent to your email." });
      } catch (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ error: "Error sending reset email." });
      }
    });
  });
});

// ------------------------
// RESET PASSWORD
// ------------------------
app.post('/auth/reset-password', async (req, res) => {
  console.log("[RESET PASSWORD] received body:", req.body);
  const { token, newPassword } = req.body;
  if (!token) {
    console.error("[RESET PASSWORD] Token is missing from request");
    return res.status(400).json({ error: "Token is required. Please make sure you used the correct link." });
  }
  if (!newPassword) {
    console.error("[RESET PASSWORD] New password is missing from request");
    return res.status(400).json({ error: "New password is required." });
  }

  const checkToken = async (tableName) => {
    return new Promise((resolve, reject) => {
      // Use SQL functions for checking expiry: reset_token_expiry > NOW()
      db.query(`SELECT id, email FROM ${tableName} WHERE reset_token = ? AND reset_token_expiry > NOW()`, [token], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };

  try {
    let results = await checkToken('players');
    let tableName = 'players';

    if (results.length === 0) {
      results = await checkToken('arena_owners');
      tableName = 'arena_owners';
    }

    if (results.length === 0) return res.status(400).json({ error: "Invalid or expired token" });

    const user = results[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    db.query(`UPDATE ${tableName} SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`, 
      [passwordHash, user.id], (err) => {
        if (err) return res.status(500).json({ error: "Database error" });
        return res.json({ message: "Password reset successful" });
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

// ------------------------
// VERIFY OTP FOR BOTH USERS
// ------------------------
app.post('/auth/verify-otp', (req, res) => {
  const { email, otp, userType } = req.body;

  if (!email || !otp || !userType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const tableName = userType === 'player' ? 'players' : 'arena_owners';

  db.query(`SELECT id, verification_token, verification_token_expiry FROM ${tableName} WHERE email = ?`, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    // Check expiry if present
    if (user.verification_token_expiry && new Date(user.verification_token_expiry) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (!user.verification_token || String(user.verification_token) !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP matched, activate user
    db.query(`UPDATE ${tableName} SET is_active = 1, verification_token = NULL, verification_token_expiry = NULL WHERE email = ?`, [email], (updateErr) => {
      if (updateErr) {
        console.error('Database error activating user:', updateErr);
        return res.status(500).json({ error: "Could not activate user" });
      }

      return res.status(200).json({ message: "Verification successful!" });
    });
  });
});

// ------------------------
// RESEND OTP
// ------------------------
app.post('/auth/resend-otp', (req, res) => {
  const { email, userType } = req.body;
  if (!email || !userType) return res.status(400).json({ error: "Email and user type required" });

  const tableName = userType === 'player' ? 'players' : 'arena_owners';

  db.query(`SELECT id, is_active FROM ${tableName} WHERE email = ?`, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const user = results[0];
    if (user.is_active === 1) return res.status(400).json({ error: "Account already verified" });

    const otp = String(crypto.randomInt(100000, 999999));

    db.query(`UPDATE ${tableName} SET verification_token = ?, verification_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?`, [otp, email], async (updateErr) => {
      if (updateErr) return res.status(500).json({ error: "Database error" });

      try {
        await sendVerificationEmail(email, otp);
        return res.json({ message: "OTP resent to email" });
      } catch (sendErr) {
        console.error('Error sending OTP:', sendErr);
        return res.status(500).json({ error: "Error sending OTP" });
      }
    });
  });
});

// -------------------------------------
// MODERATOR AUTH + DASHBOARD
// -------------------------------------
app.post('/moderator/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  db.query('SELECT id, name, email, password_hash, is_active FROM moderators WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const moderator = results[0];
    if (moderator.is_active === 0) return res.status(403).json({ error: "Moderator account disabled" });

    const match = await bcrypt.compare(password, moderator.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    return res.json({
      authenticated: true,
      moderatorId: moderator.id,
      name: moderator.name,
      email: moderator.email
    });
  });
});

app.get('/moderator/overview', async (req, res) => {
  try {
    const flaggedCountResults = await queryAsync(`SELECT COUNT(*) AS count FROM player_flags WHERE status = 'pending'`);
    const adminSignupsResults = await queryAsync(`SELECT COUNT(*) AS count FROM arena_owners WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    const reportedUsersResults = await queryAsync(`SELECT COUNT(DISTINCT player_id) AS count FROM player_flags WHERE status = 'pending'`);
    const recentActivityResults = await queryAsync(`SELECT ma.id, ma.target_type, ma.target_id, ma.action, ma.note, ma.created_at, m.name AS moderator_name FROM moderator_actions ma LEFT JOIN moderators m ON ma.moderator_id = m.id ORDER BY ma.created_at DESC LIMIT 5`);

    return res.json({
      flaggedCount: flaggedCountResults[0]?.count || 0,
      newAdminSignups: adminSignupsResults[0]?.count || 0,
      reportedUsers: reportedUsersResults[0]?.count || 0,
      recentActivity: recentActivityResults
    });
  } catch (err) {
    console.error('Moderator overview error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/moderator/flags', async (req, res) => {
  try {
    const query = `
      SELECT
        pf.id,
        pf.player_id,
        p.name AS player_name,
        p.email,
        p.phone,
        pf.reason,
        pf.details,
        pf.status,
        pf.created_at,
        pf.updated_at,
        (SELECT COUNT(*) FROM player_flags WHERE player_id = pf.player_id) AS total_flags
      FROM player_flags pf
      JOIN players p ON pf.player_id = p.id
      ORDER BY pf.created_at DESC
    `;
    const flags = await queryAsync(query);
    return res.json(flags);
  } catch (err) {
    console.error('Moderator flags error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/moderator/users', async (req, res) => {
  try {
    const users = await queryAsync(`SELECT id, name, email, phone, is_active, warning_count, is_banned, created_at FROM players ORDER BY created_at DESC`);
    return res.json(users);
  } catch (err) {
    console.error('Moderator users error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/moderator/admins', async (req, res) => {
  try {
    const admins = await queryAsync(`SELECT id, name, email, phone, is_active, warning_count, is_banned, created_at FROM arena_owners ORDER BY created_at DESC`);
    return res.json(admins);
  } catch (err) {
    console.error('Moderator admins error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/moderator/admins/:id/toggle', async (req, res) => {
  const adminId = req.params.id;
  try {
    const result = await queryAsync(`UPDATE arena_owners SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?`, [adminId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Admin not found' });
    const admin = await queryAsync(`SELECT id, is_active FROM arena_owners WHERE id = ?`, [adminId]);
    return res.json({ message: 'Admin status updated', admin: admin[0] });
  } catch (err) {
    console.error('Toggle admin error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/moderator/users/:id/action', async (req, res) => {
  const userId = req.params.id;
  const { action, moderatorId, note } = req.body;

  if (!action) return res.status(400).json({ error: 'Action required' });

  try {
    if (action === 'warn') {
      await queryAsync(`UPDATE players SET warning_count = warning_count + 1 WHERE id = ?`, [userId]);
    } else if (action === 'ban') {
      await queryAsync(`UPDATE players SET is_banned = 1 WHERE id = ?`, [userId]);
    } else if (action === 'resolve') {
      await queryAsync(`UPDATE players SET is_banned = 0 WHERE id = ?`, [userId]);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (moderatorId) {
      await queryAsync(`INSERT INTO moderator_actions (moderator_id, target_type, target_id, action, note) VALUES (?, 'player', ?, ?, ?)`,
        [moderatorId, userId, action, note || '']);
    }

    return res.json({ message: 'User action applied' });
  } catch (err) {
    console.error('Moderator user action error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/moderator/flags/:id/action', async (req, res) => {
  const flagId = req.params.id;
  const { action, moderatorId, note } = req.body;

  if (!action) return res.status(400).json({ error: 'Action required' });

  try {
    const flag = await queryAsync(`SELECT player_id FROM player_flags WHERE id = ?`, [flagId]);
    if (flag.length === 0) return res.status(404).json({ error: 'Flag not found' });
    const playerId = flag[0].player_id;

    let updateStatus = action;
    if (!['warned', 'banned', 'resolved'].includes(updateStatus)) {
      return res.status(400).json({ error: 'Invalid flag action' });
    }

    await queryAsync(`UPDATE player_flags SET status = ? WHERE id = ?`, [updateStatus, flagId]);

    if (action === 'warned') {
      await queryAsync(`UPDATE players SET warning_count = warning_count + 1 WHERE id = ?`, [playerId]);
    }
    if (action === 'banned') {
      await queryAsync(`UPDATE players SET is_banned = 1 WHERE id = ?`, [playerId]);
    }

    if (moderatorId) {
      await queryAsync(`INSERT INTO moderator_actions (moderator_id, target_type, target_id, action, note) VALUES (?, 'flag', ?, ?, ?)`,
        [moderatorId, flagId, action, note || '']);
    }

    return res.json({ message: 'Flag action applied' });
  } catch (err) {
    console.error('Moderator flag action error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// =====================================
// GET ALL ARENAS + main arena image
// =====================================
app.get('/arenas', (req, res) => {
  const query = `
    SELECT 
      a.id,
      a.name,
      a.city AS location,
      a.pricePerHour,
      a.availability,
      a.rating,
      (
        SELECT ai.image_path
        FROM arena_images ai
        WHERE ai.arena_id = a.id
        ORDER BY ai.id ASC
        LIMIT 1
      ) AS image_path
    FROM arenas a
    LEFT JOIN arena_images ai ON ai.arena_id = a.id
    ORDER BY a.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    return res.json(results);
  });
});

// ===============================
// GET Arena Full Details
// ===============================
app.get("/arena/:id", (req, res) => {
  const arenaId = req.params.id;

  const arenaQuery = `
    SELECT 
      id, owner_id, name, city, address, pricePerHour, availability, rating,
      timing, amenities, description, rules
    FROM arenas 
    WHERE id = ?;
  `;

  const imagesQuery = `
    SELECT image_path 
    FROM courts 
    WHERE arena_id = ?;
  `;

  // const courtsQuery = `
  //   SELECT distinct ct.type_name
  //   FROM courts c
  //   JOIN court_types ct ON c.court_type_id = ct.id
  //   WHERE c.arena_id = ?;
  // `;
  const courtsQuery = `
    SELECT 
      ct.type_name AS type,
      c.name AS court_name,
      c.id AS court_id
    FROM courts c
    JOIN court_types ct 
      ON c.court_type_id = ct.id
    WHERE c.arena_id = ?;
  `;

  // 1) Fetch arena details
  db.query(arenaQuery, [arenaId], (err, arenaResult) => {
    if (err) return res.status(500).json({ error: "Database error (arena)" });

    if (arenaResult.length === 0)
      return res.status(404).json({ error: "Arena not found" });

    let arena = arenaResult[0];

    // Parse JSON safely
    const safeJSON = (value) => {
      if (!value) return [];

      try {
        // Case 1: Already an array (MySQL sometimes returns JSON parsed)
        if (Array.isArray(value)) return value;

        // Case 2: Value is a Buffer
        if (Buffer.isBuffer(value)) {
          return JSON.parse(value.toString());
        }

        // Case 3: Value is a string
        if (typeof value === "string") {
          return JSON.parse(value);
        }

        return [];
      } catch (e) {
        console.error("JSON parse error:", e);
        return [];
      }
    };


    arena.amenities = safeJSON(arena.amenities);
    arena.rules = safeJSON(arena.rules);

    // 2) Fetch main images
    db.query(imagesQuery, [arenaId], (err, imgResult) => {
      if (err) return res.status(500).json({ error: "Database error (images)" });

      const images = imgResult.map(row => row.image_path);

      // 3) Fetch courts and court images
      db.query(courtsQuery, [arenaId], (err, courtsResult) => {
        if (err) return res.status(500).json({ error: "Database error (courts)" });

        // GROUP courts: {type_name: [court1, court2]}
        const groupedCourts = {};

        courtsResult.forEach(row => {
          if (!groupedCourts[row.type]) {
            groupedCourts[row.type] = [];
          }
          groupedCourts[row.type].push({ id: row.court_id, name: row.court_name });
        });

        // FINAL RESPONSE
        return res.json({
          id: arena.id,
          name: arena.name,
          address: arena.address,
          city: arena.city,
          rating: arena.rating,
          pricePerHour: arena.pricePerHour,
          availability: arena.availability,
          timing: arena.timing,
          amenities: arena.amenities,
          description: arena.description,
          rules: arena.rules,
          images: images,
          courts: groupedCourts
        });
      });
    });
  });
});

// ===============================
// POST Create Booking
app.post('/bookings', (req, res) => {
  const { userId, courtId, date, startTime, endTime, status } = req.body;

  if (!userId || !courtId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const statusId = status === 'confirmed' ? 2 : 1; 

  const query = `
    INSERT INTO bookings (player_id, court_id, booking_date, start_time, end_time, status_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [userId, courtId, date, startTime, endTime, statusId], (err, result) => {
    if (err) {
      console.error("Error creating booking:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Booking created successfully", bookingId: result.insertId });
  });
});

// GET User Bookings (Callback version)
// ===============================
app.get("/bookings/:userId", (req, res) => {
  const userId = req.params.userId;
  
  const query = `
    SELECT 
      b.id AS bookingId,
      a.name AS arenaName,
      c.id AS courtNumber,
      DATE(b.booking_date) AS bookingDate,
      b.start_time AS startTime,
      TIME_TO_SEC(TIMEDIFF(b.end_time, b.start_time)) / 60 AS duration,
      bs.status_name AS status
    FROM bookings b
    JOIN courts c ON b.court_id = c.id
    JOIN arenas a ON c.arena_id = a.id
    JOIN booking_status bs ON b.status_id = bs.id
    JOIN players p ON b.player_id = p.id
    WHERE b.player_id = ?
    ORDER BY b.booking_date DESC, b.start_time DESC
  `;
  
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      });
    }
    
    const formattedBookings = results.map(booking => ({
      bookingId: booking.bookingId,
      arenaName: booking.arenaName,
      courtNumber: booking.courtNumber,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      duration: Math.round(booking.duration),
      status: booking.status
    }));
    
    res.json({
      success: true,
      bookings: formattedBookings
    });
  });
});

// ===============================
// OWNER: Create New Arena
// ===============================
app.post('/arenas', (req, res) => {
  const { 
    owner_id, name, city, address, pricePerHour, 
    timing, amenities, description, rules 
  } = req.body;

  if (!owner_id || !name || !city || !pricePerHour) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO arenas 
    (owner_id, name, city, address, pricePerHour, availability, rating, timing, amenities, description, rules)
    VALUES (?, ?, ?, ?, ?, 'available', 0, ?, ?, ?, ?)
  `;

  // Convert arrays to JSON strings if they aren't already
  const amenitiesJson = JSON.stringify(amenities || []);
  const rulesJson = JSON.stringify(rules || []);

  db.query(
    query, 
    [owner_id, name, city, address, pricePerHour, timing, amenitiesJson, description, rulesJson], 
    (err, result) => {
      if (err) {
        console.error("Error creating arena:", err);
        return res.status(500).json({ error: "Database error" });
      }
      return res.status(201).json({ message: "Arena created successfully", id: result.insertId });
    }
  );
});

// ===============================
// OWNER: Get My Arenas
// ===============================
app.get('/owner/arenas', (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) return res.status(400).json({ error: "Owner ID required" });

  const query = `
    SELECT * FROM arenas WHERE owner_id = ? ORDER BY id DESC
  `;

  db.query(query, [ownerId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    // Parse JSON fields
    const arenas = results.map(arena => ({
      ...arena,
      amenities: typeof arena.amenities === 'string' ? JSON.parse(arena.amenities) : arena.amenities,
      rules: typeof arena.rules === 'string' ? JSON.parse(arena.rules) : arena.rules
    }));

    return res.json(arenas);
  });
});

// ===============================
// OWNER: Get My Bookings
// ===============================
app.get('/owner/bookings', (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) return res.status(400).json({ error: "Owner ID required" });

  const query = `
    SELECT 
      b.id AS bookingId,
      a.name AS arenaName,
      c.name AS courtName,
      p.name AS playerName,
      p.phone AS playerPhone,
      DATE(b.booking_date) AS bookingDate,
      b.start_time AS startTime,
      b.end_time AS endTime,
      bs.status_name AS status,
      (TIME_TO_SEC(TIMEDIFF(b.end_time, b.start_time)) / 3600) * a.pricePerHour AS revenue
    FROM bookings b
    JOIN courts c ON b.court_id = c.id
    JOIN arenas a ON c.arena_id = a.id
    JOIN players p ON b.player_id = p.id
    JOIN booking_status bs ON b.status_id = bs.id
    WHERE a.owner_id = ?
    ORDER BY b.booking_date DESC, b.start_time DESC
  `;

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error("Error fetching owner bookings:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json(results);
  });
});

// ===============================
// OWNER: Update Arena
// ===============================
app.put('/arenas/:id', (req, res) => {
  const arenaId = req.params.id;
  const { 
    name, city, address, pricePerHour, 
    timing, amenities, description, rules, availability 
  } = req.body;

  const query = `
    UPDATE arenas 
    SET name=?, city=?, address=?, pricePerHour=?, timing=?, amenities=?, description=?, rules=?, availability=?
    WHERE id=?
  `;

  const amenitiesJson = JSON.stringify(amenities || []);
  const rulesJson = JSON.stringify(rules || []);

  db.query(
    query, 
    [name, city, address, pricePerHour, timing, amenitiesJson, description, rulesJson, availability, arenaId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      return res.json({ message: "Arena updated successfully" });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);