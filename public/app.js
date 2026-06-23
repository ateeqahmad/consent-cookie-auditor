const defaultCookieRules = [
  {
    tool: "Google Analytics / GA4",
    pattern: "_ga",
    category: "Analytics"
  },
  {
    tool: "Google Analytics / GA4",
    pattern: "_ga_*",
    category: "Analytics"
  },
  {
    tool: "Google Analytics / Universal Analytics",
    pattern: "_gid",
    category: "Analytics"
  },
  {
    tool: "Google Analytics / Universal Analytics",
    pattern: "_gat*",
    category: "Analytics"
  },
  {
    tool: "Google Ads",
    pattern: "_gcl_au",
    category: "Advertising"
  },
  {
    tool: "Google Ads",
    pattern: "_gcl_aw",
    category: "Advertising"
  },
  {
    tool: "Google Ads",
    pattern: "_gcl_dc",
    category: "Advertising"
  },
  {
    tool: "Facebook / Meta",
    pattern: "_fbp",
    category: "Advertising"
  },
  {
    tool: "Facebook / Meta",
    pattern: "_fbc",
    category: "Advertising"
  },
  {
    tool: "TikTok",
    pattern: "_ttp",
    category: "Advertising"
  },
  {
    tool: "TikTok",
    pattern: "_tt_enable_cookie",
    category: "Advertising"
  },
  {
    tool: "TikTok",
    pattern: "ttclid",
    category: "Advertising"
  },
  {
    tool: "Klaviyo",
    pattern: "__kla_id",
    category: "Email Marketing"
  },
  {
    tool: "Microsoft Ads / Bing",
    pattern: "_uetvid",
    category: "Advertising"
  },
  {
    tool: "Microsoft Ads / Bing",
    pattern: "_uetsid",
    category: "Advertising"
  },
  {
    tool: "LinkedIn Ads",
    pattern: "li_fat_id",
    category: "Advertising"
  },
  {
    tool: "LinkedIn",
    pattern: "bcookie",
    category: "Advertising"
  },
  {
    tool: "LinkedIn",
    pattern: "lidc",
    category: "Advertising"
  },
  {
    tool: "Pinterest",
    pattern: "_pin_unauth",
    category: "Advertising"
  },
  {
    tool: "Pinterest",
    pattern: "_pinterest_ct_ua",
    category: "Advertising"
  }
];

let cookieRules = loadCookieRules();

const urlInput = document.getElementById("urlInput");
const waitSecondsInput = document.getElementById("waitSeconds");
const runAuditBtn = document.getElementById("runAuditBtn");

const toolInput = document.getElementById("toolInput");
const patternInput = document.getElementById("patternInput");
const categoryInput = document.getElementById("categoryInput");
const addRuleBtn = document.getElementById("addRuleBtn");

const rulesTableBody = document.getElementById("rulesTableBody");
const statusBox = document.getElementById("statusBox");
const summaryBox = document.getElementById("summaryBox");
const matchedCookiesBody = document.getElementById("matchedCookiesBody");
const networkRequestsBody = document.getElementById("networkRequestsBody");
const allCookiesBody = document.getElementById("allCookiesBody");

function loadCookieRules() {
  const savedRules = localStorage.getItem("consentCookieRules");

  if (savedRules) {
    try {
      return JSON.parse(savedRules);
    } catch (error) {
      return defaultCookieRules;
    }
  }

  return defaultCookieRules;
}

