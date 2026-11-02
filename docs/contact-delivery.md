# Quick Message delivery

The public form posts to the contact function. It validates the eight allowed subjects, email, name and message limits, checks the requesting origin when present, rejects a filled honeypot and applies a Netlify function rate limit. It forwards only the accepted contact fields.

The default delivery route is Netlify Forms (`quick-message`). A hidden deploy-time form declaration in index.html lets Netlify register the fields. Enable form detection before deployment and configure a new-submission email notification to **eeshan@technightcity.com**. This is included without an added forms charge on the site's existing credit-based plan. No Firebase billing upgrade or third-party email credential is needed. The notification destination is controlled in the Netlify dashboard, not supplied by visitors.

An optional existing Resend configuration is supported when both RESEND_API_KEY and CONTACT_FROM_EMAIL are present in server-only environment variables. In that path the recipient is fixed in code, reply-to is the validated visitor address, and the email is plain text. Never put credentials in the client bundle or repository.

A successful form response confirms acceptance by the submission service. It cannot independently prove final inbox delivery. Check the Netlify submission record and notification configuration, and confirm inbox arrival when testing. Do not emit a successful lead event on a network or provider failure. The current tests mock delivery; a release test must also check the deployed form and stored submission.
