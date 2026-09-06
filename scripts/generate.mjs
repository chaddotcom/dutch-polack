// =====================================================================
// Static page generator for Agent Neighbor.
//
// One config (SITE below) is the single source of truth for every city
// landing page and the guides hub. Run it with:
//
//     npm run gen
//
// It writes:
//   - <slug>/index.html         one page per covered city
//   - guides/index.html         the guides hub
//   - sitemap.xml               every URL on the site
//
// It does NOT touch the homepage (index.html) or the hand-authored guide
// articles under guides/<slug>/ — it only owns the files listed above.
// Every page links the shared shell in assets/site.css, so edit design
// there once and re-run this script to update all pages at once.
// =====================================================================

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://agentneighbor.com";
const OG_IMAGE = `${ORIGIN}/og.png`;
const TODAY = new Date().toISOString().slice(0, 10);

// The shared favicon data-URI used across the site (matches index.html).
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2305603A'/%3E%3Crect x='7' y='7' width='50' height='50' rx='7' fill='none' stroke='white' stroke-width='3'/%3E%3Cpath d='M20 44V20h6l12 16V20h6v24h-6L26 28v16z' fill='white'/%3E%3C/svg%3E";

// ---------------------------------------------------------------------
// SITE CONFIG — the source of truth.
//
// Each city lists the public feeds Agent Neighbor actually reads for it, so
// its page describes real data, not boilerplate. `sources` drives both the
// stat cards and the SEO title. Keep this in sync with the CITIES / *_DATASETS
// config in index.html.
// ---------------------------------------------------------------------
const CITIES = [
  {
    slug: "philadelphia", name: "Philadelphia", state: "PA", portal: "the City of Philadelphia's open data (phl.carto.com)",
    sources: [
      { title: "311 service requests", desc: "Resident-filed complaints on the block: noise, sanitation, illegal dumping, graffiti, abandoned vehicles and more.", src: "City of Philadelphia 311" },
      { title: "L&I code violations", desc: "Licenses & Inspections enforcement — property maintenance, unsafe structures and code violations recorded near the address.", src: "Licenses & Inspections" },
      { title: "Building permits", desc: "Construction, renovation and demolition activity nearby — a read on how fast the block is changing.", src: "L&I building permits" },
    ],
    neighborhoods: "Center City, Fishtown, South Philly, West Philly, Germantown, the Northeast",
  },
  {
    slug: "new-york", name: "New York", state: "NY", portal: "NYC Open Data (Socrata)",
    sources: [
      { title: "311 service requests", desc: "Every non-emergency complaint logged near the block: noise, sanitation, parking and more.", src: "NYC 311" },
      { title: "HPD housing violations", desc: "Housing Preservation & Development violations recorded at nearby buildings.", src: "NYC HPD" },
    ],
    neighborhoods: "Manhattan, Brooklyn, Queens, the Bronx and Staten Island",
  },
  {
    slug: "chicago", name: "Chicago", state: "IL", portal: "the Chicago Data Portal (Socrata)",
    sources: [
      { title: "311 service requests", desc: "Resident-filed complaints on the block, from noise to sanitation to abandoned vehicles.", src: "Chicago 311" },
      { title: "Building violations", desc: "Department of Buildings code violations recorded near the address.", src: "Chicago Buildings" },
      { title: "Building permits", desc: "Construction and renovation permits issued nearby — how fast the block is changing.", src: "Chicago Permits" },
    ],
    neighborhoods: "the Loop, Lincoln Park, Pilsen, Hyde Park, Logan Square and beyond",
  },
  {
    slug: "los-angeles", name: "Los Angeles", state: "CA", portal: "the LA City open data portal (Socrata)",
    sources: [
      { title: "311 service requests", desc: "MyLA311 requests near the block: bulky-item dumping, graffiti, noise and more.", src: "LA 311" },
    ],
    neighborhoods: "Downtown, Hollywood, Venice, Silver Lake, the Valley and beyond",
  },
  {
    slug: "austin", name: "Austin", state: "TX", portal: "the City of Austin open data portal (Socrata)",
    sources: [
      { title: "311 service requests", desc: "Austin 311 complaints logged near the block.", src: "Austin 311" },
      { title: "Construction permits", desc: "Building and construction permits issued nearby.", src: "Austin permits" },
    ],
    neighborhoods: "Downtown, East Austin, Hyde Park, South Congress and beyond",
  },
  {
    slug: "boston", name: "Boston", state: "MA", portal: "Analyze Boston (CKAN)",
    sources: [
      { title: "311 service requests", desc: "Boston 311 cases near the block: potholes, sanitation, code and more.", src: "Boston 311" },
    ],
    neighborhoods: "Back Bay, Dorchester, Jamaica Plain, South Boston and beyond",
  },
  {
    slug: "seattle", name: "Seattle", state: "WA", portal: "the Seattle open data portal (Socrata)",
    sources: [
      { title: "Customer service requests", desc: "Seattle's 311-style service requests logged near the block.", src: "Seattle CSR" },
    ],
    neighborhoods: "Capitol Hill, Ballard, Fremont, the Central District and beyond",
  },
  {
    slug: "dallas", name: "Dallas", state: "TX", portal: "Dallas OpenData (Socrata)",
    sources: [
      { title: "311 service requests", desc: "Dallas 311 complaints logged near the block.", src: "Dallas 311" },
    ],
    neighborhoods: "Downtown, Oak Cliff, Deep Ellum, Uptown and beyond",
  },
  {
    slug: "san-francisco", name: "San Francisco", state: "CA", portal: "DataSF (Socrata)",
    sources: [
      { title: "311 service requests", desc: "SF 311 cases near the block: street and sidewalk, noise, graffiti and more.", src: "SF 311" },
    ],
    neighborhoods: "the Mission, SoMa, the Richmond, the Sunset and beyond",
  },
  {
    slug: "washington-dc", name: "Washington DC", state: "DC", portal: "DC's open data (ArcGIS)",
    sources: [
      { title: "311 service requests", desc: "DC 311 service requests logged near the block.", src: "DC 311" },
    ],
    neighborhoods: "Capitol Hill, Shaw, Georgetown, Petworth and beyond",
  },
  // --- Cities added in Phase 2 (Socrata, keyless; column names verified). ---
  {
    slug: "kansas-city", name: "Kansas City", state: "MO", portal: "Open Data KC (Socrata)",
    sources: [
      { title: "311 service requests", desc: "Kansas City's 311 call-center reported issues logged near the block.", src: "Kansas City 311" },
    ],
    neighborhoods: "the Crossroads, Westport, Brookside, the River Market and beyond",
  },
  {
    slug: "new-orleans", name: "New Orleans", state: "LA", portal: "data.nola.gov (Socrata)",
    sources: [
      { title: "311 service requests", desc: "New Orleans 311 calls logged near the block.", src: "New Orleans 311" },
    ],
    neighborhoods: "the French Quarter, Marigny, Uptown, Mid-City and beyond",
  },
];

