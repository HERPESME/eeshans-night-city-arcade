# Razorpay coffee support

Branch: `Buy-me-coffee-setup`. The public repository contains implementation and tests, never payment credentials. Production hosting remains Netlify. No Firebase billing change or login is needed for coffee support. The branch pins Node.js 24 (the tested runtime) for builds and functions; the storage SDK requires at least Node 22.12. If an older `AWS_LAMBDA_JS_RUNTIME` override exists in Netlify, update it to `nodejs24.x` before deployment.

## What is implemented

- The existing card beside Sources on all 30 articles expands into a small amount selector. ₹100 / ₹250 / ₹500 presets, or a custom ₹1–₹5,000, charged once in INR. No recurring mandate, user account, paid link, sponsorship fulfilment or automatic refund endpoint.
- Server-created Razorpay Orders; integer paise, fixed currency and published-article allowlist. A random per-tab token is stored only as a hash on the server. This binds recovery and verification to the original order and amount.
- Duplicate order requests reserve one intent with atomic conditional writes before contacting Razorpay. Retries reuse the same order. An uncertain create request is not blindly repeated; an unopened attempt can be explicitly reset.
- Checkout callback HMAC uses the server's stored order ID. The server also fetches the payment and order and checks ownership, amount, currency, captured status, paid order and zero balance before showing success. An authorized payment is still pending.
- Signed raw-body webhooks, event-ID deduplication, immutable captured-payment records, refund records, and safe retries after storage failures. Late failed/captured events cannot overwrite refunds. Only data belonging to orders created by this site is retained.
- Site-wide Netlify Blobs stores `coffee-test-v1` / `coffee-live-v1`, strong reads and conditional writes. No in-memory production ledger. These are reconciliation records; Razorpay remains the financial source of truth. No entitlements, emails or other side effects depend on exactly-once webhook delivery.
- Strict methods, JSON content types, field allowlists, bounded bodies, Origin checks for browser POSTs, no CORS access, timeouts, no-store responses and Netlify IP/domain limits. Webhooks use signatures instead of Origin checks and avoid limits on shared provider IPs.
- The Razorpay script loads only after an explicit Continue action. No payment details, tokens, signatures, payment references or donor identity enter GA4. Optional consent-controlled `support_open` and `support_checkout` events contain only the article slug and test/live mode. They are funnel signals, not revenue reporting.
- Missing configuration fails closed. Live keys are blocked outside Netlify's production context, even if accidentally set on a preview. Test checkout is clearly labelled. Turning off new orders preserves confirmation/webhook handling while valid credentials remain configured.

## Account setup still required

1. Create/activate the Razorpay merchant account with the real owner, bank details and KYC. Confirm with Razorpay that the account/category permits voluntary support for this publication. This integration does not bypass account or category restrictions.
2. Add `https://technightcity.com` as the website. Review the displayed payment/privacy/refund text and provide any additional policies Razorpay requests. Sponsorships and development work should use separately agreed invoices rather than this tip flow.
3. Enable automatic capture in Razorpay payment capture settings. A signed callback alone does not mean captured money.
4. For international customers, request **International Cards** activation under **Account & Settings → International payments** and provide the requested purpose/business documents. Code does not grant this approval. This first version charges **INR**, including eligible international cards; it does not promise local-currency billing, every country, or every method. Bank FX charges may apply. Domestic methods also depend on the activated account.
5. Generate test API credentials and a separate random webhook secret. Enter secrets directly in Netlify's environment-variable UI, scoped to **Functions** and the intended deployment context. Do not paste them into chat, a commit, screenshots, `VITE_*` variables or frontend files. Use distinct test and live keys/secrets. Netlify Blobs is provided by the runtime; do not add an account-wide Netlify access token to the app.

| Server variable | Purpose |
| --- | --- |
| `COFFEE_ENABLED` | `true` enables new orders; absent/false disables them. |
| `COFFEE_MODE` | `test` initially; `live` only after test checkout and activation checks. |
| `RAZORPAY_KEY_ID` | Public Razorpay key ID; still sourced from runtime config, paired with the chosen mode. |
| `RAZORPAY_KEY_SECRET` | Server-only API secret for that key. |
| `RAZORPAY_WEBHOOK_SECRET` | Separate random secret, at least 32 characters, also entered in Razorpay webhook setup. |
| `COFFEE_LIVE_APPROVED` | Set `true` only after account/category approval and successful end-to-end test. Live also requires the function’s Netlify `context.deploy.context` to be `production`. |
| `RAZORPAY_WEBHOOK_SECRET_PREVIOUS` | Optional prior webhook secret during a rotation/retry window; remove after old retries stop. |
| `COFFEE_DEV_ORIGIN` | Optional localhost origin for test mode only; never enables live. |

