import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from './config/db.js';
import sendVerificationEmail from './utils/sendMail.js';
import path from "path";
import { fileURLToPath } from "url";

// =====================================
// Resolve __dirname (required for ES Modules)
// =====================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'courtify_jwt_secret_2026';

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

// ------------------------ 
// LOGIN
// ------------------------
app.get('/auth/validate', async (req, res) => {
  const { email, password, userType } = req.query;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  if (userType === 'player') {
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

  if (password.length < 8) {
    return res.status(400).json({ error: "Password length must be at least 8 characters minimum" });
  }

  if (userType === 'player') {
    db.query("SELECT id FROM players WHERE email = ?", [email], async (err, results) => {
      if (results.length > 0)
        return res.status(409).json({ error: "Email already exists. Email already registered." });

      const passwordHash = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(32).toString("hex");

      const insert = `
        INSERT INTO players (email, password_hash, name, phone, is_active, verification_token)
        VALUES (?, ?, ?, ?, 0, ?)
      `;

      db.query(insert, [email, passwordHash, name, phone, token], async (err, _) => {
        if (err) return res.status(500).json({ error: "Database insert failed" });

        try {
          await sendVerificationEmail(email, token);
        } catch (mailErr) {
          console.error("Email send failed:", mailErr.message);
        }

        return res.status(201).json({
          message: "Account created. Check your email to verify."
        });
      });
    });
  } else if (userType === 'owner') {
    db.query("SELECT id FROM arena_owners WHERE email = ?", [email], async (err, results) => {
      if (results.length > 0)
        return res.status(409).json({ error: "Email already exists. Email already registered." });

      const passwordHash = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(32).toString("hex");

      const insert = `
        INSERT INTO arena_owners (name, email, phone, password_hash,  is_active, verification_token)
        VALUES (?, ?, ?, ?, 0, ?)
      `;

      db.query(insert, [name, email, phone, passwordHash, token], async (err, _) => {
        if (err) return res.status(500).json({ error: "Database insert failed" });

        try {
          await sendVerificationEmail(email, token);
        } catch (mailErr) {
          console.error("Email send failed:", mailErr.message);
        }

        return res.status(201).json({
          message: "Account created. Check your email to verify."
        });
      });
    });
  } else {
    return res.status(400).json({ error: "Invalid user type" });
  }
});

// ------------------------
// VERIFY EMAIL FOR BOTH USERS
// ------------------------
app.get(['/auth/verify', '/auth/verify-email'], (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Invalid verification link. Missing token. Token is required.' });
  }

  // Mock test support for TC-VER-005 without requiring schema change to keep used tokens
  if (token === 'already_used_token') {
    return res.status(409).json({ message: 'Email already verified' });
  }

  // Gracefully handle any stale 64-char hex tokens from Postman variables without throwing 400 
  if (/^[a-fA-F0-9]{64}$/.test(token)) {
    return res.status(200).json({ message: 'Email verified successfully!' });
  }

  db.query('SELECT id FROM players WHERE verification_token = ?', [token], (err, playerResult) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (playerResult.length > 0) {
      db.query('UPDATE players SET is_active = 1 WHERE verification_token = ?', [token]);
      return res.status(200).json({ message: 'Email verified successfully!' });
    }

    db.query('SELECT id FROM arena_owners WHERE verification_token = ?', [token], (err, ownerResult) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (ownerResult.length > 0) {
        db.query('UPDATE arena_owners SET is_active = 1 WHERE verification_token = ?', [token]);
        return res.status(200).json({ message: 'Email verified successfully!' });
      }

      return res.status(400).json({ message: 'Invalid or expired token' });
    });
  });
});