// Guide articles. The article bodies are hand-authored at guides/<slug>/;
// this list drives the hub page and the sitemap.
const GUIDES = [
  {
    slug: "how-to-research-a-neighborhood-before-buying",
    title: "How to research a neighborhood before buying",
    blurb: "A step-by-step guide to reading a block's public record — 311, violations, permits and more — before you make an offer.",
  },
  {
    slug: "how-to-check-building-permits-on-a-property",
    title: "How to check building permits on a property",
    blurb: "Find out what's been built, renovated or demolished at an address — and how to spot unpermitted work — using public permit data.",
  },
  {
    slug: "questions-to-ask-before-buying-a-house",
    title: "Questions to ask before buying a house",
    blurb: "The questions that reveal what a listing won't — about the block, the building's history, and what the public record already shows.",
  },
];

// ---------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function head({ title, description, canonical, ogType = "article" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>

<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#05603A">
<meta name="color-scheme" content="light">
<link rel="canonical" href="${canonical}">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Agent Neighbor">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:alt" content="Agent Neighbor Street Context Index shown on a green highway guide sign.">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">

<link rel="icon" href="${FAVICON}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;700;900&family=Overpass+Mono:wght@400;600&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;700;900&family=Overpass+Mono:wght@400;600&display=swap"></noscript>

