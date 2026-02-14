# Day 3 RLS Test Report

Date: February 14, 2026
Environment: Remote Supabase project (`ytgwjbmmnkhcvrmaxrvs`)

## Summary

- RLS hardening migrations are applied.
- Public read / public write behavior on `products` matches expectation.
- Auth/signup regression is fixed via trigger migration.
- Day 3 is **partially complete**; full customer/admin matrix still pending authenticated test credentials.

## Executed Tests

### 1) Anon: Products read should be allowed
- Request: `GET /rest/v1/products?select=id&limit=1`
- Result: `200 OK`
- Status: PASS

### 2) Anon: Products insert should be blocked
- Request: `POST /rest/v1/products`
- Result: RLS rejection (`new row violates row-level security policy`)
- Status: PASS

### 3) Signup flow should work
- Request: `POST /auth/v1/signup`
- Initial Result: `500 unexpected_failure` with message `Database error saving new user`
- Fix Applied: `20260214034500_fix_auth_signup_trigger.sql`
- Re-test Result: `200 OK` (user created)
- Status: PASS

### 4) Anon: Orders read behavior
- Request: `GET /rest/v1/orders?select=id&limit=1`
- Result: `200` with empty array
- Status: NEEDS FOLLOW-UP with authenticated role tests

### 5) Anon: Orders insert smoke
- Request: `POST /rest/v1/orders`
- Result: payload rejected due column mismatch with current remote `orders` schema
- Status: NEEDS FOLLOW-UP

## Findings

1. Signup pipeline now works after trigger/function hardening.
2. Remote `orders` table shape differs from local assumptions in older scripts.
3. Full role matrix still requires authenticated customer/admin sessions or test credentials.
4. Terminal automation is currently blocked by auth controls:
   - New signups hit `429 Too Many Requests` intermittently.
   - Existing test users cannot obtain access tokens until email is confirmed (`email_not_confirmed`).

## Next Fix Plan

1. Run authenticated customer tests using a real confirmed test account.
2. Run admin tests using known admin account credentials.
3. Complete matrix:
   - customer can read own orders only
   - customer cannot admin-write products
   - admin can manage products/orders/payments
