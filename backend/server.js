import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
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

  if (userType === 'player') {
    db.query("SELECT id FROM players WHERE email = ?", [email], async (err, results) => {
      if (results.length > 0)
        return res.status(409).json({ error: "Email already registered" });

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
        return res.status(409).json({ error: "Email already registered" });

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
app.get('/auth/verify', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Invalid verification link');
  }

  // Query 1: Check in players
  const verifyPlayer = `
    UPDATE players 
    SET is_active = 1, verification_token = NULL 
    WHERE verification_token = ?
  `;

  // Query 2: Check in arena_owners
  const verifyOwner = `
    UPDATE arena_owners 
    SET is_active = 1, verification_token = NULL 
    WHERE verification_token = ?
  `;

  // Try verifying as a player first
  db.query(verifyPlayer, [token], (err, playerResult) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Server error');
    }

    if (playerResult.affectedRows > 0) {
      // Player verified successfully
      return res.redirect(`${process.env.FRONTEND_URL}/?verified=1&type=player`);
    }

    // If no player was verified, try arena owner
    db.query(verifyOwner, [token], (err, ownerResult) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Server error');
      }

      if (ownerResult.affectedRows > 0) {
        // Owner verified successfully
        return res.redirect(`${process.env.FRONTEND_URL}/?verified=1&type=owner`);
      }

      // If token matches neither table
      return res.status(400).send('Invalid or expired token');
    });
  });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);