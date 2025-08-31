#!/usr/bin/env node
/**
 * Scrape Extreme Networks Wi‑Fi Access Points catalog and save as JSON compatible with bulk-insert-products.js
 *
 * Usage:
 *  node scripts/scrape-extreme-aps.js [--out=path/to/output.json] [--limit=20]
 *
 * Output item schema (per bulk-insert-products.js expectations):
 *  {
 *    id: string, // e.g., "extreme-ap4000"
 *    name: { en: string, es: string },
 *    description: { en: string, es: string },
 *    features: { en: string[], es: string[] },
 *    categoryId: "networking",
 *    vendorId: "extreme",
 *    image?: string, // external image URL
 *    datasheet?: string, // external datasheet URL (PDF)
 *    order?: number,
 *    active?: boolean
 *  }
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DEFAULT_URL = 'https://www.extremenetworks.com/products#f-productcategorytitle=Wi-Fi%20Access%20Points';

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

async function autoScroll(page) {
  // Attempt to trigger lazy loading of all items
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight - 100) {
          clearInterval(timer);
          resolve();
        }
      }, 250);
    });
  });
}

async function dismissCookieBanners(page) {
  // Try to dismiss common cookie consent overlays
  try {
    await page.evaluate(() => {
      const clickSafely = (el) => {
        try { el.click(); return true; } catch (_) { return false; }
      };

      // Common selectors (OneTrust etc.)
      const candidates = [
        document.querySelector('#onetrust-accept-btn-handler'),
        document.querySelector('button#onetrust-accept-btn-handler'),
        document.querySelector('button[aria-label*="accept" i]'),
      ].filter(Boolean);

      // Fallback: scan buttons/links by text
      const byText = Array.from(document.querySelectorAll('button, [role="button"], a')).filter((el) =>
        /accept|agree|got it|allow all|accept all/i.test(el.textContent || '')
      );
      candidates.push(...byText);

      for (const el of candidates) {
        if (clickSafely(el)) break;
      }

      // Hide overlays if still present
      const overlays = Array.from(document.querySelectorAll('[id*="onetrust" i], [class*="onetrust" i], [class*="cookie" i], [id*="cookie" i]'));
      overlays.forEach((el) => {
        try { el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); } catch (_) {}
      });
    });
  } catch (_) {
    // ignore errors
  }
}

async function extractCatalogLinks(page) {
  // Extract product links from the page and all frames, including shadow DOM and data-* hrefs
  const collectFromFrame = async (frame) => {
    try {
      return await frame.evaluate(() => {
        const results = [];
        const seen = new Set();

        const pushUrl = (url, nameHint) => {
          try {
            if (!url) return;
            const abs = new URL(url, location.origin).toString();
            if (!/\/products\//.test(abs)) return;
            if (/\/products\/?$/.test(abs)) return;
            if (abs.includes('#')) return;
            const u = new URL(abs);
            const p = u.pathname || '';
            if (!p.includes('/products/wi-fi-access-points/')) return;
            const slug = (p.split('/').filter(Boolean).pop() || '').toLowerCase();
            if (!/^ap/.test(slug)) return;
            let name = (nameHint || '').replace(/\s+/g, ' ').trim();
            if (!name) name = slug.replace(/-/g, ' ').toUpperCase();
            if (seen.has(abs)) return;
            seen.add(abs);
            results.push({ name, href: abs });
          } catch (_) { /* ignore */ }
        };

        const pushAnchor = (a) => pushUrl(a.getAttribute('href') || a.href || '', a.textContent || '');

        const collectFromRoot = (root) => {
          const as = Array.from(root.querySelectorAll ? root.querySelectorAll('a') : []);
          as.forEach(pushAnchor);

          // Also look for data-* attributes where links may be stored
          const attrCandidates = ['data-href', 'data-url', 'data-uri', 'data-click-uri', 'data-cq-href', 'href'];
          const allEls = Array.from(root.querySelectorAll ? root.querySelectorAll('*') : []);
          for (const el of allEls) {
            for (const attr of attrCandidates) {
              const v = el.getAttribute ? el.getAttribute(attr) : null;
              if (v && /\/products\//.test(v)) {
                const txt = (el.textContent || '').trim();
                pushUrl(v, txt);
              }
            }
          }

          // Walk DOM to discover shadow roots and collect within
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
          let node;
          while ((node = walker.nextNode())) {
            if (node.shadowRoot) {
              const innerAs = Array.from(node.shadowRoot.querySelectorAll('a'));
              innerAs.forEach(pushAnchor);
              const innerEls = Array.from(node.shadowRoot.querySelectorAll('*'));
              for (const el of innerEls) {
                for (const attr of ['data-href', 'data-url', 'data-uri', 'data-click-uri', 'data-cq-href', 'href']) {
                  const v = el.getAttribute ? el.getAttribute(attr) : null;
                  if (v && /\/products\//.test(v)) pushUrl(v, el.textContent || '');
                }
              }
            }
          }
        };

        collectFromRoot(document);
        return results;
      });
    } catch (_) {
      return [];
    }
  };

  const frames = page.frames();
  const batches = await Promise.all(frames.map((f) => collectFromFrame(f)));
  const anchors = batches.flat();
  const unique = uniqBy(anchors, (x) => x.href);
  return unique.map((u) => ({ ...u, name: u.name.replace(/\s+/g, ' ') }));
}

