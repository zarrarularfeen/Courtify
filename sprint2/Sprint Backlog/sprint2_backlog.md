# Courtify — Sprint 2 Backlog

**Project:** Courtify – Sports Arena Booking Platform  
**Sprint:** 2  
**Duration:** April 8, 2026 – April 26, 2026  
**Sprint Goal:** Deliver OTP-based email verification, forgot password flow, court booking for players, a working search filter, admin panel for user management, and clean up the courts listing display.

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
| 40 | 40 |

---

## Product Backlog Items

---

### PBI-01 — OTP-Based Email Verification
**Priority:** High | **Points:** 8 | **Status:** Done

**User Story:**  
*As a registered user, I want to verify my email using a code sent to my inbox so that my account gets activated.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Generate a 6-digit code and send it by email on signup | Zarrar | Done |
| 2 | Build the OTP entry screen | Wasiq | Done |
| 3 | Check if the code entered matches what was sent | Zarrar | Done |
| 4 | Show error if the code is wrong or expired | Yousuf | Done |
| 5 | Activate account when code is correct | Zarrar | Done |
| 6 | Block login until OTP is verified | Shaheer | Done |

---

### PBI-02 — Forgot Password
**Priority:** High | **Points:** 6 | **Status:** Done

**User Story:**  
*As a user who forgot their password, I want to reset it using my email so I can get back into my account.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Add a "Forgot Password" link on the login page | Wasiq | Done |
| 2 | Build the page where user enters their email | Wasiq | Done |
| 3 | Send a reset code to the user's email | Zarrar | Done |
| 4 | Build the page where user enters new password | Wasiq | Done |
| 5 | Save the new password once confirmed | Zarrar | Done |
| 6 | Show success message after password is reset | Yousuf | Done |

---

### PBI-03 — Court Booking for Players
**Priority:** High | **Points:** 8 | **Status:** Done

**User Story:**  
*As a player, I want to book a court at an arena so I can reserve time to play.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Add a "Book" button on the court detail page | Wasiq | Done |
| 2 | Build the booking form (date, time, court) | Wasiq | Done |
| 3 | Save the booking to the database | Zarrar | Done |
| 4 | Show the player their upcoming bookings | Yousuf | Done |
| 5 | Make sure double-bookings are not allowed | Zarrar | Done |
| 6 | Confirm booking with a success message | Yousuf | Done |

---

### PBI-04 — Search and Filter (Complete)
**Priority:** High | **Points:** 6 | **Status:** Done

**User Story:**  
*As a player, I want to filter arenas by sport type and price so I can find what I need faster.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Add sport type filter buttons | Yousuf | Done |
| 2 | Add price range filter | Yousuf | Done |
| 3 | Make filters and search bar work together | Shaheer | Done |
| 4 | Show a message when no results are found | Wasiq | Done |

---

### PBI-05 — Admin Panel
**Priority:** Medium | **Points:** 8 | **Status:** Done

**User Story:**  
*As an admin, I want to manage users so I can keep the platform safe by banning or unbanning players and owners.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Create admin account and login separately | Zarrar | Done |
| 2 | Build the admin dashboard page | Wasiq | Done |
| 3 | Show a list of all players and owners | Yousuf | Done |
| 4 | Add ban button for each user | Shaheer | Done |
| 5 | Add unban button for banned users | Shaheer | Done |
| 6 | Block banned users from logging in | Zarrar | Done |

---

### PBI-06 — Courts Listing Cleanup
**Priority:** Medium | **Points:** 4 | **Status:** Done

**User Story:**  
*As a player, I want to see only real available courts without any featured or promoted entries cluttering the list.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Remove featured courts section from player listing | Shaheer | Done |
| 2 | Make sure only actual courts show up | Zarrar | Done |
| 3 | Check that the listing looks clean after removal | Yousuf | Done |

---

## Sprint Summary

| PBI | Feature | Points | Status |
|-----|---------|--------|--------|
| PBI-01 | OTP Email Verification | 8 | Done |
| PBI-02 | Forgot Password | 6 | Done |
| PBI-03 | Court Booking | 8 | Done |
| PBI-04 | Search and Filter | 6 | Done |
| PBI-05 | Admin Panel | 8 | Done |
| PBI-06 | Courts Listing Cleanup | 4 | Done |
| **Total** | | **40** | All Done |

---

## Carry-over from Sprint 1
- OTP code-based verification (replaces link-based) ← now PBI-01
- Forgot Password flow ← now PBI-02
- Sport and price filters ← now PBI-04
