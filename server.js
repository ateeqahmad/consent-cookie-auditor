const express = require("express");
const path = require("path");
const { chromium } = require("playwright");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeUrl(inputUrl) {
  if (!inputUrl) {
    throw new Error("URL is required.");
  }

  let url = inputUrl.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const parsed = new URL(url);
  return parsed.toString();
}

function wildcardToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp("^" + escaped + "$", "i");
}

function matchesCookie(cookieName, rules) {
  const matches = [];

  for (const rule of rules) {
    if (!rule || !rule.pattern) continue;

    const regex = wildcardToRegExp(rule.pattern);

    if (regex.test(cookieName)) {
      matches.push({
        tool: rule.tool || "Unknown",
        pattern: rule.pattern,
        category: rule.category || "Marketing/Analytics"
      });
    }
  }

  return matches;
}

function getCookieStatus(cookie, ruleMatches) {
  if (ruleMatches.length > 0) {
    return "Matched monitored cookie";
  }

  return "Unmatched cookie";
}

app.post("/api/audit", async (req, res) => {
  let browser;

  try {
    const { url, cookieRules, waitSeconds } = req.body;

    const targetUrl = normalizeUrl(url);
    const rules = Array.isArray(cookieRules) ? cookieRules : [];
    const waitMs = Math.max(Number(waitSeconds || 6), 1) * 1000;

    browser = await chromium.launch({
      headless: true
    });

    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 900
      },

      /*
        This helps simulate a clean first visit.
        You can change these values if you want to test EEA behavior.
      */
      locale: "en-US",
      timezoneId: "America/New_York"
    });

    const page = await context.newPage();

    const networkRequests = [];

    page.on("request", request => {
      const requestUrl = request.url();

      networkRequests.push({
        url: requestUrl,
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45000
    });

    await page.waitForTimeout(waitMs);

    const cookies = await context.cookies();

    const localStorageData = await page.evaluate(() => {
      const data = {};

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
      } catch (e) {
        data.__error = e.message;
      }

      return data;
    });

    const sessionStorageData = await page.evaluate(() => {
      const data = {};

      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          data[key] = sessionStorage.getItem(key);
        }
      } catch (e) {
        data.__error = e.message;
      }

      return data;
    });

    const matchedCookies = cookies.map(cookie => {
      const ruleMatches = matchesCookie(cookie.name, rules);

      return {
        name: cookie.name,
        valuePreview: cookie.value ? cookie.value.slice(0, 80) : "",
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        matched: ruleMatches.length > 0,
        matches: ruleMatches,
        status: getCookieStatus(cookie, ruleMatches)
      };
    });

    const monitoredCookiesSet = matchedCookies.filter(cookie => cookie.matched);

    const possibleMarketingRequests = networkRequests.filter(request => {
      return /google-analytics|googletagmanager|googleadservices|doubleclick|facebook|connect\.facebook|tiktok|analytics\.tiktok|klaviyo|bing|bat\.bing|linkedin|ads\.linkedin|pinterest/i.test(
        request.url
      );
    });

    await browser.close();

    res.json({
      success: true,
      auditedUrl: targetUrl,
      httpStatus: response ? response.status() : null,
      waitedSeconds: waitMs / 1000,
      summary: {
        totalCookies: cookies.length,
        monitoredCookiesSet: monitoredCookiesSet.length,
        possibleMarketingRequests: possibleMarketingRequests.length
      },
      monitoredCookiesSet,
      allCookies: matchedCookies,
      localStorageData,
      sessionStorageData,
      possibleMarketingRequests
    });
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Consent cookie auditor running at http://localhost:${PORT}`);
});