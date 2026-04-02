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
| 1 | Set up the frontend project | Yousuf | Done |
| 2 | Set up the backend server | Zarrar | Done |
| 3 | Connect the database | Zarrar | Done |
| 4 | Set up project settings | Shaheer | Done |
| 5 | Create login and logout state | Shaheer | Done |
| 6 | Create the navigation bar | Wasiq | Done |
| 7 | Create basic pages and routing | Yousuf | Done |
| 8 | Write initial database tables | Zarrar | Done |

---

### PBI-02 — User Registration
**Priority:** High | **Points:** 5 | **Status:** Done

**User Story:**  
*As a new user, I want to register an account (as a player or owner) so I can access the platform.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Build registration form UI | Wasiq | Done |
| 2 | Create the user registration system | Zarrar | Done |
| 3 | Make sure passwords are secure | Zarrar | Done |
| 4 | Check if email format is correct | Zarrar | Done |

---

### PBI-03 — Email Verification (Token-Based)
**Priority:** High | **Points:** 8 | **Status:** Done

**User Story:**  
*As a registered user, I want to verify my email so my account is activated.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Set up email sending | Zarrar | Done |
| 2 | Create email verification system | Zarrar | Done |
| 3 | Send email when user registers | Zarrar | Done |
| 4 | Show post-signup "check your email" message | Yousuf | Done |
| 5 | Show verification success message | Yousuf | Done |
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
| 2 | Create user login system | Zarrar | Done |
| 3 | Keep user logged in | Shaheer | Done |
| 4 | Redirect owners to dashboard | Shaheer | Done |

---

### PBI-05 — Courts and Arena Listing (Error Correction)
**Priority:** High | **Points:** 8 | **Status:** Done

**User Story:**  
*As a player, I want to browse arenas and see only the correct sport types they actually offer.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Show arenas list | Zarrar | Done |
| 2 | Show arena details | Zarrar | Done |
| 3 | Add testing data for arenas | Zarrar | Done |
| 4 | Create arena display card | Wasiq | Done |
| 5 | Build venue detail page | Yousuf | Done |
| 6 | Fix bug with wrong sports showing | Shaheer | Done |
| 7 | Verify correct types display across all arenas | Shaheer | Done |

---

### PBI-06 — Search / Filter
**Priority:** Medium | **Points:** 5 | **Status:** Partial

**User Story:**  
*As a player, I want to search arenas by name or city.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Build search real-time filter | Wasiq | Done |
| 2 | Sport filter options | Yousuf | Deferred |
| 3 | Price range filter | Yousuf | Deferred |

---

### PBI-07 — Owner Facility Registration
**Priority:** Medium | **Points:** 5 | **Status:** Done

**User Story:**  
*As an owner, I want to register my arena so it appears in the public listing.*

**Tasks:**

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Create system to add new arenas | Zarrar | Done |
| 2 | Build facility registration form | Wasiq | Done |
| 3 | Make sure only owners can add arenas | Shaheer | Done |

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
- Sport and price filters
- OTP code-based verification
- Forgot Password flow
- Admin panel (abuse reports)
- Court owner ads placement