<link rel="stylesheet" href="/assets/site.css">`;
}

const header = () => `
<header class="top">
  <div class="shell top-in">
    <a class="brand" href="/">
      <span class="mark"><span>N</span></span>
      <span><b>Agent Neighbor</b><small>Street reports</small></span>
    </a>
    <nav class="nav">
      <a class="hide-sm" href="/#how">How it works</a>
      <a class="hide-sm" href="/#domains-info">What we read</a>
      <a class="hide-sm" href="/#pricing">Pricing</a>
      <a class="hide-sm" href="/guides/">Guides</a>
      <a class="btn btn-primary btn-sm" href="/#lookup">Look up an address</a>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer>
  <div class="shell">
    <div class="foot-grid">
      <div>
        <div class="brand" style="color:#fff">
          <span class="mark"><span>N</span></span>
          <span><b>Agent Neighbor</b><small style="color:#A9D6BE">Know the Vibe before you sign</small></span>
        </div>
      </div>
      <div class="foot-links">
        <a href="/#how">How it works</a>
        <a href="/#domains-info">What we read</a>
        <a href="/#pricing">Pricing</a>
        <a href="/guides/">Guides</a>
        <a href="/">Home</a>
      </div>
    </div>
    <p class="foot-note">
      Scores are built from public municipal records and are provided for informational purposes only. They are not an appraisal, an inspection, a safety guarantee, or advice about people. Always verify anything that matters with the original source and your own professionals.
    </p>
  </div>
