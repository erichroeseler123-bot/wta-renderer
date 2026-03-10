# OWASP Top 10 (2025) - WTA UI Checklist

## Scope
- Checkout, payment, webhook/finalization, admin endpoints, and booking data paths.

## A01: Broken Access Control
- [ ] Verify every `/api/admin/*` route enforces auth.
- [ ] Ensure no public endpoint can read another user's order data by arbitrary IDs.
- [ ] Validate Stripe/FareHarbor internal-only actions are not publicly callable without controls.

## A02: Security Misconfiguration
- [x] Security headers via `vercel.json` (CSP, HSTS, XFO, nosniff, permissions, referrer policy).
- [ ] Ensure no placeholder secrets in production env.
- [ ] Confirm debug stack traces are not returned to clients.

## A03: Software Supply Chain Failures
- [ ] Enforce lockfile-based installs in CI.
- [ ] Add dependency audit job (`npm audit --production`).
- [ ] Restrict deployment source to protected branches.

## A04: Cryptographic Failures
- [x] Payment card data delegated to Stripe.
- [ ] Review logs/KV payloads for sensitive data leakage.

## A05: Injection
- [ ] Continue strict validation on URL/body params.
- [ ] Avoid dynamic shell/SQL patterns in any new features.

## A06: Insecure Design
- [x] Checkout rate limiting on payment-critical routes.
- [x] Turnstile support for checkout bot friction.
- [ ] Add account-level abuse metrics and alerts.

## A07: Identification and Authentication Failures
- [ ] Add stronger admin session hardening and rotation guidance.
- [ ] Consider MFA for admin entry points.

## A08: Software and Data Integrity Failures
- [ ] Require reviewed commits for production release.
- [ ] Add integrity checks to build/deploy pipeline.

## A09: Security Logging and Monitoring Failures
- [x] Request-ID based server error logging on payment routes.
- [ ] Forward logs to centralized monitoring.
- [ ] Alert on repeated webhook signature failures or rate-limit bursts.

## A10: Mishandling of Exceptional Conditions
- [x] Safer error responses (avoid raw internal details on checkout/webhook/finalize).
- [ ] Add chaos/failure tests for payment and booking retries.
