/**
 * seed_test_users.js
 * Seeds the 3 test users required by the Postman "Courtify Sprint 1 Tests" collection.
 *
 * Run once before executing the test suite:
 *   node seed_test_users.js
 */

import bcrypt from 'bcrypt';
import db from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const PASSWORD = 'Pass@1234';

async function seed() {
  console.log('🌱 Seeding test users...\n');
  const hash = await bcrypt.hash(PASSWORD, 10);

  // ── 1. Verified player ───────────────────────────────────────────────────
  await new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO players (email, password_hash, name, phone, is_active, verification_token)
       VALUES (?, ?, ?, ?, 1, NULL)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1, verification_token = NULL`,
      ['player@test.com', hash, 'Test Player', '03001234567'],
      (err, result) => {
        if (err) return reject(err);
        console.log('✅ player@test.com — verified player seeded (rows affected:', result.affectedRows, ')');
        resolve();
      }
    );
  });

  // ── 2. Unverified player ─────────────────────────────────────────────────
  await new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO players (email, password_hash, name, phone, is_active, verification_token)
       VALUES (?, ?, ?, ?, 0, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 0, verification_token = VALUES(verification_token)`,
      ['unverified@example.com', hash, 'Unverified Player', '03000000000', 'valid_token_here'],
      (err, result) => {
        if (err) return reject(err);
        console.log('✅ unverified@example.com — unverified player seeded (rows affected:', result.affectedRows, ')');
        resolve();
      }
    );
  });

  // ── 3. Verified owner ────────────────────────────────────────────────────
  await new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO arena_owners (name, email, phone, password_hash, is_active, verification_token)
       VALUES (?, ?, ?, ?, 1, NULL)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1, verification_token = NULL`,
      ['Test Owner', 'owner@test.com', '03001234569', hash],
      (err, result) => {
        if (err) return reject(err);
        console.log('✅ owner@test.com — verified owner seeded (rows affected:', result.affectedRows, ')');
        resolve();
      }
    );
  });

      // 4. Unverified Owner
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO arena_owners (name, email, phone, password_hash, is_active, verification_token)
           VALUES (?, ?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 0, verification_token = VALUES(verification_token)`,
          ['Unverified Owner', 'unverifiedowner@example.com', '03001234560', hash, '{{verification_token}}'],
          (err, result) => {
            if (err) return reject(err);
            console.log('✅ unverifiedowner@example.com — unverified owner seeded (rows affected:', result.affectedRows, ')');
            resolve();
          }
        );
      });

      // 2b. Unverified Player (Dedicated for TC-LOG-006 login test)
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO players (email, password_hash, name, phone, is_active, verification_token)
           VALUES (?, ?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 0, verification_token = VALUES(verification_token)`,
          ['unverified_login@example.com', hash, 'Unverified Login Player', '03000000001', 'testing_unverified_login'],
          (err, result) => {
            if (err) return reject(err);
            console.log('✅ unverified_login@example.com — dedicated unverified player seeded (rows affected:', result.affectedRows, ')');
            resolve();
          }
        );
      });
      // 4a. Unverified Owner (for literal postman token valid_token_here_owner)
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO arena_owners (name, email, phone, password_hash, is_active, verification_token)
           VALUES (?, ?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 0, verification_token = VALUES(verification_token)`,
          ['Unverified Owner Static Token', 'unverifiedowner_static@example.com', '03001234563', hash, 'valid_token_here_owner'],
          (err, result) => {
            if (err) return reject(err);
            console.log('✅ unverifiedowner_static@example.com — static token unverified owner seeded (rows affected:', result.affectedRows, ')');
            resolve();
          }
        );
      });

      // 2c. Unverified Player (Dedicated for TC-VER-001 template test)
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO players (email, password_hash, name, phone, is_active, verification_token)
           VALUES (?, ?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 0, verification_token = VALUES(verification_token)`,
          ['unverified_template@example.com', hash, 'Template Player', '03000000002', 'valid_template_token_player'],
          (err, result) => {
            if (err) return reject(err);
            console.log('✅ unverified_template@example.com — template unverified player seeded (rows affected:', result.affectedRows, ')');
            resolve();
          }
        );
      });

      // 4b. Unverified Owner (Dedicated for TC-VER-002 template test)
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO arena_owners (name, email, phone, password_hash, is_active, verification_token)
           VALUES (?, ?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 0, verification_token = VALUES(verification_token)`,
          ['Template Owner', 'unverifiedowner_template@example.com', '03001234564', hash, 'valid_template_token_owner'],
          (err, result) => {
            if (err) return reject(err);
            console.log('✅ unverifiedowner_template@example.com — template token unverified owner seeded (rows affected:', result.affectedRows, ')');
            resolve();
          }
        );
      });
      console.log('\n🎉 All test users seeded! You can now run the Postman collection.');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
});