6. Configure a **test-mode** webhook at the deployed test origin plus `/.netlify/functions/coffee-webhook`, with `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`. Use the matching test secret. For live, create a separate live webhook at `https://technightcity.com/.netlify/functions/coffee-webhook` with its live secret. Serve the webhook directly over HTTPS, with no login or redirect. Check delivery status in Razorpay.
7. Test with Razorpay's published test payment methods: captured success, failed payment, cancellation, recovery after reload, pending capture, retry and refund. Cross-check Razorpay Dashboard and Netlify Blobs records. Mock tests in this branch do not replace an account-backed test transaction or verify bank settlement.
8. After a successful test and review, merge once and publish with the intended production variables. Enable live with the live credentials. Verify a small owner-authorized real transaction and refund separately; do not automatically charge a real card during development. International acceptance must also be verified with an eligible method after account activation.

## Operations and restrictions

- New orders: 5 requests per IP/domain per 180 seconds. Verification: 30 per minute. Config: 40 per minute. These are Netlify edge protections, not an absolute fraud guarantee; enforcement may lag and distributed abuse needs provider/WAF monitoring. Verify that Netlify reports the rules applied in deployment logs.
- Provider requests time out after 10 seconds; the client after 18 seconds. Recovery uses a high-entropy session token for 24 hours. Closing the tab or blocking sessionStorage can remove recovery data; retain the Razorpay payment reference and contact `eeshan@technightcity.com` if uncertain. Expired sessions do not claim failure or encourage another payment.
- Orders are not automatically cancelled or captured by this app. Configure capture in Razorpay; payments still authorized must not be presented as successful. An order stays paid after refunds, so the current payment status is checked too.
- A failed dependency never returns paid. If an order-create call or its storage link is interrupted before checkout opens, the reservation deliberately stays unresolved rather than risking a second provider call. Reconcile it in Razorpay by the `tnc_` receipt and reset only an unopened attempt.
- Blobs records contain identifiers, amount, currency, article, timestamps, mode and token/body hashes. No card number, CVV, UPI PIN, raw webhook body, donor email/phone, API secret or callback signature is stored. They are not publicly readable through these functions. Restrict Netlify administrator access; review retention and archive/delete abandoned intents as part of operations. Do not use in-memory deduplication or a public database collection.
- Refund requests are handled by the owner through Razorpay, with a reconciliation webhook. The public app cannot issue refunds, change bank accounts or payouts. Review disputes, fees and settlements in Razorpay.
- `COFFEE_ENABLED=false` stops new orders. Keep credentials/webhooks configured for in-flight confirmations; removing secrets or changing mode stops those too. Avoid rotating API keys during active checkouts; status recovery can still fetch payments after rotation when the merchant account remains accessible. For webhook secret rotation, retain the previous secret until retries drain.
- Preview contexts must use test secrets. Never make live credentials available to untrusted PR builds; the runtime guard supplements environment scoping.

## Verification and public commits

Run `npm run test:coffee`, TypeScript, `npm run build`, and the existing SEO/SSR/blog/contact/analytics checks. Browser-review the existing card at desktop and narrow widths. No media conversions or GIF changes are needed. No new indexable route is added, so the sitemap remains unchanged and payment endpoints return noindex headers.

The production `prebuild` removes only generated `dist` and `.ssr` directories before rebuilding. This prevents a previous prerendered homepage or stale SSR template being reused during repeated local builds; source/media files are untouched.

Before **every commit on this branch**, check GitHub reports this repository as public, inspect the staged diff, and run the public-commit guard. It rejects environment/key files, common credential formats, server secret values supplied in the current environment, and exposed Razorpay secret assignments. Its scan is defence in depth, not proof that arbitrary secrets are absent. Do not change repository visibility as part of this feature.

The tracked `.githooks/pre-commit` runs the guard automatically on this branch. It is enabled in the working checkout with `git config --local core.hooksPath .githooks`; fresh clones must enable it too. Git hooks do not replace GitHub secret protection or code review and can be bypassed by a local operator.

The 2 November dependency audit reports 23 advisories (1 critical, 18 high, 4 moderate) in the pre-existing dependency tree, including packages used outside the payment functions. Comparing the baseline lockfile with this branch reports no newly affected package names from adding `@netlify/blobs`. The payment handlers do not import Express, Firebase, React Router or Zod. This does not certify the rest of the application: patch and review the existing dependencies in a separate focused change before treating a whole-site security audit as complete; do not run a forced major-version downgrade/upgrade automatically.

References checked 2 November 2026:

- [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Razorpay webhook validation and retries](https://github.com/razorpay/markdown-docs/blob/master/webhooks/validate-test.md)
- [Razorpay international payment activation](https://razorpay.com/docs/payments/international-payments/)
- [Netlify Blobs, strong consistency and conditional writes](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Netlify code-based rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
