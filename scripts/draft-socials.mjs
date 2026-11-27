import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const AVATAR_SVG_PATH = path.resolve(__dirname, "../public/brandbite-avatar.svg");
const DRAFTS_MD_PATH = path.resolve(__dirname, "../social-drafts.md");
const CARDS_DIR = path.resolve(__dirname, "../social-cards");

function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text, maxCharsPerLine = 26, maxLines = 4) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length <= maxCharsPerLine) {
      current = (current + " " + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    const usedWords = lines.join(" ").split(/\s+/).filter(Boolean).length;
    const remaining = words.slice(usedWords).join(" ");
    lines.push(
      remaining.length > maxCharsPerLine + 4
        ? remaining.slice(0, maxCharsPerLine + 1).trimEnd() + "…"
        : remaining
    );
  }
  return lines;
}

function buildCardSvg({ kicker, brand, headline, category, footerRight }) {
  const headlineLines = wrapLines(headline, 25, 4);
  const startY = 390;
  const lineHeight = 86;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#181512"/>
      <stop offset="100%" stop-color="#27201b"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect x="44" y="44" width="992" height="992" rx="44" fill="none" stroke="#3d332b" stroke-width="4"/>

  <!-- Top Brand Pill -->
  <rect x="88" y="96" width="290" height="58" rx="29" fill="#c2410c"/>
  <text x="233" y="134" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="2" fill="#ffffff">${escapeXml(
    kicker.toUpperCase()
  )}</text>

  <!-- Chain / Brand Label -->
  <text x="88" y="255" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#fb923c">${escapeXml(
    brand
  )}</text>

  <!-- Wrapped Headline -->
  ${headlineLines
    .map(
      (line, idx) =>
        `<text x="88" y="${
          startY + idx * lineHeight
        }" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="900" fill="#faf8f5">${escapeXml(
          line
        )}</text>`
    )
    .join("\n  ")}

  <!-- Category Tag -->
  <rect x="88" y="790" width="440" height="64" rx="18" fill="#2c241e" stroke="#4a4038" stroke-width="2"/>
  <text x="118" y="832" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#d6cfc7">${escapeXml(
    category
  )}</text>

  <!-- Bottom Masthead Bar -->
  <line x1="88" y1="904" x2="992" y2="904" stroke="#3d332b" stroke-width="3"/>
  <text x="88" y="968" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="900" fill="#ffffff">BRAND<tspan fill="#f97316">BITE</tspan></text>
  <text x="992" y="966" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#b8afa6">${escapeXml(
    footerRight || "eatbrandbite.com"
  )}</text>
