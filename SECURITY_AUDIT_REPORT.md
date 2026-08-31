# Security Audit Report

**Target:** NAAZ E-Commerce Full-Stack Platform (Medusa v2 Backend + Next.js Solace UI Storefront)  
**Date:** September 1, 2026  
**Auditor:** Senior Application Security & DevSecOps Engineering Team  
**Scope:** Complete Codebase (Frontend, Backend, Database, APIs, Auth, CI/CD, Dependencies)

---

## Executive Summary

A comprehensive application security audit and vulnerability assessment was conducted across the entire NAAZ e-commerce repository. The audit evaluated frontend and backend implementations, authentication, authorization, session management, database queries, API surface, business logic, sensitive data exposure, dependencies, and configuration.

The audit revealed several critical and high-severity security vulnerabilities originating from "vibe-coded" development artifacts and helper routes left in the codebase without authentication guards. Specifically:
- Public unauthenticated endpoints capable of catalog destruction (`/delete-products`), arbitrary product injection (`/import`), category wipe (`/setup-categories`), and environment reconfiguration (`/setup`).
- Unauthenticated order modification (`POST /tracking`) allowing arbitrary fulfillment status and tracking manipulation.
- IDOR and PII data harvesting vulnerability (`GET /tracking`) allowing enumeration of customer names, phone numbers, and physical home addresses.
- Hardcoded fallback JWT/cookie secrets in backend configuration.
- Client-side logic bugs in address handling and potential open redirect in region updates.

Remediation actions have been designed to harden all endpoints, enforce authentication and strict PII access controls, sanitize open redirects, add security headers, and eliminate hardcoded fallbacks.

---

## Application Architecture