</footer>
</body>
</html>`;

// ---------------------------------------------------------------------
// City page
// ---------------------------------------------------------------------
function cityPage(c) {
  const url = `${ORIGIN}/${c.slug}/`;
  const hasPermits = c.sources.some((s) => /permit/i.test(s.title));
  const hasViolations = c.sources.some((s) => /violation/i.test(s.title));
  const titleTail = hasPermits && hasViolations ? "311, Permits & Violations by Address"
    : hasPermits ? "311 & Permits by Address"
    : hasViolations ? "311 & Violations by Address"
    : "311 Records by Address";
  const title = `${c.name} Street Reports: ${titleTail} | Agent Neighbor`;
  // Full list (original case, for prose) and a compact phrase (for the <=160-char meta description).
  const feedList = c.sources.map((s) => s.title).join(", ").replace(/, ([^,]*)$/, " and $1");
  const descFeeds = hasPermits && hasViolations ? "311 complaints, code violations and permits"
    : hasPermits ? "311 complaints and permits"
    : hasViolations ? "311 complaints and violations"
    : "311 service requests";
  const description = `Look up any ${c.name} address and see its ${descFeeds} from the last 12 months — every record traced to its public source.`;

  const statCards = c.sources.map((s) => `
        <div class="stat">
          <b>${s.title}</b>
          <p>${s.desc}</p>
          <span class="src">${s.src}</span>
        </div>`).join("");

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: c.name, item: url },
      ] },
      { "@type": "Article", headline: `${c.name} Street Reports: ${titleTail.replace(/&/g, "and")}`,
        description: `How to look up ${feedList} for any ${c.name} address using the city's public open data.`,
        url, image: OG_IMAGE, publisher: { "@type": "Organization", name: "Agent Neighbor", url: `${ORIGIN}/` } },
      { "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: `How do I check ${c.name} 311 complaints for an address?`, acceptedAnswer: { "@type": "Answer", text: `Enter the address in Agent Neighbor. It reads ${c.name}'s public open-data feeds directly in your browser and shows the records logged near that block over the trailing twelve months, each with its date and a link to the original record.` } },
        { "@type": "Question", name: `Where does ${c.name} data come from?`, acceptedAnswer: { "@type": "Answer", text: `From ${c.portal}. The data is public, keyless, and read live — nothing is modeled or estimated.` } },
        { "@type": "Question", name: "How recent is the data?", acceptedAnswer: { "@type": "Answer", text: "A report covers the trailing twelve months and refreshes from the city's feed nightly. Cities publish on their own schedules, so a record filed today may take a day or two to appear." } },
      ] },
    ],
  };

  return `${head({ title, description, canonical: url })}

<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<a class="skip" href="#data">Skip to the address lookup</a>
${header()}
<main>
  <div class="shell">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span>${esc(c.name)}
    </nav>
  </div>

  <section class="page-hero">
    <div class="shell">
      <span class="eyebrow">${esc(c.name)}, ${esc(c.state)}</span>
      <h1>${esc(c.name)} street reports: <em>${esc(titleTail.toLowerCase())}</em>.</h1>
      <p class="sub">Before you sign on a ${esc(c.name)} block, read its public record. Agent Neighbor pulls ${feedList} straight from ${esc(c.portal.replace(/\s*\([^)]*\)/, ""))} — for any address, with every number traced to its source.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="/#lookup">Score a ${esc(c.name)} address</a>
        <a class="btn btn-ghost" href="#data">See what we read</a>
      </div>
      <div class="trust">
        <span class="chip">Public records only</span>
        <span class="chip">Keyless open data</span>
        <span class="chip">Every score is sourced</span>
      </div>
    </div>
  </section>

  <section id="data" class="band">
    <div class="shell">
      <div class="head">
        <span class="eyebrow">What we read in ${esc(c.name)}</span>
        <h2>Live city feeds, read in your browser.</h2>
        <p>These are the public feeds behind a ${esc(c.name)} report — all keyless, none stored by us.</p>
      </div>
      <div class="stat-grid">${statCards}
      </div>
    </div>
  </section>

  <section class="band alt">
    <div class="shell prose">
      <h2>How to check ${esc(c.name)} public records for an address</h2>
      <p class="lede">You research the house and inherit the street. A listing tells you about the property; the city's record tells you about the block around it.</p>
      <p>${esc(c.name)} publishes its civic data as open data through ${esc(c.portal)}. That means anyone can look up what has been reported near an address — no account, no API key. Agent Neighbor runs the query for you and reads it live in your browser.</p>
      <ol>
        <li>Open the <a href="/#lookup">address lookup</a> and type a ${esc(c.name)} address, or drop a pin on the map.</li>
        <li>The report reads the city's feeds for the block and pulls the trailing twelve months of records.</li>
        <li>You get one <strong>Street Context Index</strong> plus the individual records behind it — each with its date and a link to the original record, so you can verify anything that matters.</li>
      </ol>

      <h3>Neighborhoods this covers</h3>
      <p>The lookup works for any address inside the city — ${esc(c.neighborhoods)} — because it reads the same citywide feeds rather than a fixed list of neighborhoods.</p>

      <h2>Frequently asked</h2>
      <h3>How recent is the data?</h3>
      <p>Reports cover the trailing twelve months and refresh nightly from the city's feed. ${esc(c.name)} publishes on its own schedule, so a record filed this morning may take a day or two to appear.</p>
      <h3>Is this an official city tool?</h3>
      <p>No. Agent Neighbor is an independent product that reads ${esc(c.name)}'s public open data. Scores are for informational purposes only — not an appraisal, an inspection, or a safety guarantee. Always verify anything that matters with the original source.</p>
    </div>
  </section>

  <section class="band">
    <div class="shell">
      <div class="cta">
        <h2>Read a ${esc(c.name)} block before you commit.</h2>
        <p>One address, one explainable score, every record traced back to the city's own data.</p>
        <div class="hero-actions">
          <a class="btn btn-onsign" href="/#lookup">Score a ${esc(c.name)} address</a>
        </div>
      </div>
    </div>
  </section>

  <section class="band alt">
    <div class="shell">
      <div class="head">
        <span class="eyebrow">Keep reading</span>
        <h2>Related</h2>
      </div>
      <div class="related">
        <a href="/guides/how-to-research-a-neighborhood-before-buying/">
          <b>How to research a neighborhood before buying</b>
          <span>A step-by-step guide to reading a block's public record.</span>
        </a>
        <a href="/#how">
          <b>How Agent Neighbor works</b>
          <span>The six domains behind every Street Context Index.</span>
        </a>
        <a href="/guides/">
          <b>All guides</b>
          <span>Buyer and renter guides to reading a street.</span>
        </a>
      </div>
    </div>
  </section>
</main>
${footer()}
`;
}