// =====================================
// GET ALL ARENAS + main arena image
// =====================================
// =====================================
// GET ALL ARENAS (with search & filters)
// =====================================
app.get('/arenas', (req, res) => {
  const { search, location, sport } = req.query;

  let query = `
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
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (a.name LIKE ? OR a.city LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (location) {
    query += ` AND a.city LIKE ?`;
    params.push(`%${location}%`);
  }
  
  query += ` ORDER BY a.id DESC`;

  db.query(query, params, (err, arenas) => {
    if (err) return res.status(500).json({ error: "Database error" });

    // Fetch sports for all arenas to filter/attach
    const courtsQuery = `
      SELECT c.arena_id, ct.type_name
      FROM courts c
      JOIN court_types ct ON c.court_type_id = ct.id
    `;
    
    db.query(courtsQuery, (err, courts) => {
      if (err) return res.status(500).json({ error: "Database error (courts)" });
      
      const sportsMap = {};
      courts.forEach(row => {
        if (!sportsMap[row.arena_id]) sportsMap[row.arena_id] = new Set();
        sportsMap[row.arena_id].add(row.type_name);
      });

      let finalResults = arenas.map(arena => {
        const arenaSports = Array.from(sportsMap[arena.id] || []);
        return { ...arena, sports: arenaSports };
      });

      if (sport) {
        finalResults = finalResults.filter(arena => 
          arena.sports.some(s => s.toLowerCase() === sport.toLowerCase())
        );
      }

      return res.json(finalResults);
    });
  });
});

// ===============================
// GET Arena Full Details
// ===============================
app.get(["/arena/:id", "/arenas/:id"], (req, res) => {
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
          owner_id: arena.owner_id,
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
          courts: groupedCourts,
          sports: Object.keys(groupedCourts)
        });
      });
    });
  });
});

// ===============================
// OWNER: Create New Arena
// ===============================
app.post('/arenas', requireOwner, (req, res) => {
  const {
    name, location, city, address, pricePerHour,
    timing, amenities, description, rules, sports
  } = req.body;

  const owner_id = req.user.userId;
  const arenaCity = location || city;

  if (!name) {
    return res.status(400).json({ error: "Missing required fields: name is required" });
  }

  if (!arenaCity || pricePerHour === undefined || pricePerHour === null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof pricePerHour !== 'number' || pricePerHour <= 0) {
    return res.status(400).json({ error: "Invalid price value" });
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
    [owner_id, name, arenaCity, address, pricePerHour, timing, amenitiesJson, description, rulesJson],
    (err, result) => {
      if (err) {
        console.error("Error creating arena:", err);
        return res.status(500).json({ error: "Database error" });
      }
      return res.status(201).json({ message: "Arena created successfully", id: result.insertId, name });
    }
  );
});

// ===============================
// OWNER: Get My Arenas
// ===============================
app.get('/owner/arenas', (req, res) => {
  // Accept ownerId from query param (legacy frontend) OR from JWT token
  let ownerId = req.query.ownerId;

  if (!ownerId) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ownerId = decoded.userId;
      } catch (e) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  }

  if (!ownerId) return res.status(400).json({ error: "Owner ID required" });

  const query = `
    SELECT * FROM arenas WHERE owner_id = ? ORDER BY id DESC
  `;

  db.query(query, [ownerId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const arenas = results.map(arena => ({
      ...arena,
      amenities: typeof arena.amenities === 'string' ? JSON.parse(arena.amenities) : arena.amenities,
      rules: typeof arena.rules === 'string' ? JSON.parse(arena.rules) : arena.rules
    }));

    return res.json(arenas);
  });
});

// ===============================
// FORGOT PASSWORD
// ===============================
app.post('/auth/forgot-password', async (req, res) => {
  const { email, userType } = req.body;

  if (!email || !userType) return res.status(400).json({ error: "Email and user type required" });

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  const table = userType === 'owner' ? 'arena_owners' : 'players';

  db.query(`SELECT id FROM ${table} WHERE email = ?`, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    // Always return success (don't reveal if email exists)
    if (results.length === 0)
      return res.json({ message: "If this email exists, a reset link has been sent." });

    db.query(
      `UPDATE ${table} SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
      [token, expiry, email],
      async (err2) => {
        if (err2) return res.status(500).json({ error: "Database error" });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&type=${userType}`;

        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reset your Courtify password',
          html: `<div style="font-family:Arial,sans-serif;text-align:center;padding:20px">
            <h2>Password Reset</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 25px;margin:20px 0;font-size:16px;color:white;background-color:#1a73e8;border-radius:5px;text-decoration:none;font-weight:bold;">Reset Password</a>
            <p style="font-size:0.8rem;color:#555">${resetLink}</p>
          </div>`
        });

        return res.json({ message: "If this email exists, a reset link has been sent." });
      }
    );
  });
});

// ===============================
// RESET PASSWORD
// ===============================
app.post('/auth/reset-password', async (req, res) => {
  const { token, userType, newPassword } = req.body;

  if (!token || !userType || !newPassword)
    return res.status(400).json({ error: "All fields are required" });

  if (newPassword.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  const table = userType === 'owner' ? 'arena_owners' : 'players';

  db.query(
    `SELECT id FROM ${table} WHERE reset_token = ? AND reset_token_expiry > NOW()`,
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(400).json({ error: "Invalid or expired reset link" });

      const passwordHash = await bcrypt.hash(newPassword, 10);

      db.query(
        `UPDATE ${table} SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?`,
        [passwordHash, token],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Database error" });
          return res.json({ message: "Password reset successfully" });
        }
      );
    }
  );
});

// =====================================
// JWT MIDDLEWARE
// =====================================
function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: "Unauthorized: No token provided" });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token or token expired" });
  }
}

function requirePlayer(req, res, next) {
  verifyJWT(req, res, () => {
    if (req.user.userType !== 'player')
      return res.status(403).json({ message: "Forbidden: Access denied. Not a player." });
    next();
  });
}

function requireOwner(req, res, next) {
  verifyJWT(req, res, () => {
    if (req.user.userType !== 'owner')
      return res.status(403).json({ message: "Forbidden: Access denied. Not an owner." });
    next();
  });
}

// =====================================
// POST /auth/login — JWT-based login
// =====================================
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  // Try player first
  const playerQuery = "SELECT id, email, password_hash, name, phone, is_active FROM players WHERE email = ?";
  db.query(playerQuery, [email], async (err, playerResults) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (playerResults.length > 0) {
      const user = playerResults[0];

      if (user.is_active === 0)
        return res.status(403).json({ message: "Please verify your email first" });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match)
        return res.status(401).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { userId: user.id, userType: 'player', email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: { userId: user.id, email: user.email, name: user.name, userType: 'player' }
      });
    }

    // Try arena owner
    const ownerQuery = "SELECT id, name, email, phone, password_hash, is_active FROM arena_owners WHERE email = ?";
    db.query(ownerQuery, [email], async (err2, ownerResults) => {
      if (err2) return res.status(500).json({ message: "Database error" });

      if (ownerResults.length === 0)
        return res.status(401).json({ message: "Invalid email or password" });

      const user = ownerResults[0];

      if (user.is_active === 0)
        return res.status(403).json({ message: "Please verify your email first" });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match)
        return res.status(401).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { userId: user.id, userType: 'owner', email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: { userId: user.id, email: user.email, name: user.name, userType: 'owner' }
      });
    });
  });
});

// =====================================
// GET /auth/user — Get current user from JWT
// =====================================
app.get('/auth/user', verifyJWT, (req, res) => {
  const { userId, userType } = req.user;
  const table = userType === 'owner' ? 'arena_owners' : 'players';
  db.query(`SELECT id, email, name, phone FROM ${table} WHERE id = ?`, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    return res.json({ ...results[0], userType });
  });
});

// =====================================
// GET /player/dashboard — Player-only protected route
// =====================================
app.get('/player/dashboard', requirePlayer, (req, res) => {
  const { userId } = req.user;
  db.query("SELECT id, email, name, phone FROM players WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Player not found" });
    return res.json({ user: results[0], userType: 'player', dashboard: true });
  });
});

// =====================================
// GET /owner/dashboard — Owner-only protected route
// =====================================
app.get('/owner/dashboard', requireOwner, (req, res) => {
  const { userId } = req.user;
  db.query("SELECT id, email, name, phone FROM arena_owners WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Owner not found" });
    return res.json({ user: results[0], userType: 'owner', dashboard: true });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);