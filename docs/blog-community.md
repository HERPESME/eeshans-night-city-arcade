# Blog reader accounts

Feature branch: ftr/oauth-blog-community. Netlify remains the host. Firebase project technightcity supplies Authentication and Firestore.

The reader icon appears beside the square music control on blog pages. Google and email/password sign-in, email registration, verification, password reset and sign-out use Firebase Authentication. Only verified readers can vote or post. The article's discussion sits before the suggested articles. Replies are one level deep. The 90-second reading prompt counts focused, visible time and appears once per tab session. Readers can dismiss it and continue reading. Article HTML and canonicals remain available to crawlers.

## Before a production release

1. In Firebase Authentication for technightcity, enable Google and Email/Password. Choose the existing support email for Google. Enable email enumeration protection and configure the password policy with a minimum of eight characters.
2. Add technightcity.com to Authentication's authorized domains. For a preview test, authorize that exact Netlify deploy-preview hostname temporarily, then remove it when testing ends. The configured Firebase authDomain remains technightcity.firebaseapp.com.
3. Create the default Cloud Firestore database in production mode if it does not exist. Use the free Spark plan and review the free quota. Do not enable billing for this feature.
4. Review the existing database rules before release. The checked-in firestore.rules defines only the new articles/*/comments, articles/*/votes and communityMembers paths and denies other paths by default. If the project has other applications or rules, incorporate these matches into the existing rules before deploying. Do not overwrite unrelated rules.
5. Deploy the reviewed rules and indexes using Firebase CLI while signed into the owner account:
   firebase deploy --project technightcity --only firestore:rules,firestore:indexes
6. Wait for the comments composite index to finish building. Test Google sign-in, email registration, the verification link, password reset, sign-out, upvote/downvote/retract, posting, replying, deleting your comment and pagination with two disposable reader accounts.
7. Inspect the public display name, comment and timestamp. Email addresses are never stored in public comment documents. Google avatar URLs are displayed only in the signed-in reader's own account control with no-referrer. Votes can only be read or changed by their owner. This version shows the reader's vote selection without public totals.
8. Moderate through the Firebase Console. Removing a message through the reader UI leaves a blank tombstone so replies remain reachable. Owners can remove abusive records through the console. Launching a larger public community will require reviewing abuse reports and quota use.

## Data and boundaries

- articles/{slug}/comments/{id}: public display name, Firebase UID, text, parent ID, createdAt. Public reads must use a limit of at most 12. Text is rendered as React text, without HTML or automatic external links.
- articles/{slug}/votes/{uid}: value -1 or 1 and updatedAt. The UID is the unique vote key, so changing direction replaces the vote. Retraction deletes it.
- communityMembers/{uid}: private posting cooldown and last comment ID. A transaction writes the message and this record together. Rules require a verified email, a 30-second posting gap and the exact comment ID, preventing many messages in one batch.
- No passwords, refresh tokens or service-account credentials are stored in Firestore or source files. Firebase's existing browser configuration is shared with the analytics module. Auth runs independently of optional analytics consent. The new modules do not send names, email, message text or UID to analytics.
- Firestore requests start when the discussion nears the viewport and use bounded pages. Threads do not subscribe to realtime streams. Refresh the page for other readers' latest comments.
- Each comment is limited to 2,000 characters and each display name to 40. Email verification and cooldown reduce abuse. They do not guarantee a spam-free community.
- Errors and disabled providers are surfaced in the interface. Database access is governed by deployed rules, never by UI checks alone.

## Validation

npm run build
npm run test:seo
npm run test:ssr
npm run test:blogs
npm run test:analytics
npm run test:coffee
npx tsc --noEmit -p tsconfig.app.json

Rules use the local Firebase emulator, with synthetic verified/unverified users:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npx firebase-tools emulators:exec --project demo-night-city-community --only firestore "npm run test:community-rules"

The demo project does not write to the live database. Rules checks cover denied anonymous/unverified writes, vote ownership, invalid values, comment pagination, reply parents, cooldown, author deletion and unrelated collections.
