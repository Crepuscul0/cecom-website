#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.watchguard.com';
const LISTING_URL = BASE_URL + '/wgrd-products/all-products-list';
const OUT_DIR = path.join(__dirname, '..', 'data', 'scraped', 'watchguard');
const CATALOG_OUT = path.join(OUT_DIR, 'watchguard-catalog.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toAbsoluteUrl(href) {
  try {
    return new URL(href, BASE_URL).toString();
  } catch (e) {
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

async function getProductLinks(page) {
  console.log('Loading product listing page...');
  await page.goto(LISTING_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1000); // Reduced wait time

  const links = await page.evaluate(() => {
    // Get all product links
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const allHrefs = anchors.map(a => a.href || a.getAttribute('href'));
    
    // Filter for wgrd-products links
    const wgrdLinks = allHrefs.filter(href => href && href.includes('/wgrd-products/'));
    
    // Filter out non-product pages
    const productLinks = wgrdLinks.filter(href => {
      if (!href) return false;
      
      const excludePatterns = [
        '/all-products-list',
        '#',
        'mailto:',
        'tel:',
        '/support',
        '/contact',
        '/download',
        '/training',
        '/partners',
        '/about'
      ];
      
      const shouldExclude = excludePatterns.some(pattern => href.includes(pattern));
      return !shouldExclude;
    });
    
    return productLinks;
  });

  // Normalize and deduplicate
  const normalized = links.map(toAbsoluteUrl);
  const uniqueLinks = [...new Set(normalized)];

  console.log(`Filtered to ${uniqueLinks.length} unique product links`);

  // Log some examples for debugging
  if (uniqueLinks.length > 0) {
    console.log('Sample product links:');
    uniqueLinks.slice(0, 5).forEach((link, i) => {
      console.log(`  ${i + 1}. ${link}`);
    });
  }

  return uniqueLinks;
}

async function extractProductDetails(page, productUrl) {
  console.log(`Scraping product: ${productUrl}`);
  await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(500); // Reduced wait time

  const productData = await page.evaluate(() => {
    // Optimized single-pass extraction
    let title = null;
    let description = null;
    let imageUrl = null;
    let datasheetLink = null;

    // Get title - prioritized order
    const h1 = document.querySelector('h1');
    if (h1) {
      title = h1.textContent?.trim();
    } else {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      title = ogTitle?.content || document.title;
    }

    // Get description
    const metaDesc = document.querySelector('meta[name="description"]') ||
      document.querySelector('meta[property="og:description"]');
    if (metaDesc) {
      description = metaDesc.content;
    } else {
      // Quick fallback to first substantial paragraph
      const paragraphs = document.querySelectorAll('p');
      for (const p of paragraphs) {
        const text = p.textContent?.trim();
        if (text && text.length > 20) {
          description = text;
          break;
        }
      }
    }

    // Get image - optimized search
    const specificImg = document.querySelector('img.pt-5.pb-4');
    if (specificImg) {
      imageUrl = specificImg.getAttribute('src');
    } else {
      // Quick fallback
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        imageUrl = ogImage.content;
      } else {
        const productImg = document.querySelector('img[src*="firebox"], img[alt*="watchguard" i], img[alt*="firebox" i]');
        if (productImg) {
          imageUrl = productImg.getAttribute('src');
        }
      }
    }

    // Comprehensive datasheet detection (streamlined for production)
    const allImages = document.querySelectorAll('img');
    const allLinks = document.querySelectorAll('a[href]');
    
    // Method 1: Look for datasheet images with parent links
    for (const img of allImages) {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      
      if (src.toLowerCase().includes('datasheet') || alt.toLowerCase().includes('datasheet')) {
        const parentLink = img.closest('a');
        if (parentLink && parentLink.getAttribute('href')) {
          datasheetLink = parentLink.getAttribute('href');
          break;
        }
      }
    }
    
    // Method 2: Look for links with datasheet in text
    if (!datasheetLink) {
      for (const link of allLinks) {
        const href = link.getAttribute('href') || '';
        const text = link.textContent?.toLowerCase() || '';
        
        if (text.includes('datasheet') && href) {
          datasheetLink = href;
          break;
        }
      }
    }
    
    // Method 3: Look for resource center docs
    if (!datasheetLink) {
      for (const link of allLinks) {
        const href = link.getAttribute('href') || '';
        if (href.includes('wgrd-resource-center/docs/')) {
          datasheetLink = href;
          break;
        }
      }
    }

    return {
      title: title || null,
      description: description || null,
      imageUrl: imageUrl || null,
      datasheetLink: datasheetLink || null,
    };
  });

  // Convert image URL to absolute
  if (productData.imageUrl) {
    productData.imageUrl = toAbsoluteUrl(productData.imageUrl);
  }

  // Follow datasheet link to extract PDF URL from iframe
  let datasheetPdfUrl = null;
  if (productData.datasheetLink) {
    const datasheetPageUrl = toAbsoluteUrl(productData.datasheetLink);
    console.log(`Following datasheet link: ${datasheetPageUrl}`);
    
    try {
      await page.goto(datasheetPageUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      await sleep(3000); // Wait longer for iframe to load
      
      // Wait for page to fully load including iframes
      await sleep(2000);
      
      // Extract PDF URL from iframe - simplified approach
      datasheetPdfUrl = await page.evaluate(() => {
        // Priority 1: Look for any iframe with widen.net (most common)
        const widenIframes = document.querySelectorAll('iframe[src*="widen.net"]');
        if (widenIframes.length > 0) {
          return widenIframes[0].getAttribute('src');
        }
        
        // Priority 2: Look for iframe with name="widen-iframe"
        const namedIframe = document.querySelector('iframe[name="widen-iframe"]');
        if (namedIframe && namedIframe.getAttribute('src')) {
          return namedIframe.getAttribute('src');
        }
        
        // Priority 3: Look for any iframe with PDF in src
        const pdfIframes = document.querySelectorAll('iframe[src*=".pdf"]');
        if (pdfIframes.length > 0) {
          return pdfIframes[0].getAttribute('src');
        }
        
        // Priority 4: Look for any iframe (sometimes PDFs are embedded differently)
        const allIframes = document.querySelectorAll('iframe[src]');
        if (allIframes.length > 0) {
          return allIframes[0].getAttribute('src');
        }
        
        // Priority 5: Look for direct PDF links on the page
        const pdfLinks = document.querySelectorAll('a[href*=".pdf"]');
        if (pdfLinks.length > 0) {
          return pdfLinks[0].getAttribute('href');
        }
        
        return null;
      });
      
      if (datasheetPdfUrl) {
        console.log(`Extracted PDF URL: ${datasheetPdfUrl}`);
      } else {
        console.log('No PDF URL found in datasheet page');
      }
      
    } catch (error) {
      console.error(`Error following datasheet link ${datasheetPageUrl}:`, error.message);
    }
  }

  const result = {
    ...productData,
    datasheetPdfUrl,
    sourceUrl: productUrl
  };

  console.log(`Product scraped: ${result.title || 'Unknown'} - Datasheet: ${result.datasheetPdfUrl ? 'Found' : 'Not found'}`);
  return result;
}

function cleanDatasheetUrl(url) {
  if (!url) return null;

  // For widen.net URLs, just remove query parameters and keep original format
  if (url.includes('widen.net')) {
    return url.split('?')[0];
  }

  // For other URLs, just remove query parameters
  return url.split('?')[0];
}

function toCatalogItem(product, index) {
  const id = `watchguard-${slugify(product.title)}`;
  const cleanedDatasheet = cleanDatasheetUrl(product.datasheetPdfUrl);

  return {
    id,
    name: {
      en: product.title,
      es: product.title,
    },
    description: {
      en: product.description || 'WatchGuard security product',
      es: product.description || 'Producto de seguridad WatchGuard',
    },
    features: {
      en: [], // Could be enhanced to extract features from product pages
      es: [],
    },
    categoryId: 'security',
    vendorId: 'watchguard',
    image: product.imageUrl || '/products/placeholder-product.svg',
    datasheet: cleanedDatasheet,
    sourceUrl: product.sourceUrl, // Keep track of where this came from
    order: index + 1,
    active: true,
    scrapedAt: new Date().toISOString(),
  };
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36');
  page.setDefaultTimeout(60000); // Reduced timeout

  try {
    await fs.mkdir(OUT_DIR, { recursive: true });

    // Step 1: Get product links from the listing page
    console.log('Collecting product links from:', LISTING_URL);
    const allProductLinks = await getProductLinks(page);
    console.log(`Found ${allProductLinks.length} product links`);
    
    // Use all discovered links
    const productLinks = allProductLinks;
    console.log(`Processing all ${productLinks.length} products`);

    // Step 2: Scrape each product page in parallel batches
    const products = [];
    const concurrency = 5; // Balanced concurrency for speed
    const browserPages = [];

    console.log('Setting up browser pages for parallel processing...');
    for (let i = 0; i < concurrency; i++) {
      const newPage = await browser.newPage();
      await newPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36');
      newPage.setDefaultTimeout(60000); // Reduced timeout
      // Disable only CSS and fonts for faster loading, keep images for datasheet detection
      await newPage.setRequestInterception(true);
      newPage.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'stylesheet' || resourceType === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });
      browserPages.push(newPage);
    }

    const queue = [...productLinks];
    let processedCount = 0;
    let successCount = 0;

    console.log(`Starting to process ${queue.length} products...`);

    while (queue.length) {
      const batch = queue.splice(0, concurrency);
      console.log(`Processing batch of ${batch.length} products...`);

      const batchResults = await Promise.all(
        batch.map(async (url, index) => {
          const page = browserPages[index];
          try {
            const result = await extractProductDetails(page, url);
            if (result && result.title) {
              successCount++;
              return result;
            }
            console.warn(`No valid data extracted from ${url}`);
            return null;
          } catch (e) {
            console.error(`Error scraping ${url}:`, e.message);
            return null;
          }
        })
      );

      batchResults.forEach(result => {
        if (result) {
          products.push(result);
        }
      });

      processedCount += batch.length;
      console.log(`Progress: ${processedCount}/${productLinks.length} processed, ${successCount} successful`);

      // Reduced delay between batches for speed
      if (queue.length > 0) {
        await sleep(500);
      }
    }

    // Close the parallel pages
    await Promise.all(browserPages.map(p => p.close()));

    console.log(`\nScraping completed:`);
    console.log(`- Total products processed: ${processedCount}`);
    console.log(`- Successful extractions: ${successCount}`);
    console.log(`- Products with datasheets: ${products.filter(p => p.datasheetPdfUrl).length}`);

    // Step 3: Convert to catalog format
    const catalog = products.map((p, idx) => toCatalogItem(p, idx));

    // Step 4: Save to file
    await fs.writeFile(CATALOG_OUT, JSON.stringify(catalog, null, 2), 'utf8');

    // Step 5: Generate summary
    const withDatasheets = catalog.filter(item => item.datasheet);
    const withImages = catalog.filter(item => item.image && !item.image.includes('placeholder'));

    console.log(`\n=== SCRAPING SUMMARY ===`);
    console.log(`Total products in catalog: ${catalog.length}`);
    console.log(`Products with datasheets: ${withDatasheets.length} (${Math.round(withDatasheets.length / catalog.length * 100)}%)`);
    console.log(`Products with images: ${withImages.length} (${Math.round(withImages.length / catalog.length * 100)}%)`);
    console.log(`Catalog saved to: ${CATALOG_OUT}`);

    // Show some examples of successful extractions
    if (withDatasheets.length > 0) {
      console.log(`\nSample products with datasheets:`);
      withDatasheets.slice(0, 3).forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name.en}`);
        console.log(`     Datasheet: ${item.datasheet}`);
        console.log(`     Source: ${item.sourceUrl}`);
      });
    }
  } catch (e) {
    console.error('Fatal error:', e);
  } finally {
    await browser.close();
  }
})();
