# Consent Cookie Auditor

A simple Node.js and Playwright-based tool for checking whether marketing and analytics cookies are being set before a user gives consent.

This tool is designed for first-pass privacy and consent audits. It loads a website in a clean browser session, does not click the consent banner, waits a few seconds, and reports whether monitored cookies or marketing requests appear before consent is granted.

## What It Checks

The app includes default cookie rules for common marketing and analytics platforms, including:

* Google Analytics / GA4
* Google Ads
* Meta / Facebook
* TikTok
* Klaviyo
* Microsoft Ads / Bing
* LinkedIn
* Pinterest
* HubSpot
* Hotjar
* Microsoft Clarity

You can add or remove cookie rules directly from the browser interface.

## Features

* Loads a website in a fresh browser session
* Checks cookies before consent is accepted
* Flags known marketing and analytics cookies
* Shows all cookies set by the page
* Shows possible marketing and analytics network requests
* Lets you add or delete cookie patterns from the UI
* Stores custom cookie rules in browser localStorage
* Uses Playwright to run a real Chromium browser

## Why This Exists

Consent audits often require checking whether tracking technologies are firing before a user has accepted a cookie banner. This tool helps identify possible issues by showing whether common analytics and advertising cookies are being created before consent.

It is useful for reviewing implementations involving tools such as Google Tag Manager, GA4, Google Ads, Meta Pixel, TikTok Pixel, Klaviyo, HubSpot, and similar platforms.

## Important Note

This tool does not determine legal compliance by itself.

It can show that certain cookies or network requests appeared before consent was accepted, but legal compliance depends on factors such as:

* jurisdiction
* user location
* consent banner configuration
* CMP behavior
* cookie category
* whether the cookie is essential, functional, analytics, or advertising
* whether prior consent already exists
* whether Google Consent Mode or another consent framework is implemented correctly

Use this as an audit support tool, not as legal advice.

## Requirements

* Node.js
* npm
* Playwright

## Installation

Clone the repository:

```bash
git clone https://github.com/ateeqahmad/consent-cookie-auditor.git
cd consent-cookie-auditor
```

Install dependencies:

```bash
npm install
```

Install the Chromium browser used by Playwright:

```bash
npx playwright install chromium
```

## Run the App

Start the local server:

```bash
node server.js
```

Then open this in your browser:

```text
http://localhost:3000
```

## How to Use

1. Enter the website URL you want to audit.
2. Choose how many seconds the page should wait after loading.
3. Click **Run Audit**.
4. Review the results.

The most important section is:

```text
Monitored Cookies Set Without Consent
```

If cookies such as `_ga`, `_ga_*`, `_gcl_au`, `_fbp`, `_fbc`, `_ttp`, or `__kla_id` appear before consent is accepted, that may indicate a consent implementation issue.

## Default Cookie Rules

Some of the default cookie patterns include:

| Platform               | Cookie Pattern      |
| ---------------------- | ------------------- |
| Google Analytics / GA4 | `_ga`               |
| Google Analytics / GA4 | `_ga_*`             |
| Google Analytics       | `_gid`              |
| Google Ads             | `_gcl_au`           |
| Google Ads             | `_gcl_aw`           |
| Meta / Facebook        | `_fbp`              |
| Meta / Facebook        | `_fbc`              |
| TikTok                 | `_ttp`              |
| TikTok                 | `_tt_enable_cookie` |
| Klaviyo                | `__kla_id`          |
| Microsoft Ads / Bing   | `_uetvid`           |
| Microsoft Ads / Bing   | `_uetsid`           |
| LinkedIn Ads           | `li_fat_id`         |
| Pinterest              | `_pin_unauth`       |

## Adding Custom Cookie Rules

You can add custom rules from the UI.

Example:

| Tool              | Pattern      | Category    |
| ----------------- | ------------ | ----------- |
| Hotjar            | `_hj*`       | Analytics   |
| HubSpot           | `hubspotutk` | Marketing   |
| Microsoft Clarity | `_clck`      | Analytics   |
| Reddit Ads        | `_rdt_uuid`  | Advertising |
| Snapchat          | `_scid`      | Advertising |

Wildcard matching is supported.

For example:

```text
_ga_*
```

will match cookies such as:

```text
_ga_ABC123
```

## Project Structure

```text
consent-cookie-auditor/
  server.js
  package.json
  package-lock.json
  public/
    index.html
    app.js
    style.css
```

## How It Works

The backend uses Playwright to launch Chromium in a clean browser context. It opens the requested URL, waits for the configured amount of time, collects cookies, checks them against the configured cookie rules, and returns the results to the frontend.

The frontend displays:

* monitored cookies found
* possible marketing and analytics requests
* all cookies set by the page
* editable cookie rules

## Limitations

This tool currently checks the page before consent only. It does not yet automatically test behavior after clicking **Accept** or **Reject**.

Possible future improvements:

* add “before consent,” “after accept,” and “after reject” modes
* add automatic consent button detection
* add geographic testing for EEA, UK, and US behavior
* export results to CSV
* save audit history
* add localStorage and sessionStorage rule matching
* classify network requests by vendor

## Disclaimer

This project is provided for technical auditing and educational purposes. It is not legal advice. Consult a qualified privacy professional or attorney for legal interpretation of consent compliance. This document is written using ChatGPT and reviewed by me. I own complete responsibility for it.
