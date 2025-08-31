#!/usr/bin/env node
/*
  Scrape Extreme Networks Wired Access product listings (2 pages) and extract product details.
  Outputs:
  - data/scraped/extreme/wired-access-raw.json
  - data/scraped/extreme/wired-access-catalog.json (compatible with data/catalog/products.json schema)

  Notes:
  - Focus on reliable product image URL (og:image or sitecorecontenthub.cloud <img>).
  - Datasheet URL detection is best-effort (link text contains 'datasheet' or PDF under content hub domain).
*/

const fs = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer');

const LIST_URLS = [
  'https://www.extremenetworks.com/products#f-solutiontitle=Wired%20Access&cq=%40z95xtemplatename%3D%22Product%20Detail%20Page%22%20OR%20%40includeinproductlisting%3D1&numberOfResults=36',
  'https://www.extremenetworks.com/products#f-solutiontitle=Wired%20Access&cq=%40z95xtemplatename%3D%22Product%20Detail%20Page%22%20OR%20%40includeinproductlisting%3D1&firstResult=36&numberOfResults=36'
];

const OUT_DIR = path.join(__dirname, '..', 'data', 'scraped', 'extreme');
const RAW_OUT = path.join(OUT_DIR, 'wired-access-raw.json');
const CATALOG_OUT = path.join(OUT_DIR, 'wired-access-catalog.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function uniq(arr) { return Array.from(new Set(arr)); }
function toAbsoluteUrl(href) {
  try {
    return new URL(href, 'https://www.extremenetworks.com').toString();
  } catch {
    return href;
  }
}
function slugify(input) {
  return (input || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function getProductLinks(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  // Give dynamic listing time to render (Coveo)
  await sleep(3000);

  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const hrefs = anchors.map(a => a.href || a.getAttribute('href'));
    const isProd = (h) => {
      if (!h) return false;
      try { h = new URL(h, location.origin).toString(); } catch {}
      if (!/\/products\//.test(h)) return false;
      // Exclude obvious non-product areas
      const excludes = [
        '/solutions/', '/about-', '/partners', '/resources', '/learn', '/events', '/company', '/support', '/platform-one', '/platform-one', '/platform-one%27', '/industry-', '/extremeconnect'
      ];
      if (excludes.some(x => h.includes(x))) return false;
      // Heuristic: keep detail pages (longer paths) and avoid pure category roots ending with '/products'
      return true;
    };
    return hrefs.filter(isProd);
  });

  // Normalize and filter duplicates
  const normalized = uniq(links.map(toAbsoluteUrl));
  return normalized;
}

async function scrapeProduct(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle0', timeout: 120000 });
    await sleep(1500);

    const data = await page.evaluate(() => {
      const pick = (sel) => document.querySelector(sel);
      const pickAll = (sel) => Array.from(document.querySelectorAll(sel));

      const getMeta = (name, prop) => {
        if (name) return document.querySelector(`meta[name="${name}"]`)?.content || null;
        if (prop) return document.querySelector(`meta[property="${prop}"]`)?.content || null;
        return null;
      };

      const ogTitle = getMeta(null, 'og:title');
      const titleH1 = pick('h1')?.textContent?.trim() || null;
      const title = titleH1 || ogTitle || null;

      const metaDesc = getMeta('description') || getMeta(null, 'og:description');

      // Fallback description: first long paragraph
      let paragraph = null;
      if (!metaDesc) {
        const ps = pickAll('p').map(p => (p.textContent || '').trim()).filter(t => t.length > 120);
        paragraph = ps[0] || null;
      }

      // Common patterns to exclude from features
      const EXCLUDED_PATTERNS = [
        /^resources?$/i,
        /^related\s+(products?|items?|links?)$/i,
        /^see\s+also$/i,
        /^downloads?$/i,
        /^documents?$/i,
        /^specifications?$/i,
        /^contact\s+(us|sales|support)$/i,
        /^where\s+to\s+buy/i,
        /^request\s+info/i,
        /^get\s+started/i,
        /^learn\s+more/i,
        /^additional\s+information/i,
        /^\s*(?:\d+\s*[-–]\s*)?(?:[A-Z][A-Z\s-]*[A-Z]|[A-Z]{2,})(?:\s*\d+)?\s*$/, // All-caps or title-case headings
        /^[\s\d\W]+$/, // No text, just symbols/numbers
        /^\s*$/, // Empty or whitespace only
      ];

      function cleanFeatureText(text) {
        if (!text) return '';
        return text
          .replace(/<[^>]+>/g, ' ') // Remove HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/^[\s\d.\-•*]+\s*/, '') // Remove leading bullets/numbers
          .trim();
      }

      function isFeatureValid(feature) {
        if (!feature || feature.length < 10) return false; // Too short to be meaningful
        if (feature.length > 200) return false; // Too long, probably not a feature
        
        // Check against exclusion patterns
        return !EXCLUDED_PATTERNS.some(pattern => pattern.test(feature));
      }

      // Highlights/Benefits extraction
      function textFromList(root) {
        if (!root) return [];
        const lis = Array.from(root.querySelectorAll('li'));
        return lis
          .map(li => cleanFeatureText(li.textContent))
          .filter(isFeatureValid);
      }

      let highlights = [];
      // Try to locate sections by headings
      const headers = pickAll('h2, h3, h4');
      for (const h of headers) {
        const txt = (h.textContent || '').toLowerCase();
        if (/(product\s*highlights|benefits|features)/i.test(txt)) {
          // try sibling list
          let sectionLists = [];
          // next sibling that contains a UL/OL
          let el = h.nextElementSibling;
          let steps = 0;
          while (el && steps < 6 && sectionLists.length === 0) {
            sectionLists = Array.from(el.querySelectorAll('ul, ol'));
            el = el.nextElementSibling;
            steps++;
          }
          for (const list of sectionLists) {
            highlights.push(...textFromList(list));
          }
        }
      }
      if (highlights.length === 0) {
        // generic fallback: pick first UL with enough items
        const anyList = pick('ul, ol');
        if (anyList) highlights = textFromList(anyList);
      }
      // Deduplicate and limit to 15 most relevant features
      highlights = Array.from(new Set(highlights)).slice(0, 15);

      // Image URL: prefer og:image, else first sitecore content hub image
      const ogImage = getMeta(null, 'og:image');
      let imageUrl = ogImage || null;
      if (!imageUrl) {
        const img = pickAll('img').map(img => img.getAttribute('src') || '').find(src => src.includes('sitecorecontenthub.cloud') && src.includes('/content/'));
        if (img) imageUrl = img;
      }

      // Datasheet URL: look for anchors with text or href including datasheet or a PDF on content hub
      const dsAnchor = pickAll('a[href]').find(a => {
        const t = (a.textContent || '').toLowerCase();
        const h = (a.getAttribute('href') || '').toLowerCase();
        return /datasheet|data\s*sheet/.test(t) || /datasheet|data\s*sheet/.test(h) || (/sitecorecontenthub\.cloud/.test(h) && /\.pdf(\?|$)/.test(h));
      });
      const datasheetHref = dsAnchor ? dsAnchor.getAttribute('href') : null;

      return {
        url: location.href,
        title,
        summary: metaDesc || paragraph || null,
        highlights,
        imageUrl: imageUrl || null,
        datasheetUrl: datasheetHref || null,
      };
    });

    // Normalize URLs absolute
    if (data && data.imageUrl) data.imageUrl = toAbsoluteUrl(data.imageUrl);
    if (data && data.datasheetUrl) data.datasheetUrl = toAbsoluteUrl(data.datasheetUrl);

    return data;
  } catch (err) {
    console.error('Error scraping product', productUrl, err.message);
    return { url: productUrl, error: err.message };
  }
}

function toCatalogItem(prod, index = 0) {
  const safeTitle = prod.title || prod.url.split('/').filter(Boolean).pop() || 'product';
  const baseSlug = slugify(safeTitle.replace(/\bextreme(networks)?\b/ig, '').trim()) || slugify(prod.url);
  const id = `extreme-${baseSlug}`;

  // Fallbacks
  const desc = prod.summary || 'Extreme Networks product.';
  const features = Array.isArray(prod.highlights) && prod.highlights.length ? prod.highlights : [];

  return {
    id,
    name: {
      en: safeTitle,
      es: safeTitle,
    },
    description: {
      en: desc,
      es: desc,
    },
    features: {
      en: features,
      es: features,
    },
    categoryId: 'networking',
    vendorId: 'extreme',
    image: prod.imageUrl || '/products/placeholder-product.svg',
    datasheet: prod.datasheetUrl || null,
    order: index + 1,
    active: true,
  };
}

(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36');
  page.setDefaultTimeout(120000);

  const allLinks = new Set();
  for (const listUrl of LIST_URLS) {
    console.log('Collecting product links from:', listUrl);
    const links = await getProductLinks(page, listUrl);
    console.log(`Found ${links.length} candidate links`);
    links.forEach(l => allLinks.add(l));
  }
  const productLinks = Array.from(allLinks)
    .filter(u => /\/products\//.test(u))
    .filter(u => !/[#?]category|\/solutions\//i.test(u));

  console.log(`Total unique product links: ${productLinks.length}`);

  const raw = [];
  let i = 0;
  for (const url of productLinks) {
    i++;
    console.log(`[${i}/${productLinks.length}] Scraping:`, url);
    const prod = await scrapeProduct(page, url);
    raw.push(prod);
  }

  await browser.close();

  // Save raw
  await fs.writeFile(RAW_OUT, JSON.stringify(raw, null, 2), 'utf8');

  // Filter valid items (must have image url to honor the requirement)
  const valid = raw.filter(p => p && !p.error && p.imageUrl);
  const catalog = valid.map((p, idx) => toCatalogItem(p, idx));
  await fs.writeFile(CATALOG_OUT, JSON.stringify(catalog, null, 2), 'utf8');

  const missingImg = raw.filter(p => !p.error && !p.imageUrl).length;
  console.log('Done.');
  console.log('Raw saved to:', RAW_OUT);
  console.log('Catalog saved to:', CATALOG_OUT);
  console.log(`Products with missing image: ${missingImg}`);
})();
