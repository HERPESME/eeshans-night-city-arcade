# Eeshan — Night City Arcade Portfolio

A cyberpunk-retro portfolio showcasing full-stack and AI/ML work with interactive terminal UI, themed animations, and live developer stats.

## 🚀 Features

- Pixel-art + glitch visual system
- Interactive loading sequence and music controls
- Command palette quick navigation (`Cmd/Ctrl + K`)
- Project database with filters, inspect mode, and featured repos
- Terminal contact center with serverless message delivery
- Hidden terminal achievements / easter-egg commands
- Live LeetCode and GitHub stats integrations

## 🛠️ Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui primitives
- Netlify Functions (`leetcode`, `contact`, `github`)

## 📦 Getting Started

1. Clone and install:
   - `git clone https://github.com/YOUR_USERNAME/night-city-arcade-portfolio.git`
   - `cd night-city-arcade-portfolio`
   - `npm install`
2. Run locally:
   - `npm run dev`
3. Build production bundle:
   - `npm run build`

## 📮 Contact Function Setup (Netlify)

`QUICK.MESSAGE` sends data to `/.netlify/functions/contact`.

Required environment variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`

Optional:

- `CONTACT_FROM_EMAIL` (defaults to `onboarding@resend.dev`)

## 🛰️ Live GitHub Stats Setup (Netlify)

`PROJECTS.DATABASE` fetches live stats from `/.netlify/functions/github`.

Optional environment variable:

- `GITHUB_TOKEN` (recommended to improve rate limits)

## 🕹️ Terminal Achievements Commands

Try these in `CONTACT.TERMINAL`:

- `achievements.show()`
- `unlock.david()`
- `theme.retro()`
- `summon.relic()`
- `trace.ghost()`
- `clear`

Unlock state is persisted in browser local storage.

## ⚙️ Performance Notes

Optimizations currently applied:

- Deferred background music loading (`preload="none"`)
- Lazy/async loading for heavy project and modal visuals
- Reduced-motion support for animation-heavy experiences
- Stabilized playlist references to avoid unnecessary re-renders

For future media updates:

- Prefer compressed `.webp` / `.avif` for large images
- Replace heavy GIF loops with short videos where possible
- Trim and normalize audio before upload

## � SEO / Social Metadata Note

Canonical + OG + sitemap currently use:

- `https://eeshans-night-city-arcade.netlify.app/`

If your production URL changes, update:

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`

## 🖼️ Assets & Media

Included media is demo-oriented. Replace or remove any asset you don’t have redistribution rights for before publishing forks.

## 📬 Contact

- LinkedIn: [eeshan-singh-926790285](https://www.linkedin.com/in/eeshan-singh-926790285)
- GitHub: [HERPESME](https://github.com/HERPESME)
- Email: `eeshan.singh53@gmail.com`

## 📝 License

MIT — see `LICENSE`.