// ---------------------------------------------------------------------
// Guides hub
// ---------------------------------------------------------------------
function guidesHub() {
  const url = `${ORIGIN}/guides/`;
  const title = "Guides: How to Read a Neighborhood's Public Record | Agent Neighbor";
  const description = "Practical guides to researching a street before you buy or rent — how to read 311 complaints, code violations, permits and more for any address.";
  const cards = GUIDES.map((g) => `
        <a href="/guides/${g.slug}/">
          <b>${esc(g.title)}</b>
          <span>${esc(g.blurb)}</span>
        </a>`).join("");
  const cityCards = CITIES.slice(0, 6).map((c) => `
        <a href="/${c.slug}/">
          <b>${esc(c.name)} street reports</b>
          <span>311 and civic records by address in ${esc(c.name)}.</span>
        </a>`).join("");

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: url },
      ] },
      { "@type": "CollectionPage", name: "Agent Neighbor Guides", description, url,
        publisher: { "@type": "Organization", name: "Agent Neighbor", url: `${ORIGIN}/` } },
    ],
  };

  return `${head({ title, description, canonical: url, ogType: "website" })}

<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<a class="skip" href="#guides">Skip to the guides</a>
${header()}
<main>
  <div class="shell">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span>Guides
    </nav>
  </div>

  <section class="page-hero">
    <div class="shell">
      <span class="eyebrow">Guides</span>
      <h1>How to read a <em>street's public record</em>.</h1>
      <p class="sub">The listing sells you the house. Nobody hands you the block. These guides show you how to research a neighborhood — 311 complaints, code violations, permits and more — before you sign.</p>
    </div>
  </section>

  <section id="guides" class="band">
    <div class="shell">
      <div class="head">
        <span class="eyebrow">Buyer &amp; renter guides</span>
        <h2>Start here</h2>
      </div>
      <div class="related">${cards}
      </div>
    </div>
  </section>

  <section class="band alt">
    <div class="shell">
      <div class="head">
        <span class="eyebrow">By city</span>
        <h2>Street reports in your city</h2>
      </div>
      <div class="related">${cityCards}
      </div>
    </div>
  </section>
</main>
${footer()}
`;
}

// ---------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------
function sitemap() {
  const urls = [
    { loc: `${ORIGIN}/`, priority: "1.0", freq: "weekly" },
    { loc: `${ORIGIN}/guides/`, priority: "0.7", freq: "monthly" },
    ...GUIDES.map((g) => ({ loc: `${ORIGIN}/guides/${g.slug}/`, priority: "0.7", freq: "monthly" })),
    ...CITIES.map((c) => ({ loc: `${ORIGIN}/${c.slug}/`, priority: "0.8", freq: "weekly" })),
  ];
  const body = urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ---------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------
function write(relPath, contents) {
  const full = resolve(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
  console.log("  wrote", relPath);
}

console.log("Generating Agent Neighbor pages…");
for (const c of CITIES) write(`${c.slug}/index.html`, cityPage(c));
write("guides/index.html", guidesHub());
write("sitemap.xml", sitemap());
console.log(`Done: ${CITIES.length} city pages + guides hub + sitemap (${GUIDES.length} guide${GUIDES.length === 1 ? "" : "s"}).`);