async function extractProductDetail(page, url, fallbackName) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  // Some pages may have sections that load after a bit
  await new Promise((r) => setTimeout(r, 1200));

  const data = await page.evaluate(() => {
    const pick = (sel, attr = 'text') => {
      const el = document.querySelector(sel);
      if (!el) return null;
      if (attr === 'text') return (el.textContent || '').trim();
      return el.getAttribute(attr) || el[attr] || null;
    };

    const meta = (prop, nameAttr = 'property') => {
      const m = document.querySelector(`meta[${nameAttr}="${prop}"]`);
      return m?.content || null;
    };

    const textClean = (t) => (t || '').replace(/\s+/g, ' ').trim();
    const isNoise = (t) => /Extreme Platform ONE|Products & Solutions|Industry Solutions|Back to Menu|IDC: The Platform Era Has Arrived|Why Extreme|Public Cloud vs Private Cloud/i.test(t || '');

    const title = meta('og:title') || pick('h1') || pick('title');

    // Prefer meta description if good; else derive from main/article container
    const badDesc = (txt) => {
      const s = textClean(txt || '');
      if (!s) return true;
      if (isNoise(s)) return true;
      if (/^\*+\s*/.test(s)) return true; // starts with asterisks/notes
      if (/^Modes?\s+\d|available in a future software release/i.test(s)) return true;
      if (/cookie|subscribe|newsletter|privacy|terms/i.test(s)) return true;
      if (s.length < 60) return true;
      return false;
    };

    let description = meta('description', 'name') || meta('og:description') || '';
    if (badDesc(description)) {
      const containers = [
        document.querySelector('main'),
        document.querySelector('[role="main"]'),
        document.querySelector('article'),
        ...Array.from(document.querySelectorAll('.c-richtext, .component-rich-text, .product-description, .c-content')),
      ].filter(Boolean);
      outer: for (const root of containers) {
        const ps = Array.from(root.querySelectorAll('p'));
        for (const p of ps) {
          const txt = textClean(p.textContent || '');
          if (txt.length >= 60 && txt.length <= 600 && !isNoise(txt) && !badDesc(txt)) {
            description = txt;
            break outer;
          }
        }
      }
      // Fallback: first paragraph after H1
      if (badDesc(description)) {
        const h1 = document.querySelector('h1');
        const p = h1 ? h1.nextElementSibling : null;
        const txt = p ? textClean(p.textContent || '') : '';
        if (txt && !badDesc(txt)) description = txt;
      }
    }

    const image = (() => {
      const goodSrc = (src) => {
        if (!src) return false;
        const s = String(src);
        if (/flags\//i.test(s)) return false; // avoid country flag icons
        if (/logo|icon|sprite|placeholder/i.test(s)) return false;
        return /sitecorecontenthub|\.(png|jpe?g|webp)(\?|$)/i.test(s);
      };

      const bestFromImg = (img) => {
        if (!img) return null;
        // Prefer srcset largest candidate
        const srcset = img.getAttribute('srcset');
        if (srcset) {
          const parts = srcset.split(',').map((p) => p.trim()).map((p) => {
            const m = p.match(/\s+(\d+)[wx]$/);
            return { url: p.replace(/\s+\d+[wx]$/, ''), size: m ? parseInt(m[1], 10) : 0 };
          });
          const sorted = parts.filter((x) => goodSrc(x.url)).sort((a, b) => b.size - a.size);
          if (sorted.length) return sorted[0].url;
        }
        const cand = img.getAttribute('src') || img.currentSrc || '';
        return goodSrc(cand) ? cand : null;
      };

      // 1) Prefer gallery images
      const galleryImgs = Array.from(document.querySelectorAll('.photo-gallery__item img, .photo-gallery img, .c-gallery img'));
      for (const gi of galleryImgs) {
        const src = bestFromImg(gi);
        if (src) return src;
      }

      // 2) Then hero or product image containers
      const heroImg = document.querySelector('.c-hero img, .hero img, figure img, .c-image img');
      const heroSrc = bestFromImg(heroImg);
      if (heroSrc) return heroSrc;

      // 3) Then og:image meta
      const og = (document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="og:image"]'))?.content || null;
      if (goodSrc(og)) return og;

      // 4) Fallback: first good image on page
      const any = Array.from(document.querySelectorAll('img'))
        .map((img) => bestFromImg(img))
        .filter((src) => goodSrc(src));
      return any[0] || null;
    })();

    // Find datasheet link: prefer anchors with text containing 'datasheet'; fallback to any PDF link
    let datasheet = null;
    const anchors = Array.from(document.querySelectorAll('a'));
    const dsText = anchors.find((a) => /datasheet/i.test(a.textContent || ''));
    if (dsText && dsText.href) {
      datasheet = dsText.href;
    }
    if (!datasheet) {
      const pdf = anchors.find((a) => /\.pdf($|\?)/i.test(a.href || ''));
      if (pdf && pdf.href) datasheet = pdf.href;
    }

    // Collect features: target lists under headings containing Features/Benefits/Highlights
    const features = [];
    const pushFeature = (txt) => {
      const clean = textClean(txt);
      if (!clean) return;
      if (isNoise(clean)) return;
      if (clean.length < 4) return;
      // filter marketing fluff
      if (/integrated experience|automation|simplified licensing|AI driven|workflows|inventory management|subscribe|newsletter|privacy|terms/i.test(clean)) return;
      if (!features.includes(clean)) features.push(clean);
    };

    const headingSel = 'h2, h3, h4';
    const headings = Array.from(document.querySelectorAll(headingSel))
      .filter((h) => /features|benefits|highlights|key features/i.test(h.textContent || ''))
      .slice(0, 3);
    for (const h of headings) {
      const section = h.closest('section, div, article') || h.parentElement;
      if (!section) continue;
      const lists = Array.from(section.querySelectorAll('ul, ol')).slice(0, 4);
      for (const ul of lists) {
        for (const li of Array.from(ul.querySelectorAll('li'))) pushFeature(li.textContent || '');
      }
      if (features.length >= 30) break;
    }

    // Fallback: lists under likely rich-text/product content containers
    if (features.length < 6) {
      const blocks = Array.from(document.querySelectorAll('.c-richtext, .component-rich-text, article, main, [role="main"]'));
      for (const b of blocks) {
        const lists = Array.from(b.querySelectorAll('ul, ol')).slice(0, 2);
        for (const ul of lists) {
          for (const li of Array.from(ul.querySelectorAll('li'))) pushFeature(li.textContent || '');
        }
        if (features.length >= 12) break;
      }
    }

    return { title, description, image, datasheet, features };
  });

  const nameEn = (data.title || fallbackName || '').trim();
  const descEn = (data.description || 'Extreme Networks product.').trim();
  const featuresEn = Array.isArray(data.features) ? data.features.filter(Boolean) : [];

  // Ensure image is present; some pages might not have og:image
  const imageUrl = data.image || null;

  return {
    nameEn,
    descEn,
    imageUrl,
    datasheetUrl: data.datasheet || null,
    featuresEn,
  };
}

