#!/usr/bin/env node
/*
  Scrape Extreme Networks Wired Access (Switches) products via sitemap (no Puppeteer).
  Dependencies: fast-xml-parser (already in dependencies)
  Outputs:
    - data/scraped/extreme/wired-access-raw.json
    - data/scraped/extreme/wired-access-catalog.json
*/

const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const { XMLParser } = require('fast-xml-parser');

const SITEMAP_URL = 'https://www.extremenetworks.com/sitemap.xml';
const OUT_DIR = path.join(__dirname, '..', 'data', 'scraped', 'extreme');
const RAW_OUT = path.join(OUT_DIR, 'wired-access-raw.json');
const CATALOG_OUT = path.join(OUT_DIR, 'wired-access-catalog.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function uniq(arr) { return Array.from(new Set(arr)); }
function toAbsoluteUrl(href) {
  try { return new URL(href, 'https://www.extremenetworks.com').toString(); } catch { return href; }
}
function slugify(input) {
  return (input || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        res.resume();
        resolve(fetchText(redirectUrl));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
}

async function getAllSitemapUrls() {
  const parser = new XMLParser({ ignoreAttributes: false });
  const xml = await fetchText(SITEMAP_URL);
  const root = parser.parse(xml);

  // If sitemapindex: fetch ONLY nested .xml sitemaps (product-like) and aggregate their URLs
  if (root.sitemapindex && Array.isArray(root.sitemapindex.sitemap)) {
    let locs = root.sitemapindex.sitemap.map(s => s.loc).filter(Boolean);
    const sitemapFilter = (u) => /\.xml(\?|$)/i.test(u) && /product|products|switch|wired|catalog/i.test(u);
    const filteredLocs = locs.filter(sitemapFilter);
    locs = filteredLocs.slice(0, 30);
    console.log(`Sitemap index: ${filteredLocs.length} product-like .xml sitemaps. Fetching up to ${locs.length}.`);

    const urls = new Set();
    for (const loc of locs) {
      try {
        const xml2 = await fetchText(loc);
        const tree = parser.parse(xml2);
        const urlset = tree.urlset && Array.isArray(tree.urlset.url) ? tree.urlset.url : [];
        for (const u of urlset) {
          if (u.loc) urls.add(u.loc);
        }
        await sleep(150);
      } catch (e) {
        console.warn('Skipping sitemap due to error:', loc);
      }
    }
    return Array.from(urls);
  }

  // If urlset: just return the URLs directly (do NOT treat them as nested sitemaps)
  if (root.urlset && Array.isArray(root.urlset.url)) {
    const urls = root.urlset.url.map(u => u.loc).filter(Boolean);
    console.log(`Root is urlset. URLs found: ${urls.length}.`);
    return urls;
  }

  console.warn('Unknown sitemap format. Returning empty list.');
  return [];
}

function filterWiredAccessProductUrls(allUrls) {
  // Focus on Switches (wired access) under /products/switches/
  return uniq(
    allUrls
      .filter(u => /\/products\//.test(u))
      .filter(u => /\/products\/switches\//.test(u))
      .filter(u => !/\/(solutions|about-|partners|resources|learn|events|company|support)\//.test(u))
  );
}

function extractMeta(content, name, prop) {
  if (name) {
    const r = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
    const m = content.match(r); if (m) return m[1];
  }
  if (prop) {
    const r = new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
    const m = content.match(r); if (m) return m[1];
  }
  return null;
}

function extractTagText(content, tag) {
  const r = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
  const m = content.match(r);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractListsNearHeadings(content) {
  // Find headings containing Product Highlights/Benefits/Features and collect nearby list items
  const results = [];
  const headingRe = /<(h1|h2|h3|h4)[^>]*>([\s\S]*?)<\/\1>/gi;
  let hm;
  while ((hm = headingRe.exec(content)) !== null) {
    const txt = hm[2].replace(/<[^>]+>/g, ' ').toLowerCase();
    if (/product\s*highlights|benefits|features/.test(txt)) {
      // slice next 4000 chars and pick UL/OL lis
      const start = hm.index + hm[0].length;
      const slice = content.slice(start, start + 4000);
      const lis = Array.from(slice.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(m => m[1]);
      for (const li of lis) {
        const t = li.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (t) results.push(t);
      }
    }
  }
  return uniq(results).slice(0, 20);
}

function extractFirstListItems(content, max = 12) {
  const lis = Array.from(content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(m => m[1]);
  const items = lis.map(li => li.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  return uniq(items).slice(0, max);
}

function extractImage(content) {
  const og = extractMeta(content, null, 'og:image');
  if (og) return og;
  // Find first sitecorecontenthub image
  const m = content.match(/<img[^>]*src=["']([^"']+sitecorecontenthub\.cloud[^"']+)["'][^>]*>/i);
  if (m) return m[1];
  return null;
}

function extractDatasheet(content) {
  const a = content.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi) || [];
  for (const anchor of a) {
    const hrefM = anchor.match(/href=["']([^"']+)["']/i);
    const text = anchor.replace(/<[^>]+>/g, ' ').toLowerCase();
    const href = hrefM ? hrefM[1].toLowerCase() : '';
    if (/datasheet|data\s*sheet/.test(text) || (/sitecorecontenthub\.cloud/.test(href) && /\.pdf(\?|$)/.test(href))) {
      return hrefM ? hrefM[1] : null;
    }
  }
  // fallback: any PDF on sitecore
  const pdf = content.match(/href=["']([^"']+sitecorecontenthub\.cloud[^"']+\.pdf[^"']*)["']/i);
  return pdf ? pdf[1] : null;
}

async function scrapeProduct(url) {
  try {
    const html = await fetchText(url);
    const title = extractTagText(html, 'h1') || extractMeta(html, null, 'og:title');
    const metaDesc = extractMeta(html, 'description', null) || extractMeta(html, null, 'og:description');

    // fallback: first long paragraph
    let summary = metaDesc;
    if (!summary) {
      const p = extractTagText(html, 'p');
      summary = p && p.length > 80 ? p : null;
    }

    let highlights = extractListsNearHeadings(html);
    if (!highlights.length) highlights = extractFirstListItems(html, 12);

    const imageUrl = extractImage(html);
    const datasheetUrl = extractDatasheet(html);

    const normImage = imageUrl ? toAbsoluteUrl(imageUrl) : null;
    const normDS = datasheetUrl ? toAbsoluteUrl(datasheetUrl) : null;

    return { url, title, summary, highlights, imageUrl: normImage, datasheetUrl: normDS };
  } catch (e) {
    return { url, error: e.message };
  }
}

function toCatalogItem(prod, index = 0) {
  const safeTitle = prod.title || prod.url.split('/').filter(Boolean).pop() || 'product';
  const baseSlug = slugify(safeTitle.replace(/\bextreme(networks)?\b/ig, '').trim()) || slugify(prod.url);
  const id = `extreme-${baseSlug}`;
  const desc = prod.summary || 'Extreme Networks product.';
  const features = Array.isArray(prod.highlights) && prod.highlights.length ? prod.highlights : [];
  return {
    id,
    name: { en: safeTitle, es: safeTitle },
    description: { en: desc, es: desc },
    features: { en: features, es: features },
    categoryId: 'networking',
    vendorId: 'extreme',
    image: prod.imageUrl || '/products/placeholder-product.svg',
    order: index + 1,
    active: true,
  };
}

(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('Fetching sitemap...');
  const all = await getAllSitemapUrls();
  console.log(`Sitemap URLs: ${all.length}`);

  const productUrls = filterWiredAccessProductUrls(all);
  console.log(`Candidate wired access products: ${productUrls.length}`);

  const raw = [];
  let i = 0;
  for (const u of productUrls) {
    i++;
    console.log(`[${i}/${productUrls.length}] ${u}`);
    const p = await scrapeProduct(u);
    raw.push(p);
    await sleep(150);
  }

  await fs.writeFile(RAW_OUT, JSON.stringify(raw, null, 2), 'utf8');

  const valid = raw.filter(p => p && !p.error && p.imageUrl);
  const catalog = valid.map((p, idx) => toCatalogItem(p, idx));
  await fs.writeFile(CATALOG_OUT, JSON.stringify(catalog, null, 2), 'utf8');

  console.log('Done.');
  console.log('Raw ->', RAW_OUT);
  console.log('Catalog ->', CATALOG_OUT);
  console.log(`Kept ${catalog.length} with image. Dropped ${raw.length - catalog.length} missing image.`);
})();