</svg>`;
}

function clampBlueskyPost(text, link) {
  const suffix = `\n\n${link}`;
  const budget = 295 - suffix.length;
  const trimmed =
    text.length <= budget ? text : text.slice(0, budget - 1).trimEnd() + "…";
  return `${trimmed}${suffix}`;
}

async function generateSocialDrafts() {
  const raw = await fs.readFile(FEED_PATH, "utf8");
  const avatarSvg = await fs.readFile(AVATAR_SVG_PATH, "utf8").catch(() => "");
  const feed = JSON.parse(raw);
  const items = feed.items || [];

  const usedIds = new Set();
  const pick = (predicate) => {
    const found = items.find((i) => !usedIds.has(i.id) && predicate(i));
    if (found) usedIds.add(found.id);
    return found || null;
  };

  const ltoLead = pick((i) => i.type === "Limited-Time Offer") || pick(() => true);
  const snackPick =
    pick(
      (i) =>
        i.sourceId === "impulsivebuy" ||
        i.sourceId === "brandeating" ||
        i.category === "Cookies & Sweets" ||
        i.category === "Chips & Crisps"
    ) || pick(() => true);
  const dealPick = pick((i) => i.type === "Deal") || pick(() => true);
  const midweekPick = pick((i) => i.brandSlug !== "industry-wide") || pick(() => true);

  const selected = [
    {
      slot: "Monday — New Menu Drop Alert",
      kicker: "New Menu Drop",
      hook: "Worth a drive-thru detour or pass?",
      item: ltoLead,
    },
    {
      slot: "Wednesday — Snack & Shelf Spotlight",
      kicker: "Snack Sighting",
      hook: "Spotted on the wire — grabbing a bag or skipping?",
      item: snackPick,
    },
    {
      slot: "Thursday — Deal / Value Watch",
      kicker: "Deal Alert",
      hook: "Solid value play heading into the weekend.",
      item: dealPick,
    },
    {
      slot: "Friday — Weekend Crave Radar",
      kicker: "Weekend Radar",
      hook: "Plus full weekly roundup live on The Weekly Bite!",
      item: midweekPick,
    },
  ].filter((entry) => Boolean(entry.item));

  await fs.mkdir(CARDS_DIR, { recursive: true });

  const cardEntries = [];
  let md = `# BrandBite Buffer Social Queue Drafts\n\n`;
  md += `*Generated ${new Date().toLocaleString("en-US")} from ${items.length} live dispatches.*\n`;
  md += `*Open \`social-cards/index.html\` in your browser to download crisp **1080×1080 PNG** graphics (plus your **1024×1024 Profile Avatar PNG**) in one click for Buffer / Instagram!*\n\n---\n\n`;

  for (let i = 0; i < selected.length; i++) {
    const { slot, kicker, hook, item } = selected[i];
    const link =
      item.brandSlug && item.brandSlug !== "industry-wide"
        ? `https://eatbrandbite.com/brands/${item.brandSlug}`
        : "https://eatbrandbite.com";

    const bskyThreadsCopy = clampBlueskyPost(
      `🍔 ${item.brand}: ${item.title}\n\n${hook}`,
      link
    );

    const igCaption = [
      `${item.brand}: ${item.title} 👀`,
      "",
      item.excerpt,
      "",
      `${hook} Track all 87 fast-food chains & snack brands on eatbrandbite.com (link in bio).`,
      "",
      `#fastfood #foodnews #limitedtimeoffer #snacks #eatbrandbite #${item.brand
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}`,
    ].join("\n");

    const svg = buildCardSvg({
      kicker,
      brand: item.brand,
      headline: item.title,
      category: `${item.category} • ${item.type}`,
      footerRight: "@eatbrandbite",
    });

    const filename = `card-${i + 1}-${item.brandSlug || "drop"}.svg`;
    await fs.writeFile(path.join(CARDS_DIR, filename), svg, "utf8");
    cardEntries.push({
      slot,
      filename,
      pngName: filename.replace(/\.svg$/, ".png"),
      svg,
      bskyThreadsCopy,
      igCaption,
    });

    md += `## ${i + 1}. ${slot}\n\n`;
    md += `**Graphic Card:** \`social-cards/${filename}\` *(1-click PNG export in \`social-cards/index.html\`)*\n\n`;
    md += `### Bluesky & Threads Copy (<= 300 chars)\n\`\`\`text\n${bskyThreadsCopy}\n\`\`\`\n\n`;
    md += `### Instagram Caption\n\`\`\`text\n${igCaption}\n\`\`\`\n\n---\n\n`;
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>BrandBite Social Cards &amp; PNG Exporter</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #12100e; color: #f5f2ed; margin: 0; padding: 32px; }
    h1 { margin-top: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; margin-top: 24px; }
    .panel { background: #1c1916; border: 1px solid #332c26; border-radius: 16px; padding: 20px; }
    .preview svg { width: 100%; height: auto; border-radius: 12px; display: block; }
    button { background: #c2410c; color: #fff; border: 0; border-radius: 10px; padding: 10px 16px; font-weight: 800; cursor: pointer; margin-top: 12px; }
    button:hover { background: #9a3412; }
    pre { background: #12100e; border: 1px solid #332c26; border-radius: 10px; padding: 12px; white-space: pre-wrap; font-size: 12px; color: #d6cfc7; }
  </style>
</head>
<body>
  <h1>BrandBite Buffer Studio — 1-Click PNG Exporter</h1>
  <p>Click any button below to download a crisp rasterized <strong>PNG</strong> ready for Instagram, Threads, Bluesky, and Buffer.</p>

  ${
    avatarSvg
      ? `<div class="panel" style="max-width: 360px; margin-bottom: 28px;">
          <h3>Profile Avatar (1024×1024 PNG)</h3>
          <div class="preview" id="avatar-holder" style="max-width: 180px;">${avatarSvg}</div>
          <button onclick="exportSvg('avatar-holder', 1024, 'brandbite-avatar-1024.png')">Download 1024×1024 Avatar PNG</button>
        </div>`
      : ""
  }

  <div class="grid">
    ${cardEntries
      .map(
        (c, idx) => `
      <div class="panel">
        <h3>${escapeXml(c.slot)}</h3>
        <div class="preview" id="card-${idx}">${c.svg}</div>
        <button onclick="exportSvg('card-${idx}', 1080, '${c.pngName}')">Download 1080×1080 PNG</button>
        <h4>Bluesky / Threads</h4>
        <pre>${escapeXml(c.bskyThreadsCopy)}</pre>
        <h4>Instagram Caption</h4>
        <pre>${escapeXml(c.igCaption)}</pre>
      </div>`
      )
      .join("\n")}
  </div>

  <script>
    function exportSvg(containerId, size, filename) {
      const svgEl = document.querySelector('#' + containerId + ' svg');
      const xml = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(pngBlob);
          a.download = filename;
          a.click();
        }, 'image/png');
      };
      img.src = url;
    }
  </script>
</body>
</html>`;

  await fs.writeFile(DRAFTS_MD_PATH, md, "utf8");
  await fs.writeFile(path.join(CARDS_DIR, "index.html"), html, "utf8");

  console.log(`✅ Drafted ${cardEntries.length} Buffer posts -> ${DRAFTS_MD_PATH}`);
  console.log(`🖼️  1-Click PNG studio (cards + 1024px profile avatar) -> ${path.join(CARDS_DIR, "index.html")}`);
}

generateSocialDrafts().catch((err) => {
  console.error("Failed to draft socials:", err);
  process.exit(1);
});
