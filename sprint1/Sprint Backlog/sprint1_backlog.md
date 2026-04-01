# Courtify — Sprint 1 Backlog

**Project:** Courtify – Sports Arena Booking Platform  
**Sprint:** 1  
**Duration:** March 17, 2026 – March 31, 2026  
**Sprint Goal:** Establish project infrastructure and deliver Email Verification on registration and login for two different users (player and owner), and Courts Listing (with category error correction).

---

## Team


| Zarrar -  **Scrum Master** |
| Shaheer  |
| Yousuf |
| Wasiq   |

---

## Story Points Summary

| Total Committed | Total Completed |
|----------------|----------------|
| 39 | 34 |

---

## Product Backlog Items

---

### PBI-01 — Project Setup and Infrastructure
**Priority:** High | **Points:** 5 | **Status:** Done

**User Story:**  
*As a developer, I want a working full-stack skeleton so that the team can build features on a shared foundation.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Initialize Vite + React frontend | Yousuf | Done |
| 2 | Initialize Express backend (ESM) | Zarrar | Done |
| 3 | Configure MySQL connection pool | Zarrar | Done |
| 4 | Set up .env and shared secrets | Shaheer | Done |
| 5 | Implement AuthContext (login/logout state) | Shaheer | Done |
| 6 | Build NavBar component | Wasiq | Done |
| 7 | Configure React Router and base routes | Yousuf | Done |
| 8 | Write initial SQL schema | Zarrar | Done |

---

### PBI-02 — User Registration
**Priority:** High | **Points:** 5 | **Status:** Done

**User Story:**  
*As a new user, I want to register an account (as a player or owner) so I can access the platform.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Build registration form UI | Wasiq | Done |
| 2 | Implement POST /auth/signup endpoint | Zarrar | Done |
| 3 | Add bcrypt password hashing | Zarrar | Done |
| 4 | Add email format and duplicate validation | Zarrar | Done |

---

### PBI-03 — Email Verification (Token-Based)
**Priority:** High | **Points:** 8 | **Status:** Done

**User Story:**  
*As a registered user, I want to verify my email so my account is activated.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Configure Nodemailer (Gmail SMTP) | Zarrar | Done |
| 2 | Implement GET /auth/verify endpoint | Zarrar | Done |
| 3 | Integrate email send on signup | Zarrar | Done |
| 4 | Show post-signup "check your email" message | Yousuf | Done |
| 5 | Handle ?verified=1 redirect on Dashboard | Yousuf | Done |
| 6 | Block login for unverified accounts | Shaheer | Done |

---

### PBI-04 — User Login
**Priority:** High | **Points:** 3 | **Status:** Done

**User Story:**  
*As a verified user, I want to log in so I can access my dashboard.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Build login form with Player/Owner toggle | Wasiq | Done |
| 2 | Implement GET /auth/validate endpoint | Zarrar | Done |
| 3 | Persist session in AuthContext | Shaheer | Done |
| 4 | Redirect owners to /owner/dashboard | Shaheer | Done |

---

### PBI-05 — Courts and Arena Listing (Error Correction)
**Priority:** High | **Points:** 8 | **Status:** Done

**User Story:**  
*As a player, I want to browse arenas and see only the correct sport types they actually offer.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Implement GET /arenas with thumbnail | Zarrar | Done |
| 2 | Implement GET /arena/:id with grouped courts | Zarrar | Done |
| 3 | Seed correct court_types (Padel, Tennis, Badminton, Futsal) | Zarrar | Done |
| 4 | Build VenueCard component | Wasiq | Done |
| 5 | Build venue detail page | Yousuf | Done |
| 6 | Fix sport-type mismatch bug (e.g. Swimming Pool showing) | Shaheer | Done |
| 7 | Verify correct types display across all arenas | Shaheer | Done |

---

### PBI-06 — Search / Filter
**Priority:** Medium | **Points:** 5 | **Status:** Partial

**User Story:**  
*As a player, I want to search arenas by name or city.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Build SearchBar with real-time name/city filter | Wasiq | Done |
| 2 | Sport-type filter chips | Yousuf | Deferred |
| 3 | Price range filter | Yousuf | Deferred |

---

### PBI-07 — Owner Facility Registration
**Priority:** Medium | **Points:** 5 | **Status:** Done

**User Story:**  
*As an owner, I want to register my arena so it appears in the public listing.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Implement POST /arenas endpoint | Zarrar | Done |
| 2 | Build facility registration form | Wasiq | Done |
| 3 | Guard route to owners only | Shaheer | Done |

---

## Sprint Summary

| PBI | Feature | Points | Status |
|-----|---------|--------|--------|
| PBI-01 | Project Setup | 5 | Done |
| PBI-02 | User Registration | 5 | Done |
| PBI-03 | Email Verification | 8 | Done |
| PBI-04 | User Login | 3 | Done |
| PBI-05 | Courts Listing | 8 | Done |
| PBI-06 | Search / Filter | 5 | Partial |
| PBI-07 | Owner Registration | 5 | Done |
| **Total** | | **39** | 6 Done, 1 Partial |

---

## Carry-over to Sprint 2
- Sport-type and price filters
- OTP code-based verification (replace link-based)
- Forgot Password flow
- Admin panel (abuse reports)
- Court owner ads placement