- **Frontend:** Next.js 14+ (App Router, React 18, TypeScript, TailwindCSS, Solace UI) running on port `3001`.
- **Backend:** Medusa v2 Headless Commerce Engine (Node.js/TypeScript, MikroORM/Drizzle, Awilix DI container) running on port `9000`.
- **Database:** PostgreSQL 16 (Port `5432`, Database: `medusa_naaz`).
- **Authentication:** Medusa JWT token stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies (`_medusa_jwt`).
- **Authorization Model:** Admin Dashboard RBAC vs. Storefront Customer session.
- **Payment & Fulfillment:** Cash on Delivery (COD) in PKR (`Rs.`), Courier tracking automation (TCS, Leopards, Trax).

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Storefront                      │
│            (Port 3001 / App Router / Server Actions)        │
└──────────────┬───────────────────────────────┬──────────────┘
               │ (x-publishable-api-key)       │ (Internal fetch)
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Medusa v2 API Backend                     │
│                        (Port 9000)                          │
│   ├── /store/* (Public Catalog & Cart)                      │
│   ├── /admin/* (Admin Protected Endpoints)                  │
│   └── Custom Routes (/tracking, /setup, /import, etc.)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL 16 Database                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Attack Surface

1. **Public Store API (`/store/*`):** Product browsing, cart management, checkout completion.
2. **Admin API (`/admin/*`):** Product management, order fulfillment, customer management.
3. **Custom Backend Routes:** `/tracking`, `/import`, `/delete-products`, `/setup`, `/setup-categories`.
4. **Next.js Server Actions:** User registration, login, address creation/updating, promotion forms, region updates.
5. **Static File Server:** `scripts/serve-public.cjs` (Port 8000).

---

## Critical Findings

### [CRITICAL] SEC-001 — Unauthenticated Administrative & Catalog Manipulation Endpoints

- **Severity:** CRITICAL
- **Confidence:** HIGH
- **Category:** Broken Access Control / Dangerous Development Leftovers
- **Affected Files:**
  - `backend/medusa-app/apps/backend/src/api/delete-products/route.ts`
  - `backend/medusa-app/apps/backend/src/api/import/route.ts`
  - `backend/medusa-app/apps/backend/src/api/store/import-products/route.ts`
  - `backend/medusa-app/apps/backend/src/api/setup-categories/route.ts`
  - `backend/medusa-app/apps/backend/src/api/setup/route.ts`
- **Affected Endpoints:** `POST /delete-products`, `POST /import`, `POST /store/import-products`, `POST /setup-categories`, `GET /setup`
- **Description:**  
  Several utility routes created for seed/import during development are exposed at the top-level API without any authentication, authorization, or API key verification.
- **Attack Scenario:**  
  An unauthenticated remote attacker sends a simple HTTP POST request to `http://<target>:9000/delete-products` with `{"ids": ["prod_..."]}` or to `/setup-categories` to delete all store categories, instantly taking down the store's entire catalog. Additionally, an attacker can flood `/import` with fake products and zero-priced items.
- **Security Impact:** Complete loss of product catalog integrity, business disruption, unauthorized database modification.
- **Evidence:**  
  `deleteProductsWorkflow(container).run({ input: { ids } })` is executed directly on incoming request without checking `req.user` or auth headers.
- **Root Cause:** Development helper routes left active in production routing structure.
- **Exploitability:** Trivial (1 single curl command).
- **Recommended Fix:**  
  Remove or disable these routes from public endpoints, or move them strictly under `/admin/*` protected by Medusa's admin authentication middleware with an environment variable safeguard (`ENABLE_DEV_SETUP=false`).
- **Priority:** P0 (Immediate)
- **Regression Test Required:** Verify that unauthenticated requests receive `401 Unauthorized` or `404 Not Found`.

---

## High Findings

### [HIGH] SEC-002 — Unauthenticated Order Modification & Status Override via Tracking API

- **Severity:** HIGH
- **Confidence:** HIGH
- **Category:** Broken Access Control / Privilege Escalation
- **Affected File:** `backend/medusa-app/apps/backend/src/api/tracking/route.ts`
- **Affected Endpoint:** `POST /tracking`
- **Lines:** 89–141
- **Description:**  
  The `POST /tracking` endpoint accepts an arbitrary `order_id` and tracking metadata, executing a direct SQL statement updating the order's metadata and changing its status to `fulfilled` without verifying whether the caller is an authenticated administrator.
- **Attack Scenario:**  
  An attacker or malicious customer sends `POST /tracking` with `{"order_id": "1", "courier": "TCS", "tracking_number": "FAKE123"}` to mark unfulfilled orders as fulfilled and inject fraudulent tracking links.
- **Security Impact:** Unauthorized state modification, fulfillment tampering, customer fraud.
- **Evidence:**  
  Direct execution of `UPDATE "order" SET status = 'fulfilled' ... WHERE id = $2` without token/session inspection.
- **Root Cause:** Missing authentication guard on the POST handler.
- **Exploitability:** Trivial.
- **Recommended Fix:**  
  Protect `POST /tracking` with Medusa admin authentication or restrict execution to authorized internal services / admin API keys.
- **Priority:** P0
- **Regression Test Required:** Verify unauthenticated POST returns `401 Unauthorized`.

---

### [HIGH] SEC-003 — IDOR & Customer PII Exposure via Tracking Query

- **Severity:** HIGH
- **Confidence:** HIGH
- **Category:** Sensitive Data Exposure / IDOR / BOLA
- **Affected File:** `backend/medusa-app/apps/backend/src/api/tracking/route.ts`
- **Affected Endpoint:** `GET /tracking?q=<query>`
- **Lines:** 14–87
- **Description:**  
  The `GET /tracking` endpoint queries all orders and performs fuzzy matching against `display_id`, `email`, `phone`, or `id`. If an attacker requests `?q=1`, `?q=2`, etc., the endpoint returns the customer's full real name, complete home street address, city, phone number, email, and exact purchased items.
- **Attack Scenario:**  
  An attacker writes a 10-line script iterating `q=1..10000` to harvest a complete database of Pakistani e-commerce customer names, phone numbers, and physical home addresses.
- **Security Impact:** Massive PII data leakage, privacy violation, regulatory non-compliance.
- **Evidence:**  
  Returning unmasked `customer_name`, `address`, `phone`, `email` upon providing only a sequential integer `display_id`.
- **Root Cause:** Failure to require dual-factor verification (Order ID + exact Customer Phone or Email) and lack of PII masking (masking phone `0304****611` and address `Milat Town, Faisalabad`).
- **Exploitability:** High.
- **Recommended Fix:**  
  1. Require both `order_id` AND the matching customer `phone` or `email` to verify ownership.
  2. Mask sensitive PII in the tracking response (e.g. `M******* J****`, `+92304****611`, `Milat Town, Faisalabad`).
  3. Implement rate limiting on lookup queries.
- **Priority:** P0
- **Regression Test Required:** Verify single integer query without phone/email confirmation is rejected or masked.

---

### [HIGH] SEC-004 — Hardcoded Fallback JWT and Cookie Secrets in Backend Config

- **Severity:** HIGH
- **Confidence:** HIGH
- **Category:** Cryptographic Failure / Insecure Defaults
- **Affected Files:**
  - `backend/medusa-app/apps/backend/medusa-config.ts`
  - `backend/medusa-app/apps/backend/.env`
- **Lines:** `medusa-config.ts: 12-13`
- **Description:**  
  `medusa-config.ts` contains hardcoded fallback strings `"supersecret_naaz_jwt_token_key_2026"` and `"supersecret_naaz_cookie_token_key_2026"`. If environment variables are omitted or misconfigured during deployment, the application silently boots using public static secrets.
- **Attack Scenario:**  
  An attacker reads the hardcoded secret from the open-source or decompiled bundle and signs arbitrary JWT tokens, impersonating any administrator or customer.
- **Security Impact:** Complete authentication bypass and account takeover.
- **Root Cause:** Using predictable static fallback strings instead of throwing on missing secrets in production.
- **Recommended Fix:**  
  Enforce strict validation that `JWT_SECRET` and `COOKIE_SECRET` are provided in production and throw a fatal startup error if missing.
- **Priority:** P1

---

## Medium Findings

### [MEDIUM] SEC-005 — Overly Permissive CORS Configuration & Third-Party Origin Whitelist

- **Severity:** MEDIUM
- **Confidence:** HIGH
- **Category:** Security Misconfiguration / CORS
- **Affected Files:**
  - `backend/medusa-app/apps/backend/medusa-config.ts`
  - `backend/medusa-app/apps/backend/.env`
- **Description:**  
  `medusa-config.ts` uses `process.env.STORE_CORS || "*"` which defaults to wildcard CORS. Furthermore, `.env` contains `https://docs.medusajs.com` in `ADMIN_CORS` and `AUTH_CORS`.
- **Attack Scenario:**  
  If CORS defaults to `*` or whitelists documentation domains, malicious scripts running on cross-origin sites could attempt credentialed cross-origin requests.
- **Recommended Fix:**  
  Remove third-party domains from `ADMIN_CORS` and `AUTH_CORS`. Set explicit origins only (`http://localhost:3001`, `https://naaz.pk`, etc.).
- **Priority:** P1

---

### [MEDIUM] SEC-006 — Logic Error in Address `is_default_shipping` Boolean Evaluation

- **Severity:** MEDIUM
- **Confidence:** HIGH
- **Category:** Business Logic / Insecure Implementation
- **Affected File:** `storefront/src/lib/data/customer.ts`
- **Lines:** 186, 237
- **Description:**  
  The code evaluates: `formData.get('is_default_shipping') === 'on' || 'true' ? true : false`. In JavaScript, `('on' || 'true')` evaluates to `'true'` (truthy), resulting in `is_default_shipping` ALWAYS evaluating to `true` regardless of whether the checkbox was checked or unchecked.
- **Security Impact:** Unintended state corruption of user account preferences.
- **Recommended Fix:**  
  Correct the conditional to: `formData.get('is_default_shipping') === 'on' || formData.get('is_default_shipping') === 'true'`.
- **Priority:** P2

---

### [MEDIUM] SEC-007 — Unvalidated Path in `updateRegion` (Open Redirect Risk)

- **Severity:** MEDIUM
- **Confidence:** MEDIUM
- **Category:** Open Redirect
- **Affected File:** `storefront/src/lib/data/cart.ts`
- **Lines:** 481
- **Description:**  
  `updateRegion(countryCode, currentPath)` calls `redirect(/${countryCode}${currentPath})`. If `currentPath` is supplied from an unvalidated query parameter containing `//attacker.com` or `javascript:`, it can trigger an open redirect.
- **Recommended Fix:**  
  Sanitize `currentPath` to ensure it begins with a single `/` and does not contain `://` or `//`.
- **Priority:** P2

---

### [MEDIUM] SEC-008 — Missing Essential Security Headers in Next.js Storefront

- **Severity:** MEDIUM
- **Confidence:** HIGH
- **Category:** Security Headers
- **Affected File:** `storefront/next.config.js`
- **Description:**  
  The storefront application does not configure standard defense-in-depth HTTP response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **Security Impact:** Clickjacking susceptibility, MIME-type sniffing.
- **Recommended Fix:**  
  Add `headers()` configuration in `next.config.js` with `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Priority:** P2

---

## Low & Informational Findings

### [LOW] SEC-009 — Detailed Backend Error Disclosure in Server Actions
- **File:** `storefront/src/lib/data/customer.ts`
- **Description:** Server Actions return `error.toString()` directly to client forms, which may leak backend microservice internal errors or validation details.
- **Fix:** Map technical errors to user-friendly messages.

### [LOW] SEC-010 — Hardcoded Publishable Key Fallback
- **File:** `storefront/src/lib/data/cookies.ts`, `customer.ts`
- **Description:** Fallback `pk_87449040...` string hardcoded in TypeScript files.
- **Fix:** Strictly read from `process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

### [INFO] SEC-011 — Dependency Vulnerabilities in Transitive Tooling
- **Description:** `npm audit` reported 18 vulnerabilities in development/build dependencies (`postcss`, `nanoid`, `yaml`, `lodash`).
- **Fix:** Run targeted `npm audit fix` where non-breaking.

---

## Positive Security Controls Identified

1. **HttpOnly & SameSite Cookies:** Medusa authentication tokens (`_medusa_jwt`) are stored in `HttpOnly`, `SameSite=Strict`, `Secure` (in prod) cookies.
2. **Parameterized Database Queries:** Medusa v2 ORM (MikroORM/Drizzle) and PostgreSQL client use parameterized placeholders (`$1`, `$2`), preventing SQL injection.
3. **No Direct `dangerouslySetInnerHTML` Abuse:** Content rendering relies on React JSX and sanitized Markdown parsers.
4. **Publishable API Key Scoping:** Access to store endpoints is properly scoped to sales channels and regions.

---

## Remediation Plan

1. **Phase 1: Disable & Secure Dangerous Unauthenticated Endpoints**
   - Delete/disable `/delete-products`, `/import`, `/store/import-products`, `/setup`, `/setup-categories` from public routing.
2. **Phase 2: Secure Order Tracking & PII Protection**
   - Require dual confirmation (Order # + Phone Number or Email).
   - Mask sensitive customer information in tracking output.
   - Require admin authentication for `POST /tracking`.
3. **Phase 3: Sanitize Open Redirects & Fix Address Logic**
   - Sanitize path in `updateRegion`.
   - Fix boolean logic in `is_default_shipping`.
4. **Phase 4: Security Headers & Config Hardening**
   - Add security headers in `storefront/next.config.js`.
   - Clean CORS configurations in backend `.env` and `medusa-config.ts`.
