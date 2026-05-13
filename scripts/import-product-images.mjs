import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CATALOG_FILES = [
  "src/data/productCatalog.ts",
  "src/data/sourcedCatalogProducts.ts",
  "src/data/sourcedWizardProducts.ts",
  "src/data/sourcedWheelProducts.ts"
];
const OUT_FILE = "src/data/productImageOverrides.ts";
const REPORT_FILE = "catalog-product-image-report.json";
const CONCURRENCY = Number(process.env.PRODUCT_IMAGE_CONCURRENCY || 8);
const TIMEOUT_MS = Number(process.env.PRODUCT_IMAGE_TIMEOUT_MS || 14000);

function tsString(value) {
  return JSON.stringify(value);
}

function absoluteUrl(raw, base) {
  if (!raw || raw.startsWith("data:")) return "";
  try {
    return new URL(raw.replace(/&amp;/g, "&"), base).href;
  } catch {
    return "";
  }
}

function cleanHtml(value) {
  return value.replace(/\\u0026/g, "&").replace(/\\\//g, "/").trim();
}

function findMetaImage(html, pageUrl) {
  const metaPatterns = [
    { kind: "og:image", re: /<meta\s+[^>]*(?:property|name)=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["'][^>]*>/i },
    { kind: "og:image", re: /<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image(?::secure_url)?["'][^>]*>/i },
    { kind: "twitter:image", re: /<meta\s+[^>]*(?:property|name)=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["'][^>]*>/i },
    { kind: "twitter:image", re: /<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']twitter:image(?::src)?["'][^>]*>/i }
  ];
  for (const pattern of metaPatterns) {
    const match = html.match(pattern.re);
    const imageUrl = absoluteUrl(cleanHtml(match?.[1] || ""), pageUrl);
    if (imageUrl) return { imageUrl, kind: pattern.kind };
  }

  const jsonLdScripts = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of jsonLdScripts) {
    try {
      const parsed = JSON.parse(cleanHtml(script[1]));
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      const stack = [...nodes];
      while (stack.length) {
        const node = stack.shift();
        if (!node || typeof node !== "object") continue;
        const image = node.image;
        const first = Array.isArray(image) ? image[0] : image?.url || image;
        const imageUrl = absoluteUrl(typeof first === "string" ? first : "", pageUrl);
        if (imageUrl) return { imageUrl, kind: "json-ld" };
        Object.values(node).forEach((value) => {
          if (value && typeof value === "object") stack.push(value);
        });
      }
    } catch {
      // Ignore malformed JSON-LD and continue to image fallback.
    }
  }

  const imgMatches = [...html.matchAll(/<img\s+[^>]*(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/gi)];
  const preferred = imgMatches
    .map((match) => absoluteUrl(cleanHtml(match[1]), pageUrl))
    .filter(Boolean)
    .find((url) => /cdn|product|uploads|media|shop|catalog|wp-content/i.test(url) && /\.(?:png|jpe?g|webp)(?:[?#].*)?$/i.test(url));
  if (preferred) return { imageUrl: preferred, kind: "img" };

  return null;
}

async function fetchImageForSource(sourceUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(sourceUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "RC Drift Sync catalog image importer (+https://rcdriftsync.com)",
        accept: "text/html,application/xhtml+xml"
      }
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) return { sourceUrl, ok: false, status: response.status, reason: `HTTP ${response.status}` };
    if (!/html|xml/i.test(contentType)) return { sourceUrl, ok: false, status: response.status, reason: `Unsupported content type: ${contentType || "unknown"}` };
    const html = await response.text();
    const found = findMetaImage(html, response.url || sourceUrl);
    if (!found) return { sourceUrl, ok: false, status: response.status, reason: "No product image metadata found" };
    return { sourceUrl, ok: true, ...found };
  } catch (error) {
    return { sourceUrl, ok: false, reason: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function collectSourceUrls() {
  const urls = new Set();
  const counts = {};
  for (const file of CATALOG_FILES) {
    const fullPath = path.join(ROOT, file);
    const text = await fs.readFile(fullPath, "utf8");
    const matches = [...text.matchAll(/sourceUrl:\s*"([^"]+)"/g)].map((match) => match[1]);
    counts[file] = matches.length;
    matches.forEach((url) => urls.add(url));
  }
  return { urls: Array.from(urls).sort(), counts };
}

async function mapLimit(values, limit, task) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < values.length) {
      const current = values[index++];
      const result = await task(current);
      results.push(result);
      const done = results.length;
      if (done % 50 === 0 || done === values.length) {
        console.log(`Checked ${done}/${values.length}`);
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function writeOverrides(results, generatedAt) {
  const found = results.filter((result) => result.ok).sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));
  const entries = found.map((result) => {
    return `  ${tsString(result.sourceUrl)}: {
    imageUrl: ${tsString(result.imageUrl)},
    imageSourceUrl: ${tsString(result.sourceUrl)},
    imageSourceKind: ${tsString(result.kind)},
    imageLastCheckedAt: ${tsString(generatedAt)}
  }`;
  });
  return `export interface ProductImageOverride {
  imageUrl: string;
  imageSourceUrl: string;
  imageSourceKind: "og:image" | "twitter:image" | "json-ld" | "img";
  imageLastCheckedAt: string;
}

export const productImageOverridesGeneratedAt = ${tsString(generatedAt)};

export const productImageOverrides: Record<string, ProductImageOverride> = {
${entries.join(",\n")}
};
`;
}

const startedAt = new Date().toISOString();
const { urls, counts } = await collectSourceUrls();
console.log(`Found ${urls.length} unique source URLs.`);
const results = await mapLimit(urls, CONCURRENCY, fetchImageForSource);
const generated = writeOverrides(results, startedAt);
await fs.writeFile(path.join(ROOT, OUT_FILE), generated, "utf8");
const ok = results.filter((result) => result.ok);
const failed = results.filter((result) => !result.ok);
await fs.writeFile(
  path.join(ROOT, REPORT_FILE),
  JSON.stringify(
    {
      generatedAt: startedAt,
      sourceCounts: counts,
      uniqueSourceUrls: urls.length,
      imagesFound: ok.length,
      missingImages: failed.length,
      failuresByReason: failed.reduce((acc, result) => {
        acc[result.reason] = (acc[result.reason] || 0) + 1;
        return acc;
      }, {}),
      missing: failed
    },
    null,
    2
  ),
  "utf8"
);
console.log(`Images found: ${ok.length}`);
console.log(`Missing images: ${failed.length}`);
console.log(`Wrote ${OUT_FILE}`);
console.log(`Wrote ${REPORT_FILE}`);
