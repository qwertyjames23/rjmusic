# Security Policy

## Supported Versions

rjmusic.shop is a continuously deployed application — only the latest version
running on the `main` branch (live in production) is supported. There are no
tagged releases to back-port fixes to.

| Version | Supported |
| ------- | --------- |
| `main` (production) | ✅ |
| older commits | ❌ |

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately using **GitHub's private vulnerability reporting**:

1. Go to the [Security tab](https://github.com/qwertyjames23/rjmusic/security) of this repository.
2. Click **Report a vulnerability**.
3. Provide a description, steps to reproduce, and the potential impact.

This keeps the report confidential until a fix is released. If you are unable to
use GitHub, you may reach out through the **RJ Music Facebook page**.

### What to expect

- **Acknowledgement** within a few days.
- An assessment of the report and, if valid, a fix timeline.
- Credit for the disclosure once it is resolved, if you would like it.

## Scope

This policy covers the application code in this repository. Because rjmusic.shop
handles customer orders and payment metadata, the following are especially
in-scope:

- Authentication / authorization and Supabase Row Level Security (RLS) bypasses
- Exposure of secrets, the service-role key, or customer / order data
- Injection (SQL, XSS) and broken access control on admin routes
- Insecure handling of the Facebook Messenger webhook

Please **do not** run automated scanners against the live site, attempt denial
of service, or access data that is not yours. Use a local development instance
for testing wherever possible.
