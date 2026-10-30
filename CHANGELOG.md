# Changelog

All notable changes to OpenSEO. Versions follow [Semantic Versioning](https://semver.org).

## [0.4.0](https://github.com/nirrmul-999/auto-seen-ai/compare/v0.3.0...v0.4.0) (2026-10-30)


### Features

* add a github action that checks preview deploys ([#16](https://github.com/nirrmul-999/auto-seen-ai/issues/16)) ([4815651](https://github.com/nirrmul-999/auto-seen-ai/commit/48156511bed45fef90ae5a8e28657d42c48c211a))
* add a Telegram link preview ([#19](https://github.com/nirrmul-999/auto-seen-ai/issues/19)) ([365ee81](https://github.com/nirrmul-999/auto-seen-ai/commit/365ee818385900b5a0727dfcb6b18cc394239851))
* add an mcp server ([#17](https://github.com/nirrmul-999/auto-seen-ai/issues/17)) ([a88a1ec](https://github.com/nirrmul-999/auto-seen-ai/commit/a88a1ec41c914c74a2a62ac83167c3ce8b8ffa75))
* compare two audits ([#14](https://github.com/nirrmul-999/auto-seen-ai/issues/14)) ([8d98ba1](https://github.com/nirrmul-999/auto-seen-ai/commit/8d98ba170185905e30cdaefbaa62b189a5510f36))
* monitor pages and send alerts ([#15](https://github.com/nirrmul-999/auto-seen-ai/issues/15)) ([b947508](https://github.com/nirrmul-999/auto-seen-ai/commit/b947508d423f578822b4e58d44e778275291849d))
* publish a docker image and add a demo to the readme ([#4](https://github.com/nirrmul-999/auto-seen-ai/issues/4)) ([06fa6e1](https://github.com/nirrmul-999/auto-seen-ai/commit/06fa6e1177d4f85bb896fa59ee9577676230d733))

## [0.3.0](https://github.com/alexsilver8/open-seo/compare/v0.2.0...v0.3.0) (2026-10-11)

### Compare two audits

- Put two audits side by side: the same page before and after a change, or your page next to a
  competitor's. See both grades, the change in score, each category, speed and size, and every
  check grouped by how it changed: new problems, got worse, fixed, improved and still to fix.
- Pick two audits under Compare in the sidebar, or audit a competitor's page on the spot. Reports
  have a Compare button, and each site in History has Compare last two.
- Each comparison has a shareable page, white-labelled like reports, with Save PDF. The same data
  comes from `GET /api/compare?a=<id>&b=<id>`.

### Monitors and alerts

- Re-audit a page every day or every week, at an hour in your time zone. Every run is a normal
  audit in History.
- Get an alert when the score drops (by 5 points by default, naming the checks that started
  failing and linking to the comparison), when the page stops loading and when it's back, and
  when its SSL certificate is invalid or about to expire (14 days by default).
- Alerts go by email (set `SMTP_URL` and `SMTP_FROM`), Slack, Discord or a JSON webhook, set up
  under Settings → Alerts, with a button that sends a test alert. Each piece of news is sent once.
- The scheduler starts with OpenSEO and catches up on runs it missed while it was off;
  `OPENSEO_SCHEDULER=false` turns it off. API: `/api/monitors` and `POST /api/alerts/test`.

### GitHub Action

- `uses: alexsilver8/open-seo@v0` audits each preview deploy next to production and fails the pull
  request when a page drops more than 2 points, a check starts failing, or the page doesn't load.
- The results go to the job summary and to a pull request comment that later runs update. It
  works with Vercel and Netlify previews, and leaves out what preview hosts change on purpose:
  the `X-Robots-Tag: noindex` header, canonical tags and email records. Timings never fail it.
- `pnpm check` does the same in any other CI.

### MCP server

- Claude, Cursor, VS Code and other AI tools can use OpenSEO through its MCP server at `/api/mcp`:
  run audits, read and compare reports, crawl sites, check share previews and add monitors.
- Claude Desktop connects through a bridge in the Docker image:
  `docker exec -i openseo node mcp-stdio.mjs`. With `ADMIN_PASSWORD` set, MCP asks for it like
  the rest of the admin API.

## [0.2.0](https://github.com/alexsilver8/open-seo/releases/tag/v0.2.0) (2026-10-10)

### Share previews

- See how a link looks on Google, Facebook, X, LinkedIn, Slack, Discord, WhatsApp and iMessage,
  with what to fix for each. Each preview follows that platform's rules: large or small image,
  card type, image size and file size limits, and theme color.
- Every share image, favicon, Apple touch icon and web app manifest icon is downloaded and
  measured: real pixel size (including every size inside .ico files), format and weight.
- A table of every Open Graph, X, icon and app tag on the page.
- In every report, and as a standalone Share preview page and `GET /api/preview`.
- New checks: share image, Apple touch icon, web app manifest and theme color. The Open Graph,
  X card and favicon checks now look at the images and icons themselves, not just the tags.

### Run it with one command

- A Docker image for Intel and ARM is published to `ghcr.io/alexsilver8/open-seo` with every
  release:
  `docker run -d --name openseo -p 3000:3000 -v openseo-data:/data ghcr.io/alexsilver8/open-seo`
- Fixed the Dockerfile, which copied a `public` folder that no longer exists and broke the build.
- `docker compose` passes every option from `.env` and can reach sites on your own computer.

### Removed

- The Branding section in Settings. Name, logo, accent color, footer and call to action still
  white-label reports when set in `data/settings.json` or through `PUT /api/settings`.
- Leads and the embeddable audit widget: the Leads page, `/embed`, `embed.js`, `/api/leads`,
  the embed settings and the `email` and `name` fields of `POST /api/audit`. An existing
  `data/leads.json` is left in place but no longer read.

## 0.1.0

The first release.

### Audits

- Grades a page from A+ to F with about 70 checks in seven categories: on-page SEO,
  performance, usability, security, links, social and AI search readiness.
- Ranks what to fix by priority, with a recommendation and evidence for every problem.
- Checks links live, measures scripts, stylesheets and images, and reads robots.txt, the
  sitemap, llms.txt, the SSL certificate, HTTP/2 support and SPF and DMARC records.
- Optional Core Web Vitals, accessibility score and phone and desktop screenshots from Google
  PageSpeed Insights.
- Refuses private and internal addresses, with timeouts, size limits and a per-visitor rate
  limit.

### Reports

- Shareable report pages with a category sidebar, a "fix these first" list and filters for
  problems and passes.
- Save as PDF from the browser, or download as JSON.
- White-label branding: name, logo, accent color, footer and a call to action button.
- A light theme by default, with dark and match-system options in Settings.

### Crawler

- Crawls up to 500 pages of a site, respecting robots.txt.
- Finds broken pages, links to broken pages, missing or duplicate titles and descriptions,
  missing or extra H1s, thin content, slow pages, noindex, canonicals and missing alt text.
- Site health score, issue filters and CSV export.

### Leads and embed

- One script tag puts the audit on any website, in your branding, resizing itself.
- Captures each visitor's email and website as a lead, with CSV export.

### Running it

- History of every audit with each site's score over time.
- REST API with streamed progress, and `pnpm scan` and `pnpm crawl` in the terminal.
- Data stored as JSON files. Optional admin password. Docker image and Compose file.
- Fonts are bundled with the app, so neither builds nor visitors call Google Fonts.