function saveCookieRules() {
  localStorage.setItem("consentCookieRules", JSON.stringify(cookieRules));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRules() {
  rulesTableBody.innerHTML = "";

  cookieRules.forEach((rule, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(rule.tool)}</td>
      <td><code>${escapeHtml(rule.pattern)}</code></td>
      <td>${escapeHtml(rule.category)}</td>
      <td>
        <button class="danger" data-delete-rule="${index}">Delete</button>
      </td>
    `;

    rulesTableBody.appendChild(tr);
  });
}

function addRule() {
  const tool = toolInput.value.trim();
  const pattern = patternInput.value.trim();
  const category = categoryInput.value.trim();

  if (!tool || !pattern) {
    alert("Please enter at least a tool name and cookie pattern.");
    return;
  }

  cookieRules.push({
    tool,
    pattern,
    category: category || "Marketing/Analytics"
  });

  toolInput.value = "";
  patternInput.value = "";
  categoryInput.value = "";

  saveCookieRules();
  renderRules();
}

function deleteRule(index) {
  cookieRules.splice(index, 1);
  saveCookieRules();
  renderRules();
}

function renderMatchedCookies(cookies) {
  matchedCookiesBody.innerHTML = "";

  if (!cookies.length) {
    matchedCookiesBody.innerHTML = `
      <tr>
        <td colspan="5">No monitored cookies were found.</td>
      </tr>
    `;
    return;
  }

  cookies.forEach((cookie) => {
    const tools = cookie.matches.map((match) => `${match.tool} (${match.pattern})`).join(", ");

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><code>${escapeHtml(cookie.name)}</code></td>
      <td>${escapeHtml(tools)}</td>
      <td>${escapeHtml(cookie.domain)}</td>
      <td>${escapeHtml(cookie.sameSite)}</td>
      <td>${cookie.secure ? "Yes" : "No"}</td>
    `;

    matchedCookiesBody.appendChild(tr);
  });
}

function renderNetworkRequests(requests) {
  networkRequestsBody.innerHTML = "";

  if (!requests.length) {
    networkRequestsBody.innerHTML = `
      <tr>
        <td colspan="3">No obvious marketing/analytics requests found.</td>
      </tr>
    `;
    return;
  }

  requests.forEach((request) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(request.resourceType)}</td>
      <td>${escapeHtml(request.method)}</td>
      <td class="url-cell">${escapeHtml(request.url)}</td>
    `;

    networkRequestsBody.appendChild(tr);
  });
}

function renderAllCookies(cookies) {
  allCookiesBody.innerHTML = "";

  if (!cookies.length) {
    allCookiesBody.innerHTML = `
      <tr>
        <td colspan="4">No cookies were found.</td>
      </tr>
    `;
    return;
  }

  cookies.forEach((cookie) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><code>${escapeHtml(cookie.name)}</code></td>
      <td>${escapeHtml(cookie.domain)}</td>
      <td>${cookie.matched ? "Yes" : "No"}</td>
      <td><code>${escapeHtml(cookie.valuePreview)}</code></td>
    `;

    allCookiesBody.appendChild(tr);
  });
}

async function runAudit() {
  const url = urlInput.value.trim();
  const waitSeconds = Number(waitSecondsInput.value || 6);

  if (!url) {
    alert("Please enter a website URL.");
    return;
  }

  statusBox.textContent = "Running audit...";
  summaryBox.innerHTML = "";
  matchedCookiesBody.innerHTML = "";
  networkRequestsBody.innerHTML = "";
  allCookiesBody.innerHTML = "";

  runAuditBtn.disabled = true;

  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        waitSeconds,
        cookieRules
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Audit failed.");
    }

    statusBox.innerHTML = `
      Audit complete for <strong>${escapeHtml(result.auditedUrl)}</strong>.
    `;

    summaryBox.innerHTML = `
      <div class="summary-grid">
        <div>
          <strong>Total Cookies</strong>
          <span>${result.summary.totalCookies}</span>
        </div>
        <div>
          <strong>Monitored Cookies Set</strong>
          <span>${result.summary.monitoredCookiesSet}</span>
        </div>
        <div>
          <strong>Marketing Requests</strong>
          <span>${result.summary.possibleMarketingRequests}</span>
        </div>
      </div>
    `;

    renderMatchedCookies(result.monitoredCookiesSet);
    renderNetworkRequests(result.possibleMarketingRequests);
    renderAllCookies(result.allCookies);
  } catch (error) {
    statusBox.innerHTML = `
      <span class="error">Error: ${escapeHtml(error.message)}</span>
    `;
  } finally {
    runAuditBtn.disabled = false;
  }
}

rulesTableBody.addEventListener("click", (event) => {
  const deleteIndex = event.target.getAttribute("data-delete-rule");

  if (deleteIndex !== null) {
    deleteRule(Number(deleteIndex));
  }
});

addRuleBtn.addEventListener("click", addRule);
runAuditBtn.addEventListener("click", runAudit);

renderRules();