async function extractCategoryLinks(page) {
  // Extract non-product category/subsection links under Wi‑Fi APs
  const cats = await page.evaluate(() => {
    const out = [];
    const seen = new Set();
    const push = (href) => {
      try {
        if (!href) return;
        const abs = new URL(href, location.origin).toString();
        const u = new URL(abs);
        const p = u.pathname || '';
        if (!p.includes('/products/wi-fi-access-points/')) return;
        const slug = (p.split('/').filter(Boolean).pop() || '').toLowerCase();
        if (/^ap/.test(slug)) return; // skip product pages
        if (seen.has(abs)) return;
        seen.add(abs);
        out.push(abs);
      } catch (_) {}
    };
    const as = Array.from(document.querySelectorAll('a'));
    as.forEach((a) => push(a.getAttribute('href') || a.href || ''));
    // include shadow roots
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        const innerAs = Array.from(node.shadowRoot.querySelectorAll('a'));
        innerAs.forEach((a) => push(a.getAttribute('href') || a.href || ''));
      }
    }
    return out;
  });
  return cats;
}

async function main() {
  const args = process.argv.slice(2);
  const outArg = args.find((a) => a.startsWith('--out='));
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const urlsArg = args.find((a) => a.startsWith('--urls='));
  const urlsFileArg = args.find((a) => a.startsWith('--urls-file='));
  const catalogArg = args.find((a) => a.startsWith('--catalog='));

  const outPath = outArg
    ? path.resolve(process.cwd(), outArg.split('=')[1])
    : path.join(process.cwd(), 'data', 'scraped', 'extreme', 'wifi-access-catalog.json');
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const catalogUrl = catalogArg ? catalogArg.split('=')[1] : DEFAULT_URL;

  console.log('🔎 Scraping Extreme Networks Wi‑Fi Access Points');
  if (urlsArg || urlsFileArg) {
    console.log('🌐 Using provided product URLs');
  } else {
    console.log(`🌐 Catalog URL: ${catalogUrl}`);
  }
  console.log(`📄 Output: ${outPath}`);
  if (limit) console.log(`🔢 Limit: ${limit}`);
  console.log('─'.repeat(50));

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  let links = [];

  // Collect links from network responses (handles dynamic SPA search APIs)
  const netLinks = new Map(); // href -> name
  const acceptNetUrl = (url) => {
    try {
      const u = new URL(url);
      const p = u.pathname || '';
      if (!p.includes('/products/wi-fi-access-points/')) return false;
      const slug = (p.split('/').filter(Boolean).pop() || '').toLowerCase();
      if (!/^ap/.test(slug)) return false;
      return true;
    } catch (_) { return false; }
  };
  page.on('response', async (resp) => {
    try {
      const url = resp.url();
      const ct = resp.headers()['content-type'] || '';
      if (!/application\/json/i.test(ct)) return;
      // Heuristic: Coveo/REST search or other search endpoints
      if (!/search|coveo|result|query/i.test(url)) return;
      const data = await resp.json();
      const pushCandidate = (href, title) => {
        if (!href) return;
        const abs = new URL(href, 'https://www.extremenetworks.com').toString();
        if (!acceptNetUrl(abs)) return;
        const name = (title || abs.split('/').filter(Boolean).pop() || '').replace(/[-_]/g, ' ').trim();
        if (!netLinks.has(abs)) netLinks.set(abs, name);
      };
      // Handle common structures
      if (Array.isArray(data)) {
        data.forEach((item) => {
          const href = item.clickUri || item.uri || item.url || (item.raw && item.raw.clickuri);
          const title = item.title || item.Title || item.name;
          pushCandidate(href, title);
        });
      } else if (data && typeof data === 'object') {
        const arrs = [];
        if (Array.isArray(data.results)) arrs.push(data.results);
        if (Array.isArray(data.items)) arrs.push(data.items);
        if (Array.isArray(data.documents)) arrs.push(data.documents);
        for (const arr of arrs) {
          arr.forEach((item) => {
            const href = item.clickUri || item.uri || item.url || (item.raw && item.raw.clickuri);
            const title = item.title || item.Title || item.name;
            pushCandidate(href, title);
          });
        }
      }
    } catch (_) {
      // ignore parsing errors
    }
  });

  if (urlsArg || urlsFileArg) {
    // Build links list from CLI args or file
    let urls = [];
    if (urlsArg) {
      const list = urlsArg.split('=')[1] || '';
      urls = list.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (urlsFileArg) {
      const filePath = path.resolve(process.cwd(), urlsFileArg.split('=')[1]);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        urls = urls.concat(raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
      } else {
        console.warn(`⚠️  URLs file not found: ${filePath}`);
      }
    }
    // Deduplicate
    const set = Array.from(new Set(urls));
    links = set.map((href) => {
      const name = href.split('/').filter(Boolean).pop() || 'AP';
      return { name, href };
    });
  } else {
    await page.goto(catalogUrl, { waitUntil: 'networkidle2', timeout: 120000 });
    await dismissCookieBanners(page);
    await autoScroll(page);
    await new Promise((r) => setTimeout(r, 800));
    try {
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('a')).some((a) => /\/products\//.test(a.href) && !/\/products\/?$/.test(a.href)),
        { timeout: 15000 }
      );
    } catch (_) {
      // proceed anyway
    }
    links = await extractCatalogLinks(page);
    // Retry a few times if no links found (dynamic rendering)
    if (!links || links.length === 0) {
      for (let i = 0; i < 3; i++) {
        await autoScroll(page);
        await new Promise((r) => setTimeout(r, 1000));
        links = await extractCatalogLinks(page);
        if (links.length > 0) break;
      }
    }

    // Merge in network-discovered links
    if (netLinks.size) {
      const netList = Array.from(netLinks.entries()).map(([href, name]) => ({ href, name }));
      links = links.concat(netList);
    }

    // Fallback BFS crawl within Wi‑Fi APs section if still no links
    if (!links || links.length === 0) {
      const startSet = new Set([
        catalogUrl,
        'https://www.extremenetworks.com/products/wi-fi-access-points/',
        'https://www.extremenetworks.com/products/wi-fi-access-points/universal-aps-indoor/',
        'https://www.extremenetworks.com/products/wi-fi-access-points/universal-aps-outdoor/',
        'https://www.extremenetworks.com/products/wi-fi-access-points/nonuniversal-aps-indoor/',
        'https://www.extremenetworks.com/products/wi-fi-access-points/nonuniversal-aps-outdoor/',
      ]);
      const queue = Array.from(startSet);
      const visited = new Set();
      const apMap = new Map();
      let pagesVisited = 0;
      const maxPages = 10;

      while (queue.length && pagesVisited < maxPages) {
        const nextUrl = queue.shift();
        if (visited.has(nextUrl)) continue;
        visited.add(nextUrl);
        try {
          await page.goto(nextUrl, { waitUntil: 'networkidle2', timeout: 120000 });
          await dismissCookieBanners(page);
          await autoScroll(page);
          await new Promise((r) => setTimeout(r, 800));
          const apLinks = await extractCatalogLinks(page);
          for (const l of apLinks) {
            if (!apMap.has(l.href)) apMap.set(l.href, l.name);
          }
          const catLinks = await extractCategoryLinks(page);
          for (const c of catLinks) {
            if (!visited.has(c) && queue.length < 50) queue.push(c);
          }
          pagesVisited++;
        } catch (_) {
          // ignore page errors and continue
        }
      }
      const apList = Array.from(apMap.entries()).map(([href, name]) => ({ href, name }));
      if (apList.length) links = apList;
    }
  }

  if (links.length === 0) {
    console.warn('⚠️  No product links detected on the catalog page. The site structure may have changed.');
  }

  // Deduplicate and optionally limit
  links = uniqBy(links, (x) => x.href);
  if (limit && Number.isFinite(limit)) links = links.slice(0, limit);

  console.log(`🧮 Found product links: ${links.length}`);

  const results = [];
  let order = 1;
  for (const link of links) {
    try {
      console.log(`→ Processing: ${link.name} | ${link.href}`);
      const detail = await extractProductDetail(page, link.href, link.name);

      const id = `extreme-${slugify(detail.nameEn).replace(/^extreme-/, '')}`;
      const item = {
        id,
        name: { en: detail.nameEn, es: detail.nameEn },
        description: { en: detail.descEn, es: detail.descEn },
        features: { en: detail.featuresEn, es: detail.featuresEn },
        categoryId: 'networking',
        vendorId: 'extreme',
        image: detail.imageUrl,
        datasheet: detail.datasheetUrl,
        order: order++,
        active: true,
      };

      results.push(item);
    } catch (e) {
      console.error(`❌ Failed to process ${link.href}:`, e.message || e);
    }
  }

  // Ensure directory exists
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('📦 Saved catalog JSON');
  console.log(`📝 Items: ${results.length}`);
  console.log('✅ Done');

  await browser.close();
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
}
