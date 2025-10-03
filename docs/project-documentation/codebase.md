# .eslintrc.json

```json
{
  "extends": "next"
}

```

# .vscode/settings.json

```json
{
    "kiroAgent.configureMCP": "Disabled"
}
```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

# debug-blog-page.js

```js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugBlogPage() {
  console.log('🔍 DEBUG BLOG PAGE RENDERING');
  console.log('================================\n');

  try {
    // Test the exact query used by getBlogPosts
    console.log('1️⃣ Testing getBlogPosts query...');
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name_es, name_en, slug)
      `)
      .eq('status', 'published')
      .limit(100)
      .order('published_date', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Found ${posts.length} posts`);

    // Transform posts like getBlogPosts does
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      slug: post.slug,
      category: post.blog_categories?.slug || '',
      tags: [],
      featuredImage: post.featured_image,
      publishedDate: post.published_date,
      readingTime: 5,
      author: post.author,
      status: post.status,
      seo: post.meta_title || post.meta_description ? {
        metaTitle: post.meta_title || post.title,
        metaDescription: post.meta_description || post.excerpt || '',
        keywords: ''
      } : undefined
    })) || [];

    console.log(`✅ Transformed ${transformedPosts.length} posts`);

    // Test filtering (no filters applied)
    const filteredPosts = transformedPosts.filter(post => post.status === 'published');
    console.log(`✅ After status filter: ${filteredPosts.length} posts`);

    // Test pagination (page 1, 6 posts per page)
    const postsPerPage = 6;
    const currentPage = 1;
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    console.log(`✅ Paginated posts (page ${currentPage}): ${paginatedPosts.length} posts`);

    // Check if posts have all required fields
    console.log('\n2️⃣ Checking post structure...');
    if (paginatedPosts.length > 0) {
      const firstPost = paginatedPosts[0];
      console.log('First post structure:');
      console.log('- id:', firstPost.id ? '✅' : '❌');
      console.log('- title:', firstPost.title ? '✅' : '❌');
      console.log('- slug:', firstPost.slug ? '✅' : '❌');
      console.log('- category:', firstPost.category ? '✅' : '❌');
      console.log('- publishedDate:', firstPost.publishedDate ? '✅' : '❌');
      console.log('- author:', firstPost.author ? '✅' : '❌');
      console.log('- excerpt:', firstPost.excerpt ? '✅' : '❌');
      console.log('- content:', firstPost.content ? '✅' : '❌');
      
      console.log('\nFirst post details:');
      console.log(`- Title: ${firstPost.title}`);
      console.log(`- Slug: ${firstPost.slug}`);
      console.log(`- Category: ${firstPost.category}`);
      console.log(`- Published: ${firstPost.publishedDate}`);
      console.log(`- Author: ${firstPost.author}`);
    }

    // Test if the condition for rendering posts would pass
    console.log('\n3️⃣ Testing render condition...');
    const shouldRenderPosts = paginatedPosts.length > 0;
    console.log(`paginationResult.posts.length > 0: ${shouldRenderPosts}`);

    if (shouldRenderPosts) {
      console.log('✅ Posts should render in the grid');
      console.log(`📋 Posts to render: ${paginatedPosts.length}`);
      paginatedPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
      });
    } else {
      console.log('❌ No posts message should show');
    }

    // Check for any potential issues
    console.log('\n4️⃣ Potential issues check...');
    
    // Check for missing required fields that could cause rendering issues
    const postsWithMissingFields = paginatedPosts.filter(post => 
      !post.id || !post.title || !post.slug || !post.publishedDate
    );
    
    if (postsWithMissingFields.length > 0) {
      console.log(`❌ Found ${postsWithMissingFields.length} posts with missing required fields`);
      postsWithMissingFields.forEach(post => {
        console.log(`   - Post: ${post.title || 'No title'}`);
        console.log(`     Missing: ${!post.id ? 'id ' : ''}${!post.title ? 'title ' : ''}${!post.slug ? 'slug ' : ''}${!post.publishedDate ? 'publishedDate ' : ''}`);
      });
    } else {
      console.log('✅ All posts have required fields');
    }

    // Check for invalid dates
    const postsWithInvalidDates = paginatedPosts.filter(post => {
      const date = new Date(post.publishedDate);
      return isNaN(date.getTime());
    });

    if (postsWithInvalidDates.length > 0) {
      console.log(`❌ Found ${postsWithInvalidDates.length} posts with invalid dates`);
    } else {
      console.log('✅ All posts have valid dates');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugBlogPage();

```

# debug-rss-missing-posts.js

```js
#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { XMLParser } = require('fast-xml-parser')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugMissingPosts() {
  console.log('🔍 DEBUGGING MISSING RSS POSTS')
  console.log('=' * 50)
  
  try {
    // 1. Fetch RSS feed
    console.log('\n1️⃣ Fetching RSS feed...')
    const response = await fetch('https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS')
    const xmlData = await response.text()
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    })
    
    const result = parser.parse(xmlData)
    const rssItems = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    console.log(`✅ RSS feed has ${rssItems.length} items`)
    
    // 2. Get existing posts from Supabase
    console.log('\n2️⃣ Getting existing posts from Supabase...')
    const { data: existingPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('status', 'published')
    
    if (error) {
      console.error('❌ Error fetching existing posts:', error)
      return
    }
    
    console.log(`✅ Supabase has ${existingPosts.length} posts`)
    
    // 3. Compare RSS vs Supabase
    console.log('\n3️⃣ Comparing RSS items vs Supabase posts...')
    
    const existingSlugs = new Set(existingPosts.map(p => p.slug))
    const missingPosts = []
    
    rssItems.forEach((item, index) => {
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-es'
      
      if (!existingSlugs.has(slug)) {
        missingPosts.push({
          index: index + 1,
          title: item.title,
          slug: slug,
          pubDate: item.pubDate,
          link: item.link
        })
      }
    })
    
    console.log(`📊 Missing posts: ${missingPosts.length}`)
    
    if (missingPosts.length > 0) {
      console.log('\n📋 Missing posts from RSS feed:')
      missingPosts.forEach(post => {
        console.log(`${post.index}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Date: ${post.pubDate}`)
        console.log(`   Link: ${post.link}`)
        console.log('')
      })
    }
    
    // 4. Show existing posts
    console.log('\n4️⃣ Existing posts in Supabase:')
    existingPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log('')
    })
    
    // 5. Summary
    console.log('\n🎯 SUMMARY:')
    console.log(`- RSS feed items: ${rssItems.length}`)
    console.log(`- Supabase posts: ${existingPosts.length}`)
    console.log(`- Missing posts: ${missingPosts.length}`)
    
    if (missingPosts.length > 0) {
      console.log('\n⚠️  ACTION NEEDED: Import missing posts to see all 20 posts on the blog')
    } else {
      console.log('\n✅ All RSS posts are already in Supabase')
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugMissingPosts()

```

# i18n.ts

```ts
export { default } from './src/i18n/request';
```

# messages/company-credibility.en.json

```json
{
  "CompanyCredibility": {
    "history": {
      "title": "Our History",
      "description": "Since 2004, CECOM has been at the forefront of technology solutions in the Dominican Republic. What started as a small computer repair service has evolved into a comprehensive IT solutions provider, serving businesses across various industries with cutting-edge technology and unparalleled expertise."
    },
    "stats": {
      "yearsExperience": "Years of Experience",
      "successfulProjects": "Successful Projects",
      "satisfiedClients": "Satisfied Clients",
      "certifications": "Industry Certifications"
    },
    "timeline": {
      "title": "Key Milestones",
      "description": "Major achievements that have shaped our journey and strengthened our position as a technology leader.",
      "milestones": {
        "founded": {
          "title": "Company Founded",
          "description": "CECOM was established in Santo Domingo, starting with computer repair and basic IT services."
        },
        "firstExpansion": {
          "title": "Service Expansion",
          "description": "Expanded into network infrastructure and enterprise solutions, serving medium and large businesses."
        },
        "majorContract": {
          "title": "Government Partnership",
          "description": "Secured major contracts with government institutions, establishing credibility in the public sector."
        },
        "modernization": {
          "title": "Digital Transformation",
          "description": "Embraced cloud technologies and modern IT solutions, becoming a leader in digital transformation services."
        }
      }
    },
    "achievements": {
      "title": "Certifications & Achievements",
      "description": "Our commitment to excellence is reflected in our industry certifications and recognition from leading technology partners.",
      "items": {
        "item1": "ISO 9001:2015 Quality Management Certification",
        "item2": "Microsoft Gold Partner Status",
        "item3": "Cisco Certified Partner",
        "item4": "VMware Authorized Partner",
        "item5": "HP Enterprise Preferred Partner",
        "item6": "Dominican Republic IT Excellence Award 2022"
      }
    }
  }
}

```

# messages/company-credibility.es.json

```json
{
  "CompanyCredibility": {
    "history": {
      "title": "Nuestra Historia",
      "description": "Desde 2004, CECOM ha estado a la vanguardia de las soluciones tecnológicas en la República Dominicana. Lo que comenzó como un pequeño servicio de reparación de computadoras ha evolucionado hasta convertirse en un proveedor integral de soluciones de TI, sirviendo a empresas de diversas industrias con tecnología de vanguardia y experiencia incomparable."
    },
    "stats": {
      "yearsExperience": "Años de Experiencia",
      "successfulProjects": "Proyectos Exitosos",
      "satisfiedClients": "Clientes Satisfechos",
      "certifications": "Certificaciones de la Industria"
    },
    "timeline": {
      "title": "Hitos Clave",
      "description": "Logros importantes que han moldeado nuestro camino y fortalecido nuestra posición como líder tecnológico.",
      "milestones": {
        "founded": {
          "title": "Fundación de la Empresa",
          "description": "CECOM fue establecida en Santo Domingo, comenzando con reparación de computadoras y servicios básicos de TI."
        },
        "firstExpansion": {
          "title": "Expansión de Servicios",
          "description": "Se expandió hacia infraestructura de redes y soluciones empresariales, sirviendo a medianas y grandes empresas."
        },
        "majorContract": {
          "title": "Alianza Gubernamental",
          "description": "Aseguró contratos importantes con instituciones gubernamentales, estableciendo credibilidad en el sector público."
        },
        "modernization": {
          "title": "Transformación Digital",
          "description": "Adoptó tecnologías en la nube y soluciones de TI modernas, convirtiéndose en líder en servicios de transformación digital."
        }
      }
    },
    "achievements": {
      "title": "Certificaciones y Logros",
      "description": "Nuestro compromiso con la excelencia se refleja en nuestras certificaciones de la industria y el reconocimiento de socios tecnológicos líderes.",
      "items": {
        "item1": "Certificación ISO 9001:2015 de Gestión de Calidad",
        "item2": "Estatus de Microsoft Gold Partner",
        "item3": "Socio Certificado de Cisco",
        "item4": "Socio Autorizado de VMware",
        "item5": "Socio Preferido de HP Enterprise",
        "item6": "Premio de Excelencia en TI República Dominicana 2022"
      }
    }
  }
}

```

# messages/en.json

```json
{
  "Common": {
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close",
      "retry": "Retry",
      "clearFilters": "Clear filters",
      "viewDetails": "View Details",
      "previous": "Previous",
      "next": "Next",
      "allVendors": "All Vendors"
    },
    "states": {
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "noData": "No data available",
      "sending": "Sending...",
      "loadingCategories": "Loading categories...",
      "loadingProducts": "Loading products...",
      "errorLoadingCategories": "Error loading categories",
      "errorLoadingProducts": "Error loading products",
      "errorLoadingVendors": "Error loading vendors",
      "noProducts": "No products found",
      "noCategories": "No categories available",
      "noProductsInCategory": "No products found in this category",
      "tryAdjustingFilters": "Try adjusting your search or filters to find what you're looking for.",
      "noProductsAvailable": "No products are currently available in this section."
    },
    "accessibility": {
      "closeModal": "Close modal",
      "openMenu": "Open menu",
      "selectLanguage": "Select language",
      "toggleTheme": "Toggle theme",
      "toggleNavigation": "Toggle navigation",
      "topNavigation": "Top",
      "logoAlt": "CECOM Logo"
    },
    "theme": {
      "light": "Light",
      "dark": "Dark",
      "system": "System",
      "toggleTheme": "Toggle theme"
    },
    "language": {
      "english": "🇺🇸 English",
      "spanish": "🇩🇴 Español",
      "toggleLanguage": "Toggle language"
    }
  },
  "Validation": {
    "required": "This field is required",
    "requiredField": "This field is required",
    "email": "Please enter a valid email address",
    "phone": "Please enter a valid phone number",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be no more than {max} characters",
    "nameMinLength": "Name must be at least 2 characters",
    "messageMinLength": "Message must be at least 10 characters",
    "phoneMinLength": "Phone number must be at least 10 digits",
    "invalidEmail": "Please enter a valid email address",
    "invalidPhone": "Please enter a valid phone number",
    "invalidName": "Name can only contain letters and spaces"
  },
  "Home": {
    "title": "Cutting-Edge",
    "welcome": "Technology Solutions",
    "description": "Discover our wide range of technology products: from network equipment and servers to storage and energy solutions. Everything you need to power your business.",
    "getStarted": "View Catalog",
    "liveDemo": "Our Solutions",
    "productsShowcase": "Featured Products",
    "exploreProducts": "Explore our complete catalog of technology products from the best brands in the market."
  },
  "Solutions": {
    "title": "Solutions",
    "ourSolutions": "Our Solutions",
    "businessNeeds": "Everything you need to run your business",
    "wideRange": "We offer a wide range of solutions to meet your needs. From cybersecurity to networking, we have you covered.",
    "cybersecurity": {
      "name": "Cybersecurity",
      "description": "We provide top-tier cybersecurity solutions to protect your business from threats."
    },
    "networking": {
      "name": "Networking",
      "description": "We offer robust and scalable networking solutions for your business."
    },
    "servers": {
      "name": "Servers",
      "description": "We provide reliable and high-performance servers for your business needs."
    },
    "storage": {
      "name": "Storage",
      "description": "We offer scalable and secure storage solutions for your data."
    }
  },
  "Alliances": {
    "title": "Alliances",
    "ourAlliances": "Our Alliances",
    "partnerMessage": "We partner with the best to bring you the best solutions.",
    "alliances": {
      "3cx": "3CX is a software-based private branch exchange (PBX) based on the SIP (Session Initiation Protocol) standard.",
      "avaya": "Avaya is a global leader in communication systems, applications and services.",
      "axis": "Axis is the market leader in network video.",
      "cambium": "Cambium Networks is a leading global provider of wireless broadband solutions that connect the unconnected.",
      "dahua": "Dahua Technology is a world-leading video-centric smart IoT solution and service provider.",
      "eset": "ESET is a global provider of security software for companies and consumers.",
      "extreme": "Extreme Networks is a networking company that designs, develops, and manufactures wired and wireless network infrastructure equipment.",
      "hp": "Hewlett Packard Enterprise is a global technology leader focused on developing intelligent solutions for the hybrid world.",
      "jabra": "Jabra is a Danish brand specializing in audio equipment, and more recently, video conference systems.",
      "lenovo": "Lenovo is a Chinese multinational technology company that designs, develops, manufactures, and sells personal computers, tablet computers, smartphones, workstations, servers, electronic storage devices, IT management software, and smart televisions.",
      "panduit": "Panduit is a global manufacturer of physical infrastructure solutions that support power, communications, computing, control, and security systems.",
      "vertiv": "Vertiv is a global provider of critical digital infrastructure and continuity solutions.",
      "watchguard": "WatchGuard Technologies, Inc. is an American multinational cybersecurity company.",
      "weboost": "weBoost is a leading manufacturer of cell phone signal boosters."
    }
  },
  "AboutUs": {
    "title": "About Us",
    "description": "CECOM, S.A.S. is a company located in Santo Domingo, Dominican Republic, that operates in the fields of computer repair and information technology services. We have been in business for over 20 years, and we are dedicated to providing the best solutions for your business.",
    "contactUs": "Contact Us",
    "ourTeam": "Our Team",
    "ourPartners": "Our Partners",
    "teamDescription": "Meet the professionals who make our success and that of our clients possible.",
    "partnersDescription": "We work with the best brands in the market to offer you quality solutions.",
    "readyToWork": "Ready to work with us?",
    "ctaDescription": "Contact us today and discover how we can help you achieve your technology goals.",
    "learnMore": "Learn more about our company, our team, and our values.",
    "mission": {
      "title": "Our Mission",
      "description": "At CECOM, we are dedicated to providing innovative technology solutions and superior quality services that drive the growth and efficiency of our clients. Our mission is to be the trusted technology partner that transforms business challenges into success opportunities."
    },
    "vision": {
      "title": "Our Vision",
      "description": "To be recognized as the leading company in information technology solutions in the Dominican Republic, standing out for our excellence in service, constant innovation and commitment to the technological development of our clients and the community."
    },
    "values": {
      "title": "Our Values",
      "excellence": {
        "title": "Excellence",
        "description": "We strive to exceed expectations in every project."
      },
      "innovation": {
        "title": "Innovation",
        "description": "We adopt the latest technologies to offer cutting-edge solutions."
      },
      "integrity": {
        "title": "Integrity",
        "description": "We act with honesty and transparency in all our relationships."
      },
      "commitment": {
        "title": "Commitment",
        "description": "We are completely dedicated to the success of our clients."
      }
    }
  },
  "Contact": {
    "title": "Contact",
    "getInTouch": "Get in touch",
    "description": "We are here to help you. Get in touch with us for any inquiries about our technology services.",
    "postalAddress": "Postal address",
    "addressLine1": "Av. Pasteur N.11",
    "addressLine2": "Gazcue, Santo Domingo",
    "addressLine3": "Dominican Republic",
    "phoneNumber": "Phone number",
    "phone": "+1 (809) 555-0123",
    "emailAddress": "Email address",
    "email": "info@cecom.com.do",
    "businessHours": "Business Hours",
    "weekdays": "Monday - Friday: 8:00 AM - 6:00 PM",
    "saturday": "Saturday: 9:00 AM - 1:00 PM",
    "sunday": "Sunday: Closed",
    "form": {
      "fullName": "Full name",
      "fullNamePlaceholder": "Full name",
      "emailPlaceholder": "Email",
      "phonePlaceholder": "Phone",
      "message": "Message",
      "messagePlaceholder": "Message",
      "submit": "Submit",
      "sending": "Sending...",
      "successMessage": "Message sent successfully. We will get back to you soon.",
      "errorMessage": "Error sending message. Please try again."
    },
    "validation": {
      "requiredField": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "invalidPhone": "Please enter a valid phone number",
      "messageMinLength": "Message must be at least 10 characters",
      "nameMinLength": "Name must be at least 2 characters"
    }
  },
  "Blog": {
    "title": "Blog",
    "subtitle": "Insights, guides and trends in enterprise technology for the Dominican Republic",
    "description": "Stay updated with the latest technology trends, cybersecurity tips, and enterprise solutions from CECOM experts.",
    "backToBlog": "Back to Blog",
    "minRead": "min read",
    "needHelp": "Need Expert Help?",
    "needHelpDescription": "Our cybersecurity and IT experts are ready to help you implement these solutions in your business.",
    "contactUs": "Contact Us",
    "activeFilters": "Active Filters",
    "category": "Category",
    "tag": "Tag",
    "search": "Search",
    "noPosts": "No articles found",
    "noPostsDescription": "Try adjusting your search or filters to find what you're looking for.",
    "categoryDescription": "Articles in category",
    "categorySubDescription": "Explore our latest insights and guides.",
    "tagDescription": "Articles tagged with",
    "tagSubDescription": "Discover related content.",
    "tagPageDescription": "All articles tagged with",
    "noPostsInCategory": "No articles in this category yet",
    "noPostsInCategoryDescription": "We're working on adding more content. Check back soon!",
    "articles": "articles",
    "relatedPosts": "Related Posts",
    "relatedPostsComingSoon": "Related posts feature coming soon!"
  },
  "NotFound": {
    "title": "404 - Page Not Found",
    "description": "The page you are looking for does not exist."
  },
  "Header": {
    "home": "Home",
    "solutions": "Solutions",
    "alliances": "Alliances",
    "blog": "Blog",
    "aboutUs": "About Us",
    "contact": "Contact",
    "accessibility": {
      "mainNavigation": "Main navigation",
      "homeLink": "Go to home page",
      "solutionsLink": "Go to solutions page",
      "alliancesLink": "Go to alliances page",
      "blogLink": "Go to blog page",
      "aboutUsLink": "Go to about us page",
      "contactLink": "Go to contact page",
      "logoLink": "Go to home page",
      "logoAlt": "CECOM Logo - Go to home page",
      "languageSelector": "Language selector",
      "languageSelectorButton": "Select language",
      "languageSelectorMenu": "Language options",
      "selectEnglish": "Switch to English",
      "selectSpanish": "Switch to Spanish",
      "mobileMenuButton": "Open mobile navigation menu",
      "mobileMenuClose": "Close mobile navigation menu",
      "mobileNavigation": "Mobile navigation menu",
      "themeToggle": "Toggle between light and dark theme",
      "skipToContent": "Skip to main content"
    },
    "tooltips": {
      "home": "Navigate to home page",
      "solutions": "View our technology solutions",
      "alliances": "See our business partnerships",
      "blog": "Read our latest articles and insights",
      "aboutUs": "Learn more about our company",
      "contact": "Get in touch with us",
      "languageSelector": "Change website language",
      "themeToggle": "Switch between light and dark mode",
      "mobileMenu": "Open navigation menu"
    }
  },
  "Footer": {
    "quickLinks": "Quick Links",
    "followUs": "Follow Us",
    "rights": "All rights reserved.",
    "products": "Products",
    "social": {
      "instagram": "Instagram",
      "facebook": "Facebook",
      "x": "X (Twitter)"
    }
  },
  "Catalog": {
    "categories": "Categories",
    "allProducts": "All Products",
    "searchProducts": "Search products...",
    "filterByVendor": "Filter by vendor",
    "showingResults": "Showing {count} results",
    "features": "Features",
    "specifications": "Specifications",
    "datasheet": "Datasheet",
    "modal": {
      "closeModal": "Close",
      "previousProduct": "Previous",
      "nextProduct": "Next",
      "viewDatasheet": "View Datasheet",
      "visitWebsite": "Visit Website",
      "moreFeatures": "+{count} more",
      "noImageAvailable": "No image available",
      "description": "Description",
      "specificationsNote": "For detailed specifications, please refer to the product datasheet or contact our sales team.",
      "productImageAlt": "Product image",
      "logoAlt": "logo"
    },
    "filter": {
      "allVendors": "All Vendors",
      "filterByVendor": "Filter by vendor",
      "clearFilters": "Clear filters",
      "activeSearch": "\"{query}\"",
      "activeVendor": "{vendor}"
    },
    "states": {
      "loading": "Loading...",
      "error": "Error",
      "loadingCategories": "Loading categories...",
      "errorLoadingCategories": "Error loading categories",
      "noCategories": "No categories available",
      "loadingProducts": "Loading products...",
      "errorLoadingProducts": "Error loading products",
      "noProducts": "No products found",
      "noProductsInCategory": "No products found in this category"
    },
    "actions": {
      "viewDetails": "View Details",
      "retry": "Retry"
    }
  },
  "Admin": {
    "title": "CECOM CMS",
    "subtitle": "Administration Panel",
    "status": {
      "active": "Active",
      "loading": "Loading administration panel...",
      "error": "Error",
      "success": "Success"
    },
    "auth": {
      "loginRequired": "You need to log in to access the administration panel",
      "loginButton": "Log In",
      "signOut": "Sign Out",
      "accessDenied": "Access Denied",
      "noPermissions": "You don't have permissions to access the administration panel.",
      "currentRole": "Current role:",
      "developmentMode": "🧪 Loading data in development mode..."
    },
    "navigation": {
      "categories": "Categories",
      "vendors": "Vendors",
      "products": "Products",
      "pages": "Pages"
    },
    "stats": {
      "categories": "Categories",
      "vendors": "Vendors", 
      "products": "Products",
      "pages": "Pages"
    },
    "scrollIndicator": {
      "moreRowsBelow": "More rows below",
      "moreContentBelow": "More content below",
      "scrollDown": "Scroll down"
    },
    "search": {
      "searchCategories": "Search categories...",
      "searchVendors": "Search vendors...",
      "searchProducts": "Search products..."
    },
    "tables": {
      "categories": "Categories",
      "vendors": "Vendors",
      "products": "Products", 
      "actions": "Actions",
      "name": "Name",
      "image": "Image",
      "slug": "Slug",
      "order": "Order",
      "website": "Website",
      "category": "Category",
      "vendor": "Vendor",
      "status": "Status",
      "active": "Active",
      "inactive": "Inactive",
      "noWebsite": "No website",
      "noName": "No name",
      "noTranslation": "No translation",
      "noCategory": "No category",
      "noVendor": "No vendor"
    },
    "buttons": {
      "newCategory": "+ New Category",
      "newVendor": "+ New Vendor",
      "newProduct": "+ New Product",
      "edit": "Edit",
      "delete": "Delete"
    },
    "confirmations": {
      "deleteCategory": "Are you sure you want to delete this category?",
      "deleteVendor": "Are you sure you want to delete this vendor?",
      "deleteProduct": "Are you sure you want to delete this product?"
    },
    "confirmDialog": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Deletion",
      "message": "Are you sure you want to perform this action?",
      "deleteMessage": "This action cannot be undone.",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "delete": "Delete",
      "deleteConfirm": "Yes, delete"
    },
    "errors": {
      "deleteCategory": "Error deleting category. Please try again.",
      "deleteVendor": "Error deleting vendor. Please try again.",
      "deleteProduct": "Error deleting product. Please try again.",
      "categoryInUseTitle": "Cannot Delete Category",
      "categoryInUseDescription": "This category cannot be deleted because it is currently in use by one or more products. Please reassign or delete those products first.",
      "loadingCategories": "Error loading categories",
      "loadingVendors": "Error loading vendors",
      "loadingProducts": "Error loading products"
    },
    "placeholders": {
      "pagesComingSoon": "Page management coming soon..."
    },
    "forms": {
      "category": {
        "title": "Category",
        "newTitle": "New Category",
        "editTitle": "Edit Category",
        "nameEn": "Name (English)",
        "nameEs": "Name (Spanish)",
        "descriptionEn": "Description (English)",
        "descriptionEs": "Description (Spanish)",
        "slug": "Slug",
        "order": "Order",
        "icon": "Icon",
        "selectIcon": "Select Icon",
        "generateSlug": "Generate from English name",
        "save": "Save Category",
        "cancel": "Cancel",
        "saving": "Saving...",
        "errorSaving": "Error saving category"
      },
      "vendor": {
        "title": "Vendor",
        "newTitle": "New Vendor",
        "editTitle": "Edit Vendor",
        "name": "Name",
        "website": "Website",
        "descriptionEn": "Description (English)",
        "descriptionEs": "Description (Spanish)",
        "save": "Save Vendor",
        "cancel": "Cancel",
        "saving": "Saving...",
        "errorSaving": "Error saving vendor"
      },
      "product": {
        "title": "Product",
        "newTitle": "New Product",
        "editTitle": "Edit Product",
        "nameEn": "Name (English)",
        "nameEs": "Name (Spanish)",
        "descriptionEn": "Description (English)",
        "descriptionEs": "Description (Spanish)",
        "featuresEn": "Features (English)",
        "featuresEs": "Features (Spanish)",
        "imageUrl": "Image URL",
        "category": "Category",
        "vendor": "Vendor",
        "order": "Order",
        "active": "Active",
        "addFeature": "Add Feature",
        "removeFeature": "Remove",
        "selectCategory": "Select category",
        "selectVendor": "Select vendor",
        "save": "Save Product",
        "cancel": "Cancel",
        "saving": "Saving...",
        "errorSaving": "Error saving product"
      },
      "validation": {
        "required": "This field is required",
        "invalidUrl": "Invalid URL",
        "minLength": "Minimum {min} characters",
        "maxLength": "Maximum {max} characters",
        "duplicateName": "A {type} with this name already exists",
        "duplicateSlug": "A category with this slug already exists"
      }
    }
  },
  "AdminPanel": {
    "title": "Administration Panel - CECOM",
    "navigation": {
      "cms": "CMS",
      "users": "Users",
      "blogs": "Blogs",
      "tickets": "Tickets",
      "cotizaciones": "Quotes",
      "aplicaciones": "Applications",
      "vpns": "VPNs"
    },
    "common": {
      "search": "Search...",
      "filter": "Filter",
      "actions": "Actions",
      "status": "Status",
      "created": "Created",
      "updated": "Updated",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "view": "View",
      "add": "Add",
      "loading": "Loading...",
      "noData": "No data available",
      "saving": "Saving...",
      "create": "Create",
      "update": "Update",
      "confirm": "Confirm",
      "approve": "Approve",
      "reject": "Reject"
    },
    "users": {
      "title": "User Management",
      "newUser": "New User",
      "searchPlaceholder": "Search users...",
      "noUsersFound": "No users found",
      "status": {
        "all": "All",
        "active": "Active",
        "inactive": "Inactive",
        "pending": "Pending",
        "approved": "Approved",
        "rejected": "Rejected"
      },
      "roles": {
        "all": "All Roles"
      },
      "stats": {
        "total": "Total Users",
        "active": "Active",
        "pending": "Pending",
        "inactive": "Inactive"
      },
      "actions": {
        "approve": "Approve",
        "reject": "Reject",
        "viewDetails": "View Details"
      },
      "table": {
        "name": "Name",
        "email": "Email",
        "role": "Role",
        "status": "Status",
        "created": "Created"
      },
      "userDetails": {
        "title": "User Details",
        "fullName": "Full Name",
        "email": "Email",
        "role": "Role",
        "status": "Status",
        "registrationDate": "Registration Date",
        "approvalDate": "Approval Date"
      }
    },
    "tickets": {
      "title": "Ticket Management",
      "newTicket": "New Ticket",
      "searchPlaceholder": "Search tickets...",
      "noTicketsFound": "No tickets found",
      "status": {
        "all": "All",
        "open": "Open",
        "inProgress": "In Progress",
        "in_progress": "In Progress",
        "resolved": "Resolved",
        "closed": "Closed"
      },
      "priority": {
        "all": "All Priorities",
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "urgent": "Urgent"
      },
      "stats": {
        "total": "Total Tickets",
        "open": "Open",
        "inProgress": "In Progress",
        "resolved": "Resolved",
        "urgent": "Urgent"
      },
      "table": {
        "title": "Title",
        "subject": "Subject",
        "client": "Client",
        "category": "Category",
        "priority": "Priority",
        "status": "Status",
        "date": "Date",
        "created": "Created"
      },
      "form": {
        "title": "Title",
        "description": "Description",
        "category": "Category",
        "assignedTo": "Assigned To"
      }
    },
    "cotizaciones": {
      "title": "Quote Management",
      "newCotizacion": "New Quote",
      "newQuote": "New Quote",
      "searchPlaceholder": "Search quotes...",
      "noCotizacionesFound": "No quotes found",
      "status": {
        "all": "All",
        "draft": "Draft",
        "sent": "Sent",
        "accepted": "Accepted",
        "rejected": "Rejected",
        "approved": "Approved",
        "expired": "Expired"
      },
      "stats": {
        "total": "Total Quotes",
        "draft": "Draft",
        "sent": "Sent",
        "accepted": "Accepted",
        "approved": "Approved",
        "approvedValue": "Approved Value"
      },
      "table": {
        "client": "Client",
        "description": "Description",
        "products": "Products",
        "status": "Status",
        "amount": "Amount",
        "date": "Date",
        "totalAmount": "Total Amount",
        "validUntil": "Valid Until"
      },
      "form": {
        "clientName": "Client Name",
        "clientEmail": "Client Email",
        "clientPhone": "Client Phone",
        "company": "Company",
        "description": "Description",
        "products": "Products",
        "totalAmount": "Total Amount",
        "validUntil": "Valid Until"
      }
    },
    "aplicaciones": {
      "title": "Application Management",
      "newApplication": "New Application",
      "searchPlaceholder": "Search applications...",
      "noApplicationsFound": "No applications found",
      "status": {
        "all": "All",
        "active": "Active",
        "inactive": "Inactive",
        "pending": "Pending"
      },
      "types": {
        "all": "All Types"
      },
      "stats": {
        "total": "Total Applications",
        "submitted": "Submitted",
        "underReview": "Under Review",
        "approved": "Approved",
        "deployed": "Deployed"
      },
      "table": {
        "application": "Application",
        "client": "Client",
        "type": "Type",
        "status": "Status",
        "date": "Date",
        "name": "Name",
        "version": "Version",
        "lastUpdate": "Last Update"
      }
    },
    "vpns": {
      "title": "VPN Management",
      "newVPN": "New VPN",
      "searchPlaceholder": "Search VPNs...",
      "noVPNsFound": "No VPNs found",
      "status": {
        "all": "All",
        "requested": "Requested",
        "approved": "Approved",
        "active": "Active",
        "expired": "Expired",
        "configuring": "Configuring",
        "suspended": "Suspended",
        "terminated": "Terminated"
      },
      "locations": {
        "all": "All Locations"
      },
      "stats": {
        "total": "Total VPNs",
        "requested": "Requested",
        "approved": "Approved",
        "active": "Active",
        "configuring": "Configuring",
        "suspended": "Suspended",
        "expired": "Expired"
      },
      "table": {
        "name": "Name",
        "client": "Client",
        "user": "User",
        "location": "Location",
        "status": "Status",
        "expires": "Expires",
        "expiryDate": "Expiry Date",
        "bandwidth": "Bandwidth"
      }
    },
    "blogs": {
      "title": "Blog Management",
      "subtitle": "Create and manage blog posts",
      "createPost": "Create Post",
      "editPost": "Edit Post",
      "editPostAction": "Edit Post",
      "createSubtitle": "Create a new blog post",
      "editSubtitle": "Edit existing blog post",
      "noPosts": "No blog posts found",
      "searchPlaceholder": "Search blog posts...",
      "filterAll": "All Posts",
      "statusPublished": "Published",
      "statusDraft": "Draft",
      "statusPending": "Pending Approval",
      "tableTitle": "Title",
      "tableStatus": "Status",
      "tableAuthor": "Author",
      "tableDate": "Date",
      "tableActions": "Actions",
      "viewPost": "View Post",
      "editPostButton": "Edit Post",
      "deletePost": "Delete Post",
      "approvePost": "Approve Post",
      "rejectPost": "Reject Post",
      "deleteTitle": "Delete Blog Post",
      "deleteMessage": "Are you sure you want to delete '{title}'? This action cannot be undone.",
      "approveTitle": "Approve Blog Post",
      "approveMessage": "Are you sure you want to approve '{title}' for publication?",
      "rejectTitle": "Reject Blog Post",
      "rejectMessage": "Are you sure you want to reject '{title}' and send it back to draft?",
      "formTitle": "Title",
      "formExcerpt": "Excerpt",
      "formContent": "Content",
      "formCategory": "Category",
      "formStatus": "Status",
      "titlePlaceholder": "Enter blog post title...",
      "excerptPlaceholder": "Enter a brief description of the post...",
      "contentPlaceholder": "Write your blog post content here...",
      "selectCategory": "Select a category",
      "seoSection": "SEO Settings",
      "metaTitle": "Meta Title",
      "metaDescription": "Meta Description",
      "featuredImage": "Featured Image URL",
      "metaTitlePlaceholder": "Custom title for search engines",
      "metaDescriptionPlaceholder": "Description for search engines",
      "imagePlaceholder": "https://example.com/image.jpg",
      "preview": "Preview",
      "closePreview": "Close Preview",
      "employeeNotice": "Note: Posts created by employees require administrator approval before publication."
    }
  },
  "CompanyCredibility": {
    "history": {
      "title": "Our History",
      "description": "Since 2004, CECOM has been at the forefront of technology solutions in the Dominican Republic. What started as a small computer repair service has evolved into a comprehensive IT solutions provider, serving businesses across various industries with cutting-edge technology and unparalleled expertise."
    },
    "stats": {
      "yearsExperience": "Years of Experience",
      "successfulProjects": "Successful Projects",
      "satisfiedClients": "Satisfied Clients",
      "certifications": "Industry Certifications"
    },
    "timeline": {
      "title": "Key Milestones",
      "description": "Major achievements that have shaped our journey and strengthened our position as a technology leader.",
      "milestones": {
        "founded": {
          "title": "Company Founded",
          "description": "CECOM was established in Santo Domingo, starting with computer repair and basic IT services."
        },
        "firstExpansion": {
          "title": "Service Expansion",
          "description": "Expanded into network infrastructure and enterprise solutions, serving medium and large businesses."
        },
        "majorContract": {
          "title": "Government Partnership",
          "description": "Secured major contracts with government institutions, establishing credibility in the public sector."
        },
        "modernization": {
          "title": "Digital Transformation",
          "description": "Embraced cloud technologies and modern IT solutions, becoming a leader in digital transformation services."
        }
      }
    },
    "achievements": {
      "title": "Certifications and Achievements",
      "description": "Our commitment to excellence is reflected in our industry certifications and recognition from leading technology partners.",
      "featuredPartners": "Strategic Technology Partners",
      "otherCertifications": "Additional Certifications",
      "viewMore": "View More",
      "showLess": "Show Less",
      "items": {
        "item1": "ISO 9001:2015 Quality Management Certification",
        "item2": "Microsoft Gold Partner Status",
        "item3": "Cisco Certified Partner",
        "item4": "VMware Authorized Partner",
        "item5": "HP Enterprise Preferred Partner",
        "item6": "Dominican Republic IT Excellence Award 2022"
      }
    }
  }
}

```

# messages/es.json

```json
{
  "Common": {
    "buttons": {
      "submit": "Enviar",
      "cancel": "Cancelar",
      "save": "Guardar",
      "delete": "Eliminar",
      "edit": "Editar",
      "close": "Cerrar",
      "retry": "Reintentar",
      "clearFilters": "Limpiar filtros",
      "viewDetails": "Ver Detalles",
      "previous": "Anterior",
      "next": "Siguiente",
      "allVendors": "Todos los Proveedores"
    },
    "states": {
      "loading": "Cargando...",
      "error": "Error",
      "success": "Éxito",
      "noData": "No hay datos disponibles",
      "sending": "Enviando...",
      "loadingCategories": "Cargando categorías...",
      "loadingProducts": "Cargando productos...",
      "errorLoadingCategories": "Error al cargar categorías",
      "errorLoadingProducts": "Error al cargar productos",
      "errorLoadingVendors": "Error al cargar proveedores",
      "noProducts": "No se encontraron productos",
      "noCategories": "No hay categorías disponibles",
      "noProductsInCategory": "No se encontraron productos en esta categoría",
      "tryAdjustingFilters": "Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.",
      "noProductsAvailable": "No hay productos disponibles actualmente en esta sección."
    },
    "accessibility": {
      "closeModal": "Cerrar modal",
      "openMenu": "Abrir menú",
      "selectLanguage": "Seleccionar idioma",
      "toggleTheme": "Cambiar tema",
      "toggleNavigation": "Alternar navegación",
      "topNavigation": "Superior",
      "logoAlt": "Logo de CECOM"
    },
    "theme": {
      "light": "Claro",
      "dark": "Oscuro",
      "system": "Sistema",
      "toggleTheme": "Cambiar tema"
    },
    "language": {
      "english": "🇺🇸 English",
      "spanish": "🇩🇴 Español",
      "toggleLanguage": "Cambiar idioma"
    }
  },
  "Validation": {
    "required": "Este campo es requerido",
    "requiredField": "Este campo es requerido",
    "email": "Por favor ingrese un correo electrónico válido",
    "phone": "Por favor ingrese un número de teléfono válido",
    "minLength": "Debe tener al menos {min} caracteres",
    "maxLength": "No debe tener más de {max} caracteres",
    "nameMinLength": "El nombre debe tener al menos 2 caracteres",
    "messageMinLength": "El mensaje debe tener al menos 10 caracteres",
    "phoneMinLength": "El número de teléfono debe tener al menos 10 dígitos",
    "invalidEmail": "Por favor ingrese un correo electrónico válido",
    "invalidPhone": "Por favor ingrese un número de teléfono válido",
    "invalidName": "El nombre solo puede contener letras y espacios"
  },
  "Home": {
    "title": "Soluciones Tecnológicas",
    "welcome": "de Vanguardia",
    "description": "Descubre nuestra amplia gama de productos tecnológicos: desde equipos de red y servidores hasta soluciones de almacenamiento y energía. Todo lo que necesitas para impulsar tu negocio.",
    "getStarted": "Ver Catálogo",
    "liveDemo": "Nuestras Soluciones",
    "productsShowcase": "Productos Destacados",
    "exploreProducts": "Explora nuestro catálogo completo de productos tecnológicos de las mejores marcas del mercado."
  },
  "Solutions": {
    "title": "Soluciones",
    "ourSolutions": "Nuestras Soluciones",
    "businessNeeds": "Todo lo que necesita para operar su negocio",
    "wideRange": "Ofrecemos una amplia gama de soluciones para satisfacer sus necesidades. Desde ciberseguridad hasta redes, lo tenemos cubierto.",
    "cybersecurity": {
      "name": "Ciberseguridad",
      "description": "Ofrecemos soluciones de ciberseguridad de primer nivel para proteger su negocio de amenazas."
    },
    "networking": {
      "name": "Redes",
      "description": "Ofrecemos soluciones de red robustas y escalables para su negocio."
    },
    "servers": {
      "name": "Servidores",
      "description": "Proporcionamos servidores confiables y de alto rendimiento para las necesidades de su negocio."
    },
    "storage": {
      "name": "Almacenamiento",
      "description": "Ofrecemos soluciones de almacenamiento escalables y seguras para sus datos."
    }
  },
  "Alliances": {
    "title": "Alianzas",
    "ourAlliances": "Nuestras Alianzas",
    "partnerMessage": "Nos asociamos con los mejores para ofrecerle las mejores soluciones.",
    "alliances": {
      "3cx": "3CX es una centralita privada (PBX) basada en software que utiliza el estándar SIP (Session Initiation Protocol).",
      "avaya": "Avaya es un líder global en sistemas, aplicaciones y servicios de comunicación.",
      "axis": "Axis es el líder del mercado en video en red.",
      "cambium": "Cambium Networks es un proveedor global líder de soluciones de banda ancha inalámbrica que conectan a los no conectados.",
      "dahua": "Dahua Technology es un proveedor líder mundial de soluciones y servicios de IoT inteligentes centrados en video.",
      "eset": "ESET es un proveedor global de software de seguridad para empresas y consumidores.",
      "extreme": "Extreme Networks es una empresa de redes que diseña, desarrolla y fabrica equipos de infraestructura de red cableados e inalámbricos.",
      "hp": "Hewlett Packard Enterprise es un líder tecnológico global centrado en el desarrollo de soluciones inteligentes para el mundo híbrido.",
      "jabra": "Jabra es una marca danesa especializada en equipos de audio y, más recientemente, sistemas de videoconferencia.",
      "lenovo": "Lenovo es una empresa multinacional de tecnología china que diseña, desarrolla, fabrica y vende computadoras personales, tabletas, teléfonos inteligentes, estaciones de trabajo, servidores, dispositivos de almacenamiento electrónico, software de gestión de TI y televisores inteligentes.",
      "panduit": "Panduit es un fabricante global de soluciones de infraestructura física que soportan sistemas de energía, comunicaciones, computación, control y seguridad.",
      "vertiv": "Vertiv es un proveedor global de infraestructura digital crítica y soluciones de continuidad.",
      "watchguard": "WatchGuard Technologies, Inc. es una empresa multinacional estadounidense de ciberseguridad.",
      "weboost": "weBoost es un fabricante líder de amplificadores de señal de teléfono celular."
    }
  },
  "AboutUs": {
    "title": "Nosotros",
    "description": "CECOM, S.A.S. es una empresa ubicada en Santo Domingo, República Dominicana, que opera en los campos de reparación de computadoras y servicios de tecnología de la información. Llevamos más de 20 años en el negocio y nos dedicamos a brindar las mejores soluciones para su negocio.",
    "contactUs": "Contáctenos",
    "ourTeam": "Nuestro Equipo",
    "ourPartners": "Nuestros Socios",
    "teamDescription": "Conoce a los profesionales que hacen posible nuestro éxito y el de nuestros clientes.",
    "partnersDescription": "Trabajamos con las mejores marcas del mercado para ofrecerte soluciones de calidad.",
    "readyToWork": "¿Listo para trabajar con nosotros?",
    "ctaDescription": "Contáctanos hoy mismo y descubre cómo podemos ayudarte a alcanzar tus objetivos tecnológicos.",
    "learnMore": "Conoce más sobre nuestra empresa, nuestro equipo y nuestros valores.",
    "mission": {
      "title": "Nuestra Misión",
      "description": "En CECOM, nos dedicamos a proporcionar soluciones tecnológicas innovadoras y servicios de calidad superior que impulsen el crecimiento y la eficiencia de nuestros clientes. Nuestra misión es ser el socio tecnológico de confianza que transforma los desafíos empresariales en oportunidades de éxito."
    },
    "vision": {
      "title": "Nuestra Visión",
      "description": "Ser reconocidos como la empresa líder en soluciones de tecnología de la información en la República Dominicana, destacándonos por nuestra excelencia en el servicio, innovación constante y compromiso con el desarrollo tecnológico de nuestros clientes y la comunidad."
    },
    "values": {
      "title": "Nuestros Valores",
      "excellence": {
        "title": "Excelencia",
        "description": "Nos esforzamos por superar las expectativas en cada proyecto."
      },
      "innovation": {
        "title": "Innovación",
        "description": "Adoptamos las últimas tecnologías para ofrecer soluciones vanguardistas."
      },
      "integrity": {
        "title": "Integridad",
        "description": "Actuamos con honestidad y transparencia en todas nuestras relaciones."
      },
      "commitment": {
        "title": "Compromiso",
        "description": "Nos dedicamos completamente al éxito de nuestros clientes."
      }
    }
  },
  "Contact": {
    "title": "Contacto",
    "getInTouch": "Ponte en contacto",
    "description": "Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta sobre nuestros servicios de tecnología.",
    "postalAddress": "Dirección postal",
    "addressLine1": "Av. Pasteur N.11",
    "addressLine2": "Gazcue, Santo Domingo",
    "addressLine3": "República Dominicana",
    "phoneNumber": "Número de teléfono",
    "phone": "+1 (809) 555-0123",
    "emailAddress": "Dirección de correo electrónico",
    "email": "info@cecom.com.do",
    "businessHours": "Horario de Atención",
    "weekdays": "Lunes - Viernes: 8:00 AM - 6:00 PM",
    "saturday": "Sábado: 9:00 AM - 1:00 PM",
    "sunday": "Domingo: Cerrado",
    "form": {
      "fullName": "Nombre completo",
      "fullNamePlaceholder": "Nombre completo",
      "emailPlaceholder": "Correo electrónico",
      "phonePlaceholder": "Teléfono",
      "message": "Mensaje",
      "messagePlaceholder": "Mensaje",
      "submit": "Enviar",
      "sending": "Enviando...",
      "successMessage": "Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.",
      "errorMessage": "Error al enviar el mensaje. Por favor, inténtalo de nuevo."
    },
    "validation": {
      "requiredField": "Este campo es requerido",
      "invalidEmail": "Por favor ingrese un correo electrónico válido",
      "invalidPhone": "Por favor ingrese un número de teléfono válido",
      "messageMinLength": "El mensaje debe tener al menos 10 caracteres",
      "nameMinLength": "El nombre debe tener al menos 2 caracteres"
    }
  },
  "Blog": {
    "title": "Blog",
    "subtitle": "Insights, guías y tendencias en tecnología empresarial para República Dominicana",
    "description": "Mantente actualizado con las últimas tendencias tecnológicas, consejos de ciberseguridad y soluciones empresariales de los expertos de CECOM.",
    "backToBlog": "Volver al Blog",
    "minRead": "min de lectura",
    "needHelp": "¿Necesitas Ayuda Experta?",
    "needHelpDescription": "Nuestros expertos en ciberseguridad y TI están listos para ayudarte a implementar estas soluciones en tu empresa.",
    "contactUs": "Contáctanos",
    "activeFilters": "Filtros Activos",
    "category": "Categoría",
    "tag": "Etiqueta",
    "search": "Búsqueda",
    "noPosts": "No se encontraron artículos",
    "noPostsDescription": "Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.",
    "categoryDescription": "Artículos en la categoría",
    "categorySubDescription": "Explora nuestros últimos insights y guías.",
    "tagDescription": "Artículos etiquetados con",
    "tagSubDescription": "Descubre contenido relacionado.",
    "tagPageDescription": "Todos los artículos etiquetados con",
    "noPostsInCategory": "Aún no hay artículos en esta categoría",
    "noPostsInCategoryDescription": "Estamos trabajando en agregar más contenido. ¡Vuelve pronto!",
    "articles": "artículos",
    "relatedPosts": "Artículos Relacionados",
    "relatedPostsComingSoon": "¡La función de artículos relacionados estará disponible pronto!"
  },
  "NotFound": {
    "title": "404 - Página no encontrada",
    "description": "La página que buscas no existe."
  },
  "Header": {
    "home": "Inicio",
    "solutions": "Soluciones",
    "alliances": "Alianzas",
    "blog": "Blog",
    "aboutUs": "Nosotros",
    "contact": "Contacto",
    "accessibility": {
      "mainNavigation": "Navegación principal",
      "homeLink": "Ir a la página de inicio",
      "solutionsLink": "Ir a la página de soluciones",
      "alliancesLink": "Ir a la página de alianzas",
      "blogLink": "Ir a la página del blog",
      "aboutUsLink": "Ir a la página acerca de nosotros",
      "contactLink": "Ir a la página de contacto",
      "logoLink": "Ir a la página de inicio",
      "logoAlt": "Logo de CECOM - Ir a la página de inicio",
      "languageSelector": "Selector de idioma",
      "languageSelectorButton": "Seleccionar idioma",
      "languageSelectorMenu": "Opciones de idioma",
      "selectEnglish": "Cambiar a inglés",
      "selectSpanish": "Cambiar a español",
      "mobileMenuButton": "Abrir menú de navegación móvil",
      "mobileMenuClose": "Cerrar menú de navegación móvil",
      "mobileNavigation": "Menú de navegación móvil",
      "themeToggle": "Alternar entre tema claro y oscuro",
      "skipToContent": "Saltar al contenido principal"
    },
    "tooltips": {
      "home": "Navegar a la página de inicio",
      "solutions": "Ver nuestras soluciones tecnológicas",
      "alliances": "Ver nuestras alianzas comerciales",
      "blog": "Lee nuestros últimos artículos e insights",
      "aboutUs": "Conoce más sobre nuestra empresa",
      "contact": "Ponte en contacto con nosotros",
      "languageSelector": "Cambiar idioma del sitio web",
      "themeToggle": "Cambiar entre modo claro y oscuro",
      "mobileMenu": "Abrir menú de navegación"
    }
  },
  "Footer": {
    "quickLinks": "Enlaces Rápidos",
    "followUs": "Síguenos",
    "rights": "Todos los derechos reservados.",
    "products": "Productos",
    "social": {
      "instagram": "Instagram",
      "facebook": "Facebook",
      "x": "X (Twitter)"
    }
  },
  "Catalog": {
    "categories": "Categorías",
    "allProducts": "Todos los Productos",
    "searchProducts": "Buscar productos...",
    "filterByVendor": "Filtrar por proveedor",
    "showingResults": "Mostrando {count} resultados",
    "features": "Características",
    "specifications": "Especificaciones",
    "datasheet": "Hoja de Datos",
    "modal": {
      "closeModal": "Cerrar",
      "previousProduct": "Anterior",
      "nextProduct": "Siguiente",
      "viewDatasheet": "Ver Hoja de Datos",
      "visitWebsite": "Visitar Sitio Web",
      "moreFeatures": "+{count} más",
      "noImageAvailable": "No hay imagen disponible",
      "description": "Descripción",
      "specificationsNote": "Para especificaciones detalladas, consulte la hoja de datos del producto o contacte a nuestro equipo de ventas.",
      "productImageAlt": "Imagen del producto",
      "logoAlt": "logo"
    },
    "filter": {
      "allVendors": "Todos los Proveedores",
      "filterByVendor": "Filtrar por proveedor",
      "clearFilters": "Limpiar filtros",
      "activeSearch": "\"{query}\"",
      "activeVendor": "{vendor}"
    },
    "states": {
      "loading": "Cargando...",
      "error": "Error",
      "loadingCategories": "Cargando categorías...",
      "errorLoadingCategories": "Error al cargar categorías",
      "noCategories": "No hay categorías disponibles",
      "loadingProducts": "Cargando productos...",
      "errorLoadingProducts": "Error al cargar productos",
      "noProducts": "No se encontraron productos",
      "noProductsInCategory": "No se encontraron productos en esta categoría"
    },
    "actions": {
      "viewDetails": "Ver Detalles",
      "retry": "Reintentar"
    }
  },
  "Admin": {
    "title": "CECOM CMS",
    "subtitle": "Panel de Administración",
    "status": {
      "active": "Activo",
      "loading": "Cargando panel de administración...",
      "error": "Error",
      "success": "Éxito"
    },
    "auth": {
      "loginRequired": "Necesitas iniciar sesión para acceder al panel de administración",
      "loginButton": "Iniciar Sesión",
      "signOut": "Cerrar Sesión",
      "accessDenied": "Acceso Denegado",
      "noPermissions": "No tienes permisos para acceder al panel de administración.",
      "currentRole": "Rol actual:",
      "developmentMode": "🧪 Cargando datos en modo desarrollo..."
    },
    "navigation": {
      "categories": "Categorías",
      "vendors": "Proveedores",
      "products": "Productos", 
      "pages": "Páginas"
    },
    "stats": {
      "categories": "Categorías",
      "vendors": "Proveedores",
      "products": "Productos",
      "pages": "Páginas"
    },
    "scrollIndicator": {
      "moreRowsBelow": "Más filas abajo",
      "moreContentBelow": "Más contenido abajo",
      "scrollDown": "Desplázate hacia abajo"
    },
    "search": {
      "searchCategories": "Buscar categorías...",
      "searchVendors": "Buscar proveedores...",
      "searchProducts": "Buscar productos..."
    },
    "tables": {
      "categories": "Categorías",
      "vendors": "Proveedores", 
      "products": "Productos",
      "actions": "Acciones",
      "name": "Nombre",
      "image": "Imagen",
      "slug": "Slug",
      "order": "Orden",
      "website": "Sitio Web",
      "category": "Categoría",
      "vendor": "Proveedor",
      "status": "Estado",
      "active": "Activo",
      "inactive": "Inactivo",
      "noWebsite": "Sin sitio web",
      "noName": "Sin nombre",
      "noTranslation": "Sin traducción",
      "noCategory": "Sin categoría",
      "noVendor": "Sin proveedor"
    },
    "buttons": {
      "newCategory": "+ Nueva Categoría",
      "newVendor": "+ Nuevo Proveedor",
      "newProduct": "+ Nuevo Producto",
      "edit": "Editar",
      "delete": "Eliminar"
    },
    "confirmations": {
      "deleteCategory": "¿Estás seguro de que quieres eliminar esta categoría?",
      "deleteVendor": "¿Estás seguro de que quieres eliminar este proveedor?",
      "deleteProduct": "¿Estás seguro de que quieres eliminar este producto?"
    },
    "confirmDialog": {
      "title": "Confirmar Acción",
      "deleteTitle": "Confirmar Eliminación",
      "message": "¿Estás seguro de que quieres realizar esta acción?",
      "deleteMessage": "Esta acción no se puede deshacer.",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "delete": "Eliminar",
      "deleteConfirm": "Sí, eliminar"
    },
    "errors": {
      "deleteCategory": "Error al eliminar la categoría. Por favor, intente de nuevo.",
      "deleteVendor": "Error al eliminar el proveedor. Por favor, intente de nuevo.",
      "deleteProduct": "Error al eliminar el producto. Por favor, intente de nuevo.",
      "categoryInUseTitle": "No se puede eliminar la categoría",
      "categoryInUseDescription": "Esta categoría no se puede eliminar porque está siendo utilizada por uno o más productos. Por favor, reasigne o elimine esos productos primero.",
      "loadingCategories": "Error al cargar categorías",
      "loadingVendors": "Error al cargar proveedores",
      "loadingProducts": "Error al cargar productos"
    },
    "placeholders": {
      "pagesComingSoon": "Gestión de páginas próximamente..."
    },
    "forms": {
      "category": {
        "title": "Categoría",
        "newTitle": "Nueva Categoría",
        "editTitle": "Editar Categoría",
        "nameEn": "Nombre (Inglés)",
        "nameEs": "Nombre (Español)",
        "descriptionEn": "Descripción (Inglés)",
        "descriptionEs": "Descripción (Español)",
        "slug": "Slug",
        "order": "Orden",
        "icon": "Icono",
        "selectIcon": "Seleccionar Icono",
        "generateSlug": "Generar desde nombre en inglés",
        "save": "Guardar Categoría",
        "cancel": "Cancelar",
        "saving": "Guardando...",
        "errorSaving": "Error al guardar la categoría"
      },
      "vendor": {
        "title": "Proveedor",
        "newTitle": "Nuevo Proveedor",
        "editTitle": "Editar Proveedor",
        "name": "Nombre",
        "website": "Sitio Web",
        "descriptionEn": "Descripción (Inglés)",
        "descriptionEs": "Descripción (Español)",
        "save": "Guardar Proveedor",
        "cancel": "Cancelar",
        "saving": "Guardando...",
        "errorSaving": "Error al guardar el proveedor"
      },
      "product": {
        "title": "Producto",
        "newTitle": "Nuevo Producto",
        "editTitle": "Editar Producto",
        "nameEn": "Nombre (Inglés)",
        "nameEs": "Nombre (Español)",
        "descriptionEn": "Descripción (Inglés)",
        "descriptionEs": "Descripción (Español)",
        "featuresEn": "Características (Inglés)",
        "featuresEs": "Características (Español)",
        "imageUrl": "URL de la imagen",
        "category": "Categoría",
        "vendor": "Proveedor",
        "order": "Orden",
        "active": "Activo",
        "addFeature": "Agregar Característica",
        "removeFeature": "Eliminar",
        "selectCategory": "Seleccionar categoría",
        "selectVendor": "Seleccionar proveedor",
        "save": "Guardar Producto",
        "cancel": "Cancelar",
        "saving": "Guardando...",
        "errorSaving": "Error al guardar el producto"
      },
      "validation": {
        "required": "Este campo es requerido",
        "invalidUrl": "URL inválida",
        "minLength": "Mínimo {min} caracteres",
        "maxLength": "Máximo {max} caracteres",
        "duplicateName": "Ya existe una {type} con este nombre",
        "duplicateSlug": "Ya existe una categoría con este slug"
      }
    }
  },
  "AdminPanel": {
    "title": "Panel de Administración - CECOM",
    "navigation": {
      "cms": "CMS",
      "users": "Usuarios",
      "blogs": "Blogs",
      "tickets": "Tickets",
      "cotizaciones": "Cotizaciones",
      "aplicaciones": "Aplicaciones",
      "vpns": "VPNs"
    },
    "common": {
      "search": "Buscar...",
      "filter": "Filtrar",
      "actions": "Acciones",
      "status": "Estado",
      "created": "Creado",
      "updated": "Actualizado",
      "save": "Guardar",
      "cancel": "Cancelar",
      "delete": "Eliminar",
      "edit": "Editar",
      "view": "Ver",
      "add": "Agregar",
      "loading": "Cargando...",
      "noData": "No hay datos disponibles",
      "saving": "Guardando...",
      "create": "Crear",
      "update": "Actualizar",
      "confirm": "Confirmar",
      "approve": "Aprobar",
      "reject": "Rechazar"
    },
    "users": {
      "title": "Gestión de Usuarios",
      "newUser": "Nuevo Usuario",
      "searchPlaceholder": "Buscar usuarios...",
      "noUsersFound": "No se encontraron usuarios",
      "status": {
        "all": "Todos",
        "active": "Activo",
        "inactive": "Inactivo",
        "pending": "Pendiente",
        "approved": "Aprobado",
        "rejected": "Rechazado"
      },
      "roles": {
        "all": "Todos los Roles"
      },
      "stats": {
        "total": "Total Usuarios",
        "active": "Activos",
        "pending": "Pendientes",
        "inactive": "Inactivos"
      },
      "actions": {
        "approve": "Aprobar",
        "reject": "Rechazar",
        "viewDetails": "Ver Detalles"
      },
      "table": {
        "name": "Nombre",
        "email": "Email",
        "role": "Rol",
        "status": "Estado",
        "created": "Creado"
      },
      "userDetails": {
        "title": "Detalles del Usuario",
        "fullName": "Nombre Completo",
        "email": "Email",
        "role": "Rol",
        "status": "Estado",
        "registrationDate": "Fecha de Registro",
        "approvalDate": "Fecha de Aprobación"
      }
    },
    "tickets": {
      "title": "Gestión de Tickets",
      "newTicket": "Nuevo Ticket",
      "searchPlaceholder": "Buscar tickets...",
      "noTicketsFound": "No se encontraron tickets",
      "status": {
        "all": "Todos",
        "open": "Abierto",
        "inProgress": "En Progreso",
        "in_progress": "En Progreso",
        "resolved": "Resuelto",
        "closed": "Cerrado"
      },
      "priority": {
        "all": "Todas las Prioridades",
        "low": "Baja",
        "medium": "Media",
        "high": "Alta",
        "urgent": "Urgente"
      },
      "stats": {
        "total": "Total Tickets",
        "open": "Abiertos",
        "inProgress": "En Progreso",
        "resolved": "Resueltos",
        "urgent": "Urgentes"
      },
      "table": {
        "title": "Título",
        "subject": "Asunto",
        "client": "Cliente",
        "category": "Categoría",
        "priority": "Prioridad",
        "status": "Estado",
        "date": "Fecha",
        "created": "Creado"
      },
      "form": {
        "title": "Título",
        "description": "Descripción",
        "category": "Categoría",
        "assignedTo": "Asignado a"
      }
    },
    "cotizaciones": {
      "title": "Gestión de Cotizaciones",
      "newCotizacion": "Nueva Cotización",
      "newQuote": "Nueva Cotización",
      "searchPlaceholder": "Buscar cotizaciones...",
      "noCotizacionesFound": "No se encontraron cotizaciones",
      "status": {
        "all": "Todas",
        "draft": "Borrador",
        "sent": "Enviada",
        "accepted": "Aceptada",
        "rejected": "Rechazada",
        "approved": "Aprobada",
        "expired": "Expirada"
      },
      "stats": {
        "total": "Total Cotizaciones",
        "draft": "Borradores",
        "sent": "Enviadas",
        "accepted": "Aceptadas",
        "approved": "Aprobadas",
        "approvedValue": "Valor Aprobado"
      },
      "table": {
        "client": "Cliente",
        "description": "Descripción",
        "products": "Productos",
        "status": "Estado",
        "amount": "Monto",
        "date": "Fecha",
        "totalAmount": "Monto Total",
        "validUntil": "Válida Hasta"
      },
      "form": {
        "clientName": "Nombre del Cliente",
        "clientEmail": "Correo del Cliente",
        "clientPhone": "Teléfono del Cliente",
        "company": "Empresa",
        "description": "Descripción",
        "products": "Productos",
        "totalAmount": "Monto Total",
        "validUntil": "Válida Hasta"
      }
    },
    "aplicaciones": {
      "title": "Gestión de Aplicaciones",
      "newApplication": "Nueva Aplicación",
      "searchPlaceholder": "Buscar aplicaciones...",
      "noApplicationsFound": "No se encontraron aplicaciones",
      "status": {
        "all": "Todas",
        "active": "Activa",
        "inactive": "Inactiva",
        "pending": "Pendiente"
      },
      "types": {
        "all": "Todos los Tipos"
      },
      "stats": {
        "total": "Total Aplicaciones",
        "submitted": "Enviadas",
        "underReview": "En Revisión",
        "approved": "Aprobadas",
        "deployed": "Desplegadas"
      },
      "table": {
        "application": "Aplicación",
        "client": "Cliente",
        "type": "Tipo",
        "status": "Estado",
        "date": "Fecha",
        "name": "Nombre",
        "version": "Versión",
        "lastUpdate": "Última Actualización"
      }
    },
    "vpns": {
      "title": "Gestión de VPNs",
      "newVPN": "Nueva VPN",
      "searchPlaceholder": "Buscar VPNs...",
      "noVPNsFound": "No se encontraron VPNs",
      "status": {
        "all": "Todas",
        "requested": "Solicitada",
        "approved": "Aprobada",
        "active": "Activa",
        "expired": "Expirada",
        "configuring": "Configurando",
        "suspended": "Suspendida",
        "terminated": "Terminada"
      },
      "locations": {
        "all": "Todas las Ubicaciones"
      },
      "stats": {
        "total": "Total VPNs",
        "requested": "Solicitadas",
        "approved": "Aprobadas",
        "active": "Activas",
        "configuring": "Configurando",
        "suspended": "Suspendidas",
        "expired": "Expiradas"
      },
      "table": {
        "name": "Nombre",
        "client": "Cliente",
        "user": "Usuario",
        "location": "Ubicación",
        "status": "Estado",
        "expires": "Expira",
        "expiryDate": "Fecha de Vencimiento",
        "bandwidth": "Ancho de Banda"
      }
    },
    "blogs": {
      "title": "Gestión de Blogs",
      "subtitle": "Crear y gestionar artículos del blog",
      "createPost": "Crear Artículo",
      "editPost": "Editar Artículo",
      "editPostAction": "Editar Artículo",
      "createSubtitle": "Crear un nuevo artículo del blog",
      "editSubtitle": "Editar artículo existente",
      "noPosts": "No se encontraron artículos del blog",
      "searchPlaceholder": "Buscar artículos del blog...",
      "filterAll": "Todos los Artículos",
      "statusPublished": "Publicado",
      "statusDraft": "Borrador",
      "statusPending": "Pendiente de Aprobación",
      "tableTitle": "Título",
      "tableStatus": "Estado",
      "tableAuthor": "Autor",
      "tableDate": "Fecha",
      "tableActions": "Acciones",
      "viewPost": "Ver Artículo",
      "editPostButton": "Editar Artículo",
      "deletePost": "Eliminar Artículo",
      "approvePost": "Aprobar Artículo",
      "rejectPost": "Rechazar Artículo",
      "deleteTitle": "Eliminar Artículo del Blog",
      "deleteMessage": "¿Estás seguro de que quieres eliminar '{title}'? Esta acción no se puede deshacer.",
      "approveTitle": "Aprobar Artículo del Blog",
      "approveMessage": "¿Estás seguro de que quieres aprobar '{title}' para publicación?",
      "rejectTitle": "Rechazar Artículo del Blog",
      "rejectMessage": "¿Estás seguro de que quieres rechazar '{title}' y enviarlo de vuelta a borrador?",
      "formTitle": "Título",
      "formExcerpt": "Extracto",
      "formContent": "Contenido",
      "formCategory": "Categoría",
      "formStatus": "Estado",
      "titlePlaceholder": "Ingresa el título del artículo...",
      "excerptPlaceholder": "Ingresa una breve descripción del artículo...",
      "contentPlaceholder": "Escribe el contenido de tu artículo aquí...",
      "selectCategory": "Selecciona una categoría",
      "seoSection": "Configuración SEO",
      "metaTitle": "Meta Título",
      "metaDescription": "Meta Descripción",
      "featuredImage": "URL de Imagen Destacada",
      "metaTitlePlaceholder": "Título personalizado para motores de búsqueda",
      "metaDescriptionPlaceholder": "Descripción para motores de búsqueda",
      "imagePlaceholder": "https://ejemplo.com/imagen.jpg",
      "preview": "Vista Previa",
      "closePreview": "Cerrar Vista Previa",
      "employeeNotice": "Nota: Los artículos creados por empleados requieren aprobación del administrador antes de la publicación."
    }
  },
  "CompanyCredibility": {
    "history": {
      "title": "Nuestra Historia",
      "description": "Desde 2004, CECOM ha estado a la vanguardia de las soluciones tecnológicas en la República Dominicana. Lo que comenzó como un pequeño servicio de reparación de computadoras ha evolucionado hasta convertirse en un proveedor integral de soluciones de TI, sirviendo a empresas de diversas industrias con tecnología de vanguardia y experiencia incomparable."
    },
    "stats": {
      "yearsExperience": "Años de Experiencia",
      "successfulProjects": "Proyectos Exitosos",
      "satisfiedClients": "Clientes Satisfechos",
      "certifications": "Certificaciones de la Industria"
    },
    "timeline": {
      "title": "Hitos Clave",
      "description": "Logros importantes que han moldeado nuestro camino y fortalecido nuestra posición como líder tecnológico.",
      "milestones": {
        "founded": {
          "title": "Fundación de la Empresa",
          "description": "CECOM fue establecida en Santo Domingo, comenzando con reparación de computadoras y servicios básicos de TI."
        },
        "firstExpansion": {
          "title": "Expansión de Servicios",
          "description": "Se expandió hacia infraestructura de redes y soluciones empresariales, sirviendo a medianas y grandes empresas."
        },
        "majorContract": {
          "title": "Alianza Gubernamental",
          "description": "Aseguró contratos importantes con instituciones gubernamentales, estableciendo credibilidad en el sector público."
        },
        "modernization": {
          "title": "Transformación Digital",
          "description": "Adoptó tecnologías en la nube y soluciones de TI modernas, convirtiéndose en líder en servicios de transformación digital."
        }
      }
    },
    "achievements": {
      "title": "Certificaciones y Logros",
      "description": "Nuestro compromiso con la excelencia se refleja en nuestras certificaciones de la industria y el reconocimiento de socios tecnológicos líderes.",
      "featuredPartners": "Socios Tecnológicos Estratégicos",
      "otherCertifications": "Certificaciones Adicionales",
      "viewMore": "Ver Más",
      "showLess": "Ver Menos",
      "items": {
        "item1": "Certificación ISO 9001:2015 de Gestión de Calidad",
        "item2": "Estatus de Microsoft Gold Partner",
        "item3": "Socio Certificado de Cisco",
        "item4": "Socio Autorizado de VMware",
        "item5": "Socio Preferido de HP Enterprise",
        "item6": "Premio de Excelencia en TI República Dominicana 2022"
      }
    }
  }
}
```

# middleware.ts

```ts
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'es'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }
}

function getLocale(request: NextRequest): string {
  // Check if user has a preferred locale in cookies
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0];
    
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

// Don't apply the locale prefix for admin panel routes
const adminPanelPaths = [
  '/admin-panel',
  '/login',
  '/api/auth',
  '/api/admin'
];

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files
    '/((?!_next|api/auth|api/admin|favicon.ico|.*\\..*).*)' 
  ]
};
```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

# next.config.mjs

```mjs
import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

// Ensure timezone is set at process level for SSR and tooling
process.env.TZ = process.env.TZ || 'America/Santo_Domingo';

// Point the plugin to the request config which sets timeZone & messages
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2'],
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    reactCompiler: false,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['cecom.do', 'localhost'],
    // Add Supabase storage domain when available
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(withPayload(nextConfig));

```

# package.json

```json
{
  "name": "cecom-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "validate:translations": "node scripts/validate-translations.js",
    "theme:standardize": "node scripts/standardize-dark-theme.js --write",
    "payload:generate-types": "payload generate:types",
    "payload:generate-graphql": "payload generate:graphQLSchema",
    "setup:supabase": "node scripts/setup-supabase.js",
    "setup:storage": "node scripts/setup-storage.js",
    "migrate:data": "node scripts/migrate-data.js",
    "test:payload": "node scripts/test-payload-collections.js",
    "test:config": "node scripts/test-payload-config.js",
    "setup:payload": "node scripts/setup-payload.js",
    "migrate:existing": "node scripts/migrate-existing-data.js",
    "create:admin": "node scripts/create-admin-user.js",
    "confirm:admin": "node scripts/confirm-admin-user.js",
    "create:test": "node scripts/create-test-user.js",
    "test:supabase": "node scripts/test-supabase-access.js",
    "fix:theme": "node scripts/fix-dark-theme.js",
    "fix:colors": "node scripts/fix-admin-colors.js",
    "fix:final": "node scripts/final-color-fix.js",
    "theme:apply": "node scripts/apply-consistent-theme.js",
    "test:write": "node scripts/test-write-operations.js"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.1",
    "@payloadcms/db-postgres": "^3.50.0",
    "@payloadcms/next": "^3.50.0",
    "@payloadcms/richtext-slate": "^3.50.0",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@supabase/supabase-js": "^2.56.0",
    "@tiptap/react": "^3.0.9",
    "@tiptap/starter-kit": "^3.0.9",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "dotenv": "^17.2.1",
    "fast-xml-parser": "^5.2.5",
    "framer-motion": "^12.23.12",
    "graphql": "^16.11.0",
    "lucide-react": "^0.378.0",
    "marked": "^16.2.0",
    "next": "^15.4.4",
    "next-intl": "^4.3.4",
    "next-themes": "^0.4.6",
    "payload": "^3.50.0",
    "pg": "^8.16.3",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.62.0",
    "rss-parser": "^3.13.0",
    "sass": "^1.90.0",
    "tailwind-merge": "^2.3.0",
    "tailwindcss": "^3.4.17",
    "three": "^0.179.1",
    "web-vitals": "^5.1.0",
    "zod": "^4.0.14"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/glob": "^8.1.0",
    "@types/node": "^20",
    "@types/pg": "^8.15.5",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/three": "^0.179.0",
    "@vitest/ui": "^3.2.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^8",
    "eslint-config-next": "14.2.3",
    "glob": "^11.0.3",
    "jsdom": "^26.1.0",
    "postcss": "^8.5.6",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}

```

# payload.config.ts

```ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'cecom-payload-secret-key-for-development-2024',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- CECOM Admin',
    },
  },
  editor: slateEditor({
    admin: {
      elements: [
        'h1',
        'h2', 
        'h3',
        'h4',
        'blockquote',
        'ul',
        'ol',
        'li',
        'link',
        'upload',
      ],
      leaves: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'code',
      ],
    },
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.SUPABASE_DATABASE_URL,
    },
  }),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
  collections: [
    // Users collection for authentication
    {
      slug: 'users',
      auth: {
        tokenExpiration: 7200, // 2 hours
      },
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
          ],
          defaultValue: 'editor',
          required: true,
        },
        {
          name: 'firstName',
          type: 'text',
        },
        {
          name: 'lastName',
          type: 'text',
        },
      ],
    },
    // Categories collection
    {
      slug: 'categories',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'icon',
          type: 'text',
        },
      ],
    },
    // Vendors collection
    {
      slug: 'vendors',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'website',
          type: 'text',
        },
        {
          name: 'rssUrl',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    // Products collection
    {
      slug: 'products',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'richText',
          localized: true,
        },
        {
          name: 'features',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'feature',
              type: 'text',
            },
          ],
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
        },
        {
          name: 'vendor',
          type: 'relationship',
          relationTo: 'vendors',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'datasheet',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    // Pages collection for content management
    {
      slug: 'pages',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'content',
          type: 'richText',
          localized: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Hero', value: 'hero' },
            { label: 'About', value: 'about' },
            { label: 'Contact', value: 'contact' },
            { label: 'Page', value: 'page' },
          ],
          required: true,
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    // News articles collection
    {
      slug: 'news-articles',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'summary',
          type: 'textarea',
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'vendor',
          type: 'relationship',
          relationTo: 'vendors',
        },
        {
          name: 'sourceUrl',
          type: 'text',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'tags',
          type: 'array',
          fields: [
            {
              name: 'tag',
              type: 'text',
            },
          ],
        },
      ],
    },
    // Blog Posts collection
    {
      slug: 'blog-posts',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'URL-friendly version of the title',
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
          localized: true,
          admin: {
            description: 'Brief summary for article previews',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          localized: true,
        },
        {
          name: 'featuredImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Main image for the blog post',
          },
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'blog-categories',
          required: true,
        },
        {
          name: 'tags',
          type: 'relationship',
          relationTo: 'blog-tags',
          hasMany: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'publishedDate',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
        },
        {
          name: 'readingTime',
          type: 'number',
          admin: {
            description: 'Estimated reading time in minutes',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
          defaultValue: 'draft',
          required: true,
        },
        {
          name: 'seo',
          type: 'group',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'keywords',
              type: 'text',
              localized: true,
            },
          ],
        },
      ],
      hooks: {
        beforeChange: [
          async ({ data }) => {
            // Auto-generate reading time based on content length
            if (data.content && !data.readingTime) {
              const wordCount = JSON.stringify(data.content).split(' ').length;
              data.readingTime = Math.ceil(wordCount / 200); // 200 words per minute
            }
            return data;
          },
        ],
      },
    },
    // Blog Categories collection
    {
      slug: 'blog-categories',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            description: 'Hex color code for category badge',
          },
        },
      ],
    },
    // Blog Tags collection
    {
      slug: 'blog-tags',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
      ],
    },
    // Media collection for file uploads
    {
      slug: 'media',
      upload: {
        staticDir: 'media',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
          {
            name: 'tablet',
            width: 1024,
            height: undefined,
            position: 'centre',
          },
          {
            name: 'mobile',
            width: 480,
            height: undefined,
            position: 'centre',
          },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*', 'application/pdf'],
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          admin: {
            description: 'Alternative text for accessibility (required for images)',
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Optional caption for the media',
          },
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Product Image', value: 'product' },
            { label: 'Vendor Logo', value: 'logo' },
            { label: 'Content Image', value: 'content' },
            { label: 'Document', value: 'document' },
          ],
          admin: {
            description: 'Categorize media for better organization',
          },
        },
      ],
      access: {
        read: () => true, // Public read access
        create: ({ req: { user } }) => !!user, // Only authenticated users can upload
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin', // Only admins can delete
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            // Auto-generate alt text if not provided for images
            if (!data.alt && data.mimeType?.startsWith('image/')) {
              data.alt = `Image: ${data.filename}`
            }
            return data
          },
        ],
        afterChange: [
          async ({ doc, req }) => {
            // Log media uploads for audit trail
            if (req.user) {
              console.log(`Media uploaded by ${req.user.email}: ${doc.filename}`)
            }
            return doc
          },
        ],
      },
    },
  ],
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  typescript: {
    outputFile: 'src/types/payload-types.ts',
  },
  graphQL: {
    schemaOutputFile: 'src/generated/schema.graphql',
  },
})
```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

# public/manifest.json

```json
{
  "name": "CECOM - Technology Solutions",
  "short_name": "CECOM",
  "description": "Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1f2937",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/logos/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/logos/cecom-logo.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logos/cecom-logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["business", "technology", "productivity"],
  "lang": "en",
  "dir": "ltr"
}

```

# public/sw.js

```js
const CACHE_NAME = 'cecom-v1';
const urlsToCache = [
  '/',
  '/es',
  '/en',
  '/manifest.json',
  '/logos/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

```

# src/app/[locale]/_not-found.tsx

```tsx
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}
```

# src/app/[locale]/about/page.tsx

```tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getPageBySlug, getTeamMembers, getVendors } from '@/lib/payload/api';
import { RichTextRenderer } from '@/components/about/RichTextRenderer';
import { TeamMember } from '@/components/about/TeamMember';
import { VendorGrid } from '@/components/about/VendorGrid';
import { MissionVisionValues } from '@/components/about/MissionVisionValues';
import { CompanyCredibility } from '@/components/about/CompanyCredibility';

interface AboutPageProps {
  params: Promise<{
    locale: 'en' | 'es';
  }>;
}

export default async function About({ params }: AboutPageProps) {
  const { locale } = await params;
  // Fetch data from Payload CMS
  const [aboutPage, teamMembers, vendors] = await Promise.all([
    getPageBySlug('about', locale),
    getTeamMembers(locale),
    getVendors()
  ]);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            {aboutPage?.title || (locale === 'es' ? 'Nosotros' : 'About Us')}
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground">
            {locale === 'es' 
              ? 'Conoce más sobre nuestra empresa, nuestro equipo y nuestros valores.'
              : 'Learn more about our company, our team, and our values.'
            }
          </p>
        </div>

        {/* Mission, Vision & Values */}
        <MissionVisionValues />

        {/* Company Credibility */}
        <CompanyCredibility />

        {/* Team Section */}
        {teamMembers && teamMembers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {locale === 'es' ? 'Nuestro Equipo' : 'Our Team'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {locale === 'es'
                  ? 'Conoce a los profesionales que hacen posible nuestro éxito y el de nuestros clientes.'
                  : 'Meet the professionals who make our success and that of our clients possible.'
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <TeamMember
                  key={member.id}
                  name={member.name}
                  position={member.position}
                  bio={member.bio}
                  image={member.image}
                />
              ))}
            </div>
          </div>
        )}

        {/* Vendor Partners Section */}
        {vendors && vendors.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {locale === 'es' ? 'Nuestros Socios' : 'Our Partners'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {locale === 'es'
                  ? 'Trabajamos con las mejores marcas del mercado para ofrecerte soluciones de calidad.'
                  : 'We work with the best brands in the market to offer you quality solutions.'
                }
              </p>
            </div>
            <VendorGrid vendors={vendors} />
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {locale === 'es' ? '¿Listo para trabajar con nosotros?' : 'Ready to work with us?'}
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              {locale === 'es'
                ? 'Contáctanos hoy mismo y descubre cómo podemos ayudarte a alcanzar tus objetivos tecnológicos.'
                : 'Contact us today and discover how we can help you achieve your technology goals.'
              }
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200"
            >
              {locale === 'es' ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# src/app/[locale]/admin/page.tsx

```tsx
import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to the new admin panel
  redirect('/admin-panel');
}
```

# src/app/[locale]/alliances/page.tsx

```tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const alliances = [
  {
    name: '3CX',
    logo: '/logos/3cx.png',
    descriptionKey: 'alliances.3cx',
  },
  {
    name: 'Avaya',
    logo: '/logos/avaya.png',
    descriptionKey: 'alliances.avaya',
  },
  {
    name: 'Axis',
    logo: '/logos/axis.png',
    descriptionKey: 'alliances.axis',
  },
  {
    name: 'Cambium Networks',
    logo: '/logos/cambium.png',
    descriptionKey: 'alliances.cambium',
  },
  {
    name: 'Dahua',
    logo: '/logos/dahua.png',
    descriptionKey: 'alliances.dahua',
  },
  {
    name: 'Eset',
    logo: '/logos/eset.png',
    descriptionKey: 'alliances.eset',
  },
  {
    name: 'Extreme Networks',
    logo: '/logos/extreme.png',
    descriptionKey: 'alliances.extreme',
  },
  {
    name: 'Hewlett Packard',
    logo: '/logos/hp.png',
    descriptionKey: 'alliances.hp',
  },
  {
    name: 'Jabra',
    logo: '/logos/jabra.png',
    descriptionKey: 'alliances.jabra',
  },
  {
    name: 'Lenovo',
    logo: '/logos/lenovo.png',
    descriptionKey: 'alliances.lenovo',
  },
  {
    name: 'Panduit',
    logo: '/logos/panduit.png',
    descriptionKey: 'alliances.panduit',
  },
  {
    name: 'Vertiv',
    logo: '/logos/vertiv.png',
    descriptionKey: 'alliances.vertiv',
  },
  {
    name: 'WatchGuard',
    logo: '/logos/watchguard.png',
    descriptionKey: 'alliances.watchguard',
  },
  {
    name: 'weBoost',
    logo: '/logos/weboost.png',
    descriptionKey: 'alliances.weboost',
  },
];

export default function Alliances() {
  const t = useTranslations('Alliances');

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            {t('ourAlliances')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('partnerMessage')}
          </p>
        </div>
        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {alliances.map((alliance) => (
            <Card key={alliance.name} className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg">
              <CardHeader className="p-6">
                <div className="relative w-full h-40 bg-gradient-to-br from-muted to-accent rounded-lg overflow-hidden flex items-center justify-center p-4 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                  <img
                    src={alliance.logo}
                    alt={alliance.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <CardTitle className="mt-4 text-lg font-bold text-foreground text-center">
                  <Link href="./contact" className="hover:text-primary transition-colors duration-200">
                    {alliance.name}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground text-center leading-relaxed">
                  {t(alliance.descriptionKey)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

```

# src/app/[locale]/blog/[slug]/page.tsx

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Calendar, Clock, Tag, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { getBlogPost } from '@/lib/supabase-blog';
import { parseDate, formatDate } from '@/utils/blog';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado | CECOM',
    };
  }

  return {
    title: `${post.title} | CECOM Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: locale,
      images: post.featuredImage ? [post.featuredImage] : ['/blog/default.jpg'],
      publishedTime: post.publishedDate,
      authors: ['CECOM Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        'es': `/es/blog/${slug}`,
        'en': `/en/blog/${slug}`,
      }
    }
  };
}


export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const post = await getBlogPost(slug);
  
  if (!post) {
    notFound();
  }

  const parsedDate = parseDate(post.publishedDate);
  const formattedDate = formatDate(parsedDate, locale);

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToBlog')}
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <Link
              href={`/${locale}/blog/category/${post.category.toLowerCase()}`}
              className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {post.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedDate}>{formattedDate}</time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/${locale}/blog/tag/${tag}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded text-xs hover:bg-accent/80 transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Link>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="bg-accent rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              {t('needHelp')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('needHelpDescription')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('contactUs')}
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Posts - TODO: Implement related posts component */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">{t('relatedPosts')}</h2>
        <p className="text-muted-foreground">{t('relatedPostsComingSoon')}</p>
      </section>
    </div>
  );
}

```

# src/app/[locale]/blog/category/[category]/page.tsx

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { normalizeBlogPost, filterBlogPosts, sortBlogPosts, paginateBlogPosts } from '@/utils/blog';
import fs from 'fs';
import path from 'path';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const categoryName = decodeURIComponent(category);
  
  return {
    title: `${categoryName} | ${t('title')} | CECOM`,
    description: `${t('categoryDescription')} ${categoryName}. ${t('categorySubDescription')}`,
    keywords: `${categoryName.toLowerCase()}, blog tecnología, CECOM, República Dominicana`,
    openGraph: {
      title: `${categoryName} | CECOM Blog`,
      description: `${t('categoryDescription')} ${categoryName}`,
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/blog/category/${category}`,
      languages: {
        'es': `/es/blog/category/${category}`,
        'en': `/en/blog/category/${category}`,
      }
    }
  };
}

// Load RSS data from local files and filter by category
function loadBlogPosts(): BlogPost[] {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'blog')
    const postsPath = path.join(dataDir, 'posts.json')
    
    if (fs.existsSync(postsPath)) {
      const rawPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))
      return rawPosts.map((post: any) => normalizeBlogPost(post))
    }
  } catch (error) {
    console.error('Error loading blog posts:', error)
  }
  
  return []
}

async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const allPosts = loadBlogPosts();
  const sortedPosts = sortBlogPosts(allPosts);
  
  // Load categories to map slug to ID
  try {
    const categoriesPath = path.join(process.cwd(), 'data', 'blog', 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      const category = categories.find((cat: any) => cat.slug === categorySlug);
      
      if (category) {
        // Filter posts by category ID
        return filterBlogPosts(sortedPosts, {
          category: category.id,
          status: 'published'
        });
      }
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
  
  return [];
}

// Category metadata mapping
const categoryMetadata = {
  'ciberseguridad': {
    name: { es: 'Ciberseguridad', en: 'Cybersecurity' },
    description: { 
      es: 'Artículos sobre protección digital, firewalls, antivirus y mejores prácticas de seguridad informática.',
      en: 'Articles about digital protection, firewalls, antivirus and cybersecurity best practices.'
    }
  },
  'cat-cybersecurity': {
    name: { es: 'Ciberseguridad', en: 'Cybersecurity' },
    description: { 
      es: 'Artículos sobre protección digital, firewalls, antivirus y mejores prácticas de seguridad informática.',
      en: 'Articles about digital protection, firewalls, antivirus and cybersecurity best practices.'
    }
  },
  'redes': {
    name: { es: 'Redes', en: 'Networking' },
    description: { 
      es: 'Todo sobre infraestructura de red, switches, routers y conectividad empresarial.',
      en: 'Everything about network infrastructure, switches, routers and enterprise connectivity.'
    }
  }
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, category } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const posts = await getPostsByCategory(category);
  
  if (posts.length === 0) {
    notFound();
  }

  // Apply pagination
  const currentPage = parseInt(page);
  const paginationResult = paginateBlogPosts(posts, currentPage, 6);

  // Get category metadata
  const categoryKey = category.toLowerCase();
  const metadata = categoryMetadata[categoryKey as keyof typeof categoryMetadata];
  const categoryName = metadata?.name[locale as 'es' | 'en'] || category;
  const categoryDescription = metadata?.description[locale as 'es' | 'en'] || '';

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Back Navigation */}
            <div className="mb-6">
              <Link 
                href={`/${locale}/blog`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToBlog')}
              </Link>
            </div>

            {/* Category Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Folder className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  {categoryName}
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground mb-4">
                {categoryDescription}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{posts.length} {t('articles')}</span>
              </div>
            </div>

            {/* Posts Grid */}
            {paginationResult.posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginationResult.posts.map((post: BlogPost) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      locale={locale as 'es' | 'en'} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {paginationResult.totalPages > 1 && (
                  <BlogPagination 
                    currentPage={paginationResult.currentPage}
                    totalPages={paginationResult.totalPages}
                    locale={locale}
                    basePath={`/${locale}/blog/category/${category}`}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t('noPostsInCategory')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noPostsInCategoryDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar locale={locale} activeCategory={category} />
          </div>
        </div>
      </div>
    </div>
  );
}

```

# src/app/[locale]/blog/page.tsx

```tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { BlogPost } from '@/types/blog';
import { getBlogPosts } from '@/lib/supabase-blog';
import { filterBlogPosts, paginateBlogPosts } from '@/utils/blog';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string; tag?: string; search?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  return {
    title: `${t('title')} | CECOM - Soluciones Tecnológicas`,
    description: t('description'),
    keywords: 'blog tecnología, soluciones IT República Dominicana, ciberseguridad, redes empresariales',
    openGraph: {
      title: `${t('title')} | CECOM`,
      description: t('description'),
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        'es': '/es/blog',
        'en': '/en/blog',
      }
    }
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { page = '1', category, tag, search } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  // Load blog posts from Supabase
  const allPosts = await getBlogPosts({ 
    status: 'published',
    category: category,
    limit: 100 // Get all posts for filtering
  });
  
  // Apply filters (posts are already sorted by date from Supabase)
  const filteredPosts = filterBlogPosts(allPosts, {
    category,
    tag,
    search,
    status: 'published'
  });
  
  // Apply pagination
  const currentPage = parseInt(page);
  const paginationResult = paginateBlogPosts(filteredPosts, currentPage, 6);

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t('title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>

            {/* Active Filters */}
            {(category || tag || search) && (
              <div className="mb-6 p-4 bg-accent rounded-lg">
                <h3 className="font-semibold mb-2">{t('activeFilters')}</h3>
                <div className="flex flex-wrap gap-2">
                  {category && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                      {t('category')}: {category}
                    </span>
                  )}
                  {tag && (
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                      {t('tag')}: {tag}
                    </span>
                  )}
                  {search && (
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                      {t('search')}: "{search}"
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {paginationResult.posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginationResult.posts.map((post: BlogPost) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      locale={locale as 'es' | 'en'} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                <BlogPagination 
                  currentPage={paginationResult.currentPage}
                  totalPages={paginationResult.totalPages}
                  locale={locale}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t('noPosts')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noPostsDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}

```

# src/app/[locale]/blog/tag/[tag]/page.tsx

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { normalizeBlogPost, filterBlogPosts, sortBlogPosts, paginateBlogPosts } from '@/utils/blog';
import fs from 'fs';
import path from 'path';

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const tagName = decodeURIComponent(tag);
  
  return {
    title: `${tagName} | ${t('title')} | CECOM`,
    description: `${t('tagDescription')} ${tagName}. ${t('tagSubDescription')}`,
    keywords: `${tagName.toLowerCase()}, blog tecnología, CECOM, República Dominicana`,
    openGraph: {
      title: `${tagName} | CECOM Blog`,
      description: `${t('tagDescription')} ${tagName}`,
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/blog/tag/${tag}`,
      languages: {
        'es': `/es/blog/tag/${tag}`,
        'en': `/en/blog/tag/${tag}`,
      }
    }
  };
}

// Load RSS data from local files and filter by tag
function loadBlogPosts(): BlogPost[] {
  try {
    
    const dataDir = path.join(process.cwd(), 'data', 'blog')
    const postsPath = path.join(dataDir, 'posts.json')
    
    if (fs.existsSync(postsPath)) {
      const rawPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))
      return rawPosts.map((post: any) => normalizeBlogPost(post))
    }
  } catch (error) {
    console.error('Error loading blog posts:', error)
  }
  
  return []
}

async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  const allPosts = loadBlogPosts();
  const sortedPosts = sortBlogPosts(allPosts);
  
  // Load tags to map slug to ID
  try {
    const tagsPath = path.join(process.cwd(), 'data', 'blog', 'tags.json');
    if (fs.existsSync(tagsPath)) {
      const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
      const tag = tags.find((t: any) => t.slug === tagSlug);
      
      if (tag) {
        // Filter posts by tag ID
        return filterBlogPosts(sortedPosts, {
          tag: tag.id,
          status: 'published'
        });
      }
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
  
  return [];
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { locale, tag } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const posts = await getPostsByTag(tag);
  
  if (posts.length === 0) {
    notFound();
  }

  // Apply pagination
  const currentPage = parseInt(page);
  const paginationResult = paginateBlogPosts(posts, currentPage, 6);

  const tagName = decodeURIComponent(tag);

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Back Navigation */}
            <div className="mb-6">
              <Link 
                href={`/${locale}/blog`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToBlog')}
              </Link>
            </div>

            {/* Tag Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Tag className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  #{tagName}
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground mb-4">
                {t('tagPageDescription')} <span className="font-semibold">#{tagName}</span>
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{posts.length} {t('articles')}</span>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {paginationResult.posts.map((post: BlogPost) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  locale={locale as 'es' | 'en'} 
                />
              ))}
            </div>

            {/* Pagination */}
            {paginationResult.totalPages > 1 && (
              <BlogPagination 
                currentPage={paginationResult.currentPage}
                totalPages={paginationResult.totalPages}
                locale={locale}
                basePath={`/${locale}/blog/tag/${tag}`}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar locale={locale} activeTag={tag} />
          </div>
        </div>
      </div>
    </div>
  );
}

```

# src/app/[locale]/contact/page.tsx

```tsx
import { getTranslations } from 'next-intl/server';
import { getPageBySlug } from '@/lib/payload/api';
import EmbeddedMap from '@/components/contact/EmbeddedMap';
import ContactForm from '@/components/contact/ContactForm';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';

interface ContactPageProps {
  params: Promise<{
    locale: 'en' | 'es';
  }>;
}

export default async function Contact({ params }: ContactPageProps) {
  const { locale } = await params;
  const t = await getTranslations('Contact');
  
  // Fetch contact page content from Payload
  const contactPage = await getPageBySlug('contact', locale);
  const contactContent = contactPage?.contactInfo;

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t('getInTouch')}
            </h1>
            <p className="mt-4 text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              {contactContent?.description || t('description')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Contact Information */}
          <div className="mb-12 lg:mb-0">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
            </h2>
            
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('postalAddress')}</h3>
                  <p className="text-muted-foreground mt-1">
                    {contactContent?.address?.line1 || t('addressLine1')}<br />
                    {contactContent?.address?.line2 || t('addressLine2')}<br />
                    {contactContent?.address?.line3 || t('addressLine3')}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('phoneNumber')}</h3>
                  <p className="text-muted-foreground mt-1">
                    <a 
                      href={`tel:${contactContent?.phone || t('phone')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactContent?.phone || t('phone')}
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('emailAddress')}</h3>
                  <p className="text-muted-foreground mt-1">
                    <a 
                      href={`mailto:${contactContent?.email || t('email')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactContent?.email || t('email')}
                    </a>
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('businessHours')}</h3>
                  <div className="text-muted-foreground mt-1 space-y-1">
                    <p>{contactContent?.businessHours?.weekdays || t('weekdays')}</p>
                    <p>{contactContent?.businessHours?.saturday || t('saturday')}</p>
                    <p>{contactContent?.businessHours?.sunday || t('sunday')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
                {locale === 'es' ? 'Nuestra Ubicación' : 'Our Location'}
              </h3>
              <EmbeddedMap
                address={contactContent?.address?.formatted || `${t('addressLine1')}, ${t('addressLine2')}, ${t('addressLine3')}`}
                embedUrl={contactContent?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.2547!2d-69.9312!3d18.4655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89f0b1234567%3A0x1234567890abcdef!2sAv.%20Pasteur%2011%2C%20Santo%20Domingo%2C%20Dominican%20Republic!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'}
                className="w-full"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {locale === 'es' ? 'Envíanos un Mensaje' : 'Send us a Message'}
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

```

# src/app/[locale]/error.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to console for developers; could be extended to report to an error service
    // eslint-disable-next-line no-console
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-card text-card-foreground border rounded-xl shadow-sm p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. You can try again or return to the previous page.
        </p>
        {error?.digest && (
          <p className="text-[10px] text-muted-foreground/70 break-all">Digest: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()}>Try again</Button>
          <a href="#" onClick={(e) => { e.preventDefault(); history.back(); }} className="text-sm text-primary hover:underline">
            Go back
          </a>
        </div>
      </div>
    </div>
  );
}



```

# src/app/[locale]/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '../../styles/scrollbar.css';

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, sans-serif;
  }
}

.dark .logo {
  filter: brightness(0) invert(1);
}

```

# src/app/[locale]/layout.tsx

```tsx
import { Providers } from '@/components/providers';
import Header from '@/components/header';
import { getMessages } from 'next-intl/server';
import { timeZone } from '@/i18n/config';
import { getCurrentTime } from '@/lib/timezone';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['en', 'es'].includes(locale)) notFound();
  const messages = await getMessages({ locale });

  return (
    <Providers messages={messages} locale={locale} timeZone={timeZone} now={getCurrentTime()}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  );
}

```

# src/app/[locale]/page.tsx

```tsx
"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Home() {
  const t = useTranslations('Home');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';

  return (
    <div className="bg-background">
      <div className="relative bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat dark:brightness-90 dark:contrast-110">
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-background/70 via-background/60 to-background/70 dark:from-background/80 dark:via-background/70 dark:to-background/80"
          aria-hidden="true"
        />
        <main className="relative z-10 min-h-[calc(100dvh-80px)] flex items-center">
          <div className="mx-auto max-w-7xl w-full text-center">
            <div className="px-4 sm:px-8">
              <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">{t('title')}</span>{' '}
                <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {t('welcome')}
                </span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl md:mt-8">
                {t('description')}
              </p>
              
              {/* Products showcase text */}
              <div className="mt-8 max-w-2xl mx-auto p-6 bg-accent/50 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('productsShowcase')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('exploreProducts')}
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <div className="rounded-md shadow-lg">
                  <Link
                    href={`/${currentLocale}/solutions`}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
                  >
                    {t('getStarted')}
                  </Link>
                </div>
                <div className="rounded-md shadow-lg">
                  <Link
                    href={`/${currentLocale}/contact`}
                    className="w-full flex items-center justify-center px-8 py-3 border border-primary/20 text-base font-medium rounded-md text-primary bg-background hover:bg-accent transition-all duration-200 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
                  >
                    {t('liveDemo')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


```

# src/app/[locale]/products/[id]/page.tsx

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProduct } from '@/lib/supabase-blog';
import { ProductSchema } from '@/components/seo/ProductSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { trackProductEvent } from '@/lib/analytics';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | CECOM',
      description: 'El producto solicitado no fue encontrado.'
    };
  }

  return {
    title: `${product.name} | CECOM - Soluciones Tecnológicas`,
    description: product.description || `${product.name} - ${product.brand}`,
    keywords: `${product.name}, ${product.brand}, ${product.category}, equipos de red, tecnología empresarial`,
    openGraph: {
      title: `${product.name} | CECOM`,
      description: product.description || `${product.name} - ${product.brand}`,
      type: 'website',
      locale: locale,
      images: product.image_url || product.external_image_url ? [{
        url: product.image_url || product.external_image_url || '',
        width: 800,
        height: 600,
        alt: product.name,
      }] : undefined,
    },
    alternates: {
      canonical: `/${locale}/products/${id}`,
      languages: {
        'es': `/es/products/${id}`,
        'en': `/en/products/${id}`,
      }
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const product = await getProduct(id);
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  if (!product) {
    notFound();
  }

  const breadcrumbItems = [
    { name: t('home'), url: `/${locale}` },
    { name: t('products'), url: `/${locale}/products` },
    { name: product.name, url: `/${locale}/products/${id}` }
  ];

  return (
    <>
      {/* Schema.org structured data */}
      <ProductSchema product={product} locale={locale} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbItems.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="ml-1 text-sm font-medium text-muted-foreground md:ml-2">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url}
                      className="ml-1 text-sm font-medium text-primary hover:text-primary/80 md:ml-2"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                {(product.image_url || product.external_image_url) ? (
                  <Image
                    src={product.image_url || product.external_image_url || ''}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-muted-foreground">{t('noImage')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{product.brand}</Badge>
                  <Badge variant="outline">{product.category}</Badge>
                  {product.model && <Badge variant="outline">{product.model}</Badge>}
                </div>
              </div>

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('description')}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.price && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('pricing')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {product.currency || 'DOP'} ${product.price.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => trackProductEvent('inquiry', product.id, product.name)}
                >
                  {t('requestQuote')}
                </Button>
                
                {product.datasheet_url && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    asChild
                    onClick={() => trackProductEvent('download', product.id, product.name)}
                  >
                    <Link href={product.datasheet_url} target="_blank">
                      {t('downloadDatasheet')}
                    </Link>
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link href={`/${locale}/contact`}>
                    {t('contactExpert')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

```

# src/app/[locale]/products/page.tsx

```tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/lib/supabase-blog';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; brand?: string; search?: string }>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  return {
    title: `${t('title')} | CECOM - Soluciones Tecnológicas`,
    description: t('description'),
    keywords: 'productos tecnológicos, equipos de red, ciberseguridad, Extreme Networks, WatchGuard, República Dominicana',
    openGraph: {
      title: `${t('title')} | CECOM`,
      description: t('description'),
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        'es': '/es/products',
        'en': '/en/products',
      }
    }
  };
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const { category, brand, search } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  // Load products from Supabase
  const products = await getProducts({
    category,
    brand,
    status: 'active'
  });

  // Filter by search if provided
  const filteredProducts = search 
    ? products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <ProductFilters 
          locale={locale}
          currentCategory={category}
          currentBrand={brand}
          currentSearch={search}
        />

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                locale={locale as 'es' | 'en'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {t('noProducts')}
            </h3>
            <p className="text-muted-foreground">
              {t('noProductsDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

```

# src/app/[locale]/solutions/page.tsx

```tsx
"use client";

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { CategorySidebar } from '@/components/catalog/CategorySidebar'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { ProductFilter } from '@/components/catalog/ProductFilter'
import { ProductModal } from '@/components/catalog/ProductModal'
import { Product } from '@/lib/payload/types'
import { Suspense } from 'react'

// Loading component for the catalog
function CatalogLoading() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <div className="h-16 bg-muted rounded animate-pulse"></div>
              <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main catalog component
function CatalogContent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  
  const t = useTranslations('Solutions')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const vendorParam = searchParams.get('vendor')

    if (categoryParam) setSelectedCategoryId(categoryParam)
    if (searchParam) setSearchQuery(searchParam)
    if (vendorParam) setSelectedVendor(vendorParam)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = (category: string | null, search: string, vendor: string | null) => {
    const params = new URLSearchParams()
    
    if (category) params.set('category', category)
    if (search.trim()) params.set('search', search.trim())
    if (vendor) params.set('vendor', vendor)
    
    const queryString = params.toString()
    const newURL = queryString ? `${pathname}?${queryString}` : pathname
    
    router.replace(newURL, { scroll: false })
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
    updateURL(categoryId, searchQuery, selectedVendor)
  }

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    updateURL(selectedCategoryId, query, selectedVendor)
  }

  // Handle vendor filter change
  const handleVendorChange = (vendorId: string | null) => {
    setSelectedVendor(vendorId)
    updateURL(selectedCategoryId, searchQuery, vendorId)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedVendor(null)
    setSelectedCategoryId(null)
    router.replace(pathname, { scroll: false })
  }

  // Handle product selection for modal
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Handle product navigation in modal
  const handleProductNavigate = (direction: 'prev' | 'next') => {
    if (!selectedProduct || allProducts.length === 0) return

    const currentIndex = allProducts.findIndex(p => p.id === selectedProduct.id)
    if (currentIndex === -1) return

    let newIndex: number
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allProducts.length - 1
    } else {
      newIndex = currentIndex < allProducts.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedProduct(allProducts[newIndex])
  }

  // Get navigation capabilities for modal
  const getNavigationCapabilities = () => {
    if (!selectedProduct || allProducts.length <= 1) {
      return { prev: false, next: false }
    }
    return { prev: true, next: true }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header Section - Compact */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('ourSolutions')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('businessNeeds')}
                </p>
              </div>
            </div>
          </div>

          {/* Catalog Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 h-fit">
                <CategorySidebar
                  selectedCategoryId={selectedCategoryId || undefined}
                  onCategorySelect={handleCategorySelect}
                  className="mb-4"
                />
              </div>
            </div>

            {/* Main Content - Filters and Products */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              {/* Product Filter */}
              <ProductFilter
                searchQuery={searchQuery}
                selectedVendor={selectedVendor}
                onSearchChange={handleSearchChange}
                onVendorChange={handleVendorChange}
                onClearFilters={handleClearFilters}
              />

              {/* Product Grid */}
              <div className="flex-1 min-h-0">
                <ProductGrid
                  categoryId={selectedCategoryId}
                  searchQuery={searchQuery}
                  vendorFilter={selectedVendor || undefined}
                  onProductSelect={handleProductSelect}
                  onProductsLoad={setAllProducts}
                />
              </div>
            </div>
          </div>

          {/* Product Modal */}
          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onNavigate={handleProductNavigate}
            canNavigate={getNavigationCapabilities()}
          />
        </div>
      </div>
    </div>
  )
}

// Error boundary component
function CatalogError() {
  const t = useTranslations('Catalog')
  
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 px-4 lg:px-6 py-4 flex items-center justify-center">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('states.error')}
          </h2>
          <p className="text-muted-foreground mb-6">
            Something went wrong while loading the catalog. Please try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('actions.retry')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Solutions page component
export default function Solutions() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  )
}
```

# src/app/admin-panel/aplicaciones/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { AplicacionesManagement } from '@/components/admin/AplicacionesManagement'

export const dynamic = 'force-dynamic'

export default function AplicacionesPage() {
  return (
    <AdminPanelLayout activeSection="aplicaciones">
      <AplicacionesManagement />
    </AdminPanelLayout>
  )
}

```

# src/app/admin-panel/blogs/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { BlogManagement } from '@/components/admin/BlogManagement'

export const dynamic = 'force-dynamic'

export default function BlogsPage() {
  return (
    <AdminPanelLayout activeSection="blogs">
      <BlogManagement />
    </AdminPanelLayout>
  )
}

```

# src/app/admin-panel/cms/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic'

export default function CMSPage() {
  return (
    <AdminPanelLayout activeSection="cms">
      <AdminDashboard />
    </AdminPanelLayout>
  )
}

```

# src/app/admin-panel/cotizaciones/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { CotizacionesManagement } from '@/components/admin/CotizacionesManagement'

export const dynamic = 'force-dynamic'

export default function CotizacionesPage() {
  return (
    <AdminPanelLayout activeSection="cotizaciones">
      <CotizacionesManagement />
    </AdminPanelLayout>
  )
}

```

# src/app/admin-panel/layout.tsx

```tsx
import { getMessages } from 'next-intl/server'
import { AdminLocaleProvider } from '@/contexts/AdminLocaleContext'

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to English for admin panel
  const locale = 'en'
  const messages = await getMessages({ locale })

  return (
    <AdminLocaleProvider initialMessages={messages} initialLocale={locale}>
      {children}
    </AdminLocaleProvider>
  )
}

```

# src/app/admin-panel/page.tsx

```tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPanelPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin-panel/cms')
  }, [router])
  return null
}

```

# src/app/admin-panel/tickets/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { TicketsManagement } from '@/components/admin/TicketsManagement'

export const dynamic = 'force-dynamic'

export default function TicketsPage() {
  return (
    <AdminPanelLayout activeSection="tickets">
      <TicketsManagement />
    </AdminPanelLayout>
  )
}

```

# src/app/admin-panel/users/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { UsersManagement } from '@/components/admin/UsersManagement'

export const dynamic = 'force-dynamic'

export default function UsersPage() {
  return (
    <AdminPanelLayout activeSection="users">
      <UsersManagement />
    </AdminPanelLayout>
  )
}

```

# src/app/admin-panel/vpns/page.tsx

```tsx
import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { VPNsManagement } from '@/components/admin/VPNsManagement'

export const dynamic = 'force-dynamic'

export default function VPNsPage() {
  return (
    <AdminPanelLayout activeSection="vpns">
      <VPNsManagement />
    </AdminPanelLayout>
  )
}

```

# src/app/admin/page.tsx

```tsx
import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Redirect to the new admin panel
  redirect('/admin-panel');
}
```

# src/app/api/admin/import-rss/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RSSItem {
  title: string
  description: string
  link: string
  guid: string
  pubDate: string
}

async function fetchExtremeNetworksRSS(): Promise<RSSItem[]> {
  try {
    const response = await fetch('https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS')
    const xmlData = await response.text()
    
    const { XMLParser } = await import('fast-xml-parser')
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    })
    
    const result = parser.parse(xmlData) as any
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    return items.filter((item: any) => item && item.title)
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

function parseRSSItemToPost(item: RSSItem) {
  const cleanDescription = item.description
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()
  
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  const translatedTitle = item.title
    .replace(/Security Advisory/gi, 'Aviso de Seguridad')
    .replace(/Vulnerability/gi, 'Vulnerabilidad')
    .replace(/attack/gi, 'ataque')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
    .replace(/authentication leak/gi, 'filtración de autenticación')
    .replace(/allows long exponents/gi, 'permite exponentes largos')
  
  const translatedExcerpt = cleanDescription
    .replace(/remote attackers/gi, 'atacantes remotos')
    .replace(/server-side/gi, 'del lado del servidor')
    .replace(/calculations/gi, 'cálculos')
    .replace(/vulnerability/gi, 'vulnerabilidad')
    .substring(0, 200) + '...'
  
  const content = `# ${translatedTitle}

## Resumen de la Vulnerabilidad

${translatedExcerpt}

### Información de la Vulnerabilidad

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-ES')}
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](${item.link}).*`
  
  return {
    title: translatedTitle,
    slug: `${slug}-es`,
    excerpt: translatedExcerpt,
    content,
    publishedDate: new Date(item.pubDate),
    sourceUrl: item.link,
    metaTitle: translatedTitle,
    metaDescription: translatedExcerpt
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 10 } = await request.json()
    
    console.log('🔄 Fetching RSS feed...')
    const rssItems = await fetchExtremeNetworksRSS()
    
    if (rssItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No RSS items found',
        imported: 0,
        total: 0
      })
    }
    
    // Get cybersecurity category ID
    const { data: categories } = await supabase
      .from('blog_categories')
      .select('id, name')
      .eq('name', 'Ciberseguridad')
      .single()
    
    const categoryId = categories?.id || 'f3c265c9-390a-4572-994a-db7d2ca5948b'
    
    const results = []
    let imported = 0
    
    for (let i = 0; i < Math.min(limit, rssItems.length); i++) {
      const item = rssItems[i]
      
      try {
        const post = parseRSSItemToPost(item)
        
        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', post.slug)
          .single()
        
        if (existingPost) {
          console.log(`⏭️  Skipping existing post: ${post.title}`)
          continue
        }
        
        // Insert new post
        const { data: insertedPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            slug: post.slug,
            category_id: categoryId,
            featured_image: '/blog/cybersecurity-placeholder.jpg',
            published_date: post.publishedDate.toISOString(),
            status: 'published',
            author: 'Equipo CECOM',
            meta_title: post.metaTitle,
            meta_description: post.metaDescription,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) {
          console.error(`❌ Error inserting post "${post.title}":`, error.message)
          continue
        }
        
        console.log(`✅ Imported: ${post.title}`)
        results.push({ post, insertedPost })
        imported++
        
      } catch (error) {
        console.error(`❌ Error processing RSS item "${item.title}":`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported} posts`,
      imported,
      total: rssItems.length,
      results: results.map(r => ({
        title: r.post.title,
        slug: r.post.slug,
        publishedDate: r.post.publishedDate
      }))
    })
    
  } catch (error) {
    console.error('❌ Error in RSS import API:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RSS Import API - Use POST to import RSS feeds',
    usage: 'POST /api/admin/import-rss with { "limit": 10 }'
  })
}

```

# src/app/api/catalog/categories/route.ts

```ts
import { NextRequest } from 'next/server'
import { getCategories } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'

    const categories = await getCategories(locale)
    
    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
```

# src/app/api/catalog/products/route.ts

```ts
import { NextRequest } from 'next/server'
import { getProducts, getProductsByCategory, getProductsByVendor, searchContent } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'
    const categoryId = searchParams.get('categoryId')
    const vendorId = searchParams.get('vendorId')
    const search = searchParams.get('search')

    let products

    // If search query is provided, use search function
    if (search) {
      const searchResults = await searchContent(search, locale)
      products = searchResults.products
    } else if (categoryId) {
      // Get products by category
      products = await getProductsByCategory(categoryId, locale)
    } else if (vendorId) {
      // Get products by vendor
      products = await getProductsByVendor(vendorId, locale)
    } else {
      // Get all products
      products = await getProducts(locale)
    }

    // Apply additional filters if needed
    if (categoryId && (search || vendorId)) {
      products = products.filter((product: any) => {
        return product.category?.id === categoryId
      })
    }

    if (vendorId && (search || categoryId)) {
      products = products.filter((product: any) => {
        return product.vendor?.id === vendorId
      })
    }
    
    return Response.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

# src/app/api/catalog/search/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/lib/payload/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'
    
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      )
    }
    
    const results = await searchContent(query, locale)
    
    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Error searching content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search content',
      },
      { status: 500 }
    )
  }
}
```

# src/app/api/catalog/vendors/route.ts

```ts
import { NextRequest } from 'next/server'
import { getVendors } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const vendors = await getVendors()
    
    return Response.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return Response.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}
```

# src/app/api/contact/__tests__/route.test.ts

```ts
import { describe, it, expect } from 'vitest';
import { POST } from '../route';

// Mock NextRequest
class MockNextRequest {
  constructor(private body: any) {}
  
  async json() {
    return this.body;
  }
}

describe('Contact API Route', () => {
  it('should handle valid contact form submission', async () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const request = new MockNextRequest(validData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Contact form submitted successfully');
    expect(result.messageId).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'invalid-email',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const request = new MockNextRequest(invalidData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Validation failed');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toBeDefined();
    expect(result.details.some((detail: any) => detail.field === 'email')).toBe(true);
  });

  it('should reject missing required fields', async () => {
    const invalidData = {
      fullName: '',
      email: '',
      phone: '',
      message: '',
    };

    const request = new MockNextRequest(invalidData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Validation failed');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toBeDefined();
    expect(result.details.length).toBeGreaterThan(0);
  });

  it('should handle Spanish characters in names', async () => {
    const validData = {
      fullName: 'María José Rodríguez',
      email: 'maria@example.com',
      phone: '+1 (809) 555-0123',
      message: 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.',
    };

    const request = new MockNextRequest(validData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });
});
```

# src/app/api/contact/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Basic validation schema for API route (without translations)
const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z
    .string()
    .min(1, 'Phone is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number'),
  
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Simple email sending function (in production, use a service like SendGrid, Resend, etc.)
async function sendEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  // For now, we'll just log the email data
  // In production, integrate with an email service
  // console.log('Contact form submission:', {
  //   from: data.email,
  //   name: data.fullName,
  //   phone: data.phone,
  //   message: data.message,
  //   timestamp: new Date().toISOString(),
  // });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, return actual email sending result
  return { success: true, messageId: `msg_${Date.now()}` };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body);
    
    // Send the email
    const emailResult = await sendEmail(validatedData);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          code: 'EMAIL_SEND_FAILED' 
        },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      messageId: emailResult.messageId,
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    // Return generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
```

# src/app/api/feeds/refresh/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getVendors } from '@/lib/payload/api'
import type { Vendor } from '@/lib/payload/types'
import { parseRSSFeedToArticles, ParsedArticle } from '@/lib/rss-parser'
import fs from 'fs'
import path from 'path'

interface StoredArticle extends ParsedArticle {
  createdAt: string
  updatedAt: string
}

// Function to read existing articles from JSON file
async function readExistingArticles(): Promise<StoredArticle[]> {
  try {
    const articlesPath = path.join(process.cwd(), 'data/feeds/articles.json')
    const fileContents = fs.readFileSync(articlesPath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.log('No existing articles file found, starting fresh')
    return []
  }
}

// Function to save articles to JSON file
async function saveArticles(articles: StoredArticle[]): Promise<void> {
  try {
    const articlesPath = path.join(process.cwd(), 'data/feeds/articles.json')
    
    // Ensure directory exists
    const dir = path.dirname(articlesPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2))
    console.log(`Saved ${articles.length} articles to ${articlesPath}`)
  } catch (error) {
    console.error('Error saving articles:', error)
    throw error
  }
}

// Function to convert ParsedArticle to StoredArticle with timestamps
function convertToStoredArticle(article: ParsedArticle): StoredArticle {
  const now = new Date().toISOString()
  return {
    ...article,
    createdAt: now,
    updatedAt: now
  }
}

// Function to detect and remove duplicates
function deduplicateArticles(existingArticles: StoredArticle[], newArticles: StoredArticle[]): StoredArticle[] {
  const existingIds = new Set(existingArticles.map(article => article.id))
  const existingUrls = new Set(existingArticles.map(article => article.sourceUrl))
  const existingTitles = new Set(existingArticles.map(article => `${article.vendorId}-${article.title.toLowerCase()}`))
  
  const uniqueNewArticles = newArticles.filter(article => {
    // Check for duplicate by ID
    if (existingIds.has(article.id)) {
      return false
    }
    
    // Check for duplicate by URL
    if (article.sourceUrl && existingUrls.has(article.sourceUrl)) {
      return false
    }
    
    // Check for duplicate by vendor + title combination
    const titleKey = `${article.vendorId}-${article.title.toLowerCase()}`
    if (existingTitles.has(titleKey)) {
      return false
    }
    
    return true
  })
  
  console.log(`Filtered out ${newArticles.length - uniqueNewArticles.length} duplicate articles`)
  return uniqueNewArticles
}

// POST endpoint to refresh RSS feeds and store articles
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor')
    
    // Get vendors with RSS URLs
    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))
    
    if (vendorsWithRSS.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No vendors with RSS feeds found' 
      }, { status: 404 })
    }

    // If specific vendor requested, filter to that vendor
    const targetVendors: Vendor[] = vendorId 
      ? vendorsWithRSS.filter((v: Vendor) => v.id === vendorId)
      : vendorsWithRSS

    if (vendorId && targetVendors.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Vendor with ID '${vendorId}' not found or has no RSS feed` 
      }, { status: 404 })
    }

    // Read existing articles
    const existingArticles = await readExistingArticles()
    console.log(`Found ${existingArticles.length} existing articles`)

    let allNewArticles: StoredArticle[] = []
    const errors: string[] = []
    const processedVendors: string[] = []

    // Process each vendor's RSS feed
    for (const vendor of targetVendors) {
      try {
        const parsedArticles = await parseRSSFeedToArticles(vendor.rssUrl!, vendor.id, vendor.name)
        const storedArticles = parsedArticles.map(convertToStoredArticle)
        allNewArticles.push(...storedArticles)
        processedVendors.push(vendor.name)
        
      } catch (error) {
        const errorMsg = `Failed to fetch RSS for ${vendor.name}: ${error}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Remove duplicates
    const uniqueNewArticles = deduplicateArticles(existingArticles, allNewArticles)
    
    // Combine existing and new articles
    const allArticles = [...existingArticles, ...uniqueNewArticles]
    
    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    // Limit total articles to prevent file from growing too large (keep last 1000)
    const maxArticles = 1000
    const finalArticles = allArticles.slice(0, maxArticles)
    
    // Save updated articles
    await saveArticles(finalArticles)

    return NextResponse.json({
      success: true,
      message: 'RSS feeds refreshed successfully',
      stats: {
        totalArticles: finalArticles.length,
        newArticles: uniqueNewArticles.length,
        duplicatesFiltered: allNewArticles.length - uniqueNewArticles.length,
        vendorsProcessed: processedVendors.length,
        processedVendors,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('Error in RSS refresh API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while refreshing RSS feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check refresh status and last refresh time
export async function GET(request: NextRequest) {
  try {
    const existingArticles = await readExistingArticles()
    
    // Get the most recent article timestamp to determine last refresh
    const lastRefresh = existingArticles.length > 0 
      ? Math.max(...existingArticles.map(a => new Date(a.createdAt).getTime()))
      : null

    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles: existingArticles.length,
        lastRefresh: lastRefresh ? new Date(lastRefresh).toISOString() : null,
        vendorsWithRSS: vendorsWithRSS.length,
        vendors: vendorsWithRSS.map((v: Vendor) => ({
          id: v.id,
          name: v.name,
          rssUrl: v.rssUrl
        }))
      }
    })

  } catch (error) {
    console.error('Error getting refresh status:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while getting refresh status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

# src/app/api/feeds/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getVendors } from '@/lib/payload/api'
import { parseRSSFeedToArticles, ParsedArticle } from '@/lib/rss-parser'
import type { Vendor } from '@/lib/payload/types'

// Cache for RSS feeds to prevent excessive API calls
const feedCache = new Map<string, { data: ParsedArticle[], lastFetched: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// GET endpoint to fetch RSS feeds from all vendors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Get vendors with RSS URLs
    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))
    
    if (vendorsWithRSS.length === 0) {
      return NextResponse.json({ 
        success: true, 
        articles: [], 
        message: 'No vendors with RSS feeds found' 
      })
    }

    let allArticles: ParsedArticle[] = []
    const errors: string[] = []

    // If specific vendor requested, filter to that vendor
    const targetVendors: Vendor[] = vendorId 
      ? vendorsWithRSS.filter((v: Vendor) => v.id === vendorId)
      : vendorsWithRSS

    if (vendorId && targetVendors.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Vendor with ID '${vendorId}' not found or has no RSS feed` 
      }, { status: 404 })
    }

    // Process each vendor's RSS feed
    for (const vendor of targetVendors) {
      const cacheKey = `${vendor.id}-${vendor.rssUrl}`
      const now = Date.now()
      
      // Check cache first (unless force refresh)
      if (!forceRefresh && feedCache.has(cacheKey)) {
        const cached = feedCache.get(cacheKey)!
        if (now - cached.lastFetched < CACHE_DURATION) {
          console.log(`Using cached data for ${vendor.name}`)
          allArticles.push(...cached.data)
          continue
        }
      }

      try {
        const articles = await parseRSSFeedToArticles(vendor.rssUrl!, vendor.id, vendor.name)
        
        // Cache the results
        feedCache.set(cacheKey, {
          data: articles,
          lastFetched: now
        })
        
        allArticles.push(...articles)
        
      } catch (error) {
        const errorMsg = `Failed to fetch RSS for ${vendor.name}: ${error}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Sort articles by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Limit results if needed
    const limit = parseInt(searchParams.get('limit') || '50')
    if (limit > 0) {
      allArticles = allArticles.slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      articles: allArticles,
      totalCount: allArticles.length,
      vendorsProcessed: targetVendors.length,
      errors: errors.length > 0 ? errors : undefined,
      cached: !forceRefresh
    })

  } catch (error) {
    console.error('Error in RSS feeds API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while fetching RSS feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

# src/app/api/feeds/test/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getVendors } from '@/lib/payload/api'
import { testRSSFeed, isValidRSSUrl } from '@/lib/rss-parser'
import type { Vendor } from '@/lib/payload/types'

// GET endpoint to test RSS feed accessibility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor')
    const testUrl = searchParams.get('url')
    
    // If a specific URL is provided, test that URL
    if (testUrl) {
      if (!isValidRSSUrl(testUrl)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid RSS URL format'
        }, { status: 400 })
      }
      
      const result = await testRSSFeed(testUrl)
      
      return NextResponse.json({
        success: result.success,
        url: testUrl,
        error: result.error,
        itemCount: result.itemCount,
        message: result.success 
          ? `RSS feed is accessible with ${result.itemCount} items`
          : `RSS feed test failed: ${result.error}`
      })
    }
    
    // Get vendors with RSS URLs
    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))
    
    if (vendorsWithRSS.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No vendors with RSS feeds found' 
      }, { status: 404 })
    }

    // If specific vendor requested, filter to that vendor
    const targetVendors: Vendor[] = vendorId 
      ? vendorsWithRSS.filter((v: Vendor) => v.id === vendorId)
      : vendorsWithRSS

    if (vendorId && targetVendors.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Vendor with ID '${vendorId}' not found or has no RSS feed` 
      }, { status: 404 })
    }

    // Test each vendor's RSS feed
    const testResults = []
    
    for (const vendor of targetVendors) {
      const result = await testRSSFeed(vendor.rssUrl!)
      
      testResults.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        rssUrl: vendor.rssUrl,
        success: result.success,
        error: result.error,
        itemCount: result.itemCount
      })
    }

    const successCount = testResults.filter(r => r.success).length
    const failureCount = testResults.filter(r => !r.success).length

    return NextResponse.json({
      success: failureCount === 0,
      summary: {
        totalTested: testResults.length,
        successful: successCount,
        failed: failureCount
      },
      results: testResults,
      message: failureCount === 0 
        ? 'All RSS feeds are accessible'
        : `${failureCount} out of ${testResults.length} RSS feeds failed`
    })

  } catch (error) {
    console.error('Error in RSS test API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while testing RSS feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

# src/app/api/i18n/route.ts

```ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') || 'en';
  
  // Make sure locale is valid
  if (!['en', 'es'].includes(locale)) {
    return NextResponse.json(
      { error: 'Invalid locale' },
      { status: 400 }
    );
  }

  try {
    // Import the messages for the requested locale
    const messages = (await import(`../../../../messages/${locale}.json`)).default;
    
    return NextResponse.json({
      locale,
      ...messages
    });
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}

```

# src/app/api/import-rss/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { importRSSToPayload } from '@/lib/rss-importer'

export async function POST(request: NextRequest) {
  try {
    const { limit = 10, dryRun = false } = await request.json()
    
    if (dryRun) {
      // Return preview of what would be imported without actually importing
      const { fetchExtremeNetworksRSS, parseRSSItemToPost } = await import('@/lib/rss-importer')
      const rssItems = await fetchExtremeNetworksRSS()
      const preview = rssItems.slice(0, limit).map(item => ({
        title: item.title,
        pubDate: item.pubDate,
        link: item.link,
        spanish: parseRSSItemToPost(item, 'es'),
        english: parseRSSItemToPost(item, 'en')
      }))
      
      return NextResponse.json({
        success: true,
        dryRun: true,
        preview,
        total: rssItems.length
      })
    }
    
    const result = await importRSSToPayload(limit)
    
    return NextResponse.json({
      success: true,
      imported: result.imported,
      total: result.total,
      message: `Successfully imported ${result.imported} articles from Extreme Networks RSS feed`
    })
    
  } catch (error) {
    console.error('RSS import error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RSS Import API',
    usage: {
      method: 'POST',
      body: {
        limit: 'number (default: 10) - Number of articles to import',
        dryRun: 'boolean (default: false) - Preview mode without importing'
      }
    }
  })
}

```

# src/app/api/messages/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getMessages } from 'next-intl/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  try {
    const messages = await getMessages({ locale })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to load messages:', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

```

# src/app/api/webhook/rss-import/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { importExtremeNetworksRSS } from '@/lib/rss-importer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, limit = 10 } = body
    
    // Verificar secret
    const config = require('../../../../automation/webhook-config.json')
    if (secret !== config.secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verificar IP (opcional)
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    console.log(`RSS Import webhook triggered from IP: ${clientIP}`)
    
    // Ejecutar importación
    const result = await importExtremeNetworksRSS({ limit, dryRun: false })
    
    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Import failed', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'RSS Import Webhook',
    status: 'active',
    endpoint: '/api/webhook/rss-import',
    method: 'POST',
    requiredFields: ['secret'],
    optionalFields: ['limit']
  })
}
```

# src/app/auth/page.tsx

```tsx
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'

function AuthPageContent() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam === 'pending_approval') {
      setMessage('Tu cuenta está pendiente de aprobación por un administrador.')
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/admin-panel')
      }
    }
    checkUser()
  }, [router, searchParams])

  const handleSuccess = () => {
    if (mode === 'login') {
      router.push('/admin-panel')
    } else {
      setMessage('Cuenta creada exitosamente. Esperando aprobación del administrador.')
      setMode('login')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm text-center">
            {message}
          </div>
        )}
        
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onToggleMode={() => setMode('signup')}
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess}
            onToggleMode={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <AuthPageContent />
    </Suspense>
  )
}

```

# src/app/feed.xml/route.ts

```ts
import { getBlogPosts } from '@/lib/supabase-blog';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do';
  
  try {
    // Get published blog posts
    const posts = await getBlogPosts({ 
      status: 'published', 
      limit: 50 
    });

    const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${baseUrl}/es/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/es/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
      <author>info@cecom.do (${post.author})</author>
      <category><![CDATA[${post.category}]]></category>
    </item>`).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CECOM - Blog Tecnológico</title>
    <description>Últimas noticias y artículos sobre tecnología empresarial, ciberseguridad y soluciones IT en República Dominicana</description>
    <link>${baseUrl}/es/blog</link>
    <language>es-DO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>info@cecom.do (Equipo CECOM)</managingEditor>
    <webMaster>info@cecom.do (Equipo CECOM)</webMaster>
    <category>Technology</category>
    <category>Cybersecurity</category>
    <category>IT Solutions</category>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // Fallback RSS with basic info
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CECOM - Blog Tecnológico</title>
    <description>Últimas noticias y artículos sobre tecnología empresarial</description>
    <link>${baseUrl}/es/blog</link>
    <language>es-DO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

    return new Response(fallbackRss, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

```

# src/app/global-error.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-lg w-full bg-card text-card-foreground border rounded-xl shadow-sm p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Algo salió mal</h2>
            <p className="text-muted-foreground text-sm">
              Ocurrió un error inesperado. Puedes intentarlo de nuevo o regresar.
            </p>
            {error?.digest && (
              <p className="text-[10px] text-muted-foreground/70 break-all">Digest: {error.digest}</p>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => reset()}>Reintentar</Button>
              <a href="/" className="text-sm text-primary hover:underline">
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}



```

# src/app/layout.tsx

```tsx
import type { Metadata } from 'next';
import './[locale]/globals.css';
import { Analytics } from '@/components/Analytics';
import { WebVitals } from '@/components/performance/WebVitals';

export const metadata: Metadata = {
  title: {
    default: 'CECOM - Technology Solutions | Dominican Republic',
    template: '%s | CECOM'
  },
  description: 'Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic. Authorized distributor of Extreme Networks, WatchGuard, and more.',
  keywords: ['technology solutions', 'cybersecurity', 'networking', 'IT infrastructure', 'Dominican Republic', 'Extreme Networks', 'WatchGuard', 'enterprise solutions'],
  authors: [{ name: 'CECOM' }],
  creator: 'CECOM',
  publisher: 'CECOM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'es-DO': '/es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_DO'],
    url: '/',
    siteName: 'CECOM',
    title: 'CECOM - Technology Solutions | Dominican Republic',
    description: 'Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CECOM Technology Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CECOM - Technology Solutions | Dominican Republic',
    description: 'Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.',
    images: ['/hero-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logos/favicon.svg',
    shortcut: '/logos/favicon.svg',
    apple: '/logos/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WV6M4MCS');`
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WV6M4MCS"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <WebVitals />
      </body>
    </html>
  );
}
```

# src/app/page.tsx

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
  return null;
} 
```

# src/app/robots.txt/route.ts

```ts
export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Block admin areas
Disallow: /admin/
Disallow: /admin-panel/
Disallow: /api/

# Block development files
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /en/
Allow: /es/
Allow: /en/blog/
Allow: /es/blog/
Allow: /en/products/
Allow: /es/products/

# Crawl delay (optional)
Crawl-delay: 1`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}

```

# src/app/sitemap.xml/route.ts

```ts
import { MetadataRoute } from 'next'
import { 
  getAllPublishedBlogSlugs, 
  getAllProductIds, 
  getAllBlogCategorySlugs, 
  getAllBlogTagSlugs,
  getBlogPosts
} from '@/lib/supabase-blog'

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/products',
    '/blog',
  ]
  
  // Generate URLs for both locales
  const locales = ['en', 'es']
  const staticUrls = staticPages.flatMap(page => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : page === '/blog' ? 0.9 : 0.8,
    }))
  )

  try {
    // Dynamic blog posts
    const blogPosts = await getBlogPosts({ status: 'published' })
    const blogUrls = blogPosts.flatMap(post => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    )

    // Blog categories
    const categorySlugs = await getAllBlogCategorySlugs()
    const categoryUrls = categorySlugs.flatMap(slug => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/category/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )

    // Blog tags
    const tagSlugs = await getAllBlogTagSlugs()
    const tagUrls = tagSlugs.flatMap(slug => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/tag/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    )

    // Products
    const productIds = await getAllProductIds()
    const productUrls = productIds.flatMap(id => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/products/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    )

    const sitemap: MetadataRoute.Sitemap = [
      ...staticUrls,
      ...blogUrls,
      ...categoryUrls,
      ...tagUrls,
      ...productUrls,
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified ? new Date(entry.lastModified).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback to static sitemap if dynamic content fails
    const fallbackSitemap: MetadataRoute.Sitemap = [...staticUrls]
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${fallbackSitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified ? new Date(entry.lastModified).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

```

# src/components/__tests__/header-translations.test.ts

```ts
import { describe, it, expect } from 'vitest';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

describe('Header Accessibility Translations', () => {
  describe('English translations', () => {
    it('should have all required accessibility translations', () => {
      const headerAccessibility = enMessages.Header.accessibility;
      
      expect(headerAccessibility).toBeDefined();
      expect(headerAccessibility.mainNavigation).toBe('Main navigation');
      expect(headerAccessibility.homeLink).toBe('Go to home page');
      expect(headerAccessibility.solutionsLink).toBe('Go to solutions page');
      expect(headerAccessibility.alliancesLink).toBe('Go to alliances page');
      expect(headerAccessibility.aboutUsLink).toBe('Go to about us page');
      expect(headerAccessibility.contactLink).toBe('Go to contact page');
      expect(headerAccessibility.logoLink).toBe('Go to home page');
      expect(headerAccessibility.logoAlt).toBe('CECOM Logo - Go to home page');
      expect(headerAccessibility.languageSelectorButton).toBe('Select language');
      expect(headerAccessibility.languageSelectorMenu).toBe('Language options');
      expect(headerAccessibility.selectEnglish).toBe('Switch to English');
      expect(headerAccessibility.selectSpanish).toBe('Switch to Spanish');
      expect(headerAccessibility.mobileMenuButton).toBe('Open mobile navigation menu');
      expect(headerAccessibility.mobileNavigation).toBe('Mobile navigation menu');
      expect(headerAccessibility.skipToContent).toBe('Skip to main content');
    });

    it('should have all required tooltip translations', () => {
      const headerTooltips = enMessages.Header.tooltips;
      
      expect(headerTooltips).toBeDefined();
      expect(headerTooltips.home).toBe('Navigate to home page');
      expect(headerTooltips.solutions).toBe('View our technology solutions');
      expect(headerTooltips.alliances).toBe('See our business partnerships');
      expect(headerTooltips.aboutUs).toBe('Learn more about our company');
      expect(headerTooltips.contact).toBe('Get in touch with us');
      expect(headerTooltips.languageSelector).toBe('Change website language');
      expect(headerTooltips.mobileMenu).toBe('Open navigation menu');
    });
  });

  describe('Spanish translations', () => {
    it('should have all required accessibility translations', () => {
      const headerAccessibility = esMessages.Header.accessibility;
      
      expect(headerAccessibility).toBeDefined();
      expect(headerAccessibility.mainNavigation).toBe('Navegación principal');
      expect(headerAccessibility.homeLink).toBe('Ir a la página de inicio');
      expect(headerAccessibility.solutionsLink).toBe('Ir a la página de soluciones');
      expect(headerAccessibility.alliancesLink).toBe('Ir a la página de alianzas');
      expect(headerAccessibility.aboutUsLink).toBe('Ir a la página acerca de nosotros');
      expect(headerAccessibility.contactLink).toBe('Ir a la página de contacto');
      expect(headerAccessibility.logoLink).toBe('Ir a la página de inicio');
      expect(headerAccessibility.logoAlt).toBe('Logo de CECOM - Ir a la página de inicio');
      expect(headerAccessibility.languageSelectorButton).toBe('Seleccionar idioma');
      expect(headerAccessibility.languageSelectorMenu).toBe('Opciones de idioma');
      expect(headerAccessibility.selectEnglish).toBe('Cambiar a inglés');
      expect(headerAccessibility.selectSpanish).toBe('Cambiar a español');
      expect(headerAccessibility.mobileMenuButton).toBe('Abrir menú de navegación móvil');
      expect(headerAccessibility.mobileNavigation).toBe('Menú de navegación móvil');
      expect(headerAccessibility.skipToContent).toBe('Saltar al contenido principal');
    });

    it('should have all required tooltip translations', () => {
      const headerTooltips = esMessages.Header.tooltips;
      
      expect(headerTooltips).toBeDefined();
      expect(headerTooltips.home).toBe('Navegar a la página de inicio');
      expect(headerTooltips.solutions).toBe('Ver nuestras soluciones tecnológicas');
      expect(headerTooltips.alliances).toBe('Ver nuestras alianzas comerciales');
      expect(headerTooltips.aboutUs).toBe('Conocer más sobre nuestra empresa');
      expect(headerTooltips.contact).toBe('Ponerse en contacto con nosotros');
      expect(headerTooltips.languageSelector).toBe('Cambiar idioma del sitio web');
      expect(headerTooltips.mobileMenu).toBe('Abrir menú de navegación');
    });
  });

  describe('Translation consistency', () => {
    it('should have the same accessibility keys in both languages', () => {
      const enKeys = Object.keys(enMessages.Header.accessibility);
      const esKeys = Object.keys(esMessages.Header.accessibility);
      
      expect(enKeys.sort()).toEqual(esKeys.sort());
    });

    it('should have the same tooltip keys in both languages', () => {
      const enKeys = Object.keys(enMessages.Header.tooltips);
      const esKeys = Object.keys(esMessages.Header.tooltips);
      
      expect(enKeys.sort()).toEqual(esKeys.sort());
    });

    it('should have no empty translation values', () => {
      const checkEmptyValues = (obj: any, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkEmptyValues(value, currentPath);
          }
        }
      };

      checkEmptyValues(enMessages.Header.accessibility, 'Header.accessibility');
      checkEmptyValues(enMessages.Header.tooltips, 'Header.tooltips');
      checkEmptyValues(esMessages.Header.accessibility, 'Header.accessibility');
      checkEmptyValues(esMessages.Header.tooltips, 'Header.tooltips');
    });
  });
});
```

# src/components/about/AdditionalCertifications.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function AdditionalCertifications() {
  const t = useTranslations('CompanyCredibility');
  const [showAllCertifications, setShowAllCertifications] = useState(false);

  return (
    <div className="border-t border-border pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-foreground">
          {t('achievements.otherCertifications')}
        </h4>
        <button
          onClick={() => setShowAllCertifications(!showAllCertifications)}
          className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
        >
          {showAllCertifications ? t('achievements.showLess') : t('achievements.viewMore')}
        </button>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out overflow-hidden ${
        showAllCertifications ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <motion.div
            key={item}
            className="flex items-center p-3 bg-muted rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: showAllCertifications ? 1 : 0, 
              scale: showAllCertifications ? 1 : 0.9 
            }}
            transition={{ duration: 0.3, delay: showAllCertifications ? item * 0.05 : 0 }}
          >
            <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
            <span className="text-foreground font-medium text-sm">
              {t(`achievements.items.item${item}`)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

```

# src/components/about/CompanyCredibility.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Building, Users, Award, CheckCircle, Calendar, TrendingUp, Trophy, Star, Building2 } from 'lucide-react';
import { FeaturedPartners } from './FeaturedPartners';
import { AdditionalCertifications } from './AdditionalCertifications';

export function CompanyCredibility() {
  const t = useTranslations('CompanyCredibility');

  const stats = [
    {
      key: 'yearsExperience',
      icon: Calendar,
      value: '20+',
      suffix: ''
    },
    {
      key: 'successfulProjects',
      icon: Trophy,
      value: '500+',
      suffix: ''
    },
    {
      key: 'satisfiedClients',
      icon: Users,
      value: '200+',
      suffix: ''
    },
    {
      key: 'certifications',
      icon: Star,
      value: '15+',
      suffix: ''
    }
  ];

  const milestones = [
    {
      key: 'founded',
      year: '2004'
    },
    {
      key: 'firstExpansion',
      year: '2010'
    },
    {
      key: 'majorContract',
      year: '2015'
    },
    {
      key: 'modernization',
      year: '2020'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Company History */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
              <div className="relative bg-primary p-4 rounded-full shadow-lg">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-foreground ml-4">
              {t('history.title')}
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('history.description')}
          </p>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.key}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="relative bg-card rounded-xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                        <div className="relative bg-primary p-3 rounded-full shadow-lg">
                          <IconComponent className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.value}{stat.suffix}
                    </div>
                    
                    <p className="text-muted-foreground font-medium">
                      {t(`stats.${stat.key}`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            {t('timeline.title')}
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('timeline.description')}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.key}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {milestone.year}
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t(`timeline.milestones.${milestone.key}.title`)}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(`timeline.milestones.${milestone.key}.description`)}
                    </p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                
                <div className="w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Certifications & Achievements */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
              <div className="relative bg-primary p-4 rounded-full shadow-lg">
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground ml-4">
              {t('achievements.title')}
            </h3>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('achievements.description')}
          </p>

          <FeaturedPartners />
          <AdditionalCertifications />
        </div>
      </motion.div>
    </div>
  );
}

```

# src/components/about/FeaturedPartners.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function FeaturedPartners() {
  const t = useTranslations('CompanyCredibility');

  const featuredPartners = [
    { name: 'Extreme Networks', logo: '/logos/extreme.png', key: 'extreme' },
    { name: 'WatchGuard', logo: '/logos/watchguard.png', key: 'watchguard' },
    { name: 'Vertiv', logo: '/logos/vertiv.png', key: 'vertiv' },
    { name: 'Avaya', logo: '/logos/avaya.png', key: 'avaya' }
  ];

  return (
    <div className="mb-8">
      <h4 className="text-xl font-semibold text-foreground mb-6">
        {t('achievements.featuredPartners')}
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {featuredPartners.map((partner, index) => (
          <motion.div
            key={partner.key}
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-muted rounded-xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 text-center">
                <div className="w-full h-20 flex items-center justify-center mb-4">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h5 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {partner.name}
                </h5>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

```

# src/components/about/MissionVisionValues.tsx

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Target, Eye, Heart, Award, Lightbulb, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function MissionVisionValues() {
  const t = useTranslations('AboutUs');

  const values = [
    {
      key: 'excellence',
      icon: Award,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      key: 'innovation',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      shadowColor: 'shadow-yellow-500/25'
    },
    {
      key: 'integrity',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/25'
    },
    {
      key: 'commitment',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/25'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Mission and Vision - Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Mission */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <div className="relative bg-card dark:bg-card rounded-2xl p-8 h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative bg-primary p-4 rounded-full shadow-lg">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground ml-4 group-hover:text-primary transition-colors duration-300">
                {t('mission.title')}
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('mission.description')}
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <div className="relative bg-card dark:bg-card rounded-2xl p-8 h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative bg-primary p-4 rounded-full shadow-lg">
                  <Eye className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground ml-4 group-hover:text-primary transition-colors duration-300">
                {t('vision.title')}
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('vision.description')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Values Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
            <div className="relative bg-primary p-4 rounded-full shadow-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground ml-4">
            {t('values.title')}
          </h2>
        </div>
      </motion.div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => {
          const IconComponent = value.icon;
          return (
            <motion.div
              key={value.key}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="relative bg-card dark:bg-card rounded-xl p-6 border border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                      <div className="relative bg-primary p-3 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 text-center group-hover:scale-105 transition-transform duration-300">
                    {t(`values.${value.key}.title`)}
                  </h3>
                  
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {t(`values.${value.key}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

```

# src/components/about/RichTextRenderer.tsx

```tsx
'use client'

import React from 'react'

interface RichTextNode {
  type?: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  children?: RichTextNode[]
  url?: string
  newTab?: boolean
}

interface RichTextRendererProps {
  content: RichTextNode[]
  className?: string
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  const renderNode = (node: RichTextNode, index: number): React.ReactNode => {
    // Handle text nodes
    if (node.text !== undefined) {
      let textElement: React.ReactNode = node.text

      // Apply text formatting
      if (node.bold) {
        textElement = <strong key={`bold-${index}`}>{textElement}</strong>
      }
      if (node.italic) {
        textElement = <em key={`italic-${index}`}>{textElement}</em>
      }
      if (node.underline) {
        textElement = <u key={`underline-${index}`}>{textElement}</u>
      }
      if (node.strikethrough) {
        textElement = <s key={`strike-${index}`}>{textElement}</s>
      }
      if (node.code) {
        textElement = (
          <code key={`code-${index}`} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
            {textElement}
          </code>
        )
      }

      return textElement
    }

    // Handle element nodes
    const children = node.children?.map((child, childIndex) => 
      renderNode(child, childIndex)
    ) || []

    switch (node.type) {
      case 'h1':
        return (
          <h1 key={index} className="text-3xl font-bold text-foreground mb-4">
            {children}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={index} className="text-2xl font-semibold text-foreground mb-3">
            {children}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={index} className="text-xl font-semibold text-foreground mb-2">
            {children}
          </h3>
        )
      case 'h4':
        return (
          <h4 key={index} className="text-lg font-semibold text-foreground mb-2">
            {children}
          </h4>
        )
      case 'p':
        return (
          <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
            {children}
          </p>
        )
      case 'ul':
        return (
          <ul key={index} className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            {children}
          </ul>
        )
      case 'ol':
        return (
          <ol key={index} className="list-decimal list-inside text-muted-foreground mb-4 space-y-1">
            {children}
          </ol>
        )
      case 'li':
        return (
          <li key={index} className="leading-relaxed">
            {children}
          </li>
        )
      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
            {children}
          </blockquote>
        )
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target={node.newTab ? '_blank' : undefined}
            rel={node.newTab ? 'noopener noreferrer' : undefined}
            className="text-primary hover:text-primary/80 underline"
          >
            {children}
          </a>
        )
      default:
        // Handle unknown types or fragments
        return <span key={index}>{children}</span>
    }
  }

  return (
    <div className={className}>
      {content.map((node, index) => renderNode(node, index))}
    </div>
  )
}
```

# src/components/about/TeamMember.tsx

```tsx
'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface TeamMemberProps {
  name: string
  position: string
  bio: string
  image?: {
    url: string
    alt?: string
  }
}

export function TeamMember({ name, position, bio, image }: TeamMemberProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg">
      <CardHeader className="flex flex-col items-center p-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-muted to-muted group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || `${name} profile photo`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/30">
              <span className="text-2xl font-bold text-primary">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground text-center">{name}</h3>
        <p className="text-sm font-medium text-primary text-center">{position}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-sm text-muted-foreground text-center leading-relaxed">{bio}</p>
      </CardContent>
    </Card>
  )
}
```

# src/components/about/VendorGrid.tsx

```tsx
'use client'

import Image from 'next/image'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Vendor {
  id: string
  name: string
  logo?: {
    url: string
    alt?: string
  }
  website?: string
}

interface VendorGridProps {
  vendors: Vendor[]
}

export function VendorGrid({ vendors }: VendorGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {vendors.map((vendor) => (
        <Card 
          key={vendor.id}
          className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg"
        >
          <CardHeader className="flex flex-col items-center p-6">
            <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-muted to-muted group-hover:from-primary/10 group-hover:to-primary/20 rounded-lg transition-all duration-300 mb-4">
              {vendor.logo ? (
                <Image
                  src={vendor.logo.url}
                  alt={vendor.logo.alt || `${vendor.name} logo`}
                  width={80}
                  height={48}
                  className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="text-xs font-semibold text-muted-foreground text-center px-2">
                  {vendor.name}
                </div>
              )}
            </div>
            <CardTitle className="text-center text-sm font-semibold text-foreground">
              {vendor.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
```

# src/components/admin/AdminContent.tsx

```tsx
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Category, Vendor, Product, AdminTab } from '@/types/admin';
import { StatsCards } from './StatsCards';
import { AdminTabs } from './AdminTabs';
import { CategoriesTable } from './tables/CategoriesTable';
import { VendorsTable } from './tables/VendorsTable';
import { ProductsTable } from './tables/ProductsTable';
import { CategoryFormModal, VendorFormModal, ProductFormModal } from './forms';

interface AdminContentProps {
  categories: Category[];
  vendors: Vendor[];
  products: Product[];
  onRefresh: () => void;
}

export function AdminContent({ 
  categories, 
  vendors, 
  products, 
  onRefresh 
}: AdminContentProps) {
  // Persist active tab in localStorage to maintain user's position
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-active-tab') || 'categories';
    }
    return 'categories';
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const t = useTranslations('Admin');

  const tabs: AdminTab[] = [
    { id: 'categories', name: t('navigation.categories'), count: categories.length },
    { id: 'vendors', name: t('navigation.vendors'), count: vendors.length },
    { id: 'products', name: t('navigation.products'), count: products.length },
    { id: 'pages', name: t('navigation.pages'), count: 0 },
  ];

  // Handle tab change and persist to localStorage
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-active-tab', tabId);
    }
  };

  const handleFormSuccess = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setShowVendorForm(false);
    setEditingItem(null);
    onRefresh();
    // Don't change the active tab - user should stay where they are
  };

  const handleFormClose = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setShowVendorForm(false);
    setEditingItem(null);
  };

  return (
    <div className="w-full h-full">
      {/* Stats Cards */}
      <StatsCards 
        categories={categories}
        vendors={vendors}
        products={products}
      />

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow-sm">
        <AdminTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="p-6">
          {activeTab === 'categories' && (
            <CategoriesTable 
              categories={categories} 
              onRefresh={onRefresh}
              onAdd={() => {
                setEditingItem(null);
                setShowCategoryForm(true);
              }}
              onEdit={(category) => {
                setEditingItem(category);
                setShowCategoryForm(true);
              }}
            />
          )}
          
          {activeTab === 'vendors' && (
            <VendorsTable 
              vendors={vendors} 
              onRefresh={onRefresh}
              onAdd={() => {
                setEditingItem(null);
                setShowVendorForm(true);
              }}
              onEdit={(vendor) => {
                setEditingItem(vendor);
                setShowVendorForm(true);
              }}
            />
          )}
          
          {activeTab === 'products' && (
            <ProductsTable 
              products={products} 
              categories={categories} 
              vendors={vendors} 
              onRefresh={onRefresh}
              onAdd={() => {
                setEditingItem(null);
                setShowProductForm(true);
              }}
              onEdit={(product) => {
                setEditingItem(product);
                setShowProductForm(true);
              }}
            />
          )}
          
          {activeTab === 'pages' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('placeholders.pagesComingSoon')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showProductForm}
        product={editingItem}
        categories={categories}
        vendors={vendors}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <CategoryFormModal
        isOpen={showCategoryForm}
        category={editingItem}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <VendorFormModal
        isOpen={showVendorForm}
        vendor={editingItem}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
```

# src/components/admin/AdminDashboard.tsx

```tsx
'use client';
import { useEffect } from 'react';
import { canModifyContent, signOut } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminContent } from './AdminContent';
import { AdminLoading, AdminAccessDenied } from './AdminStates';
import { ToastProvider } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function AdminDashboard() {
  const t = useTranslations('AdminPanel');
  
  const {
    categories,
    vendors,
    products,
    loading,
    user,
    userProfile,
    loadData,
    setUser,
    setUserProfile
  } = useAdminData();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Clear development mode
      localStorage.removeItem('dev_user');
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Show loading state (also covers the brief moment before user is resolved)
  if (loading || !user) {
    return <AdminLoading />;
  }

  // Check if user has permission to access admin
  if (userProfile && !canModifyContent(userProfile.role)) {
    return (
      <AdminAccessDenied
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {loading ? (
          <AdminLoading />
        ) : !user || !userProfile ? (
          <AdminAccessDenied 
            userProfile={null} 
            onSignOut={handleSignOut} 
          />
        ) : (
          <AdminContent
            categories={categories}
            vendors={vendors}
            products={products}
            onRefresh={loadData}
          />
        )}
      </div>
    </ToastProvider>
  );
}
```

# src/components/admin/AdminHeader.tsx

```tsx
import { UserProfile } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

interface AdminHeaderProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
}

export function AdminHeader({ userProfile, onSignOut }: AdminHeaderProps) {
  const t = useTranslations('Admin');
  
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              {t('status.active')}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="block">
                {userProfile?.first_name} {userProfile?.last_name}
              </span>
              <span className="text-xs capitalize">
                {userProfile?.role}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

# src/components/admin/AdminIntlProvider.tsx

```tsx
'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

interface AdminIntlProviderProps {
  children: ReactNode;
}

export function AdminIntlProvider({ children }: AdminIntlProviderProps) {
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the current locale from cookie or use default
    const getLocaleFromCookie = () => {
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
        return match ? match[2] : 'en';
      }
      return 'en';
    };

    const locale = getLocaleFromCookie();
    
    // Fetch the messages for the current locale
    fetch(`/api/i18n?locale=${locale}`)
      .then(response => response.json())
      .then(data => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load messages:', error);
        // Fallback to just loading the component without translations
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !messages) {
    // Simple loading state
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <NextIntlClientProvider locale={messages.locale || 'en'} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

```

# src/components/admin/AdminPanelLayout.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { supabase, getUserProfile, UserProfile, isAdmin, isEmployee } from '@/lib/supabase'
import { Users, Ticket, FileText, Wifi, Settings, LogOut, Menu, X, BookOpen } from 'lucide-react'
import { LanguageToggle } from '@/components/admin/LanguageToggle'
import { ThemeToggle } from '@/components/theme-toggle'

interface AdminPanelLayoutProps {
  children: React.ReactNode
  activeSection: string
}

export function AdminPanelLayout({ children, activeSection }: AdminPanelLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations('AdminPanel')
  const locale = useLocale()
  
  const handleLocaleChange = (newLocale: string) => {
    // Update the URL to include the new locale
    const path = window.location.pathname
    const newPath = path.startsWith(`/${locale}`) 
      ? path.replace(`/${locale}`, `/${newLocale}`)
      : `/${newLocale}${path}`
    
    // Force a full page reload to apply the new locale
    window.location.href = newPath
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)
        
        // Check if user is approved
        if (profile && profile.approval_status !== 'approved') {
          router.push('/auth?message=pending_approval')
          return
        }
      } else {
        router.push('/auth')
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const navigationItems = [
    // Admin-only sections
    ...(isAdmin(userProfile.role) ? [
      { id: 'cms', label: t('navigation.cms'), icon: Settings, href: '/admin-panel/cms' },
      { id: 'users', label: t('navigation.users'), icon: Users, href: '/admin-panel/users' },
    ] : []),
    
    // Employee and Admin sections
    ...(isEmployee(userProfile.role) || isAdmin(userProfile.role) ? [
      { id: 'blogs', label: t('navigation.blogs'), icon: BookOpen, href: '/admin-panel/blogs' },
      { id: 'tickets', label: t('navigation.tickets'), icon: Ticket, href: '/admin-panel/tickets' },
      { id: 'cotizaciones', label: t('navigation.cotizaciones'), icon: FileText, href: '/admin-panel/cotizaciones' },
      { id: 'aplicaciones', label: t('navigation.aplicaciones'), icon: Settings, href: '/admin-panel/aplicaciones' },
      { id: 'vpns', label: t('navigation.vpns'), icon: Wifi, href: '/admin-panel/vpns' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg border-r border-border">
            <SidebarContent 
              navigationItems={navigationItems}
              activeSection={activeSection}
              userProfile={userProfile}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4 border-r border-border">
          <SidebarContent 
            navigationItems={navigationItems}
            activeSection={activeSection}
            userProfile={userProfile}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-lg font-semibold text-foreground">
                {t('title')}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <ThemeToggle />
              <LanguageToggle currentLocale={locale} onLocaleChange={handleLocaleChange} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 h-full">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  navigationItems: Array<{
    id: string
    label: string
    icon: any
    href: string
  }>
  activeSection: string
  userProfile: UserProfile
  onSignOut: () => void
  onClose?: () => void
}

function SidebarContent({ navigationItems, activeSection, userProfile, onSignOut, onClose }: SidebarContentProps) {
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose?.()
  }

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-foreground">CECOM Admin</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className="h-6 w-6 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="border-t border-border pt-4">
              <div className="px-2 py-2 text-xs text-muted-foreground">
                <div>Usuario: {userProfile.email}</div>
                <div>Rol: {userProfile.role === 'admin' ? 'Administrador' : 
                           userProfile.role === 'employee' ? 'Empleado' : 'Usuario'}</div>
              </div>
              <button
                onClick={onSignOut}
                className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted w-full text-left"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                Cerrar Sesión
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </>
  )
}

```

# src/components/admin/AdminStates.tsx

```tsx
'use client';

import { UserProfile } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal';
import { useTranslations } from 'next-intl';

interface AdminLoadingProps {}

export function AdminLoading({}: AdminLoadingProps) {
  // Try to use translations but fail silently with defaults if context is missing
  let loadingText = 'Loading...';
  try {
    const t = useTranslations('Admin');
    loadingText = t('status.loading');
  } catch (e) {
    // Fall back to default text if translations aren't available
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );
}

interface AdminLoginProps {
  showAuthModal: boolean;
  onShowAuthModal: (show: boolean) => void;
  onAuthSuccess: () => void;
}

export function AdminLogin({ 
  showAuthModal, 
  onShowAuthModal, 
  onAuthSuccess 
}: AdminLoginProps) {
  // Default texts in case translations aren't available
  let titleText = 'Admin Area';
  let loginRequiredText = 'Please log in to access the admin area.';
  let loginButtonText = 'Log In';
  
  try {
    const t = useTranslations('Admin');
    titleText = t('title');
    loginRequiredText = t('auth.loginRequired');
    loginButtonText = t('auth.loginButton');
  } catch (e) {
    // Fall back to defaults if translations aren't available
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">{titleText}</h1>
          <p className="text-muted-foreground mb-6">
            {loginRequiredText}
          </p>
          <button
            onClick={() => onShowAuthModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            {loginButtonText}
          </button>
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => onShowAuthModal(false)}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}

interface AdminAccessDeniedProps {
  userProfile?: UserProfile | null;
  onSignOut: () => void;
}

export function AdminAccessDenied({ userProfile, onSignOut }: AdminAccessDeniedProps) {
  // Default texts in case translations aren't available
  let accessDeniedText = 'Access Denied';
  let noPermissionsText = 'You do not have permission to access this area.';
  let currentRoleText = 'Your current role:';
  let signOutText = 'Sign Out';
  
  try {
    const t = useTranslations('Admin');
    accessDeniedText = t('auth.accessDenied');
    noPermissionsText = t('auth.noPermissions');
    currentRoleText = t('auth.currentRole');
    signOutText = t('auth.signOut');
  } catch (e) {
    // Fall back to defaults if translations aren't available
  }
  
  const renderContent = () => {
    if (!userProfile) {
      return (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {noPermissionsText}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="text-muted-foreground mb-6">{noPermissionsText}</p>
        <div className="mb-6 p-4 bg-muted/50 rounded-md text-left">
          <p className="text-sm text-muted-foreground">
            {currentRoleText}
          </p>
          <p className="font-medium text-foreground">
            {userProfile.role}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-destructive mb-4">
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {accessDeniedText}
        </h2>
        
        {renderContent()}
        
        <button
          onClick={onSignOut}
          className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md font-medium transition-colors"
        >
          {signOutText}
        </button>
      </div>
    </div>
  );
}
```

# src/components/admin/AdminTabs.tsx

```tsx
import { AdminTab } from '@/types/admin';
import { useTranslations } from 'next-intl';

interface AdminTabsProps {
  tabs: AdminTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function AdminTabs({ tabs, activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.name}
            <span className="ml-2 bg-accent text-foreground py-0.5 px-2.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
```

# src/components/admin/AplicacionesManagement.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Eye, Edit, Trash2, Settings } from 'lucide-react'

interface Aplicacion {
  id: string
  application_name: string
  client_name: string
  client_email: string
  application_type: string
  description: string
  requirements: any
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'deployed'
  assigned_to: string
  created_by: string
  created_at: string
  updated_at: string
}

type Status = Aplicacion['status']

export function AplicacionesManagement() {
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAplicacion, setEditingAplicacion] = useState<Aplicacion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const t = useTranslations('AdminPanel.aplicaciones')
  const tCommon = useTranslations('AdminPanel.common')

  const [formData, setFormData] = useState<{
    application_name: string
    client_name: string
    client_email: string
    application_type: string
    description: string
    requirements: string
    status: Status
  }>({
    application_name: '',
    client_name: '',
    client_email: '',
    application_type: '',
    description: '',
    requirements: '',
    status: 'submitted'
  })

  const applicationTypes = [
    'Web Application',
    'Mobile App',
    'Desktop Software',
    'API Integration',
    'Database System',
    'E-commerce Platform',
    'CRM System',
    'Other'
  ]

  useEffect(() => {
    fetchAplicaciones()
  }, [])

  const fetchAplicaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('aplicaciones')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAplicaciones(data || [])
    } catch (error) {
      console.error('Error fetching aplicaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const submitData = {
        ...formData,
        requirements: formData.requirements ? JSON.parse(formData.requirements) : null
      }
      
      if (editingAplicacion) {
        const { error } = await supabase
          .from('aplicaciones')
          .update({
            ...submitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAplicacion.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('aplicaciones')
          .insert({
            ...submitData,
            created_by: user?.id
          })
          
        if (error) throw error
      }
      
      await fetchAplicaciones()
      resetForm()
    } catch (error) {
      console.error('Error saving aplicacion:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) return
    
    try {
      const { error } = await supabase
        .from('aplicaciones')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      await fetchAplicaciones()
    } catch (error) {
      console.error('Error deleting aplicacion:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      application_name: '',
      client_name: '',
      client_email: '',
      application_type: '',
      description: '',
      requirements: '',
      status: 'submitted'
    })
    setEditingAplicacion(null)
    setShowForm(false)
  }

  const startEdit = (aplicacion: Aplicacion) => {
    setFormData({
      application_name: aplicacion.application_name,
      client_name: aplicacion.client_name,
      client_email: aplicacion.client_email,
      application_type: aplicacion.application_type,
      description: aplicacion.description || '',
      requirements: aplicacion.requirements ? JSON.stringify(aplicacion.requirements, null, 2) : '',
      status: aplicacion.status
    })
    setEditingAplicacion(aplicacion)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      deployed: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    
    const labels = {
      submitted: 'Enviada',
      under_review: 'En Revisión',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      deployed: 'Desplegada'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const filteredAplicaciones = aplicaciones.filter(aplicacion => {
    const matchesSearch = !searchTerm || 
      aplicacion.application_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aplicacion.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aplicacion.client_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || aplicacion.status === statusFilter
    const matchesType = typeFilter === 'all' || aplicacion.application_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
{t('newApplication')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('status.all')}</option>
          <option value="submitted">Enviada</option>
          <option value="under_review">En Revisión</option>
          <option value="approved">{t('status.active')}</option>
          <option value="rejected">Rechazada</option>
          <option value="deployed">Desplegada</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('types.all')}</option>
          {applicationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{aplicaciones.length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.total')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{aplicaciones.filter(a => a.status === 'submitted').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.submitted')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{aplicaciones.filter(a => a.status === 'under_review').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.underReview')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{aplicaciones.filter(a => a.status === 'approved').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.approved')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{aplicaciones.filter(a => a.status === 'deployed').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.deployed')}</div>
        </div>
      </div>

      {/* Aplicaciones Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.application')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.client')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAplicaciones.map((aplicacion) => (
                <tr key={aplicacion.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{aplicacion.application_name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {aplicacion.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{aplicacion.client_name}</div>
                      <div className="text-sm text-muted-foreground">{aplicacion.client_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {aplicacion.application_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(aplicacion.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(aplicacion.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(aplicacion)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(aplicacion.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAplicaciones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('noApplicationsFound')}</div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAplicacion ? 'Editar Aplicación' : 'Nueva Aplicación'}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre de la Aplicación *
                  </label>
                  <input
                    type="text"
                    value={formData.application_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tipo de Aplicación *
                  </label>
                  <select
                    value={formData.application_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_type: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Seleccionar tipo</option>
                    {applicationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email del Cliente *
                  </label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Requerimientos (JSON)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={4}
                  placeholder='{"features": ["Feature 1", "Feature 2"], "technologies": ["React", "Node.js"]}'
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="submitted">Enviada</option>
                  <option value="under_review">En Revisión</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                  <option value="deployed">Desplegada</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {editingAplicacion ? 'Actualizar' : 'Crear'} Aplicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

```

# src/components/admin/BlogEditor.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Save, X, Eye } from 'lucide-react'
import { supabase, UserProfile, isAdmin } from '@/lib/supabase'
import { BlogPost } from '@/types/blog'

interface BlogEditorProps {
  post: BlogPost | null
  categories: any[]
  userProfile: UserProfile | null
  onSave: () => void
  onCancel: () => void
}

export function BlogEditor({ post, categories, userProfile, onSave, onCancel }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    status: 'draft' as 'draft' | 'published'
  })
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const t = useTranslations('AdminPanel')

  useEffect(() => {
    if (post) {
      // Find category ID from slug
      const category = categories.find(cat => cat.slug === post.category)
      
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category_id: category?.id || '',
        featured_image: post.featuredImage || '',
        meta_title: post.seo?.metaTitle || '',
        meta_description: post.seo?.metaDescription || '',
        status: post.status as 'draft' | 'published'
      })
    }
  }, [post, categories])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Ensure slug is unique by checking existing posts and appending a numeric suffix if needed
  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let candidate = baseSlug
    let counter = 2
    // Try up to 20 variants to avoid infinite loops
    for (let i = 0; i < 20; i++) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()

      if (error) {
        // If the select fails for any reason, return the current candidate and let insert surface the error
        console.warn('Slug uniqueness check failed:', error)
        return candidate
      }

      if (!data) {
        return candidate
      }

      candidate = `${baseSlug}-${counter++}`
    }

    return `${baseSlug}-${Date.now()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let slug = post?.slug || generateSlug(formData.title)
      if (!post) {
        // For new posts, ensure the slug is unique
        slug = await ensureUniqueSlug(slug)
      }
      
      // Determine status based on user role
      let status = formData.status
      if (userProfile && !isAdmin(userProfile.role) && !post) {
        // New posts by employees go to draft for approval
        status = 'draft'
      }

      const postData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        slug: slug,
        category_id: formData.category_id,
        featured_image: formData.featured_image || '/blog/cybersecurity-placeholder.jpg',
        published_date: post?.publishedDate || new Date().toISOString(),
        status: status,
        author: post?.author || `${userProfile?.first_name} ${userProfile?.last_name}`,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        updated_at: new Date().toISOString()
      }

      if (post) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString()
          })

        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      // Improve visibility into PostgREST errors
      console.error('Error saving post:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        error
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (showPreview) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('blogs.preview')}</h1>
          <button
            onClick={() => setShowPreview(false)}
            className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            {t('blogs.closePreview')}
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
          <article className="prose prose-gray dark:prose-invert max-w-none">
            <h1>{formData.title}</h1>
            <p className="lead text-muted-foreground">{formData.excerpt}</p>
            <div className="whitespace-pre-wrap">{formData.content}</div>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {post ? t('blogs.editPost') : t('blogs.createPost')}
            </h1>
            <p className="text-muted-foreground">
              {post ? t('blogs.editSubtitle') : t('blogs.createSubtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('blogs.preview')}
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formTitle')} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t('blogs.titlePlaceholder')}
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formExcerpt')} *
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            placeholder={t('blogs.excerptPlaceholder')}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formCategory')} *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">{t('blogs.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_es}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formContent')} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={15}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical font-mono"
            placeholder={t('blogs.contentPlaceholder')}
            required
          />
        </div>

        {/* SEO Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{t('blogs.seoSection')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('blogs.metaTitle')}
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => handleInputChange('meta_title', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('blogs.metaTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('blogs.featuredImage')}
              </label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => handleInputChange('featured_image', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('blogs.imagePlaceholder')}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('blogs.metaDescription')}
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              placeholder={t('blogs.metaDescriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Status (Admin only) */}
        {userProfile && isAdmin(userProfile.role) && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('blogs.formStatus')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="draft">{t('blogs.statusDraft')}</option>
              <option value="published">{t('blogs.statusPublished')}</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('common.saving') : (post ? t('common.update') : t('common.create'))}
          </button>
        </div>

        {/* Employee notice */}
        {userProfile && !isAdmin(userProfile.role) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('blogs.employeeNotice')}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default BlogEditor

```

# src/components/admin/BlogManagement.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Edit, Trash2, Eye, Check, X, Search } from 'lucide-react'
import { supabase, getUserProfile, UserProfile, isAdmin } from '@/lib/supabase'
import { BlogPost } from '@/types/blog'
import { getBlogPosts, getBlogCategories } from '@/lib/supabase-blog'
import BlogEditor from './BlogEditor'
import ConfirmDialog from './ConfirmDialog'

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending'>('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'delete' | 'approve' | 'reject'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'delete'
  })

  const t = useTranslations('AdminPanel')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)
      }

      // Load posts and categories
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts({ limit: 100 }),
        getBlogCategories()
      ])

      setPosts(postsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setShowEditor(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setShowEditor(true)
  }

  const handleDeletePost = (post: BlogPost) => {
    setConfirmDialog({
      isOpen: true,
      title: t('blogs.deleteTitle'),
      message: t('blogs.deleteMessage', { title: post.title }),
      type: 'delete',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', post.id)

          if (error) throw error

          await loadData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error('Error deleting post:', error)
        }
      }
    })
  }

  const handleApprovePost = (post: BlogPost) => {
    setConfirmDialog({
      isOpen: true,
      title: t('blogs.approveTitle'),
      message: t('blogs.approveMessage', { title: post.title }),
      type: 'approve',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('blog_posts')
            .update({ status: 'published' })
            .eq('id', post.id)

          if (error) throw error

          await loadData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error('Error approving post:', error)
        }
      }
    })
  }

  const handleRejectPost = (post: BlogPost) => {
    setConfirmDialog({
      isOpen: true,
      title: t('blogs.rejectTitle'),
      message: t('blogs.rejectMessage', { title: post.title }),
      type: 'reject',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('blog_posts')
            .update({ status: 'draft' })
            .eq('id', post.id)

          if (error) throw error

          await loadData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error('Error rejecting post:', error)
        }
      }
    })
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && post.status === 'draft') ||
                         post.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }

    const labels = {
      published: t('blogs.statusPublished'),
      draft: t('blogs.statusDraft'),
      pending: t('blogs.statusPending')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showEditor) {
    return (
      <BlogEditor
        post={editingPost}
        categories={categories}
        userProfile={userProfile}
        onSave={async () => {
          await loadData()
          setShowEditor(false)
        }}
        onCancel={() => setShowEditor(false)}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('blogs.title')}</h1>
            <p className="text-muted-foreground">{t('blogs.subtitle')}</p>
          </div>
          <button
            onClick={handleCreatePost}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('blogs.createPost')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('blogs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('blogs.filterAll')}</option>
            <option value="published">{t('blogs.statusPublished')}</option>
            <option value="draft">{t('blogs.statusDraft')}</option>
            <option value="pending">{t('blogs.statusPending')}</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableTitle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableAuthor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/25">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(post.publishedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View button */}
                      <button
                        onClick={() => window.open(`/es/blog/${post.slug}`, '_blank')}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title={t('blogs.viewPost')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title={t('blogs.editPostButton')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Admin-only actions */}
                      {userProfile && isAdmin(userProfile.role) && (
                        <>
                          {/* Approve/Reject buttons for draft posts */}
                          {post.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleApprovePost(post)}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title={t('blogs.approvePost')}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectPost(post)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t('blogs.rejectPost')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('blogs.deletePost')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('blogs.noPosts')}</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  )
}

```

# src/components/admin/CategoryForm.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IconPicker } from './IconPicker';

interface Category {
 id?: string;
 name: { en: string; es: string };
 description: { en: string; es: string };
 slug: string;
 order: number;
 icon: string;
}

interface CategoryFormProps {
 category?: Category | null;
 onClose: () => void;
 onSuccess: () => void;
}

export function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
 const [formData, setFormData] = useState({
 nameEn: '',
 nameEs: '',
 descriptionEn: '',
 descriptionEs: '',
 slug: '',
 order: 0,
 icon: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (category) {
 setFormData({
 nameEn: category.name?.en || '',
 nameEs: category.name?.es || '',
 descriptionEn: category.description?.en || '',
 descriptionEs: category.description?.es || '',
 slug: category.slug || '',
 order: category.order || 0,
 icon: category.icon || ''
 });
 }
 }, [category]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const categoryData = {
 name: {
 en: formData.nameEn,
 es: formData.nameEs
 },
 description: {
 en: formData.descriptionEn,
 es: formData.descriptionEs
 },
 slug: formData.slug,
 order: formData.order,
 icon: formData.icon
 };

 if (category?.id) {
 // Update existing category
 const { error } = await supabase
 .from('categories')
 .update(categoryData)
 .eq('id', category.id);

 if (error) throw error;
 } else {
 // Create new category
 const { error } = await supabase
 .from('categories')
 .insert(categoryData);

 if (error) throw error;
 }

 onSuccess();
 } catch (err: any) {
 setError(err.message || 'Error al guardar la categoría');
 } finally {
 setLoading(false);
 }
 };

 const generateSlug = (name: string) => {
 return name
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/(^-|-$)/g, '');
 };

 const handleNameChange = (field: 'nameEn' | 'nameEs', value: string) => {
 setFormData(prev => ({
 ...prev,
 [field]: value,
 // Auto-generate slug from English name
 slug: field === 'nameEn' ? generateSlug(value) : prev.slug
 }));
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-background dark:bg-[#0a1222] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center p-6 border-b border-border">
 <h2 className="text-xl font-semibold text-foreground">
 {category ? 'Editar Categoría' : 'Nueva Categoría'}
 </h2>
 <button
 onClick={onClose}
 className="text-muted-foreground hover:text-muted-foreground"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {/* Names */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Inglés) *
 </label>
 <input
 type="text"
 value={formData.nameEn}
 onChange={(e) => handleNameChange('nameEn', e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
 placeholder="Cybersecurity"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Español) *
 </label>
 <input
 type="text"
 value={formData.nameEs}
 onChange={(e) => handleNameChange('nameEs', e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Ciberseguridad"
 />
 </div>
 </div>

 {/* Descriptions */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Inglés)
 </label>
 <textarea
 value={formData.descriptionEn}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
 rows={3}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Advanced security solutions..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Español)
 </label>
 <textarea
 value={formData.descriptionEs}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
 rows={3}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Soluciones de seguridad avanzadas..."
 />
 </div>
 </div>

 {/* Slug, Order, Icon */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Slug *
 </label>
 <input
 type="text"
 value={formData.slug}
 onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="cybersecurity"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Orden
 </label>
 <input
 type="number"
 value={formData.order}
 onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="0"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Icono
 </label>
 <IconPicker
 selectedIcon={formData.icon}
 onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
 />
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
 {error}
 </div>
 )}

 <div className="flex justify-end space-x-3 pt-4 border-t">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-foreground bg-accent rounded-md hover:bg-gray-200"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
 >
 {loading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
```

# src/components/admin/ConfirmDialog.tsx

```tsx
"use client"

import { useTranslations } from 'next-intl'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  type: 'delete' | 'approve' | 'reject'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, type, onConfirm, onCancel }: ConfirmDialogProps) {
  const t = useTranslations('AdminPanel')

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case 'approve':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'reject':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    }
  }

  const getButtonStyles = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'approve':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'reject':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground'
    }
  }

  const getConfirmText = () => {
    switch (type) {
      case 'delete':
        return t('common.delete')
      case 'approve':
        return t('common.approve')
      case 'reject':
        return t('common.reject')
      default:
        return t('common.confirm')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onCancel} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-card text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-card px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-foreground">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto transition-colors ${getButtonStyles()}`}
              onClick={onConfirm}
            >
              {getConfirmText()}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted sm:mt-0 sm:w-auto transition-colors"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

```

# src/components/admin/CotizacionesManagement.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign } from 'lucide-react'

interface Cotizacion {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  company: string
  description: string
  products: any
  total_amount: number
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  valid_until: string
  created_by: string
  assigned_to: string
  created_at: string
  updated_at: string
}

export function CotizacionesManagement() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCotizacion, setEditingCotizacion] = useState<Cotizacion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const t = useTranslations('AdminPanel.cotizaciones')
  const tCommon = useTranslations('AdminPanel.common')

  type CotizacionFormData = {
    client_name: string
    client_email: string
    client_phone: string
    company: string
    description: string
    products: string
    total_amount: string
    status: Cotizacion['status']
    valid_until: string
  }

  const [formData, setFormData] = useState<CotizacionFormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    company: '',
    description: '',
    products: '',
    total_amount: '',
    status: 'draft',
    valid_until: ''
  })

  useEffect(() => {
    fetchCotizaciones()
  }, [])

  const fetchCotizaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCotizaciones(data || [])
    } catch (error) {
      console.error('Error fetching cotizaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const submitData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount) || 0,
        products: formData.products ? JSON.parse(formData.products) : null,
        valid_until: formData.valid_until || null
      }
      
      if (editingCotizacion) {
        const { error } = await supabase
          .from('cotizaciones')
          .update({
            ...submitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCotizacion.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cotizaciones')
          .insert({
            ...submitData,
            created_by: user?.id
          })
          
        if (error) throw error
      }
      
      await fetchCotizaciones()
      resetForm()
    } catch (error) {
      console.error('Error saving cotizacion:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización?')) return
    
    try {
      const { error } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      await fetchCotizaciones()
    } catch (error) {
      console.error('Error deleting cotizacion:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      company: '',
      description: '',
      products: '',
      total_amount: '',
      status: 'draft',
      valid_until: ''
    })
    setEditingCotizacion(null)
    setShowForm(false)
  }

  const startEdit = (cotizacion: Cotizacion) => {
    setFormData({
      client_name: cotizacion.client_name,
      client_email: cotizacion.client_email,
      client_phone: cotizacion.client_phone || '',
      company: cotizacion.company || '',
      description: cotizacion.description,
      products: cotizacion.products ? JSON.stringify(cotizacion.products, null, 2) : '',
      total_amount: cotizacion.total_amount?.toString() || '',
      status: cotizacion.status,
      valid_until: cotizacion.valid_until ? cotizacion.valid_until.split('T')[0] : ''
    })
    setEditingCotizacion(cotizacion)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    
    const labels = {
      draft: t('status.draft'),
      sent: t('status.sent'),
      approved: t('status.approved'),
      rejected: t('status.rejected'),
      expired: t('status.expired')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const matchesSearch = !searchTerm || 
      cotizacion.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cotizacion.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
{t('newQuote')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('status.all')}</option>
          <option value="draft">{t('status.draft')}</option>
          <option value="sent">{t('status.sent')}</option>
          <option value="approved">{t('status.approved')}</option>
          <option value="rejected">{t('status.rejected')}</option>
          <option value="expired">{t('status.expired')}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{cotizaciones.length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.total')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{cotizaciones.filter(c => c.status === 'sent').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.sent')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{cotizaciones.filter(c => c.status === 'approved').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.approved')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            ${cotizaciones.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.total_amount || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">{t('stats.approvedValue')}</div>
        </div>
      </div>

      {/* Cotizaciones Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.client')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.validUntil')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredCotizaciones.map((cotizacion) => (
                <tr key={cotizacion.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{cotizacion.client_name}</div>
                      <div className="text-sm text-muted-foreground">{cotizacion.client_email}</div>
                      {cotizacion.company && (
                        <div className="text-xs text-muted-foreground">{cotizacion.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(cotizacion.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-foreground">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {cotizacion.total_amount?.toLocaleString() || '0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {cotizacion.valid_until ? new Date(cotizacion.valid_until).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(cotizacion.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(cotizacion)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cotizacion.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCotizaciones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('noCotizacionesFound')}</div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email del Cliente *
                  </label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Productos (JSON)
                </label>
                <textarea
                  value={formData.products}
                  onChange={(e) => setFormData(prev => ({ ...prev, products: e.target.value }))}
                  rows={4}
                  placeholder='[{"name": "Producto 1", "quantity": 1, "price": 100}]'
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Monto Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Cotizacion['status'] }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviada</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                    <option value="expired">Expirada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Válida Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {editingCotizacion ? 'Actualizar' : 'Crear'} Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

```

# src/components/admin/DeleteConfirmationDialog.tsx

```tsx
import * as React from "react"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemType: "category" | "vendor" | "product" | "page"
  itemName?: string
  loading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemName,
  loading = false,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('Admin')

  const getTitle = () => {
    switch (itemType) {
      case "category":
        return t('confirmations.deleteCategory')
      case "vendor":
        return t('confirmations.deleteVendor')
      case "product":
        return t('confirmations.deleteProduct')
      default:
        return t('confirmDialog.deleteTitle')
    }
  }

  const getDescription = () => {
    const baseMessage = t('confirmDialog.deleteMessage')
    if (itemName) {
      return `${baseMessage}\n\n"${itemName}"`
    }
    return baseMessage
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={getTitle()}
      description={getDescription()}
      variant="destructive"
      icon={<Trash2 className="h-6 w-6 text-destructive" />}
      loading={loading}
    />
  )
}

// Hook específico para confirmaciones de eliminación
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    itemType: DeleteConfirmationDialogProps['itemType']
    itemName?: string
    onConfirm: () => void
  }>({
    itemType: "category",
    onConfirm: () => {},
  })
  const [loading, setLoading] = React.useState(false)

  const showDeleteConfirmation = React.useCallback((
    itemType: DeleteConfirmationDialogProps['itemType'],
    onConfirm: () => void | Promise<void>,
    itemName?: string
  ) => {
    setConfig({ itemType, itemName, onConfirm })
    setIsOpen(true)
  }, [])

  const handleConfirm = React.useCallback(async () => {
    setLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Error in confirmation:', error)
    } finally {
      setLoading(false)
    }
  }, [config.onConfirm])

  const hideConfirmation = React.useCallback(() => {
    setIsOpen(false)
    setLoading(false)
  }, [])

  return {
    isOpen,
    loading,
    showDeleteConfirmation,
    hideConfirmation,
    handleConfirm,
    config,
  }
}
```

# src/components/admin/examples/ConfirmationExample.tsx

```tsx
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog, useConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog'
import { useToast } from '@/components/ui/toast'
import { useErrorHandler } from '@/hooks/useErrorHandler'

/**
 * Componente de ejemplo que demuestra el uso de los nuevos diálogos de confirmación
 * Este archivo es solo para referencia y no se usa en producción
 */
export function ConfirmationExample() {
  const t = useTranslations('Admin')
  const { addToast } = useToast()
  const { showError, showSuccess } = useErrorHandler()
  
  // Ejemplo 1: Diálogo de confirmación básico
  const basicConfirmation = useConfirmationDialog()
  
  // Ejemplo 2: Diálogo de confirmación destructiva
  const [destructiveOpen, setDestructiveOpen] = useState(false)
  
  // Ejemplo 3: Confirmación de eliminación con hook
  const deleteConfirmation = useDeleteConfirmation()

  const handleBasicConfirmation = () => {
    basicConfirmation.showConfirmation({
      title: 'Confirmar Acción',
      description: 'Esta es una acción que requiere confirmación. ¿Deseas continuar?',
      onConfirm: () => {
        addToast({
          title: 'Confirmado',
          description: 'La acción se ejecutó correctamente',
          variant: 'success'
        })
      }
    })
  }

  const handleDestructiveAction = async () => {
    // Simular una operación que puede fallar
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (Math.random() > 0.5) {
      showSuccess('Operación completada exitosamente')
      setDestructiveOpen(false)
    } else {
      throw new Error('Operación falló')
    }
  }

  const handleDeleteExample = () => {
    const exampleItem = {
      id: '123',
      name: 'Ejemplo de Categoría'
    }

    deleteConfirmation.showDeleteConfirmation(
      'category',
      async () => {
        // Simular eliminación
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (Math.random() > 0.3) {
          showSuccess('Elemento eliminado correctamente')
        } else {
          showError('deleteCategory')
          throw new Error('Error al eliminar')
        }
      },
      exampleItem.name
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplos de Diálogos de Confirmación</h2>
        <p className="text-muted-foreground mb-6">
          Estos ejemplos muestran cómo usar los nuevos componentes de confirmación 
          que reemplazan los diálogos nativos del navegador.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Ejemplo 1: Confirmación Básica */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Confirmación Básica</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Diálogo de confirmación estándar para acciones generales.
          </p>
          <Button onClick={handleBasicConfirmation}>
            Mostrar Confirmación
          </Button>
        </div>

        {/* Ejemplo 2: Confirmación Destructiva */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Confirmación Destructiva</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para acciones que pueden tener consecuencias importantes.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => setDestructiveOpen(true)}
          >
            Acción Destructiva
          </Button>
        </div>

        {/* Ejemplo 3: Eliminación con Hook */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Eliminación con Hook</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Usando el hook especializado para eliminaciones.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleDeleteExample}
          >
            Eliminar Elemento
          </Button>
        </div>
      </div>

      {/* Diálogos */}
      <ConfirmationDialog
        open={basicConfirmation.isOpen}
        onOpenChange={basicConfirmation.hideConfirmation}
        onConfirm={basicConfirmation.config.onConfirm || (() => {})}
        title={basicConfirmation.config.title}
        description={basicConfirmation.config.description}
        variant={basicConfirmation.config.variant}
      />

      <ConfirmationDialog
        open={destructiveOpen}
        onOpenChange={setDestructiveOpen}
        onConfirm={handleDestructiveAction}
        title="Acción Destructiva"
        description="Esta acción puede tener consecuencias importantes. ¿Estás seguro de que deseas continuar?"
        variant="destructive"
      />

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Características:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Internacionalización completa</li>
          <li>• Estados de carga automáticos</li>
          <li>• Accesibilidad mejorada</li>
          <li>• Diseño consistente</li>
          <li>• Manejo de errores integrado</li>
          <li>• Animaciones suaves</li>
        </ul>
      </div>
    </div>
  )
}
```

# src/components/admin/forms/CategoryFormModal.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/admin';
import { FormModal, FormInput, FormTextarea, FormSelect, FormButtons } from './index';
import { IconPicker } from '../IconPicker';
import { validateCategoryName, validateCategorySlug } from '@/lib/validation/admin';

interface CategoryFormModalProps {
  isOpen: boolean;
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  slug: string;
  order: number;
  icon: string;
}

export function CategoryFormModal({ 
  isOpen, 
  category, 
  onClose, 
  onSuccess 
}: CategoryFormModalProps) {
  const t = useTranslations('Admin.forms.category');
  const [formData, setFormData] = useState<FormData>({
    nameEn: '',
    nameEs: '',
    descriptionEn: '',
    descriptionEs: '',
    slug: '',
    order: 0,
    icon: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        nameEn: category.name?.en || '',
        nameEs: category.name?.es || '',
        descriptionEn: category.description?.en || '',
        descriptionEs: category.description?.es || '',
        slug: category.slug || '',
        order: category.order || 0,
        icon: category.icon || ''
      });
    } else {
      // Reset form for new category
      setFormData({
        nameEn: '',
        nameEs: '',
        descriptionEn: '',
        descriptionEs: '',
        slug: '',
        order: 0,
        icon: ''
      });
    }
    setError('');
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      nameEn: value,
      slug: prev.slug === '' ? generateSlug(value) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate category name uniqueness
      const nameValidation = await validateCategoryName(
        formData.nameEn, 
        formData.nameEs, 
        category?.id
      );
      
      if (!nameValidation.isValid) {
        setError(nameValidation.error || t('errorSaving'));
        setLoading(false);
        return;
      }

      // Validate slug uniqueness
      const slugValidation = await validateCategorySlug(
        formData.slug, 
        category?.id
      );
      
      if (!slugValidation.isValid) {
        setError(slugValidation.error || t('errorSaving'));
        setLoading(false);
        return;
      }

      const categoryData = {
        name: {
          en: formData.nameEn,
          es: formData.nameEs
        },
        description: {
          en: formData.descriptionEn,
          es: formData.descriptionEs
        },
        slug: formData.slug,
        order: formData.order,
        icon: formData.icon
      };

      if (category?.id) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const title = category ? t('editTitle') : t('newTitle');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('nameEn')}
              value={formData.nameEn}
              onChange={handleNameEnChange}
              required
              placeholder="Technology Solutions"
            />
            <FormInput
              label={t('nameEs')}
              value={formData.nameEs}
              onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
              required
              placeholder="Soluciones Tecnológicas"
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label={t('descriptionEn')}
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder="Description in English..."
            />
            <FormTextarea
              label={t('descriptionEs')}
              value={formData.descriptionEs}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
              placeholder="Descripción en español..."
            />
          </div>

          {/* Slug and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormInput
                label={t('slug')}
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                placeholder="technology-solutions"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.nameEn) }))}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {t('generateSlug')}
              </button>
            </div>
            <FormInput
              label={t('order')}
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('icon')}
            </label>
            <IconPicker
              selectedIcon={formData.icon}
              onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
            />
          </div>
        </div>

        <FormButtons
          onCancel={onClose}
          onSave={() => {}}
          saveText={t('save')}
          cancelText={t('cancel')}
          isLoading={loading}
          loadingText={t('saving')}
        />
      </form>
    </FormModal>
  );
}
```

# src/components/admin/forms/FormButtons.tsx

```tsx
'use client';

interface FormButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  saveText: string;
  cancelText: string;
  isLoading?: boolean;
  loadingText?: string;
}

export function FormButtons({ 
  onCancel, 
  onSave, 
  saveText, 
  cancelText, 
  isLoading = false,
  loadingText = 'Saving...'
}: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-3 p-6 border-t border-border bg-muted/30">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSave}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        )}
        {isLoading ? loadingText : saveText}
      </button>
    </div>
  );
}
```

# src/components/admin/forms/FormInput.tsx

```tsx
'use client';

import { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
```

# src/components/admin/forms/FormList.tsx

```tsx
'use client';

import { Plus, X } from 'lucide-react';

interface FormListProps {
  label: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  addButtonText: string;
  removeButtonText: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function FormList({
  label,
  items,
  onItemsChange,
  addButtonText,
  removeButtonText,
  placeholder = '',
  required = false,
  error
}: FormListProps) {
  const addItem = () => {
    onItemsChange([...items, '']);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title={removeButtonText}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

# src/components/admin/forms/FormModal.tsx

```tsx
'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-2xl' 
}: FormModalProps) {
  const t = useTranslations('Admin.forms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`inline-block w-full ${maxWidth} p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-card border shadow-xl rounded-lg`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

# src/components/admin/forms/FormSelect.tsx

```tsx
'use client';

import { forwardRef } from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, required, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
```

# src/components/admin/forms/FormTextarea.tsx

```tsx
'use client';

import { forwardRef } from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground resize-vertical min-h-[100px] ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
```

# src/components/admin/forms/index.ts

```ts
export { FormModal } from './FormModal';
export { FormInput } from './FormInput';
export { FormTextarea } from './FormTextarea';
export { FormSelect } from './FormSelect';
export { FormButtons } from './FormButtons';
export { FormList } from './FormList';

// Form Modals
export { CategoryFormModal } from './CategoryFormModal';
export { VendorFormModal } from './VendorFormModal';
export { ProductFormModal } from './ProductFormModal';
```

# src/components/admin/forms/ProductFormModal.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Product, Category, Vendor } from '@/types/admin';
import { FormModal, FormInput, FormTextarea, FormSelect, FormButtons, FormList } from './index';
import { validateProductName } from '@/lib/validation/admin';

interface ProductFormModalProps {
  isOpen: boolean;
  product?: Product | null;
  categories: Category[];
  vendors: Vendor[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  featuresEn: string[];
  featuresEs: string[];
  categoryId: string;
  vendorId: string;
  externalImageUrl: string;
  order: number;
  active: boolean;
}

export function ProductFormModal({ 
  isOpen, 
  product, 
  categories, 
  vendors, 
  onClose, 
  onSuccess 
}: ProductFormModalProps) {
  const t = useTranslations('Admin.forms.product');
  const [formData, setFormData] = useState<FormData>({
    nameEn: '',
    nameEs: '',
    descriptionEn: '',
    descriptionEs: '',
    featuresEn: [''],
    featuresEs: [''],
    categoryId: '',
    vendorId: '',
    externalImageUrl: '',
    order: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        nameEn: product.name?.en || '',
        nameEs: product.name?.es || '',
        descriptionEn: product.description?.en || '',
        descriptionEs: product.description?.es || '',
        featuresEn: product.features?.en || [''],
        featuresEs: product.features?.es || [''],
        categoryId: product.category_id || '',
        vendorId: product.vendor_id || '',
        externalImageUrl: product.external_image_url || '',
        order: product.order || 0,
        active: product.active !== undefined ? product.active : true
      });
    } else {
      setFormData({
        nameEn: '',
        nameEs: '',
        descriptionEn: '',
        descriptionEs: '',
        featuresEn: [''],
        featuresEs: [''],
        categoryId: '',
        vendorId: '',
        externalImageUrl: '',
        order: 0,
        active: true
      });
    }
    setError('');
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate product name uniqueness within category
      if (formData.categoryId) {
        const nameValidation = await validateProductName(
          formData.nameEn, 
          formData.nameEs, 
          formData.categoryId,
          product?.id
        );
        
        if (!nameValidation.isValid) {
          setError(nameValidation.error || t('errorSaving'));
          setLoading(false);
          return;
        }
      }

      const productData = {
        name: {
          en: formData.nameEn,
          es: formData.nameEs
        },
        description: {
          en: formData.descriptionEn,
          es: formData.descriptionEs
        },
        features: {
          en: formData.featuresEn.filter(f => f.trim() !== ''),
          es: formData.featuresEs.filter(f => f.trim() !== '')
        },
        category_id: formData.categoryId,
        vendor_id: formData.vendorId,
        external_image_url: formData.externalImageUrl || null,
        order: formData.order,
        active: formData.active
      };

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name?.en || cat.name?.es || 'Unnamed Category'
  }));

  const vendorOptions = vendors.map(vendor => ({
    value: vendor.id,
    label: vendor.name
  }));

  const title = product ? t('editTitle') : t('newTitle');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('nameEn')}
              value={formData.nameEn}
              onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              required
              placeholder="WatchGuard Firebox T15"
            />
            <FormInput
              label={t('nameEs')}
              value={formData.nameEs}
              onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
              required
              placeholder="WatchGuard Firebox T15"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <FormInput
              label={t('imageUrl')}
              value={formData.externalImageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, externalImageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
            {formData.externalImageUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                <img 
                  src={formData.externalImageUrl} 
                  alt="Product preview" 
                  className="h-20 w-20 object-cover rounded-md border border-border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label={t('descriptionEn')}
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder="Product description in English..."
            />
            <FormTextarea
              label={t('descriptionEs')}
              value={formData.descriptionEs}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
              placeholder="Descripción del producto en español..."
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormList
              label={t('featuresEn')}
              items={formData.featuresEn}
              onItemsChange={(items) => setFormData(prev => ({ ...prev, featuresEn: items }))}
              addButtonText={t('addFeature')}
              removeButtonText={t('removeFeature')}
              placeholder="Advanced threat protection"
            />
            <FormList
              label={t('featuresEs')}
              items={formData.featuresEs}
              onItemsChange={(items) => setFormData(prev => ({ ...prev, featuresEs: items }))}
              addButtonText={t('addFeature')}
              removeButtonText={t('removeFeature')}
              placeholder="Protección avanzada contra amenazas"
            />
          </div>

          {/* Category, Vendor, Order, Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect
              label={t('category')}
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              options={categoryOptions}
              placeholder={t('selectCategory')}
              required
            />
            <FormSelect
              label={t('vendor')}
              value={formData.vendorId}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
              options={vendorOptions}
              placeholder={t('selectVendor')}
              required
            />
            <FormInput
              label={t('order')}
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              min="0"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('active')}
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.active ? t('active') : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <FormButtons
          onCancel={onClose}
          onSave={() => {}}
          saveText={t('save')}
          cancelText={t('cancel')}
          isLoading={loading}
          loadingText={t('saving')}
        />
      </form>
    </FormModal>
  );
}
```

# src/components/admin/forms/VendorFormModal.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types/admin';
import { FormModal, FormInput, FormTextarea, FormButtons } from './index';
import { validateVendorName } from '@/lib/validation/admin';

interface VendorFormModalProps {
  isOpen: boolean;
  vendor?: Vendor | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  website: string;
  descriptionEn: string;
  descriptionEs: string;
}

export function VendorFormModal({ 
  isOpen, 
  vendor, 
  onClose, 
  onSuccess 
}: VendorFormModalProps) {
  const t = useTranslations('Admin.forms.vendor');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    website: '',
    descriptionEn: '',
    descriptionEs: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        website: vendor.website || '',
        descriptionEn: vendor.description?.en || '',
        descriptionEs: vendor.description?.es || ''
      });
    } else {
      // Reset form for new vendor
      setFormData({
        name: '',
        website: '',
        descriptionEn: '',
        descriptionEs: ''
      });
    }
    setError('');
  }, [vendor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate vendor name uniqueness
      const nameValidation = await validateVendorName(
        formData.name, 
        vendor?.id
      );
      
      if (!nameValidation.isValid) {
        setError(nameValidation.error || t('errorSaving'));
        setLoading(false);
        return;
      }

      const vendorData = {
        name: formData.name,
        website: formData.website,
        description: {
          en: formData.descriptionEn,
          es: formData.descriptionEs
        }
      };

      if (vendor?.id) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', vendor.id);

        if (error) throw error;
      } else {
        // Create new vendor
        const { error } = await supabase
          .from('vendors')
          .insert(vendorData);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const title = vendor ? t('editTitle') : t('newTitle');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Name and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('name')}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Microsoft"
            />
            <FormInput
              label={t('website')}
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://www.microsoft.com"
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label={t('descriptionEn')}
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder="Description in English..."
            />
            <FormTextarea
              label={t('descriptionEs')}
              value={formData.descriptionEs}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
              placeholder="Descripción en español..."
            />
          </div>
        </div>

        <FormButtons
          onCancel={onClose}
          onSave={() => {}}
          saveText={t('save')}
          cancelText={t('cancel')}
          isLoading={loading}
          loadingText={t('saving')}
        />
      </form>
    </FormModal>
  );
}
```

# src/components/admin/IconPicker.tsx

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Shield,
  Wifi,
  Phone,
  Monitor,
  Server,
  Zap,
  Grid3X3,
  Database,
  Cloud,
  Lock,
  Network,
  Smartphone,
  Laptop,
  HardDrive,
  Router,
  Cable,
  Cpu,
  MemoryStick,
  Printer,
  Camera,
  Headphones,
  Keyboard,
  Mouse,
  Gamepad2,
  Tablet,
  Watch,
  Tv,
  Radio,
  Bluetooth,
  Usb,
  Wifi as WifiIcon,
  Search,
  X
} from 'lucide-react';

// Available icons for categories
const AVAILABLE_ICONS = {
  // Security & Protection
  shield: { icon: Shield, name: 'Shield', category: 'security' },
  lock: { icon: Lock, name: 'Lock', category: 'security' },
  
  // Networking
  wifi: { icon: Wifi, name: 'WiFi', category: 'networking' },
  network: { icon: Network, name: 'Network', category: 'networking' },
  router: { icon: Router, name: 'Router', category: 'networking' },
  cable: { icon: Cable, name: 'Cable', category: 'networking' },
  bluetooth: { icon: Bluetooth, name: 'Bluetooth', category: 'networking' },
  
  // Communication
  phone: { icon: Phone, name: 'Phone', category: 'communication' },
  smartphone: { icon: Smartphone, name: 'Smartphone', category: 'communication' },
  headphones: { icon: Headphones, name: 'Headphones', category: 'communication' },
  radio: { icon: Radio, name: 'Radio', category: 'communication' },
  
  // Computing
  monitor: { icon: Monitor, name: 'Monitor', category: 'computing' },
  laptop: { icon: Laptop, name: 'Laptop', category: 'computing' },
  tablet: { icon: Tablet, name: 'Tablet', category: 'computing' },
  cpu: { icon: Cpu, name: 'CPU', category: 'computing' },
  memory: { icon: MemoryStick, name: 'Memory', category: 'computing' },
  
  // Storage & Servers
  server: { icon: Server, name: 'Server', category: 'storage' },
  database: { icon: Database, name: 'Database', category: 'storage' },
  harddrive: { icon: HardDrive, name: 'Hard Drive', category: 'storage' },
  cloud: { icon: Cloud, name: 'Cloud', category: 'storage' },
  
  // Peripherals
  printer: { icon: Printer, name: 'Printer', category: 'peripherals' },
  camera: { icon: Camera, name: 'Camera', category: 'peripherals' },
  keyboard: { icon: Keyboard, name: 'Keyboard', category: 'peripherals' },
  mouse: { icon: Mouse, name: 'Mouse', category: 'peripherals' },
  usb: { icon: Usb, name: 'USB', category: 'peripherals' },
  
  // Entertainment
  tv: { icon: Tv, name: 'TV', category: 'entertainment' },
  gamepad: { icon: Gamepad2, name: 'Gamepad', category: 'entertainment' },
  watch: { icon: Watch, name: 'Watch', category: 'entertainment' },
  
  // General
  zap: { icon: Zap, name: 'Power', category: 'general' },
  grid: { icon: Grid3X3, name: 'Grid', category: 'general' }
};

const ICON_CATEGORIES = {
  security: 'Security',
  networking: 'Networking',
  communication: 'Communication',
  computing: 'Computing',
  storage: 'Storage',
  peripherals: 'Peripherals',
  entertainment: 'Entertainment',
  general: 'General'
};

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconKey: string) => void;
  className?: string;
}

export function IconPicker({ selectedIcon, onIconSelect, className = '' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = useTranslations('Admin.forms.category');

  // Filter icons based on search and category
  const filteredIcons = Object.entries(AVAILABLE_ICONS).filter(([key, iconData]) => {
    const matchesSearch = searchTerm === '' || 
      iconData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || iconData.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleIconSelect = (iconKey: string) => {
    onIconSelect(iconKey);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedIconData = selectedIcon ? AVAILABLE_ICONS[selectedIcon as keyof typeof AVAILABLE_ICONS] : null;
  const SelectedIconComponent = selectedIconData?.icon;

  return (
    <div className={`relative ${className}`}>
      {/* Selected Icon Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-md bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center gap-2">
          {SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{t('selectIcon')}</span>
          )}
        </div>
        <Grid3X3 className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Icon Picker Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search and Filter Header */}
          <div className="p-3 border-b border-border">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(ICON_CATEGORIES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Icons Grid */}
          <div className="p-2 max-h-60 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map(([key, iconData]) => {
                  const IconComponent = iconData.icon;
                  const isSelected = selectedIcon === key;
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleIconSelect(key)}
                      className={`p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isSelected ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'text-muted-foreground'
                      }`}
                      title={iconData.name}
                    >
                      <IconComponent className="h-5 w-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No icons found
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
```

# src/components/admin/LanguageToggle.tsx

```tsx
"use client"

import { useState } from 'react'
import { Globe } from 'lucide-react'

interface LanguageToggleProps {
  currentLocale: string
  onLocaleChange: (locale: string) => void
}

export function LanguageToggle({ currentLocale, onLocaleChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇩🇴' }
  ]

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border hover:bg-accent transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[140px]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLocaleChange(language.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md ${
                currentLocale === language.code ? 'bg-accent' : ''
              }`}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

```

# src/components/admin/ProductForm.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Product {
 id?: string;
 name: { en: string; es: string };
 description: { en: string; es: string };
 features: { en: string[]; es: string[] };
 category_id: string;
 vendor_id: string;
 order: number;
 active: boolean;
}

interface Category {
 id: string;
 name: { en: string; es: string };
}

interface Vendor {
 id: string;
 name: string;
}

interface ProductFormProps {
 product?: Product | null;
 categories: Category[];
 vendors: Vendor[];
 onClose: () => void;
 onSuccess: () => void;
}

export function ProductForm({ product, categories, vendors, onClose, onSuccess }: ProductFormProps) {
 const [formData, setFormData] = useState({
 nameEn: '',
 nameEs: '',
 descriptionEn: '',
 descriptionEs: '',
 featuresEn: [''],
 featuresEs: [''],
 categoryId: '',
 vendorId: '',
 order: 0,
 active: true
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (product) {
 setFormData({
 nameEn: product.name?.en || '',
 nameEs: product.name?.es || '',
 descriptionEn: product.description?.en || '',
 descriptionEs: product.description?.es || '',
 featuresEn: product.features?.en || [''],
 featuresEs: product.features?.es || [''],
 categoryId: product.category_id || '',
 vendorId: product.vendor_id || '',
 order: product.order || 0,
 active: product.active !== false
 });
 }
 }, [product]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const productData = {
 name: {
 en: formData.nameEn,
 es: formData.nameEs
 },
 description: {
 en: formData.descriptionEn,
 es: formData.descriptionEs
 },
 features: {
 en: formData.featuresEn.filter(f => f.trim()),
 es: formData.featuresEs.filter(f => f.trim())
 },
 category_id: formData.categoryId,
 vendor_id: formData.vendorId,
 order: formData.order,
 active: formData.active
 };

 if (product?.id) {
 // Update existing product
 const { error } = await supabase
 .from('products')
 .update(productData)
 .eq('id', product.id);

 if (error) throw error;
 } else {
 // Create new product
 const { error } = await supabase
 .from('products')
 .insert(productData);

 if (error) throw error;
 }

 onSuccess();
 } catch (err: any) {
 setError(err.message || 'Error al guardar el producto');
 } finally {
 setLoading(false);
 }
 };

 const addFeature = (lang: 'en' | 'es') => {
 const field = lang === 'en' ? 'featuresEn' : 'featuresEs';
 setFormData(prev => ({
 ...prev,
 [field]: [...prev[field], '']
 }));
 };

 const removeFeature = (lang: 'en' | 'es', index: number) => {
 const field = lang === 'en' ? 'featuresEn' : 'featuresEs';
 setFormData(prev => ({
 ...prev,
 [field]: prev[field].filter((_, i) => i !== index)
 }));
 };

 const updateFeature = (lang: 'en' | 'es', index: number, value: string) => {
 const field = lang === 'en' ? 'featuresEn' : 'featuresEs';
 setFormData(prev => ({
 ...prev,
 [field]: prev[field].map((f, i) => i === index ? value : f)
 }));
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-background dark:bg-[#0a1222] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center p-6 border-b">
 <h2 className="text-xl font-semibold text-foreground">
 {product ? 'Editar Producto' : 'Nuevo Producto'}
 </h2>
 <button
 onClick={onClose}
 className="text-muted-foreground hover:text-muted-foreground"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {/* Names */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Inglés) *
 </label>
 <input
 type="text"
 value={formData.nameEn}
 onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="WatchGuard Firebox T15"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Español) *
 </label>
 <input
 type="text"
 value={formData.nameEs}
 onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="WatchGuard Firebox T15"
 />
 </div>
 </div>

 {/* Descriptions */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Inglés)
 </label>
 <textarea
 value={formData.descriptionEn}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
 rows={4}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Entry-level firewall with advanced threat protection..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Español)
 </label>
 <textarea
 value={formData.descriptionEs}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
 rows={4}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Firewall de nivel básico con protección avanzada contra amenazas..."
 />
 </div>
 </div>

 {/* Features */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Características (Inglés)
 </label>
 {formData.featuresEn.map((feature, index) => (
 <div key={index} className="flex gap-2 mb-2">
 <input
 type="text"
 value={feature}
 onChange={(e) => updateFeature('en', index, e.target.value)}
 className="flex-1 px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Advanced threat protection"
 />
 <button
 type="button"
 onClick={() => removeFeature('en', index)}
 className="px-3 py-2 text-red-600 hover:text-red-800"
 >
 ×
 </button>
 </div>
 ))}
 <button
 type="button"
 onClick={() => addFeature('en')}
 className="text-blue-600 hover:text-blue-800 text-sm"
 >
 + Agregar característica
 </button>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Características (Español)
 </label>
 {formData.featuresEs.map((feature, index) => (
 <div key={index} className="flex gap-2 mb-2">
 <input
 type="text"
 value={feature}
 onChange={(e) => updateFeature('es', index, e.target.value)}
 className="flex-1 px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Protección avanzada contra amenazas"
 />
 <button
 type="button"
 onClick={() => removeFeature('es', index)}
 className="px-3 py-2 text-red-600 hover:text-red-800"
 >
 ×
 </button>
 </div>
 ))}
 <button
 type="button"
 onClick={() => addFeature('es')}
 className="text-blue-600 hover:text-blue-800 text-sm"
 >
 + Agregar característica
 </button>
 </div>
 </div>

 {/* Category, Vendor, Order, Active */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Categoría *
 </label>
 <select
 value={formData.categoryId}
 onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="">Seleccionar categoría</option>
 {categories.map(category => (
 <option key={category.id} value={category.id}>
 {category.name?.es || category.name?.en}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Proveedor *
 </label>
 <select
 value={formData.vendorId}
 onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="">Seleccionar proveedor</option>
 {vendors.map(vendor => (
 <option key={vendor.id} value={vendor.id}>
 {vendor.name}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Orden
 </label>
 <input
 type="number"
 value={formData.order}
 onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="0"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Estado
 </label>
 <select
 value={formData.active ? 'true' : 'false'}
 onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="true">Activo</option>
 <option value="false">Inactivo</option>
 </select>
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
 {error}
 </div>
 )}

 <div className="flex justify-end space-x-3 pt-4 border-t">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-foreground bg-accent rounded-md hover:bg-gray-200"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
 >
 {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
```

# src/components/admin/StatsCards.tsx

```tsx
import { Category, Vendor, Product } from '@/types/admin';
import { useTranslations } from 'next-intl';

interface StatsCardsProps {
  categories: Category[];
  vendors: Vendor[];
  products: Product[];
}

export function StatsCards({ categories, vendors, products }: StatsCardsProps) {
  const t = useTranslations('Admin.stats');
  
  const stats = [
    {
      title: t('categories'),
      count: categories.length,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m2-2H9m10 0V9" />
        </svg>
      )
    },
    {
      title: t('vendors'),
      count: vendors.length,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: t('products'),
      count: products.length,
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      title: t('pages'),
      count: 3,
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-semibold text-foreground">{stat.count}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

# src/components/admin/tables/CategoriesTable.tsx

```tsx
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/admin';
import { ScrollableTableContainer } from './ScrollableTableContainer';
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/components/ui/toast';

interface CategoriesTableProps {
  categories: Category[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (category: Category) => void;
}

export function CategoriesTable({ 
  categories, 
  onRefresh, 
  onAdd, 
  onEdit 
}: CategoriesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslations('Admin');
  const deleteConfirmation = useDeleteConfirmation();
  const { showError } = useErrorHandler();
  const { addToast } = useToast();

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category => 
      category.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name?.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const checkCategoryUsage = async (categoryId: string): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking category usage:', error);
      return false;
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const categoryName = category.name?.en || category.name?.es || category.slug;
    
    // Check if category is being used by any products
    const isCategoryInUse = await checkCategoryUsage(category.id);
    
    if (isCategoryInUse) {
      addToast({
        title: t('errors.categoryInUseTitle'),
        description: t('errors.categoryInUseDescription'),
        variant: 'error',
      });
      return;
    }
    
    deleteConfirmation.showDeleteConfirmation(
      'category',
      async () => {
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', category.id);
          
          if (error) throw error;
          onRefresh();
        } catch (error) {
          console.error('Error deleting category:', error);
          showError('deleteCategory');
          throw error; // Re-throw to keep loading state
        }
      },
      categoryName
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">{t('tables.categories')}</h3>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {t('buttons.newCategory')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.searchCategories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md search-input bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <ScrollableTableContainer>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.slug')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.order')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {category.name?.en || t('tables.noName')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.name?.es || t('tables.noTranslation')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {category.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {t('buttons.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('buttons.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTableContainer>

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />
    </div>
  );
}
```

# src/components/admin/tables/index.ts

```ts
export { CategoriesTable } from './CategoriesTable';
export { VendorsTable } from './VendorsTable';
export { ProductsTable } from './ProductsTable';
export { ScrollableTableContainer } from './ScrollableTableContainer';
```

# src/components/admin/tables/ProductsTable.tsx

```tsx
import { useState, useMemo } from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Product, Category, Vendor } from '@/types/admin';
import { ScrollableTableContainer } from './ScrollableTableContainer';
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
}

export function ProductsTable({ 
  products, 
  categories, 
  vendors, 
  onRefresh,
  onAdd,
  onEdit
}: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslations('Admin');
  const deleteConfirmation = useDeleteConfirmation();
  const { showError } = useErrorHandler();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name?.en || t('tables.noCategory');
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || t('tables.noVendor');
  };

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product => {
      const categoryName = getCategoryName(product.category_id);
      const vendorName = getVendorName(product.vendor_id);
      
      return (
        product.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name?.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [products, searchTerm, categories, vendors, t]);

  const handleDeleteProduct = async (product: Product) => {
    const productName = product.name?.en || product.name?.es;
    
    deleteConfirmation.showDeleteConfirmation(
      'product',
      async () => {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);
          
          if (error) throw error;
          onRefresh();
        } catch (error) {
          console.error('Error deleting product:', error);
          showError('deleteProduct');
          throw error; // Re-throw to keep loading state
        }
      },
      productName
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">{t('tables.products')}</h3>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {t('buttons.newProduct')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.searchProducts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md search-input bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <ScrollableTableContainer>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                {t('tables.image')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.products')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.category')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.vendor')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {product.external_image_url ? (
                      <img 
                        src={product.external_image_url}
                        alt={product.name?.en || 'Product image'}
                        className="h-10 w-10 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {product.name?.en || t('tables.noName')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.name?.es || t('tables.noTranslation')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {getCategoryName(product.category_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {getVendorName(product.vendor_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? t('tables.active') : t('tables.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {t('buttons.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('buttons.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTableContainer>

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />
    </div>
  );
}
```

# src/components/admin/tables/ScrollableTableContainer.tsx

```tsx
'use client';

import { ReactNode } from 'react';
import { useScrollIndicator } from '@/components/ui/ScrollIndicator';
import { useTranslations } from 'next-intl';

interface ScrollableTableContainerProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  indicatorText?: string;
  indicatorVariant?: 'default' | 'minimal' | 'arrow-only';
}

export function ScrollableTableContainer({ 
  children, 
  className = '',
  maxHeight = 'max-h-96',
  indicatorText,
  indicatorVariant = 'default'
}: ScrollableTableContainerProps) {
  const { containerRef, ScrollIndicator } = useScrollIndicator();
  const t = useTranslations('Admin.scrollIndicator');
  
  // Use translation as default if no text is provided
  const displayText = indicatorText || t('moreRowsBelow');

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={`overflow-x-auto ${maxHeight} scrollbar-hide table-scroll border border-border rounded-md ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <ScrollIndicator 
        text={displayText}
        variant={indicatorVariant}
      />
    </div>
  );
}
```

# src/components/admin/tables/VendorsTable.tsx

```tsx
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types/admin';
import { ScrollableTableContainer } from './ScrollableTableContainer';
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface VendorsTableProps {
  vendors: Vendor[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (vendor: Vendor) => void;
}

export function VendorsTable({ 
  vendors, 
  onRefresh, 
  onAdd, 
  onEdit 
}: VendorsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslations('Admin');
  const deleteConfirmation = useDeleteConfirmation();
  const { showError } = useErrorHandler();

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;
    
    return vendors.filter(vendor => 
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.website?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendors, searchTerm]);

  const handleDeleteVendor = async (vendor: Vendor) => {
    deleteConfirmation.showDeleteConfirmation(
      'vendor',
      async () => {
        try {
          const { error } = await supabase
            .from('vendors')
            .delete()
            .eq('id', vendor.id);
          
          if (error) throw error;
          onRefresh();
        } catch (error) {
          console.error('Error deleting vendor:', error);
          showError('deleteVendor');
          throw error; // Re-throw to keep loading state
        }
      },
      vendor.name
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">{t('tables.vendors')}</h3>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {t('buttons.newVendor')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.searchVendors')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md search-input bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <ScrollableTableContainer>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.website')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {vendor.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vendor.website ? (
                    <a 
                      href={vendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      {vendor.website}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">{t('tables.noWebsite')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onEdit(vendor)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {t('buttons.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteVendor(vendor)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('buttons.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTableContainer>

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />
    </div>
  );
}
```

# src/components/admin/TicketsManagement.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'

interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  assigned_to: string
  created_by: string
  created_at: string
  updated_at: string
}

export function TicketsManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const t = useTranslations('AdminPanel.tickets')
  const tCommon = useTranslations('AdminPanel.common')

  type TicketFormData = {
    title: string
    description: string
    status: Ticket['status']
    priority: Ticket['priority']
    category: string
    assigned_to: string
  }

  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: '',
    assigned_to: ''
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (editingTicket) {
        const { error } = await supabase
          .from('tickets')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTicket.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tickets')
          .insert({
            ...formData,
            created_by: user?.id
          })
          
        if (error) throw error
      }
      
      await fetchTickets()
      resetForm()
    } catch (error) {
      console.error('Error saving ticket:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ticket?')) return
    
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      await fetchTickets()
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      category: '',
      assigned_to: ''
    })
    setEditingTicket(null)
    setShowForm(false)
  }

  const startEdit = (ticket: Ticket) => {
    setFormData({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category || '',
      assigned_to: ticket.assigned_to || ''
    })
    setEditingTicket(ticket)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    const labels = {
      open: t('status.open'),
      in_progress: t('status.in_progress'),
      resolved: t('status.resolved'),
      closed: t('status.closed')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      low: t('priority.low'),
      medium: t('priority.medium'),
      high: t('priority.high'),
      urgent: t('priority.urgent')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    )
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
{t('newTicket')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('status.all')}</option>
          <option value="open">{t('status.open')}</option>
          <option value="in_progress">{t('status.in_progress')}</option>
          <option value="resolved">{t('status.resolved')}</option>
          <option value="closed">{t('status.closed')}</option>
        </select>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('priority.all')}</option>
          <option value="low">{t('priority.low')}</option>
          <option value="medium">{t('priority.medium')}</option>
          <option value="high">{t('priority.high')}</option>
          <option value="urgent">{t('priority.urgent')}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{tickets.length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.total')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'open').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.open')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'in_progress').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.inProgress')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{tickets.filter(t => t.priority === 'urgent').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.urgent')}</div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{ticket.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(ticket.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {ticket.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(ticket)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('noTicketsFound')}</div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTicket ? 'Editar Ticket' : 'Nuevo Ticket'}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Ticket['status'] }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="open">Abierto</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="resolved">Resuelto</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Ticket['priority'] }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="ej. Soporte Técnico, Hardware, Software..."
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {editingTicket ? 'Actualizar' : 'Crear'} Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

```

# src/components/admin/UsersManagement.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase, UserProfile } from '@/lib/supabase'
import { Check, X, Eye, UserCheck, UserX, Search, Filter } from 'lucide-react'

export function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const t = useTranslations('AdminPanel.users')
  const tCommon = useTranslations('AdminPanel.common')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          approval_status: status,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const updateUserRole = async (userId: string, role: 'admin' | 'employee' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.approval_status === filter
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      pending: t('status.pending'),
      approved: t('status.approved'),
      rejected: t('status.rejected')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      employee: 'bg-blue-100 text-blue-800 border-blue-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    const labels = {
      admin: 'Administrador',
      employee: 'Empleado', 
      user: 'Usuario'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="all">{t('status.all')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="approved">{t('status.approved')}</option>
              <option value="rejected">{t('status.rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Usuarios</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.approval_status === 'pending').length}</div>
          <div className="text-sm text-muted-foreground">{t('status.pending')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => u.approval_status === 'approved').length}</div>
          <div className="text-sm text-muted-foreground">{t('status.approved')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{users.filter(u => u.approval_status === 'rejected').length}</div>
          <div className="text-sm text-muted-foreground">{t('status.rejected')}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.created')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                      className="text-sm border border-border rounded px-2 py-1 bg-background"
                      disabled={user.approval_status !== 'approved'}
                    >
                      <option value="user">Usuario</option>
                      <option value="employee">Empleado</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.approval_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                            title="Aprobar usuario"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                            title="Rechazar usuario"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('noUsersFound')}</div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('userDetails.title')}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.fullName')}</label>
                <div className="text-foreground">{selectedUser.first_name} {selectedUser.last_name}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.email')}</label>
                <div className="text-foreground">{selectedUser.email}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.role')}</label>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.status')}</label>
                <div>{getStatusBadge(selectedUser.approval_status)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('userDetails.registrationDate')}</label>
                <div className="text-foreground">{new Date(selectedUser.created_at).toLocaleString()}</div>
              </div>
              
              {selectedUser.approved_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('userDetails.approvalDate')}</label>
                  <div className="text-foreground">{new Date(selectedUser.approved_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

```

# src/components/admin/VendorForm.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Vendor {
 id?: string;
 name: string;
 website?: string;
 description?: { en: string; es: string };
}

interface VendorFormProps {
 vendor?: Vendor | null;
 onClose: () => void;
 onSuccess: () => void;
}

export function VendorForm({ vendor, onClose, onSuccess }: VendorFormProps) {
 const [formData, setFormData] = useState({
 name: '',
 website: '',
 descriptionEn: '',
 descriptionEs: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (vendor) {
 setFormData({
 name: vendor.name || '',
 website: vendor.website || '',
 descriptionEn: vendor.description?.en || '',
 descriptionEs: vendor.description?.es || ''
 });
 }
 }, [vendor]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const vendorData = {
 name: formData.name,
 website: formData.website || null,
 description: {
 en: formData.descriptionEn,
 es: formData.descriptionEs
 }
 };

 if (vendor?.id) {
 // Update existing vendor
 const { error } = await supabase
 .from('vendors')
 .update(vendorData)
 .eq('id', vendor.id);

 if (error) throw error;
 } else {
 // Create new vendor
 const { error } = await supabase
 .from('vendors')
 .insert(vendorData);

 if (error) throw error;
 }

 onSuccess();
 } catch (err: any) {
 setError(err.message || 'Error al guardar el proveedor');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-background dark:bg-[#0a1222] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center p-6 border-b">
 <h2 className="text-xl font-semibold text-foreground">
 {vendor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
 </h2>
 <button
 onClick={onClose}
 className="text-muted-foreground hover:text-muted-foreground"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {/* Basic Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre del Proveedor *
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="WatchGuard"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Sitio Web
 </label>
 <input
 type="url"
 value={formData.website}
 onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="https://www.watchguard.com"
 />
 </div>
 </div>

 {/* Descriptions */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Inglés)
 </label>
 <textarea
 value={formData.descriptionEn}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
 rows={4}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Leading provider of network security solutions..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Español)
 </label>
 <textarea
 value={formData.descriptionEs}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
 rows={4}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Proveedor líder de soluciones de seguridad de red..."
 />
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
 {error}
 </div>
 )}

 <div className="flex justify-end space-x-3 pt-4 border-t">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-foreground bg-accent rounded-md hover:bg-gray-200"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
 >
 {loading ? 'Guardando...' : (vendor ? 'Actualizar' : 'Crear')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
```

# src/components/admin/VPNsManagement.tsx

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Eye, Edit, Trash2, Wifi, WifiOff } from 'lucide-react'

interface VPN {
  id: string
  vpn_name: string
  client_name: string
  client_email: string
  server_location: string
  configuration: any
  status: 'requested' | 'configuring' | 'active' | 'suspended' | 'terminated'
  assigned_to: string
  created_by: string
  expires_at: string
  created_at: string
  updated_at: string
}

export function VPNsManagement() {
  const [vpns, setVpns] = useState<VPN[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVPN, setEditingVPN] = useState<VPN | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const t = useTranslations('AdminPanel.vpns')
  const tCommon = useTranslations('AdminPanel.common')

  type VPNFormData = {
    vpn_name: string
    client_name: string
    client_email: string
    server_location: string
    configuration: string
    status: VPN['status']
    expires_at: string
  }

  const [formData, setFormData] = useState<VPNFormData>({
    vpn_name: '',
    client_name: '',
    client_email: '',
    server_location: '',
    configuration: '',
    status: 'requested',
    expires_at: ''
  })

  const serverLocations = [
    'Estados Unidos - Este',
    'Estados Unidos - Oeste',
    'Canadá',
    'Reino Unido',
    'Alemania',
    'Francia',
    'Japón',
    'Australia',
    'Brasil',
    'República Dominicana'
  ]

  useEffect(() => {
    fetchVPNs()
  }, [])

  const fetchVPNs = async () => {
    try {
      const { data, error } = await supabase
        .from('vpns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVpns(data || [])
    } catch (error) {
      console.error('Error fetching VPNs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const submitData = {
        ...formData,
        configuration: formData.configuration ? JSON.parse(formData.configuration) : null,
        expires_at: formData.expires_at || null
      }
      
      if (editingVPN) {
        const { error } = await supabase
          .from('vpns')
          .update({
            ...submitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVPN.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vpns')
          .insert({
            ...submitData,
            created_by: user?.id
          })
          
        if (error) throw error
      }
      
      await fetchVPNs()
      resetForm()
    } catch (error) {
      console.error('Error saving VPN:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta VPN?')) return
    
    try {
      const { error } = await supabase
        .from('vpns')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      await fetchVPNs()
    } catch (error) {
      console.error('Error deleting VPN:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      vpn_name: '',
      client_name: '',
      client_email: '',
      server_location: '',
      configuration: '',
      status: 'requested',
      expires_at: ''
    })
    setEditingVPN(null)
    setShowForm(false)
  }

  const startEdit = (vpn: VPN) => {
    setFormData({
      vpn_name: vpn.vpn_name,
      client_name: vpn.client_name,
      client_email: vpn.client_email,
      server_location: vpn.server_location || '',
      configuration: vpn.configuration ? JSON.stringify(vpn.configuration, null, 2) : '',
      status: vpn.status,
      expires_at: vpn.expires_at ? vpn.expires_at.split('T')[0] : ''
    })
    setEditingVPN(vpn)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      requested: 'bg-blue-100 text-blue-800 border-blue-200',
      configuring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-orange-100 text-orange-800 border-orange-200',
      terminated: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      requested: 'Solicitada',
      configuring: 'Configurando',
      active: 'Activa',
      suspended: 'Suspendida',
      terminated: 'Terminada'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active') {
      return <Wifi className="h-4 w-4 text-green-600" />
    }
    return <WifiOff className="h-4 w-4 text-muted-foreground" />
  }

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const filteredVPNs = vpns.filter(vpn => {
    const matchesSearch = !searchTerm || 
      vpn.vpn_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vpn.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vpn.client_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vpn.status === statusFilter
    const matchesLocation = locationFilter === 'all' || vpn.server_location === locationFilter
    
    return matchesSearch && matchesStatus && matchesLocation
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
{t('newVPN')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('status.all')}</option>
          <option value="requested">{t('status.requested')}</option>
          <option value="configuring">{t('status.configuring')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="suspended">{t('status.suspended')}</option>
          <option value="terminated">{t('status.terminated')}</option>
        </select>
        
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('locations.all')}</option>
          {serverLocations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{vpns.length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.total')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{vpns.filter(v => v.status === 'active').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.active')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{vpns.filter(v => v.status === 'configuring').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.configuring')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{vpns.filter(v => v.status === 'suspended').length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.suspended')}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{vpns.filter(v => v.expires_at && isExpired(v.expires_at)).length}</div>
          <div className="text-sm text-muted-foreground">{t('stats.expired')}</div>
        </div>
      </div>

      {/* VPNs Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.client')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('table.expires')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredVPNs.map((vpn) => (
                <tr key={vpn.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(vpn.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">{vpn.vpn_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{vpn.client_name}</div>
                      <div className="text-sm text-muted-foreground">{vpn.client_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {vpn.server_location || 'No especificada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vpn.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {vpn.expires_at ? (
                      <div className={isExpired(vpn.expires_at) ? 'text-red-600 font-medium' : ''}>
                        {new Date(vpn.expires_at).toLocaleDateString('es-ES')}
                        {isExpired(vpn.expires_at) && ' (Expirada)'}
                      </div>
                    ) : (
                      'Sin expiración'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(vpn)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vpn.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredVPNs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('noVPNsFound')}</div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingVPN ? 'Editar VPN' : 'Nueva VPN'}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre de la VPN *
                  </label>
                  <input
                    type="text"
                    value={formData.vpn_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, vpn_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Ubicación del Servidor
                  </label>
                  <select
                    value={formData.server_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, server_location: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Seleccionar ubicación</option>
                    {serverLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email del Cliente *
                  </label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Configuración (JSON)
                </label>
                <textarea
                  value={formData.configuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
                  rows={4}
                  placeholder='{"protocol": "OpenVPN", "port": 1194, "encryption": "AES-256"}'
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VPN['status'] }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="requested">Solicitada</option>
                    <option value="configuring">Configurando</option>
                    <option value="active">Activa</option>
                    <option value="suspended">Suspendida</option>
                    <option value="terminated">Terminada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {editingVPN ? 'Actualizar' : 'Crear'} VPN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

```

# src/components/AdminLink.tsx

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export function AdminLink() {
  const [isVisible, setIsVisible] = useState(false);

  // Show admin link only in development or when explicitly requested
  const showAdminLink = process.env.NODE_ENV === 'development' || isVisible;

  if (!showAdminLink) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-3 h-3 bg-gray-300 rounded-full opacity-20 hover:opacity-100 transition-opacity"
        title="Mostrar enlace de administración"
      />
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        href="/admin"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Admin</span>
      </Link>
      {isVisible && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

# src/components/Analytics.tsx

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initGA, trackPageView, GA_TRACKING_ID } from '@/lib/analytics';

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize GA on component mount
    if (GA_TRACKING_ID) {
      initGA();
    }
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (GA_TRACKING_ID && pathname) {
      trackPageView(window.location.href);
    }
  }, [pathname]);

  // Render GA script tags for SSR
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}

```

# src/components/auth/AuthModal.tsx

```tsx
'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { DevLoginForm } from './DevLoginForm';

interface AuthModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
 const [mode, setMode] = useState<'login' | 'signup' | 'dev'>('dev');

 if (!isOpen) return null;

 const handleSuccess = () => {
 onSuccess();
 onClose();
 };

 const toggleMode = () => {
 setMode(mode === 'login' ? 'signup' : 'login');
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="relative max-w-md w-full">
 <button
 onClick={onClose}
 className="absolute -top-4 -right-4 bg-background rounded-full p-2 shadow-lg hover:bg-accent z-10"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>

 {mode === 'dev' ? (
 <DevLoginForm onSuccess={handleSuccess} />
 ) : mode === 'login' ? (
 <LoginForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
 ) : (
 <SignUpForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
 )}
 
 {mode !== 'dev' && (
 <div className="mt-4 text-center">
 <button
 onClick={() => setMode('dev')}
 className="text-sm text-yellow-600 hover:text-yellow-700"
 >
 Modo Desarrollo
 </button>
 </div>
 )}
 </div>
 </div>
 );
}
```

# src/components/auth/DevLoginForm.tsx

```tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DevLoginFormProps {
 onSuccess: () => void;
}

export function DevLoginForm({ onSuccess }: DevLoginFormProps) {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleDevLogin = async () => {
 setLoading(true);
 setError('');

 try {
 // Create a mock admin user for development
 // This completely bypasses Supabase authentication
 const mockAdminUser = {
 id: '2b59e7ae-277f-40f2-b777-c09ec8542609',
 email: 'admin@cecom.com.do',
 role: 'administrator',
 first_name: 'Admin',
 last_name: 'CECOM',
 active: true
 };

 // Store user info in localStorage for development
 localStorage.setItem('dev_user', JSON.stringify(mockAdminUser));

 console.log('🧪 Modo desarrollo activado:', mockAdminUser);
 onSuccess();
 } catch (err) {
 setError('Error en el inicio de sesión de desarrollo');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="w-full max-w-md mx-auto">
 <div className="bg-background rounded-lg shadow-md p-6">
 <div className="text-center mb-6">
 <h2 className="text-2xl font-bold text-foreground">Modo Desarrollo</h2>
 <p className="text-muted-foreground mt-2">Acceso directo al panel de administración</p>
 </div>

 <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
 <div className="flex">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-yellow-800">
 Modo de Desarrollo
 </h3>
 <div className="mt-2 text-sm text-yellow-700">
 <p>
 Este botón bypasa la autenticación de Supabase para desarrollo.
 En producción, usa el sistema de login normal.
 </p>
 </div>
 </div>
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
 {error}
 </div>
 )}

 <button
 onClick={handleDevLogin}
 disabled={loading}
 className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Accediendo...' : 'Acceso de Desarrollo'}
 </button>

 <div className="mt-4 p-3 bg-background rounded-md">
 <p className="text-xs text-muted-foreground text-center">
 <strong>Usuario:</strong> admin@cecom.com.do<br />
 <strong>Rol:</strong> Administrator<br />
 <strong>Modo:</strong> Desarrollo (sin autenticación)
 </p>
 </div>
 </div>
 </div>
 );
}
```

# src/components/auth/LoginForm.tsx

```tsx
'use client';

import { useState } from 'react';
import { signIn } from '@/lib/supabase';

interface LoginFormProps {
 onSuccess: () => void;
 onToggleMode: () => void;
}

export function LoginForm({ onSuccess, onToggleMode }: LoginFormProps) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const { error } = await signIn(email, password);
 
 if (error) {
 setError(error.message);
 } else {
 onSuccess();
 }
 } catch (err) {
 setError('Error inesperado al iniciar sesión');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="w-full max-w-md mx-auto">
 <div className="bg-background rounded-lg shadow-md p-6">
 <div className="text-center mb-6">
 <h2 className="text-2xl font-bold text-foreground">Iniciar Sesión</h2>
 <p className="text-muted-foreground mt-2">Accede al panel de administración</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
 Correo Electrónico
 </label>
 <input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="admin@cecom.com.do"
 />
 </div>

 <div>
 <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
 Contraseña
 </label>
 <input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="••••••••"
 />
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
 {error}
 </div>
 )}

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
 </button>
 </form>

 <div className="mt-6 text-center">
 <p className="text-sm text-muted-foreground">
 ¿No tienes cuenta?{' '}
 <button
 onClick={onToggleMode}
 className="text-blue-600 hover:text-blue-700 font-medium"
 >
 Crear cuenta
 </button>
 </p>
 </div>

 <div className="mt-4 p-3 bg-background rounded-md">
 <p className="text-xs text-muted-foreground text-center">
 <strong>Cuenta de prueba:</strong><br />
 Email: admin@cecom.com.do<br />
 Contraseña: admin123
 </p>
 </div>
 </div>
 </div>
 );
}
```

# src/components/auth/SignUpForm.tsx

```tsx
'use client';

import { useState } from 'react';
import { signUp, UserRole } from '@/lib/supabase';

interface SignUpFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export function SignUpForm({ onSuccess, onToggleMode }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'user' as UserRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Cuenta creada exitosamente. Esperando aprobación del administrador.');
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      setError('Error inesperado al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Crear Cuenta</h2>
          <p className="text-muted-foreground mt-2">Registrarse en el sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Juan"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="usuario@cecom.com.do"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Iniciar sesión
            </button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800 text-center">
            <strong>Nota:</strong> Las cuentas nuevas requieren aprobación del administrador antes de poder acceder al sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
```

# src/components/blog/BlogCard.tsx

```tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { parseDate, formatDate } from '@/utils/blog';

interface BlogCardProps {
  post: BlogPost;
  locale: 'es' | 'en';
}

export function BlogCard({ post, locale }: BlogCardProps) {
  const title = post.title;
  const excerpt = post.excerpt;
  
  // Use utility functions for date parsing and formatting
  const parsedDate = parseDate(post.publishedDate);
  const formattedDate = formatDate(parsedDate, locale);

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      {/* Security Advisory Icon */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-200/20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Security Advisory</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={post.publishedDate}>{formattedDate}</time>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime} min</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/${locale}/blog/${post.slug}`}>
            {title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag: string) => (
            <Link
              key={tag}
              href={`/${locale}/blog/tag/${tag}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded text-xs hover:bg-accent/80 transition-colors"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        {/* Read More Link */}
        <Link
          href={`/${locale}/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
        >
          {locale === 'es' ? 'Leer más' : 'Read more'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

```

# src/components/blog/BlogContent.tsx

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Convert markdown-like content to HTML
  const processContent = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-foreground mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-foreground mt-10 mb-6">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-foreground mt-12 mb-8">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^- (.*$)/gim, '<li class="mb-2">$1</li>')
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside mb-6 space-y-2 text-muted-foreground ml-4">$1</ul>')
      
      // Paragraphs
      .replace(/^(?!<[h|u|l])(.*$)/gim, '<p class="mb-6 text-muted-foreground leading-relaxed">$1</p>')
      
      // Clean up empty paragraphs
      .replace(/<p class="mb-6 text-muted-foreground leading-relaxed"><\/p>/g, '');
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Process code blocks separately
  const renderContentWithCodeBlocks = (content: string) => {
    const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('\`\`\`')) {
        const lines = part.split('\n');
        const language = lines[0].replace('\`\`\`', '').trim() || 'text';
        const code = lines.slice(1, -1).join('\n');
        const codeId = `code-${index}`;
        
        return (
          <div key={index} className="relative mb-6">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted-foreground/10 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {language}
                </span>
                <button
                  onClick={() => copyToClipboard(code, codeId)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded"
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-foreground font-mono">
                  {code}
                </code>
              </pre>
            </div>
          </div>
        );
      } else {
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: processContent(part) }}
          />
        );
      }
    });
  };

  return (
    <div className="prose prose-lg max-w-none">
      <div className="blog-content">
        {renderContentWithCodeBlocks(content)}
      </div>
      
      <style jsx>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3 {
          scroll-margin-top: 100px;
        }
        
        .blog-content img {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
        }
        
        .blog-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          background: hsl(var(--accent));
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }
        
        .blog-content th,
        .blog-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
          text-align: left;
        }
        
        .blog-content th {
          background: hsl(var(--muted));
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

```

# src/components/blog/BlogHeader.tsx

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Rss, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface BlogHeaderProps {
  showSearch?: boolean;
}

export function BlogHeader({ showSearch = true }: BlogHeaderProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/blog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };


  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        {/* Blog Title and Description */}
        <div className="text-center mb-8">
          <Link href={`/${locale}/blog`} className="group">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              CECOM {locale === 'es' ? 'Blog' : 'Blog'}
            </h1>
          </Link>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'es' 
              ? 'Insights, guías y tendencias en tecnología empresarial para República Dominicana'
              : 'Insights, guides and trends in enterprise technology for the Dominican Republic'
            }
          </p>
        </div>

        {/* Search and RSS */}
        <div className="flex items-center justify-center gap-4">
          {/* Search Form */}
          {showSearch && (
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={locale === 'es' ? 'Buscar artículos...' : 'Search articles...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-80 bg-background border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </form>
          )}

          {/* RSS Feed Link */}
          <Link
            href={`/${locale}/blog/feed.xml`}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title={locale === 'es' ? 'Feed RSS' : 'RSS Feed'}
          >
            <Rss className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

```

# src/components/blog/BlogPagination.tsx

```tsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
  basePath?: string;
}

export function BlogPagination({ 
  currentPage, 
  totalPages, 
  locale,
  basePath = `/${locale}/blog`
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const getPageUrl = (page: number) => {
    const url = new URL(`${basePath}?page=${page}`, 'http://localhost');
    return url.pathname + url.search;
  };

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {locale === 'es' ? 'Anterior' : 'Previous'}
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground/50 bg-muted border border-border rounded-lg cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          {locale === 'es' ? 'Anterior' : 'Previous'}
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={getPageUrl(pageNumber)}
              className={`
                flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors
                ${isCurrentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground bg-background border border-border hover:bg-accent hover:text-accent-foreground'
                }
              `}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {locale === 'es' ? 'Siguiente' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground/50 bg-muted border border-border rounded-lg cursor-not-allowed">
          {locale === 'es' ? 'Siguiente' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </span>
      )}

      {/* Page Info */}
      <div className="hidden sm:flex items-center ml-4 text-sm text-muted-foreground">
        {locale === 'es' 
          ? `Página ${currentPage} de ${totalPages}`
          : `Page ${currentPage} of ${totalPages}`
        }
      </div>
    </nav>
  );
}

```

# src/components/blog/BlogSidebar.tsx

```tsx
import Link from 'next/link';
import { Folder, TrendingUp, Calendar } from 'lucide-react';
import { getBlogCategories, getBlogPosts } from '@/lib/supabase-blog';

interface BlogSidebarProps {
  locale: string;
  activeCategory?: string;
  activeTag?: string;
}

// Load data from Supabase
async function loadCategories(locale: string) {
  try {
    const categories = await getBlogCategories();
    const posts = await getBlogPosts({ status: 'published' });
    
    return categories.map((category: any) => {
      const postCount = posts.filter((post: any) => post.category === category.slug).length;
      return {
        name: locale === 'es' ? category.name_es : category.name_en,
        slug: category.slug,
        count: postCount,
        color: category.color
      };
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

async function loadRecentPosts(locale: string) {
  try {
    const posts = await getBlogPosts({ status: 'published', limit: 3 });
    
    return posts.map((post: any) => ({
      title: post.title,
      slug: post.slug,
      date: post.publishedDate,
      category: 'Ciberseguridad' // Default category for now
    }));
  } catch (error) {
    console.error('Error loading recent posts:', error);
    return [];
  }
}

export async function BlogSidebar({ locale, activeCategory, activeTag }: BlogSidebarProps) {
  const isSpanish = locale === 'es';
  
  // Load real data
  const categories = await loadCategories(locale);
  const tags: any[] = []; // Tags functionality to be implemented later
  const recentPosts = await loadRecentPosts(locale);

  return (
    <aside className="space-y-8">

      {/* Categories */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Folder className="w-5 h-5" />
          {isSpanish ? 'Categorías' : 'Categories'}
        </h3>
        <ul className="space-y-2">
          {categories.map((category: { name: string; slug: string; count: number }) => (
            <li key={category.slug}>
              <Link
                href={`/${locale}/blog/category/${category.slug}`}
                className={`
                  flex items-center justify-between p-2 rounded-lg transition-colors
                  ${activeCategory === category.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>


      {/* Recent Posts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <TrendingUp className="w-5 h-5" />
          {isSpanish ? 'Artículos Recientes' : 'Recent Posts'}
        </h3>
        <ul className="space-y-4">
          {recentPosts.map((post: { title: string; slug: string; date: string; category: string }) => (
            <li key={post.slug}>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="group block"
              >
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(
                      isSpanish ? 'es-DO' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </time>
                  <span>•</span>
                  <span>{post.category}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isSpanish ? 'Mantente Actualizado' : 'Stay Updated'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isSpanish 
            ? 'Recibe las últimas noticias y artículos técnicos directamente en tu email.'
            : 'Get the latest news and technical articles delivered to your inbox.'
          }
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder={isSpanish ? 'Tu email' : 'Your email'}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {isSpanish ? 'Suscribirse' : 'Subscribe'}
          </button>
        </form>
      </div>

      {/* Contact CTA */}
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isSpanish ? '¿Necesitas Ayuda?' : 'Need Help?'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isSpanish 
            ? 'Nuestro equipo de expertos está listo para asesorarte.'
            : 'Our expert team is ready to advise you.'
          }
        </p>
        <Link
          href={`/${locale}/contact`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {isSpanish ? 'Contáctanos' : 'Contact Us'}
        </Link>
      </div>
    </aside>
  );
}

```

# src/components/blog/RelatedPosts.tsx

```tsx
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  featured_image?: string;
  published_date: string;
  reading_time: number;
}

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
  locale: string;
}

// Mock data - será reemplazado por datos reales de PayloadCMS
const mockRelatedPosts: RelatedPost[] = [
  {
    id: '2',
    title: 'Cómo Elegir el Switch Perfecto para tu Red Empresarial',
    excerpt: 'Análisis detallado de switches Extreme Networks y cómo seleccionar el modelo ideal según las necesidades de tu empresa.',
    slug: 'elegir-switch-red-empresarial',
    category: 'Redes',
    featured_image: '/blog/network-switch-guide.jpg',
    published_date: '2024-08-18',
    reading_time: 6
  },
  {
    id: '3',
    title: 'Mejores Prácticas para Configurar Firewalls WatchGuard',
    excerpt: 'Guía paso a paso para configurar y optimizar tu firewall WatchGuard para máxima seguridad empresarial.',
    slug: 'configurar-firewalls-watchguard',
    category: 'Ciberseguridad',
    featured_image: '/blog/watchguard-config.jpg',
    published_date: '2024-08-16',
    reading_time: 10
  },
  {
    id: '4',
    title: 'Caso de Éxito: Modernización de Red en Empresa Local',
    excerpt: 'Cómo ayudamos a una empresa dominicana a modernizar completamente su infraestructura de red con resultados excepcionales.',
    slug: 'caso-exito-modernizacion-red',
    category: 'Casos de Éxito',
    featured_image: '/blog/case-study-network.jpg',
    published_date: '2024-08-15',
    reading_time: 8
  }
];

async function getRelatedPosts(currentPostId: string, category: string, limit: number = 3) {
  // TODO: Implementar consulta real a PayloadCMS
  // Filtrar posts relacionados por categoría, excluyendo el post actual
  return mockRelatedPosts
    .filter(post => post.id !== currentPostId)
    .slice(0, limit);
}

export async function RelatedPosts({ currentPostId, category, locale }: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId, category);
  
  if (relatedPosts.length === 0) {
    return null;
  }

  const isSpanish = locale === 'es';

  return (
    <section className="border-t border-border pt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isSpanish ? 'Artículos Relacionados' : 'Related Articles'}
        </h2>
        <p className="text-muted-foreground">
          {isSpanish 
            ? 'Continúa explorando más contenido relevante'
            : 'Continue exploring more relevant content'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          const formattedDate = new Date(post.published_date).toLocaleDateString(
            isSpanish ? 'es-DO' : 'en-US',
            { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }
          );

          return (
            <article
              key={post.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20"
            >
              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Meta Information */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={post.published_date}>{formattedDate}</time>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.reading_time} min</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/${locale}/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
                >
                  {isSpanish ? 'Leer más' : 'Read more'}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* View All Posts Link */}
      <div className="text-center mt-8">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors font-medium"
        >
          {isSpanish ? 'Ver Todos los Artículos' : 'View All Articles'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

```

# src/components/catalog/CategorySidebar.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Grid3X3, Shield, Wifi, Phone, Monitor, Server, Zap, Lock, Network, Router, Cable, Bluetooth, Smartphone, Headphones, Radio, Laptop, Tablet, Cpu, MemoryStick, Database, HardDrive, Cloud, Printer, Camera, Keyboard, Mouse, Usb, Tv, Gamepad2, Watch } from 'lucide-react'
import { Category } from '@/lib/payload/types'

interface CategorySidebarProps {
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string | null) => void
  className?: string
}

// Icon mapping for categories - matches IconPicker
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Security & Protection
  shield: Shield,
  lock: Lock,
  
  // Networking
  wifi: Wifi,
  network: Network,
  router: Router,
  cable: Cable,
  bluetooth: Bluetooth,
  
  // Communication
  phone: Phone,
  smartphone: Smartphone,
  headphones: Headphones,
  radio: Radio,
  
  // Computing
  monitor: Monitor,
  laptop: Laptop,
  tablet: Tablet,
  cpu: Cpu,
  memory: MemoryStick,
  
  // Storage & Servers
  server: Server,
  database: Database,
  harddrive: HardDrive,
  cloud: Cloud,
  
  // Peripherals
  printer: Printer,
  camera: Camera,
  keyboard: Keyboard,
  mouse: Mouse,
  usb: Usb,
  
  // Entertainment
  tv: Tv,
  gamepad: Gamepad2,
  watch: Watch,
  
  // General
  zap: Zap,
  grid: Grid3X3,
}

export function CategorySidebar({ 
  selectedCategoryId, 
  onCategorySelect, 
  className = '' 
}: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('Catalog')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/catalog/categories?locale=${locale}`)
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [locale])

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      // Deselect if clicking the same category
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryId)
    }
  }

  const handleShowAll = () => {
    onCategorySelect(null)
  }

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            {t('states.loadingCategories')}
          </span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <p className="text-sm text-destructive mb-2">{t('states.errorLoadingCategories')}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            {t('actions.retry')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg mb-4">{t('categories')}</h3>
        
        {/* Show All Products Button */}
        <Button
          variant={!selectedCategoryId ? "default" : "ghost"}
          className="w-full justify-start h-auto p-3"
          onClick={handleShowAll}
        >
          <Grid3X3 className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="text-left">{t('allProducts')}</span>
        </Button>

        {/* Category List */}
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id
            const IconComponent = categoryIcons[category.icon || 'grid'] || Grid3X3
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => handleCategoryClick(category.id)}
              >
                <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {category.description}
                    </div>
                  )}
                </div>
              </Button>
            )
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('states.noCategories')}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
```

# src/components/catalog/ProductCard.tsx

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText, ExternalLink } from 'lucide-react'
import { Product, Vendor, Category, Media } from '@/lib/payload/types'

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onViewDetails, className = '' }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const t = useTranslations('Catalog')

  // Type guards and data extraction
  const vendor = typeof product.vendor === 'object' ? product.vendor as Vendor : null
  const category = typeof product.category === 'object' ? product.category as Category : null
  const productImage = product.image as Media | undefined
  const vendorLogo = vendor?.logo as Media | undefined

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const handleViewDetails = () => {
    onViewDetails(product)
  }

  const getImageUrl = (media: Media | undefined, fallback: string = '/products/placeholder-product.svg') => {
    if (!media) return fallback
    return media.sizes?.card?.url || media.url || fallback
  }

  const getVendorLogoUrl = (media: Media | undefined) => {
    if (!media) return null
    return media.sizes?.thumbnail?.url || media.url
  }

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleViewDetails()
    }
  }

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer ${className}`}
      onClick={handleViewDetails}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${product.name} - ${t('actions.viewDetails')}`}
    >
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
          {!imageError ? (
            <Image
              src={getImageUrl(productImage)}
              alt={product.name || 'Product image'}
              fill
              className={`object-contain object-center transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              src="/products/placeholder-product.svg"
              alt="Placeholder"
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          
          {/* Loading overlay */}
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse">
                <div className="h-4 w-4 bg-border rounded-full"></div>
              </div>
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            </div>
          )}

          {/* Vendor logo */}
            {vendor && getVendorLogoUrl(vendorLogo) && (
            <div className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-sm border">
              <Image
                src={getVendorLogoUrl(vendorLogo)!}
                alt={vendor.name}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Product Name */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              <button
                type="button"
                onClick={handleViewDetails}
                className="text-left w-full cursor-pointer hover:underline focus:outline-none"
                aria-label={`${product.name} - ${t('actions.viewDetails')}`}
              >
                {product.name}
              </button>
            </h3>

            {/* Vendor Name */}
            {vendor && (
              <p className="text-sm text-muted-foreground font-medium">
                {vendor.name}
              </p>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="text-sm text-muted-foreground line-clamp-3">
                {typeof product.description === 'string' 
                  ? product.description 
                  : product.description?.root?.children?.[0]?.children?.[0]?.text || ''
                }
              </div>
            )}

            {/* Features Preview */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('features')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {typeof feature === 'string' ? feature : feature.feature || ''}
                    </Badge>
                  ))}
                  {product.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex flex-wrap gap-2 w-full min-w-0">
          <Button 
            onClick={(e) => { e.stopPropagation(); handleViewDetails() }}
            className="flex-1 min-w-0 whitespace-nowrap overflow-hidden relative z-20"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{t('actions.viewDetails')}</span>
          </Button>
          
          {product.datasheet && (
            <Button 
              variant="outline" 
              size="sm"
              className="relative z-20 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                const datasheetUrl = typeof product.datasheet === 'object' 
                  ? (product.datasheet as Media).url 
                  : product.datasheet
                if (datasheetUrl) {
                  window.open(datasheetUrl, '_blank')
                }
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}

          {vendor?.website && (
            <Button 
              variant="outline" 
              size="sm"
              className="relative z-20 shrink-0"
              onClick={(e) => { e.stopPropagation(); window.open(vendor.website, '_blank') }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
```

# src/components/catalog/ProductFilter.tsx

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react'
import { Vendor } from '@/lib/payload/types'
// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface ProductFilterProps {
  searchQuery: string
  selectedVendor: string | null
  onSearchChange: (query: string) => void
  onVendorChange: (vendorId: string | null) => void
  onClearFilters: () => void
  className?: string
}

export function ProductFilter({
  searchQuery,
  selectedVendor,
  onSearchChange,
  onVendorChange,
  onClearFilters,
  className = ''
}: ProductFilterProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorsLoading, setVendorsLoading] = useState(true)
  const [vendorsError, setVendorsError] = useState<string | null>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('Catalog')
  const tCommon = useTranslations('Common')

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearchChange(query)
    }, 300),
    [onSearchChange]
  )

  // Fetch vendors for filter dropdown
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true)
        setVendorsError(null)
        const response = await fetch('/api/catalog/vendors')
        if (!response.ok) {
          throw new Error('Failed to fetch vendors')
        }
        const data = await response.json()
        setVendors(data)
      } catch (error) {
        console.error('Error fetching vendors:', error)
        setVendorsError(error instanceof Error ? error.message : 'Failed to load vendors')
      } finally {
        setVendorsLoading(false)
      }
    }

    fetchVendors()
  }, [])

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
  }

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string | null) => {
    onVendorChange(vendorId)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setLocalSearchQuery('')
    onClearFilters()
  }

  // Get selected vendor name
  const selectedVendorName = selectedVendor 
    ? vendors.find(v => v.id === selectedVendor)?.name 
    : null

  // Check if any filters are active
  const hasActiveFilters = localSearchQuery.trim() !== '' || selectedVendor !== null

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchProducts')}
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Vendor Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                {selectedVendorName || t('filter.filterByVendor')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>{t('filter.filterByVendor')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {vendorsLoading ? (
                <DropdownMenuItem disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('states.loading')}
                </DropdownMenuItem>
              ) : vendorsError ? (
                <DropdownMenuItem disabled>
                  <span className="text-destructive text-sm">
                    {tCommon('states.errorLoadingVendors')}
                  </span>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => handleVendorSelect(null)}>
                    <span className={selectedVendor === null ? 'font-medium' : ''}>
                      {t('filter.allVendors')}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {vendors.map((vendor) => (
                    <DropdownMenuItem 
                      key={vendor.id}
                      onClick={() => handleVendorSelect(vendor.id)}
                    >
                      <span className={selectedVendor === vendor.id ? 'font-medium' : ''}>
                        {vendor.name}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="h-9"
            >
              <X className="h-4 w-4 mr-2" />
              {t('filter.clearFilters')}
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {localSearchQuery.trim() !== '' && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                <Search className="h-3 w-3" />
                <span>&quot;{localSearchQuery}&quot;</span>
                <button
                  onClick={() => {
                    setLocalSearchQuery('')
                    onSearchChange('')
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {selectedVendorName && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                <Filter className="h-3 w-3" />
                <span>{selectedVendorName}</span>
                <button
                  onClick={() => handleVendorSelect(null)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
```

# src/components/catalog/ProductGrid.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ProductCard } from './ProductCard'
import { Loader2, Package } from 'lucide-react'
import { Product } from '@/lib/payload/types'

interface ProductGridProps {
  categoryId?: string | null
  searchQuery?: string
  vendorFilter?: string
  onProductSelect: (product: Product) => void
  onProductsLoad?: (products: Product[]) => void
  className?: string
}

export function ProductGrid({ 
  categoryId, 
  searchQuery, 
  vendorFilter, 
  onProductSelect, 
  onProductsLoad,
  className = '' 
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('Catalog')
  const tCommon = useTranslations('Common')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Build query parameters
        const params = new URLSearchParams({
          locale,
        })
        
        if (categoryId) {
          params.append('categoryId', categoryId)
        }
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        if (vendorFilter) {
          params.append('vendorId', vendorFilter)
        }
        
        const response = await fetch(`/api/catalog/products?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setProducts(data)
        
        // Notify parent component of loaded products for modal navigation
        if (onProductsLoad) {
          onProductsLoad(data)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [locale, categoryId, searchQuery, vendorFilter])

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('states.loadingProducts')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{t('states.error')}</h3>
          <p className="text-muted-foreground mb-4">{t('states.errorLoadingProducts')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            {t('actions.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    const emptyMessage = categoryId 
      ? t('states.noProductsInCategory') 
      : searchQuery || vendorFilter 
        ? t('states.noProducts')
        : t('states.noProducts')

    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">
            {searchQuery || vendorFilter ? (
              <span>
                {tCommon('states.tryAdjustingFilters')}
              </span>
            ) : (
              <span>
                {tCommon('states.noProductsAvailable')}
              </span>
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {t('showingResults', { count: products.length })}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onProductSelect}
          />
        ))}
      </div>
    </div>
  )
}
```

# src/components/catalog/ProductModal.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
// Using custom modal instead of Dialog component to avoid dependency issues
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  ExternalLink, 
  Package,
  Building2,
  Tag
} from 'lucide-react'
import { Product, Vendor, Category, Media } from '@/lib/payload/types'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
  canNavigate?: {
    prev: boolean
    next: boolean
  }
}

export function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onNavigate,
  canNavigate 
}: ProductModalProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const t = useTranslations('Catalog')

  // Reset image states when product changes
  useEffect(() => {
    if (product) {
      setImageLoading(true)
      setImageError(false)
    }
  }, [product])

  if (!product) return null

  // Type guards and data extraction
  const vendor = typeof product.vendor === 'object' ? product.vendor as Vendor : null
  const category = typeof product.category === 'object' ? product.category as Category : null
  const productImage = product.image as Media | undefined
  const vendorLogo = vendor?.logo as Media | undefined

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const getImageUrl = (media: Media | undefined, fallback: string = '/products/placeholder-product.svg') => {
    if (!media) return fallback
    return media.sizes?.tablet?.url || media.url || fallback
  }

  const getVendorLogoUrl = (media: Media | undefined) => {
    if (!media) return null
    return media.sizes?.thumbnail?.url || media.url
  }

  const renderRichTextContent = (content: any) => {
    if (typeof content === 'string') {
      return content
    }
    
    if (content?.root?.children) {
      return content.root.children
        .map((child: any) => {
          if (child.children) {
            return child.children
              .map((textNode: any) => textNode.text || '')
              .join('')
          }
          return ''
        })
        .join('\n')
    }
    
    return ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" 
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-background border shadow-xl rounded-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between space-y-0 pb-4">
            <h2 className="text-xl font-bold pr-8">
              {product.name}
            </h2>
            
            <div className="flex items-center gap-2">
              {/* Navigation buttons */}
              {onNavigate && canNavigate && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('prev')}
                    disabled={!canNavigate.prev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('modal.previousProduct')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('next')}
                    disabled={!canNavigate.next}
                  >
                    {t('modal.nextProduct')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {!imageError ? (
                <Image
                  src={getImageUrl(productImage)}
                  alt={product.name || t('modal.productImageAlt')}
                  fill
                  className={`object-contain object-center transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <Image
                  src="/products/placeholder-product.svg"
                  alt="Placeholder"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              
              {/* Loading overlay */}
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-border rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {product.datasheet && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const datasheetUrl = typeof product.datasheet === 'object' 
                      ? (product.datasheet as Media).url 
                      : product.datasheet
                    if (datasheetUrl) {
                      window.open(datasheetUrl, '_blank')
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t('datasheet')}
                </Button>
              )}

              {vendor?.website && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(vendor.website, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('modal.visitWebsite')}
                </Button>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              {/* Category and Vendor */}
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {category.name}
                  </Badge>
                )}
                {vendor && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {vendor.name}
                  </Badge>
                )}
              </div>

              {/* Vendor Logo */}
              {vendor && getVendorLogoUrl(vendorLogo) && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Image
                    src={getVendorLogoUrl(vendorLogo)!}
                    alt={`${vendor.name} ${t('modal.logoAlt')}`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('modal.description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {renderRichTextContent(product.description)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('features')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">
                          {typeof feature === 'string' ? feature : feature.feature || ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Specifications placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('specifications')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('modal.specificationsNote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
```

# src/components/contact/ContactForm.tsx

```tsx
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createContactFormSchema, ContactFormData } from '@/lib/validation/contact';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const t = useTranslations('Contact');
  const tValidation = useTranslations('Validation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Create schema with error handling
  const contactFormSchema = React.useMemo(() => {
    try {
      return createContactFormSchema(tValidation);
    } catch (error) {
      console.warn('Error creating contact form schema with translations:', error);
      // Fallback to a basic schema if translations fail
      return createContactFormSchema(() => '');
    }
  }, [tValidation]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        reset(); // Clear the form
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Success/Error Messages */}
      {submitStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${
          submitStatus === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">
            {submitStatus === 'success' 
              ? t('form.successMessage')
              : t('form.errorMessage')
            }
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="sr-only">
            {t('form.fullName')}
          </Label>
          <Input
            {...register('fullName')}
            type="text"
            id="fullName"
            autoComplete="name"
            placeholder={t('form.fullNamePlaceholder')}
            className={errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="sr-only">
            {t('emailAddress')}
          </Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('form.emailPlaceholder')}
            className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="sr-only">
            {t('phoneNumber')}
          </Label>
          <Input
            {...register('phone')}
            type="tel"
            id="phone"
            autoComplete="tel"
            placeholder={t('form.phonePlaceholder')}
            className={errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message" className="sr-only">
            {t('form.message')}
          </Label>
          <textarea
            {...register('message')}
            id="message"
            rows={4}
            className={`block w-full shadow-sm py-3 px-4 placeholder-muted-foreground border rounded-md focus:ring-2 focus:ring-offset-2 transition-colors ${
              errors.message 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-input focus:ring-primary focus:border-primary'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={t('form.messagePlaceholder')}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('form.sending')}
              </>
            ) : (
              t('form.submit')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

# src/components/contact/EmbeddedMap.tsx

```tsx
interface EmbeddedMapProps {
  address: string;
  embedUrl: string;
  className?: string;
}

export default function EmbeddedMap({ address, embedUrl, className = "" }: EmbeddedMapProps) {
  return (
    <div className={`relative w-full h-64 md:h-80 lg:h-96 ${className}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing location: ${address}`}
        className="rounded-lg shadow-md"
      />
    </div>
  );
}
```

# src/components/header.tsx

```tsx
'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useTranslations } from 'next-intl';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const t = useTranslations('Header');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const currentLocale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLocale = (locale: string) => {
    if (mounted) {
      // Set cookie to remember locale preference
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
      
      const currentPath = pathname.replace(/^\/[a-z]{2}/, '');
      router.push(`/${locale}${currentPath}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md border-b border-border">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        {t('accessibility.skipToContent')}
      </a>
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label={t('accessibility.mainNavigation')}
      >
        <div className="w-full py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href={`/${currentLocale}`}
              aria-label={t('accessibility.logoLink')}
              title={t('tooltips.home')}
            >
              <span className="sr-only">{t('accessibility.logoLink')}</span>
              <img
                className="h-16 w-auto logo"
                src="/logos/cecom-logo.svg"
                alt={t('accessibility.logoAlt')}
              />
            </Link>
            <NavigationMenu className="hidden ml-12 lg:block">
              <NavigationMenuList className="flex space-x-8">
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.homeLink')}
                    title={t('tooltips.home')}
                  >
                    {t('home')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/solutions`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.solutionsLink')}
                    title={t('tooltips.solutions')}
                  >
                    {t('solutions')}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/alliances`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.alliancesLink')}
                    title={t('tooltips.alliances')}
                  >
                    {t('alliances')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/blog`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.blogLink')}
                    title={t('tooltips.blog')}
                  >
                    {t('blog')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/about`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.aboutUsLink')}
                    title={t('tooltips.aboutUs')}
                  >
                    {t('aboutUs')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/contact`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.contactLink')}
                    title={t('tooltips.contact')}
                  >
                    {t('contact')}
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="ml-6 flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  aria-label={t('accessibility.languageSelectorButton')}
                  title={t('tooltips.languageSelector')}
                >
                  <Languages className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{t('accessibility.languageSelector')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                aria-label={t('accessibility.languageSelectorMenu')}
              >
                <DropdownMenuItem 
                  onClick={() => changeLocale('en')}
                  aria-label={t('accessibility.selectEnglish')}
                >
                  {tCommon('language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLocale('es')}
                  aria-label={t('accessibility.selectSpanish')}
                >
                  {tCommon('language.spanish')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    aria-label={t('accessibility.mobileMenuButton')}
                    title={t('tooltips.mobileMenu')}
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">{t('accessibility.mobileMenuButton')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right"
                  className="w-80 sm:w-96"
                  aria-label={t('accessibility.mobileNavigation')}
                >
                  <SheetTitle className="sr-only">
                    {t('accessibility.mobileNavigation')}
                  </SheetTitle>
                  
                  {/* Header with Logo */}
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <Link 
                      href={`/${currentLocale}`}
                      className="flex items-center"
                    >
                      <img
                        className="h-12 w-auto logo"
                        src="/logos/cecom-logo.svg"
                        alt={t('accessibility.logoAlt')}
                      />
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav 
                    className="flex flex-col space-y-2 mt-8"
                    aria-label={t('accessibility.mobileNavigation')}
                  >
                    <Link 
                      href={`/${currentLocale}`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.homeLink')}
                      title={t('tooltips.home')}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('home')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/solutions`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.solutionsLink')}
                      title={t('tooltips.solutions')}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('solutions')}
                      </div>
                    </Link>

                    <Link 
                      href={`/${currentLocale}/alliances`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.alliancesLink')}
                      title={t('tooltips.alliances')}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('alliances')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/blog`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.blogLink')}
                      title={t('tooltips.blog')}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('blog')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/about`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.aboutUsLink')}
                      title={t('tooltips.aboutUs')}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('aboutUs')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/contact`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.contactLink')}
                      title={t('tooltips.contact')}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('contact')}
                      </div>
                    </Link>
                  </nav>

                  {/* Footer with Theme and Language Controls */}
                  <div className="absolute bottom-8 left-6 right-6">
                    <div className="border-t border-border pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ThemeToggle />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-9 px-3"
                                aria-label={t('accessibility.languageSelectorButton')}
                                title={t('tooltips.languageSelector')}
                              >
                                <Languages className="h-4 w-4" aria-hidden="true" />
                                <span className="ml-2 text-sm font-medium">
                                  {currentLocale.toUpperCase()}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="start"
                              aria-label={t('accessibility.languageSelectorMenu')}
                            >
                              <DropdownMenuItem 
                                onClick={() => changeLocale('en')}
                                aria-label={t('accessibility.selectEnglish')}
                              >
                                {tCommon('language.english')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => changeLocale('es')}
                                aria-label={t('accessibility.selectSpanish')}
                              >
                                {tCommon('language.spanish')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

# src/components/layout/Footer.tsx

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  const locale = useLocale() as "en" | "es";

  const tHeader = useTranslations("Header");
  const tFooter = useTranslations("Footer");

  const base = `/${locale}`;

  const links = [
    { label: tHeader("solutions"), href: `${base}/solutions` },
    { label: tHeader("alliances"), href: `${base}/alliances` },
    { label: tHeader("blog"), href: `${base}/blog` },
    { label: tHeader("aboutUs"), href: `${base}/about` },
    { label: tFooter("products"), href: `${base}/products` },
    { label: tHeader("contact"), href: `${base}/contact` },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-primary/10 bg-muted/30 dark:bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-xl font-bold">CECOM</div>
            <p className="text-sm text-muted-foreground">
              {locale === "es"
                ? "Soluciones tecnológicas para impulsar tu negocio."
                : "Technology solutions to power your business."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">
              {tFooter("quickLinks")}
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">
              {tFooter("followUs")}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                aria-label={tFooter("social.instagram")}
                className="p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-accent/40 transition-colors"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label={tFooter("social.facebook")}
                className="p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-accent/40 transition-colors"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label={tFooter("social.x")}
                className="p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-accent/40 transition-colors"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>
            © {year} CECOM. {tFooter("rights")}
          </p>
          <div className="flex gap-4">
            <Link href={`${base}`} className="hover:text-foreground transition-colors">
              {tHeader("home")}
            </Link>
            <Link href={`${base}/contact`} className="hover:text-foreground transition-colors">
              {tHeader("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

```

# src/components/payload/PayloadProvider.tsx

```tsx
'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface PayloadContextType {
  apiUrl: string
  locale: string
}

const PayloadContext = createContext<PayloadContextType | undefined>(undefined)

interface PayloadProviderProps {
  children: ReactNode
  locale?: string
}

export const PayloadProvider: React.FC<PayloadProviderProps> = ({
  children,
  locale = 'en',
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <PayloadContext.Provider value={{ apiUrl, locale }}>
      {children}
    </PayloadContext.Provider>
  )
}

export const usePayload = () => {
  const context = useContext(PayloadContext)
  if (context === undefined) {
    throw new Error('usePayload must be used within a PayloadProvider')
  }
  return context
}
```

# src/components/performance/LazyImage.tsx

```tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

```

# src/components/performance/ServiceWorker.tsx

```tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return null;
}

```

# src/components/performance/WebVitals.tsx

```tsx
'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { gtmEvent } from '@/lib/gtm';

export function WebVitals() {
  useEffect(() => {
    // Track Core Web Vitals using the new API
    onCLS((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'CLS',
        value: Math.round(metric.value * 1000),
        custom_parameter_1: metric.rating,
      });
    });

    // INP replaced FID in newer versions
    onINP((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'INP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onFCP((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'FCP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onLCP((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'LCP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onTTFB((metric: Metric) => {
      gtmEvent('web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'TTFB',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });
  }, []);

  return null;
}

```

# src/components/products/ProductCard.tsx

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/supabase-blog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  locale: 'es' | 'en';
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const isSpanish = locale === 'es';

  return (
    <Card className="relative h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
      {/* Full-card clickable overlay */}
      <Link
        href={`/${locale}/products/${product.id}`}
        aria-label={`${product.name} - ${isSpanish ? 'Ver detalles' : 'View details'}`}
        className="absolute inset-0 z-10"
      />
      <CardHeader className="p-4">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-3">
          {(product.image_url || product.external_image_url) ? (
            <Image
              src={product.image_url || product.external_image_url || ''}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground text-sm">
                {isSpanish ? 'Sin imagen' : 'No image'}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            <Link
              href={`/${locale}/products/${product.id}`}
              className="hover:underline"
              aria-label={`${product.name} - ${isSpanish ? 'Ver detalles' : 'View details'}`}
            >
              {product.name}
            </Link>
          </h3>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {product.brand}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
            {product.description}
          </p>
        )}

        {product.price && (
          <div className="mb-4">
            <span className="text-lg font-bold text-primary">
              {product.currency || 'DOP'} ${product.price.toLocaleString()}
            </span>
          </div>
        )}

        <div className="space-y-2 mt-auto relative z-20">
          <Button asChild className="w-full">
            <Link href={`/${locale}/products/${product.id}`}>
              {isSpanish ? 'Ver detalles' : 'View details'}
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full">
            {isSpanish ? 'Solicitar cotización' : 'Request quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

```

# src/components/products/ProductFilters.tsx

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductFiltersProps {
  locale: string;
  currentCategory?: string;
  currentBrand?: string;
  currentSearch?: string;
}

export function ProductFilters({ 
  locale, 
  currentCategory, 
  currentBrand, 
  currentSearch 
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');
  
  const isSpanish = locale === 'es';

  const categories = [
    'networking',
    'security',
    'wireless',
    'storage',
    'servers'
  ];

  const brands = [
    'Extreme Networks',
    'WatchGuard',
    'Avaya',
    'HP Enterprise',
    'Axis',
    '3CX'
  ];

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', search);
  };

  const clearFilters = () => {
    router.push(`/${locale}/products`);
    setSearch('');
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={isSpanish ? 'Buscar productos...' : 'Search products...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            {isSpanish ? 'Buscar' : 'Search'}
          </Button>
        </form>

        {/* Category Filter */}
        <Select
          value={currentCategory || ''}
          onValueChange={(value) => updateFilters('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isSpanish ? 'Categoría' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {isSpanish ? 'Todas las categorías' : 'All categories'}
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
        <Select
          value={currentBrand || ''}
          onValueChange={(value) => updateFilters('brand', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isSpanish ? 'Marca' : 'Brand'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {isSpanish ? 'Todas las marcas' : 'All brands'}
            </SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearFilters}>
          {isSpanish ? 'Limpiar filtros' : 'Clear filters'}
        </Button>
      </div>

      {/* Active Filters Display */}
      {(currentCategory || currentBrand || currentSearch) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">
            {isSpanish ? 'Filtros activos:' : 'Active filters:'}
          </span>
          {currentCategory && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              {isSpanish ? 'Categoría:' : 'Category:'} {currentCategory}
            </span>
          )}
          {currentBrand && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              {isSpanish ? 'Marca:' : 'Brand:'} {currentBrand}
            </span>
          )}
          {currentSearch && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              {isSpanish ? 'Búsqueda:' : 'Search:'} "{currentSearch}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}

```

# src/components/providers.tsx

```tsx
"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";

export function Providers({ children, messages, locale, timeZone, now }: { children: React.ReactNode; messages: any; locale: string; timeZone?: string; now?: Date }) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone} now={now}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={false}
        disableTransitionOnChange

      >
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
```

# src/components/seo/BreadcrumbSchema.tsx

```tsx
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://cecom.do${item.url}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

```

# src/components/seo/LocalBusinessSchema.tsx

```tsx
interface LocalBusinessSchemaProps {
  locale: string;
}

export function LocalBusinessSchema({ locale }: LocalBusinessSchemaProps) {
  const isSpanish = locale === 'es';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CECOM",
    "description": isSpanish 
      ? "Proveedor líder de soluciones tecnológicas profesionales, ciberseguridad, redes e infraestructura IT para empresas en República Dominicana"
      : "Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic",
    "url": "https://cecom.com.do",
    "logo": "https://cecom.com.do/logos/cecom-logo.svg",
    "image": "https://cecom.com.do/hero-image.jpg",
    "telephone": "+1-809-688-4491", // Replace with actual phone
    "email": "info@cecom.do",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal #123", // Replace with actual address
      "addressLocality": "Santo Domingo",
      "addressRegion": "Distrito Nacional",
      "postalCode": "10101",
      "addressCountry": "DO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "18.4861", // Santo Domingo coordinates
      "longitude": "-69.9312"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "12:00"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/cecom-do",
      "https://www.facebook.com/cecom.do",
      "https://twitter.com/cecom_do"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Dominican Republic"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": isSpanish ? "Soluciones Tecnológicas" : "Technology Solutions",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": isSpanish ? "Ciberseguridad" : "Cybersecurity",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "WatchGuard Firewalls"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog", 
          "name": isSpanish ? "Redes y Conectividad" : "Networking",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Extreme Networks Solutions"
              }
            }
          ]
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "25",
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": "$$",
    "currenciesAccepted": "DOP, USD",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

```

# src/components/seo/ProductSchema.tsx

```tsx
import { Product } from '@/lib/supabase-blog';

interface ProductSchemaProps {
  product: Product;
  locale: string;
}

export function ProductSchema({ product, locale }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - ${product.brand}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "model": product.model,
    "category": product.category,
    "image": product.image_url || product.external_image_url,
    "offers": product.price ? {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency || "DOP",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "CECOM",
        "url": "https://cecom.do"
      }
    } : undefined,
    "manufacturer": {
      "@type": "Organization",
      "name": product.brand
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  };

  // Remove undefined properties
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 2)
      }}
    />
  );
}

```

# src/components/seo/StructuredData.tsx

```tsx
'use client'

interface OrganizationSchemaProps {
  locale: string
}

interface ArticleSchemaProps {
  title: string
  description: string
  publishedDate: string
  modifiedDate?: string
  author: string
  locale: string
  slug: string
  imageUrl?: string
}

interface LocalBusinessSchemaProps {
  locale: string
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CECOM",
    "alternateName": "CECOM Technology Solutions",
    "url": `${baseUrl}/${locale}`,
    "logo": `${baseUrl}/logos/cecom-logo.png`,
    "description": locale === 'es' 
      ? "Proveedor líder de soluciones tecnológicas profesionales, ciberseguridad, redes e infraestructura TI para empresas en República Dominicana."
      : "Leading provider of professional technology solutions, cybersecurity, networking, and IT infrastructure for businesses in the Dominican Republic.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "DO",
      "addressRegion": "Santo Domingo",
      "addressLocality": "Santo Domingo"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/cecom-do",
      "https://www.facebook.com/cecom.do"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}

export function ArticleSchema({ 
  title, 
  description, 
  publishedDate, 
  modifiedDate, 
  author, 
  locale, 
  slug,
  imageUrl 
}: ArticleSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": `${baseUrl}/${locale}/blog/${slug}`,
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "CECOM",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logos/cecom-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/${locale}/blog/${slug}`
    },
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  )
}

export function LocalBusinessSchema({ locale }: LocalBusinessSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CECOM",
    "description": locale === 'es'
      ? "Soluciones tecnológicas profesionales en República Dominicana"
      : "Professional technology solutions in Dominican Republic",
    "url": `${baseUrl}/${locale}`,
    "telephone": "+1-809-XXX-XXXX", // TODO: Add real phone number
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal #123", // TODO: Add real address
      "addressLocality": "Santo Domingo",
      "addressRegion": "Distrito Nacional",
      "postalCode": "10101",
      "addressCountry": "DO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 18.4861,
      "longitude": -69.9312
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "17:00"
    },
    "priceRange": "$$",
    "servesCuisine": null,
    "acceptsReservations": false
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
    />
  )
}

export function WebsiteSchema({ locale }: { locale: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CECOM",
    "url": `${baseUrl}/${locale}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${locale}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  )
}

```

# src/components/theme-toggle.tsx

```tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const t = useTranslations("Common.theme");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t("toggleTheme")}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```

# src/components/ui/badge.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

# src/components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

```

# src/components/ui/card.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

```

# src/components/ui/confirmation-dialog.tsx

```tsx
import * as React from "react"
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  icon?: React.ReactNode
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  icon,
  loading = false,
}: ConfirmationDialogProps) {
  const t = useTranslations('Admin.confirmDialog')

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const getIcon = () => {
    if (icon) return icon
    
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-6 w-6 text-destructive" />
      default:
        return <HelpCircle className="h-6 w-6 text-primary" />
    }
  }

  const getTitle = () => {
    if (title) return title
    return variant === "destructive" ? t('deleteTitle') : t('title')
  }

  const getDescription = () => {
    if (description) return description
    return variant === "destructive" ? t('deleteMessage') : t('message')
  }

  const getConfirmText = () => {
    if (confirmText) return confirmText
    return variant === "destructive" ? t('deleteConfirm') : t('confirm')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-left">
              {getTitle()}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText || t('cancel')}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                {getConfirmText()}
              </>
            ) : (
              getConfirmText()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook personalizado para facilitar el uso
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Partial<ConfirmationDialogProps>>({})

  const showConfirmation = React.useCallback((options: Partial<ConfirmationDialogProps>) => {
    setConfig(options)
    setIsOpen(true)
  }, [])

  const hideConfirmation = React.useCallback(() => {
    setIsOpen(false)
    setConfig({})
  }, [])

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
  }
}
```

# src/components/ui/dialog.tsx

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

# src/components/ui/dropdown-menu.tsx

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

```

# src/components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

```

# src/components/ui/label.tsx

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

```

# src/components/ui/navigation-menu.tsx

```tsx
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}

```

# src/components/ui/ScrollIndicator.tsx

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
  text?: string;
  variant?: 'default' | 'minimal' | 'arrow-only';
}

export function ScrollIndicator({ 
  containerRef, 
  className = '', 
  text,
  variant = 'default'
}: ScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);
  const t = useTranslations('Admin.scrollIndicator');
  
  // Use translation as default if no text is provided
  const displayText = text || t('moreRowsBelow');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasVerticalScroll = container.scrollHeight > container.clientHeight;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
      
      setShowIndicator(hasVerticalScroll && !isAtBottom);
    };

    // Check initially
    checkScrollable();

    // Check on scroll
    const handleScroll = () => {
      checkScrollable();
    };

    // Check on resize (in case content changes)
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });

    container.addEventListener('scroll', handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  if (!showIndicator) return null;

  const getIndicatorContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="bg-muted/80 text-muted-foreground px-2 py-1 rounded-md shadow-sm flex items-center gap-1 text-xs scroll-indicator scroll-indicator-fade-in backdrop-blur-sm">
            <ChevronDown className="h-3 w-3 animate-pulse" />
          </div>
        );
      case 'arrow-only':
        return (
          <div className="bg-primary/70 text-primary-foreground p-1 rounded-full shadow-md scroll-indicator scroll-indicator-fade-in backdrop-blur-sm">
            <ChevronDown className="h-4 w-4 animate-pulse" />
          </div>
        );
      default:
        return (
          <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs scroll-indicator scroll-indicator-fade-in backdrop-blur-sm border border-primary/20">
            <span className="font-medium">{displayText}</span>
            <ChevronDown className="h-3 w-3 animate-pulse" />
          </div>
        );
    }
  };

  return (
    <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 ${className}`}>
      {getIndicatorContent()}
    </div>
  );
}

// Hook personalizado para usar con el ScrollIndicator
export function useScrollIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return {
    containerRef,
    ScrollIndicator: ({ 
      className, 
      text, 
      variant 
    }: { 
      className?: string;
      text?: string;
      variant?: 'default' | 'minimal' | 'arrow-only';
    }) => (
      <ScrollIndicator 
        containerRef={containerRef} 
        className={className}
        text={text}
        variant={variant}
      />
    )
  };
}
```

# src/components/ui/select.tsx

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

```

# src/components/ui/sheet.tsx

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```

# src/components/ui/toast.tsx

```tsx
import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

export interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50 text-green-900"
      case "error":
        return "border-red-200 bg-red-50 text-red-900"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-900"
      default:
        return "border-gray-200 bg-white text-gray-900"
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-right-full",
        getVariantStyles()
      )}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-medium leading-5">{title}</div>
        )}
        {description && (
          <div className="text-sm leading-5 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
```

# src/contexts/AdminLocaleContext.tsx

```tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'

// Default timezone for the admin panel
const TIME_ZONE = 'America/Santo_Domingo'

interface AdminLocaleContextType {
  locale: string
  setLocale: (locale: string) => void
  messages: any
}

const AdminLocaleContext = createContext<AdminLocaleContextType | undefined>(undefined)

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext)
  if (!context) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider')
  }
  return context
}

interface AdminLocaleProviderProps {
  children: ReactNode
  initialMessages: any
  initialLocale?: string
}

export function AdminLocaleProvider({ 
  children, 
  initialMessages, 
  initialLocale = 'en' 
}: AdminLocaleProviderProps) {
  const [locale, setLocaleState] = useState(initialLocale)
  const [messages, setMessages] = useState(initialMessages)

  const setLocale = async (newLocale: string) => {
    try {
      // Fetch messages for the new locale
      const response = await fetch(`/api/messages?locale=${newLocale}`)
      if (response.ok) {
        const newMessages = await response.json()
        setMessages(newMessages)
        setLocaleState(newLocale)
        // Store preference in localStorage
        localStorage.setItem('admin-locale', newLocale)
      }
    } catch (error) {
      console.error('Failed to load messages for locale:', newLocale, error)
    }
  }

  // Load saved locale preference on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('admin-locale')
    if (savedLocale && savedLocale !== locale) {
      setLocale(savedLocale)
    }
  }, [])

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone={TIME_ZONE}
      now={new Date()}
    >
      <AdminLocaleContext.Provider value={{ locale, setLocale, messages }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </AdminLocaleContext.Provider>
    </NextIntlClientProvider>
  )
}

```

# src/hooks/useAdminData.ts

```ts
import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile, UserProfile } from '@/lib/supabase';
import { Category, Vendor, Product } from '@/types/admin';

export function useAdminData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const checkAuth = async () => {
    // Check for development mode user first
    const devUser = localStorage.getItem('dev_user');
    if (devUser) {
      const userData = JSON.parse(devUser);
      setUser({ id: userData.id, email: userData.email });
      setUserProfile(userData);
      return;
    }

    const currentUser = await getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      const profile = await getUserProfile(currentUser.id);
      setUserProfile(profile);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if we're in development mode
      const devUser = localStorage.getItem('dev_user');
      if (devUser) {
        console.log('🧪 Loading data in development mode...');
      }

      const [categoriesRes, vendorsRes, productsRes] = await Promise.all([
        supabase.from('categories').select('*').order('order'),
        supabase.from('vendors').select('*').order('name'),
        supabase.from('products').select('*').order('order')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (vendorsRes.data) setVendors(vendorsRes.data);
      if (productsRes.data) setProducts(productsRes.data);

      if (categoriesRes.error) console.error('Error loading categories:', categoriesRes.error);
      if (vendorsRes.error) console.error('Error loading vendors:', vendorsRes.error);
      if (productsRes.error) console.error('Error loading products:', productsRes.error);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  return {
    categories,
    vendors,
    products,
    loading,
    user,
    userProfile,
    checkAuth,
    loadData,
    setUser,
    setUserProfile
  };
}
```

# src/hooks/useErrorHandler.ts

```ts
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/toast'

export function useErrorHandler() {
  const tErrors = useTranslations('Admin.errors')
  const tCommon = useTranslations('Common.states')
  const { addToast } = useToast()

  const showError = (errorKey: string, fallbackMessage?: string) => {
    const message = tErrors(errorKey) || fallbackMessage || 'An error occurred'
    
    addToast({
      title: tCommon('error'),
      description: message,
      variant: 'error',
      duration: 5000,
    })
  }

  const showSuccess = (message: string) => {
    addToast({
      title: tCommon('success'),
      description: message,
      variant: 'success',
      duration: 3000,
    })
  }

  return {
    showError,
    showSuccess,
  }
}
```

# src/i18n/config.ts

```ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'es'] as const;

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = (locale ?? defaultLocale) as (typeof locales)[number];

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(currentLocale as any)) notFound();

  const messages = (await import(`../../messages/${currentLocale}.json`)).default;

  return {
    locale: currentLocale,
    messages
  };
});

// Global timezone configuration (env-driven with safe default)
export const timeZone = process.env.TZ || 'America/Santo_Domingo';
```

# src/i18n/request.ts

```ts
import { getRequestConfig } from 'next-intl/server';
import { timeZone } from './config';
import { getCurrentTime } from '../lib/timezone';

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? 'en',
  messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  timeZone,
  now: getCurrentTime(),
}));
```

# src/i18n/utils.ts

```ts
import { defaultLocale } from './config';

export async function getMessages(locale: string = defaultLocale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    return (await import(`../../messages/${defaultLocale}.json`)).default;
  }
}

```

# src/lib/__tests__.disabled/data-utils.test.ts

```ts
import { describe, it, expect } from 'vitest';
import {
  getCategories,
  getVendors,
  getProducts,
  getCategoryById,
  getVendorById,
  getProductById,
  getProductsByCategory,
  getProductsByVendor,
  validateCategory,
  validateVendor,
  validateProduct
} from '../data-utils';

describe('Data Utils', () => {
  describe('Catalog data functions', () => {
    it('should read categories from JSON file', async () => {
      const categories = await getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0].name).toHaveProperty('en');
      expect(categories[0].name).toHaveProperty('es');
    });

    it('should read vendors from JSON file', async () => {
      const vendors = await getVendors();
      expect(Array.isArray(vendors)).toBe(true);
      expect(vendors.length).toBeGreaterThan(0);
      expect(vendors[0]).toHaveProperty('id');
      expect(vendors[0]).toHaveProperty('name');
      expect(vendors[0]).toHaveProperty('logo');
    });

    it('should read products from JSON file', async () => {
      const products = await getProducts();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('id');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('categoryId');
      expect(products[0]).toHaveProperty('vendorId');
    });
  });

  describe('Helper functions', () => {
    it('should find category by ID', async () => {
      const category = await getCategoryById('cybersecurity');
      expect(category).toBeDefined();
      expect(category?.id).toBe('cybersecurity');
      expect(category?.name.en).toBe('Cybersecurity');
    });

    it('should find vendor by ID', async () => {
      const vendor = await getVendorById('watchguard');
      expect(vendor).toBeDefined();
      expect(vendor?.id).toBe('watchguard');
      expect(vendor?.name).toBe('WatchGuard');
    });

    it('should find product by ID', async () => {
      const products = await getProducts();
      if (products.length > 0) {
        const product = await getProductById(products[0].id);
        expect(product).toBeDefined();
        expect(product?.id).toBe(products[0].id);
      }
    });

    it('should filter products by category', async () => {
      const products = await getProductsByCategory('cybersecurity');
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.categoryId).toBe('cybersecurity');
        expect(product.active).toBe(true);
      });
    });

    it('should filter products by vendor', async () => {
      const products = await getProductsByVendor('watchguard');
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.vendorId).toBe('watchguard');
        expect(product.active).toBe(true);
      });
    });
  });

  describe('Validation functions', () => {
    it('should validate category correctly', () => {
      const validCategory = {
        id: 'test',
        name: { en: 'Test', es: 'Prueba' },
        description: { en: 'Test desc', es: 'Desc prueba' },
        slug: 'test',
        order: 1
      };
      expect(validateCategory(validCategory)).toBe(true);

      const invalidCategory = {
        id: 'test',
        name: { en: 'Test' }, // missing es
        description: { en: 'Test desc', es: 'Desc prueba' },
        slug: 'test',
        order: 1
      };
      expect(validateCategory(invalidCategory)).toBe(false);
    });

    it('should validate vendor correctly', () => {
      const validVendor = {
        id: 'test',
        name: 'Test Vendor',
        logo: '/logo.png',
        description: { en: 'Test desc', es: 'Desc prueba' }
      };
      expect(validateVendor(validVendor)).toBe(true);

      const invalidVendor = {
        id: 'test',
        name: 'Test Vendor',
        // missing logo
        description: { en: 'Test desc', es: 'Desc prueba' }
      };
      expect(validateVendor(invalidVendor)).toBe(false);
    });

    it('should validate product correctly', () => {
      const validProduct = {
        id: 'test',
        name: { en: 'Test Product', es: 'Producto Prueba' },
        description: { en: 'Test desc', es: 'Desc prueba' },
        features: { en: ['Feature 1'], es: ['Característica 1'] },
        categoryId: 'test-cat',
        vendorId: 'test-vendor',
        order: 1,
        active: true
      };
      expect(validateProduct(validProduct)).toBe(true);

      const invalidProduct = {
        id: 'test',
        name: { en: 'Test Product', es: 'Producto Prueba' },
        description: { en: 'Test desc', es: 'Desc prueba' },
        features: { en: ['Feature 1'], es: ['Característica 1'] },
        categoryId: 'test-cat',
        vendorId: 'test-vendor',
        order: 1
        // missing active
      };
      expect(validateProduct(invalidProduct)).toBe(false);
    });
  });
});
```

# src/lib/analytics.ts

```ts
// Google Analytics 4 configuration
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(arguments);
  };

  window.gtag('js', new Date().toISOString());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track conversions (form submissions, contact requests, etc.)
export const trackConversion = (conversionId: string, data?: any) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    ...data,
  });
};

// Track blog engagement
export const trackBlogEvent = (action: 'view' | 'share' | 'comment', postSlug: string, category?: string) => {
  trackEvent(action, 'blog', `${category ? `${category}/` : ''}${postSlug}`);
};

// Track product interactions
export const trackProductEvent = (action: 'view' | 'inquiry' | 'download', productId: string, productName?: string) => {
  trackEvent(action, 'product', productName || productId);
};

// Track contact form submissions
export const trackContactForm = (formType: 'contact' | 'quote' | 'support') => {
  trackEvent('form_submit', 'contact', formType);
  trackConversion('contact_form', { form_type: formType });
};

```

# src/lib/data-utils-example.ts

```ts
/**
 * Example usage of data utility functions
 * This file demonstrates how to use the data-utils functions
 */

import {
  getCategories,
  getVendors,
  getProducts,
  getCategoryById,
  getVendorById,
  getProductById,
  getProductsByCategory,
  getProductsByVendor,
  saveCategories,
  saveVendors,
  saveProducts,
  validateCategory,
  validateVendor,
  validateProduct
} from './data-utils';

// Example: Reading data
export async function exampleReadData() {
  console.log('=== Reading Data Examples ===');
  
  // Get all categories
  const categories = await getCategories();
  console.log('Categories:', categories.map(c => c.name.en));
  
  // Get all vendors
  const vendors = await getVendors();
  console.log('Vendors:', vendors.map(v => v.name));
  
  // Get all products
  const products = await getProducts();
  console.log('Products:', products.map(p => p.name.en));
  
  // Get specific items by ID
  const cyberCategory = await getCategoryById('cybersecurity');
  console.log('Cybersecurity category:', cyberCategory?.name.en);
  
  const watchguardVendor = await getVendorById('watchguard');
  console.log('WatchGuard vendor:', watchguardVendor?.name);
  
  // Get products by category
  const cyberProducts = await getProductsByCategory('cybersecurity');
  console.log('Cybersecurity products:', cyberProducts.map(p => p.name.en));
  
  // Get products by vendor
  const watchguardProducts = await getProductsByVendor('watchguard');
  console.log('WatchGuard products:', watchguardProducts.map(p => p.name.en));
}

// Example: Adding new data
export async function exampleAddData() {
  console.log('=== Adding Data Examples ===');
  
  // Add a new category
  const categories = await getCategories();
  const newCategory = {
    id: 'cloud-services',
    name: {
      en: 'Cloud Services',
      es: 'Servicios en la Nube'
    },
    description: {
      en: 'Cloud computing and storage solutions',
      es: 'Soluciones de computación y almacenamiento en la nube'
    },
    slug: 'cloud-services',
    order: categories.length + 1,
    icon: 'cloud'
  };
  
  // Validate before adding
  if (validateCategory(newCategory)) {
    categories.push(newCategory);
    await saveCategories(categories);
    console.log('Added new category:', newCategory.name.en);
  }
  
  // Add a new vendor
  const vendors = await getVendors();
  const newVendor = {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '/logos/microsoft.png',
    website: 'https://www.microsoft.com',
    description: {
      en: 'Leading technology company providing cloud and productivity solutions',
      es: 'Empresa tecnológica líder que proporciona soluciones de nube y productividad'
    }
  };
  
  if (validateVendor(newVendor)) {
    vendors.push(newVendor);
    await saveVendors(vendors);
    console.log('Added new vendor:', newVendor.name);
  }
  
  // Add a new product
  const products = await getProducts();
  const newProduct = {
    id: 'microsoft-azure',
    name: {
      en: 'Microsoft Azure',
      es: 'Microsoft Azure'
    },
    description: {
      en: 'Comprehensive cloud computing platform with integrated services',
      es: 'Plataforma integral de computación en la nube con servicios integrados'
    },
    features: {
      en: [
        'Virtual machines',
        'Storage solutions',
        'AI and machine learning',
        'Database services',
        'Security and compliance'
      ],
      es: [
        'Máquinas virtuales',
        'Soluciones de almacenamiento',
        'IA y aprendizaje automático',
        'Servicios de base de datos',
        'Seguridad y cumplimiento'
      ]
    },
    categoryId: 'cloud-services',
    vendorId: 'microsoft',
    image: '/products/microsoft-azure.jpg',
    order: products.length + 1,
    active: true
  };
  
  if (validateProduct(newProduct)) {
    products.push(newProduct);
    await saveProducts(products);
    console.log('Added new product:', newProduct.name.en);
  }
}

// Example: Updating existing data
export async function exampleUpdateData() {
  console.log('=== Updating Data Examples ===');
  
  const products = await getProducts();
  const productToUpdate = products.find(p => p.id === 'watchguard-firebox-t15');
  
  if (productToUpdate) {
    // Update product description
    productToUpdate.description.en = 'Updated: Entry-level firewall with advanced threat protection for small businesses';
    productToUpdate.description.es = 'Actualizado: Firewall de nivel básico con protección avanzada contra amenazas para pequeñas empresas';
    
    // Add a new feature
    productToUpdate.features.en.push('24/7 support');
    productToUpdate.features.es.push('Soporte 24/7');
    
    await saveProducts(products);
    console.log('Updated product:', productToUpdate.name.en);
  }
}

// Run examples (uncomment to test)
// exampleReadData().catch(console.error);
// exampleAddData().catch(console.error);
// exampleUpdateData().catch(console.error);
```

# src/lib/data-utils.ts

```ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { Category, Vendor, Product } from '../types/catalog';
import { CMSContent } from '../types/cms';
import { AboutContent } from '../types/about';
import { NewsArticle, RSSFeedConfig } from '../types/feed';

// Base data directory path
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Generic function to read JSON data from a file
 */
async function readJSONFile<T>(filePath: string): Promise<T> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw new Error(`Failed to read data from ${filePath}`);
  }
}

/**
 * Generic function to write JSON data to a file
 */
async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const dirPath = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file with pretty formatting
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw new Error(`Failed to write data to ${filePath}`);
  }
}

// Catalog data functions
export async function getCategories(): Promise<Category[]> {
  return readJSONFile<Category[]>('catalog/categories.json');
}

export async function saveCategories(categories: Category[]): Promise<void> {
  return writeJSONFile('catalog/categories.json', categories);
}

export async function getVendors(): Promise<Vendor[]> {
  return readJSONFile<Vendor[]>('catalog/vendors.json');
}

export async function saveVendors(vendors: Vendor[]): Promise<void> {
  return writeJSONFile('catalog/vendors.json', vendors);
}

export async function getProducts(): Promise<Product[]> {
  return readJSONFile<Product[]>('catalog/products.json');
}

export async function saveProducts(products: Product[]): Promise<void> {
  return writeJSONFile('catalog/products.json', products);
}

// Content data functions
export async function getAboutContent(): Promise<AboutContent> {
  return readJSONFile<AboutContent>('content/about.json');
}

export async function saveAboutContent(content: AboutContent): Promise<void> {
  return writeJSONFile('content/about.json', content);
}

export async function getHeroContent(): Promise<CMSContent> {
  return readJSONFile<CMSContent>('content/hero.json');
}

export async function saveHeroContent(content: CMSContent): Promise<void> {
  return writeJSONFile('content/hero.json', content);
}

export async function getContactContent(): Promise<CMSContent> {
  return readJSONFile<CMSContent>('content/contact.json');
}

export async function saveContactContent(content: CMSContent): Promise<void> {
  return writeJSONFile('content/contact.json', content);
}

// Feed data functions
export async function getNewsArticles(): Promise<NewsArticle[]> {
  return readJSONFile<NewsArticle[]>('feeds/articles.json');
}

export async function saveNewsArticles(articles: NewsArticle[]): Promise<void> {
  return writeJSONFile('feeds/articles.json', articles);
}

export async function getFeedConfig(): Promise<RSSFeedConfig[]> {
  return readJSONFile<RSSFeedConfig[]>('feeds/config.json');
}

export async function saveFeedConfig(config: RSSFeedConfig[]): Promise<void> {
  return writeJSONFile('feeds/config.json', config);
}

// CMS data functions
export async function getCMSUsers(): Promise<any[]> {
  return readJSONFile<any[]>('cms/users.json');
}

export async function saveCMSUsers(users: any[]): Promise<void> {
  return writeJSONFile('cms/users.json', users);
}

export async function getCMSSettings(): Promise<any> {
  return readJSONFile<any>('cms/settings.json');
}

export async function saveCMSSettings(settings: any): Promise<void> {
  return writeJSONFile('cms/settings.json', settings);
}

// Helper functions for specific operations
export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find(category => category.id === id);
}

export async function getVendorById(id: string): Promise<Vendor | undefined> {
  const vendors = await getVendors();
  return vendors.find(vendor => vendor.id === id);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(product => product.id === id);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.categoryId === categoryId && product.active);
}

export async function getProductsByVendor(vendorId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.vendorId === vendorId && product.active);
}

// Data validation helpers
export function validateCategory(category: Partial<Category>): category is Category {
  return !!(
    category.id &&
    category.name?.en &&
    category.name?.es &&
    category.description?.en &&
    category.description?.es &&
    category.slug &&
    typeof category.order === 'number'
  );
}

export function validateVendor(vendor: Partial<Vendor>): vendor is Vendor {
  return !!(
    vendor.id &&
    vendor.name &&
    vendor.logo &&
    vendor.description?.en &&
    vendor.description?.es
  );
}

export function validateProduct(product: Partial<Product>): product is Product {
  return !!(
    product.id &&
    product.name?.en &&
    product.name?.es &&
    product.description?.en &&
    product.description?.es &&
    product.features?.en &&
    product.features?.es &&
    product.categoryId &&
    product.vendorId &&
    typeof product.order === 'number' &&
    typeof product.active === 'boolean'
  );
}
```

# src/lib/dev-translation-utils.ts

```ts
/**
 * Development Translation Utilities
 * 
 * This file provides utilities for development-time translation validation
 * and debugging. These utilities are only active in development mode.
 */

import { translationWarningSystem, translationValidator } from './translation-validator';

/**
 * Initialize translation validation in development mode
 * Call this in your app's root component or _app.tsx
 */
export function initTranslationValidation(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // Validate translations on app startup
  translationWarningSystem.validateAndWarn().catch(error => {
    console.error('Failed to validate translations on startup:', error);
  });

  // Add global validation function for debugging
  if (typeof window !== 'undefined') {
    (window as any).__validateTranslations = async () => {
      const result = await translationValidator.validateTranslations();
      console.group('🌐 Translation Validation Results');
      console.log('Valid:', result.isValid);
      console.log('Errors:', result.errors);
      console.log('Warnings:', result.warnings);
      console.log('Missing Keys:', result.missingKeys);
      console.log('Inconsistencies:', result.inconsistencies);
      console.groupEnd();
      return result;
    };

    (window as any).__checkTranslationKey = async (key: string) => {
      const exists = await translationValidator.checkTranslationKey(key);
      console.log(`Translation key '${key}' exists:`, exists);
      return exists;
    };

    console.log('🌐 Translation debugging utilities available:');
    console.log('  - __validateTranslations() - Run full validation');
    console.log('  - __checkTranslationKey(key) - Check if key exists');
  }
}

/**
 * Component wrapper that validates translations on mount
 */
export function withTranslationValidation<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  if (process.env.NODE_ENV !== 'development') {
    return Component;
  }

  const WrappedComponent = (props: T) => {
    // Validate on mount
    React.useEffect(() => {
      translationWarningSystem.validateAndWarn().catch(error => {
        console.error(`Translation validation failed in ${componentName}:`, error);
      });
    }, []);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withTranslationValidation(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook to validate specific translation keys used by a component
 */
export function useTranslationKeyValidation(keys: string[], componentName?: string): void {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const validateKeys = async () => {
      for (const key of keys) {
        const exists = await translationValidator.checkTranslationKey(key);
        if (!exists) {
          console.warn(
            `🌐 Translation key '${key}' used in ${componentName || 'component'} does not exist in all locales`
          );
        }
      }
    };

    validateKeys().catch(error => {
      console.error('Failed to validate translation keys:', error);
    });
  }, [keys, componentName]);
}

/**
 * Development-only function to log translation coverage for specific namespace
 */
export async function logNamespaceTranslationCoverage(namespace: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const result = await translationValidator.validateTranslations();
  
  const namespaceKeys = result.missingKeys.filter(missing => 
    missing.key.startsWith(`${namespace}.`)
  );

  console.group(`🌐 Translation Coverage for '${namespace}' namespace`);
  
  if (namespaceKeys.length === 0) {
    console.log('✅ All keys in this namespace are present in all locales');
  } else {
    console.log(`❌ ${namespaceKeys.length} missing keys found:`);
    namespaceKeys.forEach(missing => {
      console.log(`  • ${missing.key} (missing in: ${missing.missingIn.join(', ')})`);
    });
  }
  
  console.groupEnd();
}

// Re-export for convenience
export { translationValidator, translationWarningSystem };

// Import React for the wrapper component
import React from 'react';
```

# src/lib/gtm.ts

```ts
// Google Tag Manager configuration
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const initGTM = () => {
  if (!GTM_ID) return;

  // GTM script
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);
};

// GTM event tracking
export const gtmEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!GTM_ID || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...parameters,
  });
};

// Specific GTM events for CECOM
export const gtmTrackPageView = (pagePath: string, pageTitle: string) => {
  gtmEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

export const gtmTrackContactForm = (formType: string) => {
  gtmEvent('form_submit', {
    form_type: formType,
    event_category: 'engagement',
    event_label: 'contact_form',
  });
};

export const gtmTrackProductView = (productId: string, productName: string, category: string) => {
  gtmEvent('view_item', {
    item_id: productId,
    item_name: productName,
    item_category: category,
    event_category: 'ecommerce',
  });
};

export const gtmTrackBlogRead = (postSlug: string, postTitle: string, category: string) => {
  gtmEvent('blog_read', {
    post_slug: postSlug,
    post_title: postTitle,
    post_category: category,
    event_category: 'content',
  });
};

```

# src/lib/payload.ts

```ts
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '../../payload.config'

export const getPayload = async () => {
  const payload = await getPayloadHMR({ config: configPromise })
  return payload
}

// Blog Posts
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: any
  featuredImage?: {
    url: string
    alt: string
  }
  category: {
    name: string
    slug: string
    color?: string
  }
  tags: Array<{
    name: string
    slug: string
  }>
  author: {
    firstName: string
    lastName: string
    email: string
  }
  publishedDate: string
  readingTime?: number
  status: 'draft' | 'published' | 'archived'
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
  createdAt: string
  updatedAt: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
}

// Fetch blog posts with filtering and pagination
export async function getBlogPosts({
  locale = 'en',
  limit = 10,
  page = 1,
  category,
  tag,
  status = 'published',
  search,
}: {
  locale?: string
  limit?: number
  page?: number
  category?: string
  tag?: string
  status?: 'draft' | 'published' | 'archived'
  search?: string
} = {}): Promise<{
  docs: BlogPost[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> {
  try {
    const payload = await getPayload()
    
    const where: any = {
      status: { equals: status }
    }

    // Filter by category
    if (category) {
      where['category.slug'] = { equals: category }
    }

    // Filter by tag
    if (tag) {
      where['tags.slug'] = { in: [tag] }
    }

    // Search functionality
    if (search) {
      where.or = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { 'seo.keywords': { contains: search } }
      ]
    }

    const result = await payload.find({
      collection: 'blog-posts',
      where,
      limit,
      page,
      sort: '-publishedDate',
      locale,
      depth: 2
    })

    return {
      docs: result.docs as BlogPost[],
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page || 1,
      hasNextPage: result.hasNextPage || false,
      hasPrevPage: result.hasPrevPage || false,
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }
}

// Fetch single blog post by slug
export async function getBlogPost(slug: string, locale = 'en'): Promise<BlogPost | null> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' }
      },
      limit: 1,
      locale,
      depth: 2
    })

    return result.docs[0] as BlogPost || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

// Fetch blog categories
export async function getBlogCategories(locale = 'en'): Promise<BlogCategory[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-categories',
      limit: 100,
      sort: 'name',
      locale,
    })

    return result.docs as BlogCategory[]
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

// Fetch blog tags
export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-tags',
      limit: 100,
      sort: 'name',
    })

    return result.docs as BlogTag[]
  } catch (error) {
    console.error('Error fetching blog tags:', error)
    return []
  }
}

// Fetch related posts
export async function getRelatedPosts(
  currentPostId: string,
  categorySlug: string,
  locale = 'en',
  limit = 3
): Promise<BlogPost[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        id: { not_equals: currentPostId },
        'category.slug': { equals: categorySlug },
        status: { equals: 'published' }
      },
      limit,
      sort: '-publishedDate',
      locale,
      depth: 2
    })

    return result.docs as BlogPost[]
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

// Fetch popular posts (most recent for now, can be enhanced with view counts later)
export async function getPopularPosts(locale = 'en', limit = 5): Promise<BlogPost[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' }
      },
      limit,
      sort: '-publishedDate',
      locale,
      depth: 2
    })

    return result.docs as BlogPost[]
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return []
  }
}

```

# src/lib/payload/api.ts

```ts
import fs from 'fs'
import path from 'path'

// Temporary fallback to JSON files until Payload is properly configured
const readJSONFile = async (filePath: string) => {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error)
    return []
  }
}

// Categories API functions
export const getCategories = async (locale: 'en' | 'es' = 'en') => {
  const categories = await readJSONFile('data/catalog/categories.json')
  
  // Transform to match expected format and localize
  return categories.map((category: any) => ({
    id: category.id,
    name: category.name[locale] || category.name.en,
    description: category.description?.[locale] || category.description?.en,
    slug: category.slug,
    order: category.order || 0,
    icon: category.icon,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })).sort((a: any, b: any) => a.order - b.order)
}

export const getCategoryBySlug = async (slug: string, locale: 'en' | 'es' = 'en') => {
  const categories = await getCategories(locale)
  return categories.find((category: any) => category.slug === slug) || null
}

// Products API functions
export const getProducts = async (locale: 'en' | 'es' = 'en', categoryId?: string) => {
  const [products, categories, vendors] = await Promise.all([
    readJSONFile('data/catalog/products.json'),
    readJSONFile('data/catalog/categories.json'),
    readJSONFile('data/catalog/vendors.json')
  ])
  
  // Create lookup maps
  const categoryMap = new Map(categories.map((c: any) => [c.id, c]))
  const vendorMap = new Map(vendors.map((v: any) => [v.id, v]))
  
  // Filter and transform products
  let filteredProducts = products.filter((product: any) => product.active !== false)
  
  if (categoryId) {
    filteredProducts = filteredProducts.filter((product: any) => product.categoryId === categoryId)
  }
  
  return filteredProducts.map((product: any) => {
    const category: any = categoryMap.get(product.categoryId)
    const vendor: any = vendorMap.get(product.vendorId)
    
    return {
      id: product.id,
      name: product.name[locale] || product.name.en,
      description: product.description?.[locale] || product.description?.en,
      features: product.features?.[locale] || product.features?.en || [],
      category: category ? {
        id: category.id,
        name: category.name[locale] || category.name.en,
        slug: category.slug,
        icon: category.icon
      } : product.categoryId,
      vendor: vendor ? {
        id: vendor.id,
        name: vendor.name,
        logo: vendor.logo ? { url: vendor.logo } : undefined,
        website: vendor.website,
        description: vendor.description?.[locale] || vendor.description?.en
      } : product.vendorId,
      image: product.image ? { url: product.image } : undefined,
      datasheet: product.datasheet ? { url: product.datasheet } : undefined,
      order: product.order || 0,
      active: product.active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }).sort((a: any, b: any) => a.order - b.order)
}

export const getProductById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const products = await getProducts(locale)
  return products.find((product: any) => product.id === id) || null
}

// Vendors API functions
export const getVendors = async () => {
  const vendors = await readJSONFile('data/catalog/vendors.json')
  
  return vendors.map((vendor: any) => ({
    id: vendor.id,
    name: vendor.name,
    logo: vendor.logo ? { url: vendor.logo } : undefined,
    website: vendor.website,
    rssUrl: vendor.rssUrl,
    description: vendor.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })).sort((a: any, b: any) => a.name.localeCompare(b.name))
}

export const getVendorById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const vendors = await getVendors()
  return vendors.find((vendor: any) => vendor.id === id) || null
}

// Pages API functions
export const getPageBySlug = async (slug: string, locale: 'en' | 'es' = 'en') => {
  // Contact page data
  if (slug === 'contact') {
    return {
      id: 'contact',
      title: locale === 'es' ? 'Contacto' : 'Contact',
      slug: 'contact',
      type: 'contact',
      contactInfo: {
        description: locale === 'es' 
          ? 'Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta sobre nuestros servicios de tecnología.'
          : 'We are here to help you. Get in touch with us for any inquiries about our technology services.',
        address: {
          line1: 'Av. Pasteur N.11',
          line2: 'Gazcue, Santo Domingo',
          line3: 'República Dominicana',
          formatted: locale === 'es' 
            ? 'Av. Pasteur N.11, Gazcue, Santo Domingo, República Dominicana'
            : 'Av. Pasteur N.11, Gazcue, Santo Domingo, Dominican Republic'
        },
        phone: '+1 (809) 555-0123',
        email: 'info@cecom.com.do',
        businessHours: {
          weekdays: locale === 'es' ? 'Lunes - Viernes: 8:00 AM - 6:00 PM' : 'Monday - Friday: 8:00 AM - 6:00 PM',
          saturday: locale === 'es' ? 'Sábado: 9:00 AM - 1:00 PM' : 'Saturday: 9:00 AM - 1:00 PM',
          sunday: locale === 'es' ? 'Domingo: Cerrado' : 'Sunday: Closed'
        },
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.2547!2d-69.9312!3d18.4655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89f0b1234567%3A0x1234567890abcdef!2sAv.%20Pasteur%2011%2C%20Santo%20Domingo%2C%20Dominican%20Republic!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  
  // For now, return mock data for about page
  if (slug === 'about') {
    return {
      id: 'about',
      title: locale === 'es' ? 'Nosotros' : 'About Us',
      slug: 'about',
      type: 'about',
      content: [
        {
          type: 'h2',
          children: [
            {
              text: locale === 'es' ? 'Nuestra Misión' : 'Our Mission'
            }
          ]
        },
        {
          type: 'p',
          children: [
            {
              text: locale === 'es' 
                ? 'En CECOM, nos dedicamos a proporcionar soluciones tecnológicas innovadoras y servicios de calidad superior que impulsen el crecimiento y la eficiencia de nuestros clientes. Nuestra misión es ser el socio tecnológico de confianza que transforma los desafíos empresariales en oportunidades de éxito.'
                : 'At CECOM, we are dedicated to providing innovative technology solutions and superior quality services that drive our clients\' growth and efficiency. Our mission is to be the trusted technology partner that transforms business challenges into success opportunities.'
            }
          ]
        },
        {
          type: 'h2',
          children: [
            {
              text: locale === 'es' ? 'Nuestra Visión' : 'Our Vision'
            }
          ]
        },
        {
          type: 'p',
          children: [
            {
              text: locale === 'es'
                ? 'Ser reconocidos como la empresa líder en soluciones de tecnología de la información en la República Dominicana, destacándonos por nuestra excelencia en el servicio, innovación constante y compromiso con el desarrollo tecnológico de nuestros clientes y la comunidad.'
                : 'To be recognized as the leading information technology solutions company in the Dominican Republic, standing out for our service excellence, constant innovation, and commitment to the technological development of our clients and community.'
            }
          ]
        },
        {
          type: 'h2',
          children: [
            {
              text: locale === 'es' ? 'Nuestros Valores' : 'Our Values'
            }
          ]
        },
        {
          type: 'ul',
          children: [
            {
              type: 'li',
              children: [
                {
                  text: locale === 'es' 
                    ? 'Excelencia: Nos esforzamos por superar las expectativas en cada proyecto.'
                    : 'Excellence: We strive to exceed expectations in every project.',
                  bold: true
                }
              ]
            },
            {
              type: 'li',
              children: [
                {
                  text: locale === 'es'
                    ? 'Innovación: Adoptamos las últimas tecnologías para ofrecer soluciones vanguardistas.'
                    : 'Innovation: We adopt the latest technologies to offer cutting-edge solutions.',
                  bold: true
                }
              ]
            },
            {
              type: 'li',
              children: [
                {
                  text: locale === 'es'
                    ? 'Integridad: Actuamos con honestidad y transparencia en todas nuestras relaciones.'
                    : 'Integrity: We act with honesty and transparency in all our relationships.',
                  bold: true
                }
              ]
            },
            {
              type: 'li',
              children: [
                {
                  text: locale === 'es'
                    ? 'Compromiso: Nos dedicamos completamente al éxito de nuestros clientes.'
                    : 'Commitment: We are fully dedicated to our clients\' success.',
                  bold: true
                }
              ]
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  return null
}

export const getPagesByType = async (type: string, locale: 'en' | 'es' = 'en') => {
  // For now, return empty array as pages are not implemented in JSON files
  // This will be replaced when Payload is properly configured
  return []
}

// Team members API functions
export const getTeamMembers = async (locale: 'en' | 'es' = 'en') => {
  // Mock team data - this would come from Payload in a real implementation
  return [
    {
      id: 'team-1',
      name: 'Carlos Rodríguez',
      position: locale === 'es' ? 'Director General' : 'General Manager',
      bio: locale === 'es' 
        ? 'Con más de 15 años de experiencia en tecnología empresarial, Carlos lidera nuestra visión estratégica y el crecimiento de la empresa.'
        : 'With over 15 years of experience in enterprise technology, Carlos leads our strategic vision and company growth.',
      image: undefined,
      order: 1,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'team-2',
      name: 'María González',
      position: locale === 'es' ? 'Directora Técnica' : 'Technical Director',
      bio: locale === 'es'
        ? 'Especialista en infraestructura de redes y ciberseguridad, María supervisa la implementación técnica de todos nuestros proyectos.'
        : 'Specialist in network infrastructure and cybersecurity, María oversees the technical implementation of all our projects.',
      image: undefined,
      order: 2,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'team-3',
      name: 'Luis Martínez',
      position: locale === 'es' ? 'Gerente de Ventas' : 'Sales Manager',
      bio: locale === 'es'
        ? 'Experto en soluciones empresariales, Luis ayuda a nuestros clientes a encontrar las mejores opciones tecnológicas para sus necesidades.'
        : 'Expert in enterprise solutions, Luis helps our clients find the best technology options for their needs.',
      image: undefined,
      order: 3,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
}

// News articles API functions
export const getNewsArticles = async (vendorId?: string, limit: number = 10) => {
  const articles = await readJSONFile('data/feeds/articles.json')
  
  let filteredArticles = articles
  
  if (vendorId) {
    filteredArticles = articles.filter((article: any) => article.vendorId === vendorId)
  }
  
  return filteredArticles
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}

// Search function
export const searchContent = async (query: string, locale: 'en' | 'es' = 'en') => {
  const products = await getProducts(locale)
  const lowerQuery = query.toLowerCase()
  
  // Search products by name and description
  const matchingProducts = products.filter((product: any) => {
    const name = (product.name || '').toLowerCase()
    const description = (product.description || '').toLowerCase()
    return name.includes(lowerQuery) || description.includes(lowerQuery)
  })
  
  return {
    products: matchingProducts,
    pages: [], // Pages not implemented in JSON fallback
  }
}

// Additional utility functions
export const getProductsByCategory = async (categorySlug: string, locale: 'en' | 'es' = 'en') => {
  // First get the category
  const category = await getCategoryBySlug(categorySlug, locale)
  if (!category) return []
  
  // Then get products in that category
  return getProducts(locale, category.id)
}

export const getProductsByVendor = async (vendorId: string, locale: 'en' | 'es' = 'en') => {
  const products = await getProducts(locale)
  return products.filter((product: any) => {
    const vendor = typeof product.vendor === 'object' ? product.vendor : null
    return vendor?.id === vendorId
  })
}

// Statistics and admin functions
export const getCollectionCounts = async () => {
  const [categories, vendors, products] = await Promise.all([
    readJSONFile('data/catalog/categories.json'),
    readJSONFile('data/catalog/vendors.json'),
    readJSONFile('data/catalog/products.json')
  ])
  
  return {
    categories: categories.length,
    vendors: vendors.length,
    products: products.length,
    pages: 0,
    'news-articles': 0,
    media: 0,
    users: 0,
  }
}
```

# src/lib/payload/types.ts

```ts
// This file will be auto-generated by Payload CMS
// For now, we'll define basic types that match our collections

export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  order: number
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  logo?: Media
  website?: string
  rssUrl?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: any // Rich text content
  features?: Array<{ feature: string }>
  category: Category | string
  vendor: Vendor | string
  image?: Media
  datasheet?: Media
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content?: any // Rich text content
  type: 'hero' | 'about' | 'contact' | 'page'
  images?: Array<{ image: Media }>
  createdAt: string
  updatedAt: string
}

export interface NewsArticle {
  id: string
  title: string
  summary?: string
  content?: any // Rich text content
  publishedAt: string
  vendor?: Vendor | string
  sourceUrl?: string
  image?: Media
  tags?: Array<{ tag: string }>
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  alt?: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  sizes?: {
    thumbnail?: {
      url: string
      width: number
      height: number
    }
    card?: {
      url: string
      width: number
      height: number
    }
    tablet?: {
      url: string
      width: number
      height: number
    }
  }
  url: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'editor'
  createdAt: string
  updatedAt: string
}
```

# src/lib/payload/utils.ts

```ts
import { Media } from './types'

// Helper function to get media URL
export const getMediaUrl = (media: Media | string | null | undefined): string | null => {
  if (!media) return null
  
  if (typeof media === 'string') {
    // If it's just an ID, we can't get the URL without fetching
    return null
  }
  
  return media.url || null
}

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
  media: Media | string | null | undefined,
  size: 'thumbnail' | 'card' | 'tablet' = 'card'
): string | null => {
  if (!media || typeof media === 'string') return null
  
  if (media.sizes && media.sizes[size]) {
    return media.sizes[size]!.url
  }
  
  return media.url || null
}

// Helper function to extract text from rich text content
export const extractTextFromRichText = (richText: any): string => {
  if (!richText) return ''
  
  if (typeof richText === 'string') return richText
  
  // Handle Slate.js rich text format
  if (Array.isArray(richText)) {
    return richText
      .map((node: any) => {
        if (node.text) return node.text
        if (node.children) return extractTextFromRichText(node.children)
        return ''
      })
      .join('')
  }
  
  return ''
}

// Helper function to format date
export const formatDate = (dateString: string, locale: string = 'en'): string => {
  const date = new Date(dateString)
  
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper function to generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Helper function to validate required environment variables
export const validateEnvironment = () => {
  const required = [
    'SUPABASE_DATABASE_URL',
    'PAYLOAD_SECRET',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Helper function to check if media is an image
export const isImage = (media: Media | string | null | undefined): boolean => {
  if (!media || typeof media === 'string') return false
  
  return media.mimeType?.startsWith('image/') || false
}

// Helper function to check if media is a PDF
export const isPDF = (media: Media | string | null | undefined): boolean => {
  if (!media || typeof media === 'string') return false
  
  return media.mimeType === 'application/pdf'
}
```

# src/lib/rss-importer.ts

```ts
import { XMLParser } from 'fast-xml-parser'
import { getPayload } from './payload'

interface RSSItem {
  title: string
  description: string
  link: string
  guid: string
  pubDate: string
}

interface RSSFeed {
  rss: {
    channel: {
      title: string
      description: string
      item: RSSItem[]
    }
  }
}

export async function fetchExtremeNetworksRSS(): Promise<RSSItem[]> {
  try {
    const response = await fetch('https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS')
    const xmlData = await response.text()
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    })
    
    const result = parser.parse(xmlData) as RSSFeed
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    return items.filter(item => item && item.title)
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

export function parseRSSItemToPost(item: RSSItem, locale: 'en' | 'es' = 'en') {
  // Clean HTML from description
  const cleanDescription = item.description
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()

  // Generate slug from title
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Extract CVE if present
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const tags = ['seguridad', 'extreme-networks', 'vulnerabilidad']
  if (cveMatch) {
    tags.push(cveMatch[0].toLowerCase())
  }

  // Translate content based on locale
  const translatedContent = locale === 'es' ? {
    title: translateSecurityTitle(item.title),
    excerpt: translateSecurityDescription(cleanDescription),
    content: generateSpanishContent(item, cleanDescription),
    category: 'ciberseguridad'
  } : {
    title: item.title,
    excerpt: cleanDescription.substring(0, 200) + '...',
    content: generateEnglishContent(item, cleanDescription),
    category: 'cybersecurity'
  }

  return {
    title: translatedContent.title,
    slug: `${slug}-${locale}`,
    excerpt: translatedContent.excerpt,
    content: translatedContent.content,
    publishedDate: new Date(item.pubDate),
    status: 'published' as const,
    category: translatedContent.category,
    tags: locale === 'es' ? tags : ['security', 'extreme-networks', 'vulnerability', ...(cveMatch ? [cveMatch[0].toLowerCase()] : [])],
    sourceUrl: item.link,
    readingTime: Math.ceil(translatedContent.content.length / 1000), // Rough estimate
    seo: {
      metaTitle: translatedContent.title,
      metaDescription: translatedContent.excerpt,
      keywords: tags.join(', ')
    }
  }
}

function translateSecurityTitle(title: string): string {
  return title
    .replace(/Security Advisory/gi, 'Aviso de Seguridad')
    .replace(/Vulnerability/gi, 'Vulnerabilidad')
    .replace(/Remote Code Execution/gi, 'Ejecución Remota de Código')
    .replace(/Denial of Service/gi, 'Denegación de Servicio')
    .replace(/Information Disclosure/gi, 'Divulgación de Información')
    .replace(/Authentication/gi, 'Autenticación')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
}

function translateSecurityDescription(description: string): string {
  let translated = description
    .replace(/vulnerability/gi, 'vulnerabilidad')
    .replace(/attack/gi, 'ataque')
    .replace(/remote attackers/gi, 'atacantes remotos')
    .replace(/server-side/gi, 'del lado del servidor')
    .replace(/client-side/gi, 'del lado del cliente')
    .replace(/Products not listed/gi, 'Los productos no listados')
    .replace(/have not been evaluated/gi, 'no han sido evaluados')

  return translated.substring(0, 200) + '...'
}

function generateSpanishContent(item: RSSItem, description: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${translateSecurityTitle(item.title)}

## Resumen de la Vulnerabilidad

${translateSecurityDescription(description)}

## Detalles Técnicos

Esta vulnerabilidad ha sido identificada por Extreme Networks y afecta a productos específicos de su portafolio. Como distribuidor autorizado de Extreme Networks en República Dominicana, CECOM recomienda revisar inmediatamente si sus equipos están afectados.

### Información de la Vulnerabilidad

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-DO')}
- **Fuente:** Extreme Networks Security Advisory

## Recomendaciones de CECOM

1. **Evaluación Inmediata**: Identifique si sus equipos Extreme Networks están afectados
2. **Actualización de Firmware**: Aplique las actualizaciones recomendadas por el fabricante
3. **Monitoreo**: Implemente monitoreo adicional en los equipos afectados
4. **Contacto con Soporte**: Contacte a CECOM para asistencia técnica especializada

## ¿Necesita Ayuda?

Nuestro equipo de expertos en seguridad está disponible para ayudarle a evaluar y mitigar esta vulnerabilidad en su infraestructura.

**Contacto CECOM:**
- **Teléfono:** +1 (809) 555-0123
- **Email:** seguridad@cecom.com.do
- **Soporte 24/7:** Disponible para clientes con contrato de soporte

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](${item.link}).*`
}

function generateEnglishContent(item: RSSItem, description: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${item.title}

## Vulnerability Summary

${description}

## Technical Details

This vulnerability has been identified by Extreme Networks and affects specific products in their portfolio. As an authorized Extreme Networks distributor in the Dominican Republic, CECOM recommends immediately reviewing if your equipment is affected.

### Vulnerability Information

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Publication Date:** ${new Date(item.pubDate).toLocaleDateString('en-US')}
- **Source:** Extreme Networks Security Advisory

## CECOM Recommendations

1. **Immediate Assessment**: Identify if your Extreme Networks equipment is affected
2. **Firmware Updates**: Apply manufacturer-recommended updates
3. **Monitoring**: Implement additional monitoring on affected equipment
4. **Support Contact**: Contact CECOM for specialized technical assistance

## Need Help?

Our security expert team is available to help you assess and mitigate this vulnerability in your infrastructure.

**CECOM Contact:**
- **Phone:** +1 (809) 555-0123
- **Email:** security@cecom.com.do
- **24/7 Support:** Available for customers with support contracts

---

*For more technical details, see the [official Extreme Networks advisory](${item.link}).*`
}

export async function importRSSToPayload(limit: number = 10) {
  try {
    const payload = await getPayload()
    const rssItems = await fetchExtremeNetworksRSS()
    
    // Get or create categories
    const cybersecurityCategory = await getOrCreateCategory(payload, 'cybersecurity', {
      name: 'Ciberseguridad',
      slug: 'cybersecurity',
      description: 'Avisos de seguridad, vulnerabilidades y mejores prácticas de ciberseguridad',
      color: '#dc2626'
    })
    
    // Get existing posts to avoid duplicates
    const existingPosts = await payload.find({
      collection: 'blog-posts',
      where: {
        sourceUrl: { exists: true }
      },
      limit: 1000
    })
    
    const existingUrls = new Set(existingPosts.docs.map(post => (post as any).sourceUrl))
    const newItems = rssItems.filter(item => !existingUrls.has(item.link)).slice(0, limit)
    
    const results = []
    
    for (const item of newItems) {
      try {
        // Create Spanish version
        const spanishPost = parseRSSItemToPost(item, 'es')
        const spanishResult = await payload.create({
          collection: 'blog-posts',
          data: {
            ...spanishPost,
            category: cybersecurityCategory.id,
            locale: 'es'
          }
        })
        
        // Create English version
        const englishPost = parseRSSItemToPost(item, 'en')
        const englishResult = await payload.create({
          collection: 'blog-posts',
          data: {
            ...englishPost,
            category: cybersecurityCategory.id,
            locale: 'en'
          }
        })
        
        results.push({ spanish: spanishResult, english: englishResult })
        console.log(`Imported: ${item.title}`)
      } catch (error) {
        console.error(`Error importing ${item.title}:`, error)
      }
    }
    
    return {
      imported: results.length,
      total: rssItems.length,
      results
    }
  } catch (error) {
    console.error('Error importing RSS feed:', error)
    throw error
  }
}

async function getOrCreateCategory(payload: any, slug: string, categoryData: any) {
  // Try to find existing category
  const existing = await payload.find({
    collection: 'blog-categories',
    where: {
      slug: { equals: slug }
    },
    limit: 1
  })
  
  if (existing.docs.length > 0) {
    return existing.docs[0]
  }
  
  // Create new category
  return await payload.create({
    collection: 'blog-categories',
    data: categoryData
  })
}

```

# src/lib/rss-parser.ts

```ts
import Parser from 'rss-parser'

// RSS Parser configuration with custom fields
export const rssParser = new Parser({
  customFields: {
    feed: ['language', 'copyright', 'managingEditor'],
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['dc:date', 'dcDate'],
      ['atom:updated', 'atomUpdated'],
    ]
  },
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'CECOM RSS Reader/1.0'
  }
})

// Types for RSS parsing
export interface RSSItem {
  title: string
  link: string
  pubDate: string
  creator?: string
  contentSnippet?: string
  content?: string
  contentEncoded?: string
  guid?: string
  categories?: string[]
  mediaContent?: {
    $: {
      url: string
      type?: string
      medium?: string
    }
  }
  mediaThumbnail?: {
    $: {
      url: string
      width?: string
      height?: string
    }
  }
  dcDate?: string
  atomUpdated?: string
}

export interface RSSFeed {
  title: string
  description: string
  link: string
  language?: string
  copyright?: string
  managingEditor?: string
  lastBuildDate?: string
  items: RSSItem[]
}

export interface ParsedArticle {
  id: string
  title: string
  summary: string
  content: string
  publishedAt: string
  sourceUrl: string
  vendorId: string
  vendorName: string
  image?: string
  tags: string[]
  author?: string
}

// Utility function to extract image URL from RSS item
export function extractImageUrl(item: RSSItem): string | undefined {
  // Try media:content first
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url
  }
  
  // Try media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url
  }
  
  // Try to extract image from content
  if (item.content || item.contentEncoded) {
    const content = item.contentEncoded || item.content || ''
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
  }
  
  return undefined
}

// Utility function to clean and truncate text content
export function cleanTextContent(text: string, maxLength: number = 300): string {
  if (!text) return ''
  
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
  
  // Truncate if needed
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  
  return cleanText.substring(0, maxLength).trim() + '...'
}

// Utility function to generate consistent article ID
export function generateArticleId(item: RSSItem, vendorId: string): string {
  // Use GUID if available
  if (item.guid) {
    return item.guid.toString()
  }
  
  // Use link if available
  if (item.link) {
    return item.link
  }
  
  // Generate from vendor + title + date
  const title = item.title || 'untitled'
  const date = item.pubDate || new Date().toISOString()
  const hash = Buffer.from(`${vendorId}-${title}-${date}`).toString('base64')
  
  return `${vendorId}-${hash}`
}

// Utility function to parse publication date
export function parsePublicationDate(item: RSSItem): string {
  // Try different date fields in order of preference
  const dateFields = [item.pubDate, item.dcDate, item.atomUpdated]
  
  for (const dateField of dateFields) {
    if (dateField) {
      const parsed = new Date(dateField)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    }
  }
  
  // Fallback to current date
  return new Date().toISOString()
}

// Main function to parse RSS feed and convert to articles
export async function parseRSSFeedToArticles(
  url: string, 
  vendorId: string, 
  vendorName: string
): Promise<ParsedArticle[]> {
  try {
    console.log(`Parsing RSS feed for ${vendorName}: ${url}`)
    
    const feed = await rssParser.parseURL(url) as RSSFeed
    
    if (!feed.items || feed.items.length === 0) {
      console.log(`No items found in RSS feed for ${vendorName}`)
      return []
    }

    const articles: ParsedArticle[] = feed.items.map((item: RSSItem) => {
      const id = generateArticleId(item, vendorId)
      const image = extractImageUrl(item)
      const summary = cleanTextContent(item.contentSnippet || item.content || item.title || '', 300)
      const content = item.contentEncoded || item.content || summary
      const publishedAt = parsePublicationDate(item)
      const tags = item.categories || []
      const author = item.creator
      
      return {
        id,
        title: item.title || 'Untitled',
        summary,
        content,
        publishedAt,
        sourceUrl: item.link || '',
        vendorId,
        vendorName,
        image,
        tags,
        author
      }
    })

    console.log(`Successfully parsed ${articles.length} articles from ${vendorName}`)
    return articles

  } catch (error) {
    console.error(`Error parsing RSS feed for ${vendorName} (${url}):`, error)
    
    // Return empty array instead of throwing to allow other feeds to continue
    return []
  }
}

// Utility function to validate RSS URL
export function isValidRSSUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

// Utility function to test RSS feed accessibility
export async function testRSSFeed(url: string): Promise<{ success: boolean; error?: string; itemCount?: number }> {
  try {
    if (!isValidRSSUrl(url)) {
      return { success: false, error: 'Invalid URL format' }
    }
    
    const feed = await rssParser.parseURL(url)
    
    return {
      success: true,
      itemCount: feed.items?.length || 0
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

# src/lib/rss-supabase-importer.ts

```ts
import { XMLParser } from 'fast-xml-parser'
import { createClient } from '@supabase/supabase-js'

interface RSSItem {
  title: string
  description: string
  link: string
  guid: string
  pubDate: string
}

interface RSSFeed {
  rss: {
    channel: {
      title: string
      description: string
      item: RSSItem[]
    }
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function fetchExtremeNetworksRSS(): Promise<RSSItem[]> {
  try {
    const response = await fetch('https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS')
    const xmlData = await response.text()
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    })
    
    const result = parser.parse(xmlData) as RSSFeed
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    return items.filter(item => item && item.title)
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

export function parseRSSItemToPost(item: RSSItem, locale: 'en' | 'es' = 'es') {
  // Clean HTML from description
  const cleanDescription = item.description
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()
  
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const tags = ['seguridad', 'extreme-networks', 'vulnerabilidad']
  if (cveMatch) {
    tags.push(cveMatch[0].toLowerCase())
  }
  
  const translatedContent = locale === 'es' ? {
    title: translateSecurityTitle(item.title),
    excerpt: translateSecurityDescription(cleanDescription),
    content: generateSpanishContent(item, cleanDescription),
    category: 'ciberseguridad'
  } : {
    title: item.title,
    excerpt: cleanDescription.substring(0, 200) + '...',
    content: generateEnglishContent(item, cleanDescription),
    category: 'cybersecurity'
  }
  
  return {
    title: translatedContent.title,
    slug: `${slug}-${locale}`,
    excerpt: translatedContent.excerpt,
    content: translatedContent.content,
    publishedDate: new Date(item.pubDate),
    status: 'published' as const,
    category: translatedContent.category,
    tags: locale === 'es' ? tags : ['security', 'extreme-networks', 'vulnerability', ...(cveMatch ? [cveMatch[0].toLowerCase()] : [])],
    sourceUrl: item.link,
    readingTime: Math.ceil(translatedContent.content.length / 1000),
    seo: {
      metaTitle: translatedContent.title,
      metaDescription: translatedContent.excerpt,
      keywords: tags.join(', ')
    }
  }
}

function translateSecurityTitle(title: string): string {
  return title
    .replace(/Security Advisory/gi, 'Aviso de Seguridad')
    .replace(/Vulnerability/gi, 'Vulnerabilidad')
    .replace(/attack/gi, 'ataque')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
    .replace(/authentication leak/gi, 'filtración de autenticación')
    .replace(/allows long exponents/gi, 'permite exponentes largos')
}

function translateSecurityDescription(description: string): string {
  const translations = {
    'remote attackers': 'atacantes remotos',
    'server-side': 'del lado del servidor',
    'calculations': 'cálculos',
    'vulnerability': 'vulnerabilidad',
    'authentication': 'autenticación',
    'third party': 'terceros',
    'HTTP server': 'servidor HTTP',
    'leak': 'filtración'
  }
  
  let translated = description
  Object.entries(translations).forEach(([en, es]) => {
    translated = translated.replace(new RegExp(en, 'gi'), es)
  })
  
  return translated.substring(0, 200) + '...'
}

function generateSpanishContent(item: RSSItem, cleanDescription: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${translateSecurityTitle(item.title)}

## Resumen de la Vulnerabilidad

${translateSecurityDescription(cleanDescription)}

### Información de la Vulnerabilidad

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-ES')}
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](${item.link}).*`
}

function generateEnglishContent(item: RSSItem, cleanDescription: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${item.title}

## Vulnerability Summary

${cleanDescription}

### Vulnerability Information

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Publication Date:** ${new Date(item.pubDate).toLocaleDateString('en-US')}
- **Source:** Extreme Networks Security Advisory

---

*For technical details, please refer to the [official Extreme Networks advisory](${item.link}).*`
}

export async function importRSSToSupabase(limit: number = 10): Promise<{
  imported: number
  total: number
  results: any[]
}> {
  try {
    console.log('🔄 Fetching RSS feed...')
    const rssItems = await fetchExtremeNetworksRSS()
    
    if (rssItems.length === 0) {
      console.log('⚠️  No RSS items found')
      return { imported: 0, total: 0, results: [] }
    }
    
    console.log(`📊 Found ${rssItems.length} RSS items, processing ${Math.min(limit, rssItems.length)}...`)
    
    // Get cybersecurity category ID
    const { data: categories } = await supabase
      .from('blog_categories')
      .select('id, name')
      .eq('name', 'Ciberseguridad')
      .single()
    
    const categoryId = categories?.id || 'f3c265c9-390a-4572-994a-db7d2ca5948b' // fallback
    
    const results = []
    let imported = 0
    
    for (let i = 0; i < Math.min(limit, rssItems.length); i++) {
      const item = rssItems[i]
      
      try {
        // Parse RSS item to blog post format
        const post = parseRSSItemToPost(item, 'es')
        
        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', post.slug)
          .single()
        
        if (existingPost) {
          console.log(`⏭️  Skipping existing post: ${post.title}`)
          continue
        }
        
        // Insert new post
        const { data: insertedPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            slug: post.slug,
            category_id: categoryId,
            featured_image: '/blog/cybersecurity-placeholder.jpg',
            published_date: post.publishedDate.toISOString(),
            status: 'published',
            author: 'Equipo CECOM',
            meta_title: post.seo.metaTitle,
            meta_description: post.seo.metaDescription,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) {
          console.error(`❌ Error inserting post "${post.title}":`, error.message)
          continue
        }
        
        console.log(`✅ Imported: ${post.title}`)
        results.push({ post, insertedPost })
        imported++
        
      } catch (error) {
        console.error(`❌ Error processing RSS item "${item.title}":`, error)
      }
    }
    
    return {
      imported,
      total: rssItems.length,
      results
    }
    
  } catch (error) {
    console.error('❌ Error in RSS import:', error)
    throw error
  }
}

```

# src/lib/supabase-blog.ts

```ts
import { supabase } from './supabase';
import { BlogPost } from '@/types/blog';

export interface BlogCategory {
  id: string;
  name_es: string;
  name_en: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name_es: string;
  name_en: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostDB {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  category_id: string;
  featured_image?: string;
  published_date: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  brand: string;
  model?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  external_image_url?: string;
  datasheet_url?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

// Blog Posts
export async function getBlogPosts(options?: {
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name_es, name_en, slug)
    `);

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.category) {
    query = query.eq('category_id', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('published_date', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data?.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content,
    slug: post.slug,
    category: post.blog_categories?.slug || '',
    tags: [], // Tags will need to be implemented separately
    featuredImage: post.featured_image,
    publishedDate: post.published_date,
    readingTime: 5, // Default reading time
    author: post.author,
    status: post.status,
    seo: post.meta_title || post.meta_description ? {
      metaTitle: post.meta_title || post.title,
      metaDescription: post.meta_description || post.excerpt || '',
      keywords: ''
    } : undefined
  })) || [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name_es, name_en, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt || '',
    content: data.content,
    slug: data.slug,
    category: data.blog_categories?.slug || '',
    tags: [], // Tags will need to be implemented separately
    featuredImage: data.featured_image,
    publishedDate: data.published_date,
    readingTime: 5, // Default reading time
    author: data.author,
    status: data.status,
    seo: data.meta_title || data.meta_description ? {
      metaTitle: data.meta_title || data.title,
      metaDescription: data.meta_description || data.excerpt || '',
      keywords: ''
    } : undefined
  };
}

// Blog Categories
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name_es');

  if (error) {
    console.error('Error fetching blog categories:', error);
    return [];
  }

  return data || [];
}

export async function getBlogCategoriesWithCounts(): Promise<Array<BlogCategory & { post_count: number }>> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select(`
      *,
      blog_posts(count)
    `)
    .eq('blog_posts.status', 'published');

  if (error) {
    console.error('Error fetching blog categories with counts:', error);
    return [];
  }

  return data?.map(category => ({
    ...category,
    post_count: category.blog_posts?.[0]?.count || 0
  })) || [];
}

// Blog Tags
export async function getBlogTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name_es');

  if (error) {
    console.error('Error fetching blog tags:', error);
    return [];
  }

  return data || [];
}

export async function getBlogTagsWithCounts(): Promise<Array<BlogTag & { post_count: number }>> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select(`
      *,
      blog_post_tags(count)
    `);

  if (error) {
    console.error('Error fetching blog tags with counts:', error);
    return [];
  }

  return data?.map(tag => ({
    ...tag,
    post_count: tag.blog_post_tags?.length || 0
  })) || [];
}

// Products
export async function getProducts(options?: {
  category?: string;
  brand?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*');

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.brand) {
    query = query.eq('brand', options.brand);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  } else {
    query = query.eq('status', 'active'); // Default to active products
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('name');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Utility functions for sitemap generation
export async function getAllPublishedBlogSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching blog slugs:', error);
    return [];
  }

  return data?.map(post => post.slug) || [];
}

export async function getAllProductIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching product IDs:', error);
    return [];
  }

  return data?.map(product => product.id) || [];
}

export async function getAllBlogCategorySlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('slug');

  if (error) {
    console.error('Error fetching category slugs:', error);
    return [];
  }

  return data?.map(category => category.slug) || [];
}

export async function getAllBlogTagSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('slug');

  if (error) {
    console.error('Error fetching tag slugs:', error);
    return [];
  }

  return data?.map(tag => tag.slug) || [];
}

```

# src/lib/supabase.ts

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export type UserRole = 'admin' | 'employee' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  active: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const signUp = async (email: string, password: string, userData: {
  first_name: string;
  last_name: string;
  role?: UserRole;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  
  if (data.user && !error) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || 'user',
        approval_status: 'pending'
      });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const result = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  // If email not confirmed, provide helpful error message
  if (result.error && result.error.message === 'Email not confirmed') {
    return {
      ...result,
      error: {
        ...result.error,
        message: 'Email no confirmado. Contacta al administrador del sistema para confirmar tu cuenta.'
      }
    };
  }
  
  return result;
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canModifyContent = (userRole: UserRole): boolean => {
  return hasPermission(userRole, ['admin', 'employee']);
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

export const isEmployee = (userRole: UserRole): boolean => {
  return userRole === 'employee';
};

export const isUser = (userRole: UserRole): boolean => {
  return userRole === 'user';
};
```

# src/lib/supabase/api.ts

```ts
import { supabase } from '@/lib/supabase'

// Helper functions to safely extract multilingual content
const getMultilingualText = (field: any, locale: 'en' | 'es' = 'en') => {
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.es || ''
  }
  return ''
}

const getMultilingualArray = (field: any, locale: 'en' | 'es' = 'en') => {
  if (Array.isArray(field)) return field
  if (typeof field === 'object' && field !== null) {
    const result = field[locale] || field.en || field.es
    return Array.isArray(result) ? result : []
  }
  return []
}

// Categories API functions
export const getCategories = async (locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data.map((category: any) => ({
    id: category.id,
    name: getMultilingualText(category.name, locale),
    description: getMultilingualText(category.description, locale),
    slug: category.slug,
    order: category.order || 0,
    icon: category.icon,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  }))
}

export const getCategoryById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return {
    id: data.id,
    name: getMultilingualText(data.name, locale),
    description: getMultilingualText(data.description, locale),
    slug: data.slug,
    order: data.order || 0,
    icon: data.icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Vendors API functions
export const getVendors = async () => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }

  return data.map((vendor: any) => ({
    id: vendor.id,
    name: vendor.name,
    logo: vendor.logo ? { url: vendor.logo } : undefined,
    website: vendor.website,
    description: vendor.description,
    createdAt: vendor.created_at,
    updatedAt: vendor.updated_at,
  }))
}

export const getVendorById = async (id: string) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching vendor:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    logo: data.logo ? { url: data.logo } : undefined,
    website: data.website,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Products API functions
export const getProducts = async (locale: 'en' | 'es' = 'en', categoryId?: string) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('active', true)
    .order('order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))
}

export const getProductById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return {
    id: data.id,
    name: getMultilingualText(data.name, locale),
    description: getMultilingualText(data.description, locale),
    features: getMultilingualArray(data.features, locale),
    category: data.category ? {
      id: data.category.id,
      name: getMultilingualText(data.category.name, locale),
      slug: data.category.slug,
      icon: data.category.icon
    } : null,
    vendor: data.vendor ? {
      id: data.vendor.id,
      name: data.vendor.name,
      logo: data.vendor.logo ? { url: data.vendor.logo } : undefined,
      website: data.vendor.website,
      description: getMultilingualText(data.vendor.description, locale)
    } : null,
    image: data.external_image_url ? { url: data.external_image_url } : undefined,
    datasheet: data.external_datasheet_url ? { url: data.external_datasheet_url } : undefined,
    order: data.order || 0,
    active: data.active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export const getProductsByCategory = async (categoryId: string, locale: 'en' | 'es' = 'en') => {
  return getProducts(locale, categoryId)
}

export const getProductsByVendor = async (vendorId: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('vendor_id', vendorId)
    .eq('active', true)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching products by vendor:', error)
    return []
  }

  return data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))
}

// Search function
export const searchContent = async (query: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('active', true)
    .or(`name->>en.ilike.%${query}%,name->>es.ilike.%${query}%,description->>en.ilike.%${query}%,description->>es.ilike.%${query}%`)

  if (error) {
    console.error('Error searching products:', error)
    return { products: [], pages: [] }
  }

  const products = data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))

  return {
    products,
    pages: [], // Pages search not implemented yet
  }
}

// Statistics and admin functions
export const getCollectionCounts = async () => {
  const [categoriesResult, vendorsResult, productsResult] = await Promise.all([
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('vendors').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true })
  ])

  return {
    categories: categoriesResult.count || 0,
    vendors: vendorsResult.count || 0,
    products: productsResult.count || 0,
    pages: 0,
    'news-articles': 0,
    media: 0,
    users: 0,
  }
}
```

# src/lib/timezone.ts

```ts
// Global timezone configuration
// This ensures the timezone is set consistently across the application

// For client-side, we can use Intl.DateTimeFormat to ensure consistent formatting
export const TIMEZONE = 'America/Santo_Domingo';

// Utility function to get current time in the correct timezone
export function getCurrentTime(): Date {
  return new Date();
}

// Utility function to format dates consistently
export function formatDate(date: Date, locale: 'en' | 'es' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Utility function to format time consistently
export function formatTime(date: Date, locale: 'en' | 'es' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Utility function to format datetime consistently
export function formatDateTime(date: Date, locale: 'en' | 'es' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
```

# src/lib/translation-validator.ts

```ts
/**
 * Translation Validation Utility
 * 
 * This utility provides functions to validate translation files and check for
 * missing keys, inconsistencies between locales, and development warnings.
 */

import fs from 'fs';
import path from 'path';

export interface TranslationValidationResult {
  isValid: boolean;
  errors: TranslationError[];
  warnings: TranslationWarning[];
  missingKeys: MissingKeyReport[];
  inconsistencies: InconsistencyReport[];
}

export interface TranslationError {
  type: 'missing_file' | 'invalid_json' | 'missing_namespace';
  message: string;
  file?: string;
  key?: string;
}

export interface TranslationWarning {
  type: 'missing_key' | 'extra_key' | 'empty_value';
  message: string;
  file: string;
  key: string;
}

export interface MissingKeyReport {
  key: string;
  missingIn: string[];
  presentIn: string[];
}

export interface InconsistencyReport {
  type: 'structure_mismatch' | 'type_mismatch';
  key: string;
  details: string;
}

/**
 * Validates translation files for consistency and completeness
 */
export class TranslationValidator {
  private translationsPath: string;
  private supportedLocales: string[];

  constructor(translationsPath: string = 'messages', supportedLocales: string[] = ['en', 'es']) {
    this.translationsPath = translationsPath;
    this.supportedLocales = supportedLocales;
  }

  /**
   * Validates all translation files and returns a comprehensive report
   */
  async validateTranslations(): Promise<TranslationValidationResult> {
    const result: TranslationValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingKeys: [],
      inconsistencies: []
    };

    try {
      // Load all translation files
      const translations = await this.loadTranslationFiles();
      
      // Check for missing files
      this.checkMissingFiles(translations, result);
      
      // Validate JSON structure
      this.validateJsonStructure(translations, result);
      
      // Check for missing keys between locales
      this.checkMissingKeys(translations, result);
      
      // Check for structural inconsistencies
      this.checkStructuralConsistency(translations, result);
      
      // Check for empty values
      this.checkEmptyValues(translations, result);

      result.isValid = result.errors.length === 0;
      
    } catch (error) {
      result.errors.push({
        type: 'missing_file',
        message: `Failed to validate translations: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * Loads all translation files
   */
  private async loadTranslationFiles(): Promise<Record<string, any>> {
    const translations: Record<string, any> = {};

    for (const locale of this.supportedLocales) {
      const filePath = path.join(this.translationsPath, `${locale}.json`);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[locale] = JSON.parse(content);
        }
      } catch (error) {
        // Will be handled in validation
        translations[locale] = null;
      }
    }

    return translations;
  }

  /**
   * Checks for missing translation files
   */
  private checkMissingFiles(translations: Record<string, any>, result: TranslationValidationResult): void {
    for (const locale of this.supportedLocales) {
      if (!translations[locale]) {
        result.errors.push({
          type: 'missing_file',
          message: `Translation file for locale '${locale}' is missing or invalid`,
          file: `${locale}.json`
        });
      }
    }
  }

  /**
   * Validates JSON structure of translation files
   */
  private validateJsonStructure(translations: Record<string, any>, result: TranslationValidationResult): void {
    for (const [locale, content] of Object.entries(translations)) {
      if (content === null) {
        result.errors.push({
          type: 'invalid_json',
          message: `Invalid JSON structure in ${locale}.json`,
          file: `${locale}.json`
        });
      }
    }
  }

  /**
   * Checks for missing keys between locales
   */
  private checkMissingKeys(translations: Record<string, any>, result: TranslationValidationResult): void {
    const validTranslations = Object.entries(translations).filter(([_, content]) => content !== null);
    
    if (validTranslations.length < 2) return;

    // Get all possible keys from all locales
    const allKeys = new Set<string>();
    const keysByLocale: Record<string, Set<string>> = {};

    for (const [locale, content] of validTranslations) {
      const keys = this.extractKeys(content);
      keysByLocale[locale] = new Set(keys);
      keys.forEach(key => allKeys.add(key));
    }

    // Check for missing keys
    for (const key of allKeys) {
      const missingIn: string[] = [];
      const presentIn: string[] = [];

      for (const [locale, keys] of Object.entries(keysByLocale)) {
        if (keys.has(key)) {
          presentIn.push(locale);
        } else {
          missingIn.push(locale);
        }
      }

      if (missingIn.length > 0) {
        result.missingKeys.push({
          key,
          missingIn,
          presentIn
        });

        result.warnings.push({
          type: 'missing_key',
          message: `Key '${key}' is missing in locales: ${missingIn.join(', ')}`,
          file: missingIn.map(locale => `${locale}.json`).join(', '),
          key
        });
      }
    }
  }

  /**
   * Checks for structural inconsistencies between locales
   */
  private checkStructuralConsistency(translations: Record<string, any>, result: TranslationValidationResult): void {
    const validTranslations = Object.entries(translations).filter(([_, content]) => content !== null);
    
    if (validTranslations.length < 2) return;

    const [baseLocale, baseContent] = validTranslations[0];
    
    for (let i = 1; i < validTranslations.length; i++) {
      const [compareLocale, compareContent] = validTranslations[i];
      
      this.compareStructure(baseContent, compareContent, '', baseLocale, compareLocale, result);
    }
  }

  /**
   * Recursively compares structure between two translation objects
   */
  private compareStructure(
    base: any, 
    compare: any, 
    keyPath: string, 
    baseLocale: string, 
    compareLocale: string, 
    result: TranslationValidationResult
  ): void {
    const baseType = typeof base;
    const compareType = typeof compare;

    if (baseType !== compareType) {
      result.inconsistencies.push({
        type: 'type_mismatch',
        key: keyPath,
        details: `Type mismatch at '${keyPath}': ${baseLocale} has ${baseType}, ${compareLocale} has ${compareType}`
      });
      return;
    }

    if (baseType === 'object' && base !== null && compare !== null) {
      const baseKeys = Object.keys(base);
      const compareKeys = Object.keys(compare);

      // Check for structural differences
      const allKeys = new Set([...baseKeys, ...compareKeys]);
      
      for (const key of allKeys) {
        const newKeyPath = keyPath ? `${keyPath}.${key}` : key;
        
        if (!(key in base)) {
          result.inconsistencies.push({
            type: 'structure_mismatch',
            key: newKeyPath,
            details: `Key '${newKeyPath}' exists in ${compareLocale} but not in ${baseLocale}`
          });
        } else if (!(key in compare)) {
          result.inconsistencies.push({
            type: 'structure_mismatch',
            key: newKeyPath,
            details: `Key '${newKeyPath}' exists in ${baseLocale} but not in ${compareLocale}`
          });
        } else {
          // Recursively check nested objects
          this.compareStructure(base[key], compare[key], newKeyPath, baseLocale, compareLocale, result);
        }
      }
    }
  }

  /**
   * Checks for empty values in translation files
   */
  private checkEmptyValues(translations: Record<string, any>, result: TranslationValidationResult): void {
    for (const [locale, content] of Object.entries(translations)) {
      if (content === null) continue;

      const emptyKeys = this.findEmptyValues(content);
      
      for (const key of emptyKeys) {
        result.warnings.push({
          type: 'empty_value',
          message: `Empty value found for key '${key}' in ${locale}.json`,
          file: `${locale}.json`,
          key
        });
      }
    }
  }

  /**
   * Extracts all keys from a nested translation object
   */
  private extractKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Finds keys with empty values
   */
  private findEmptyValues(obj: any, prefix: string = ''): string[] {
    const emptyKeys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        emptyKeys.push(...this.findEmptyValues(value, fullKey));
      } else if (typeof value === 'string' && value.trim() === '') {
        emptyKeys.push(fullKey);
      }
    }

    return emptyKeys;
  }

  /**
   * Checks if a specific translation key exists in all locales
   */
  checkTranslationKey(key: string): Promise<boolean> {
    return this.loadTranslationFiles().then(translations => {
      for (const locale of this.supportedLocales) {
        const content = translations[locale];
        if (!content || !this.hasNestedKey(content, key)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Checks if a nested key exists in an object
   */
  private hasNestedKey(obj: any, key: string): boolean {
    const keys = key.split('.');
    let current = obj;

    for (const k of keys) {
      if (typeof current !== 'object' || current === null || !(k in current)) {
        return false;
      }
      current = current[k];
    }

    return true;
  }

  /**
   * Gets a translation value for a specific key and locale
   */
  async getTranslationValue(key: string, locale: string): Promise<string | null> {
    const translations = await this.loadTranslationFiles();
    const content = translations[locale];
    
    if (!content) return null;

    const keys = key.split('.');
    let current = content;

    for (const k of keys) {
      if (typeof current !== 'object' || current === null || !(k in current)) {
        return null;
      }
      current = current[k];
    }

    return typeof current === 'string' ? current : null;
  }
}

/**
 * Development mode warning system for missing translations
 */
export class TranslationWarningSystem {
  private static instance: TranslationWarningSystem;
  private validator: TranslationValidator;
  private warnedKeys: Set<string> = new Set();

  private constructor() {
    this.validator = new TranslationValidator();
  }

  private get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static getInstance(): TranslationWarningSystem {
    if (!TranslationWarningSystem.instance) {
      TranslationWarningSystem.instance = new TranslationWarningSystem();
    }
    return TranslationWarningSystem.instance;
  }

  /**
   * Warns about missing translation key (only in development)
   */
  async warnMissingKey(key: string, locale: string, component?: string): Promise<void> {
    if (!this.isDevelopment) return;

    const warningKey = `${key}-${locale}`;
    if (this.warnedKeys.has(warningKey)) return;

    const exists = await this.validator.checkTranslationKey(key);
    
    if (!exists) {
      this.warnedKeys.add(warningKey);
      
      const componentInfo = component ? ` in component ${component}` : '';
      console.warn(
        `🌐 Translation Warning: Missing key '${key}' for locale '${locale}'${componentInfo}`
      );
      
      // Also check if key exists in other locales
      const value = await this.validator.getTranslationValue(key, locale === 'en' ? 'es' : 'en');
      if (value) {
        console.warn(`   Key exists in other locale with value: "${value}"`);
      }
    }
  }

  /**
   * Validates all translations and logs warnings
   */
  async validateAndWarn(): Promise<void> {
    if (!this.isDevelopment) return;

    const result = await this.validator.validateTranslations();
    
    if (!result.isValid) {
      console.warn('🌐 Translation Validation Errors:');
      result.errors.forEach(error => {
        console.warn(`   ❌ ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      console.warn('🌐 Translation Warnings:');
      result.warnings.forEach(warning => {
        console.warn(`   ⚠️  ${warning.message}`);
      });
    }

    if (result.missingKeys.length > 0) {
      console.warn('🌐 Missing Translation Keys:');
      result.missingKeys.forEach(missing => {
        console.warn(`   🔍 '${missing.key}' missing in: ${missing.missingIn.join(', ')}`);
      });
    }
  }

  /**
   * Clears the warned keys cache (useful for testing)
   */
  clearWarnings(): void {
    this.warnedKeys.clear();
  }
}

// Export singleton instance for easy access
export const translationWarningSystem = TranslationWarningSystem.getInstance();

// Export validator instance for direct use
export const translationValidator = new TranslationValidator();
```

# src/lib/use-translations-with-validation.ts

```ts
/**
 * Enhanced useTranslations hook with validation warnings
 * 
 * This hook wraps the standard next-intl useTranslations hook to provide
 * development-mode warnings for missing translation keys.
 */

import { useTranslations as useNextIntlTranslations, useLocale } from 'next-intl';
import { translationWarningSystem } from './translation-validator';
import { useEffect } from 'react';

/**
 * Enhanced useTranslations hook that provides validation warnings in development
 */
export function useTranslationsWithValidation(namespace?: string, component?: string) {
  const t = useNextIntlTranslations(namespace);
  const locale = useLocale();

  // Create a wrapper function that validates keys before translation
  const validatedT = (key: string, values?: Record<string, any>) => {
    // In development, warn about missing keys
    if (process.env.NODE_ENV === 'development') {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      
      // Use setTimeout to avoid blocking the render
      setTimeout(() => {
        translationWarningSystem.warnMissingKey(fullKey, locale, component);
      }, 0);
    }

    return t(key, values);
  };

  return validatedT;
}

/**
 * Hook to validate translations on component mount (development only)
 */
export function useTranslationValidation(componentName?: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Validate translations when component mounts
      translationWarningSystem.validateAndWarn().catch(error => {
        console.error('Translation validation failed:', error);
      });
    }
  }, [componentName]);
}

/**
 * Utility function to check if a translation key exists
 */
export async function checkTranslationExists(key: string): Promise<boolean> {
  const { translationValidator } = await import('./translation-validator');
  return translationValidator.checkTranslationKey(key);
}

/**
 * Utility function to get all missing translation keys
 */
export async function getMissingTranslationKeys(): Promise<string[]> {
  const { translationValidator } = await import('./translation-validator');
  const result = await translationValidator.validateTranslations();
  return result.missingKeys.map(missing => missing.key);
}

/**
 * Development utility to log translation coverage report
 */
export async function logTranslationCoverage(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const { translationValidator } = await import('./translation-validator');
  const result = await translationValidator.validateTranslations();
  
  console.group('🌐 Translation Coverage Report');
  
  if (result.isValid) {
    console.log('✅ All translations are valid and consistent');
  } else {
    console.log('❌ Translation issues found');
  }
  
  console.log(`📊 Total missing keys: ${result.missingKeys.length}`);
  console.log(`⚠️  Total warnings: ${result.warnings.length}`);
  console.log(`🚨 Total errors: ${result.errors.length}`);
  
  if (result.missingKeys.length > 0) {
    console.group('Missing Keys:');
    result.missingKeys.forEach(missing => {
      console.log(`• ${missing.key} (missing in: ${missing.missingIn.join(', ')})`);
    });
    console.groupEnd();
  }
  
  if (result.errors.length > 0) {
    console.group('Errors:');
    result.errors.forEach(error => {
      console.error(`• ${error.message}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}
```

# src/lib/utils.ts

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

# src/lib/validation/admin.ts

```ts
import { supabase } from '@/lib/supabase';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a category name is unique
 */
export async function validateCategoryName(
  nameEn: string, 
  nameEs: string, 
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('categories')
      .select('id, name');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking category name' };
    }

    // Check for duplicate names in either language
    const duplicate = data?.find(category => {
      const existingNameEn = category.name?.en?.toLowerCase();
      const existingNameEs = category.name?.es?.toLowerCase();
      
      return existingNameEn === nameEn.toLowerCase() || 
             existingNameEs === nameEs.toLowerCase() ||
             existingNameEn === nameEs.toLowerCase() ||
             existingNameEs === nameEn.toLowerCase();
    });

    if (duplicate) {
      return { 
        isValid: false, 
        error: 'A category with this name already exists' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating category name' };
  }
}

/**
 * Validates if a category slug is unique
 */
export async function validateCategorySlug(
  slug: string, 
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking category slug' };
    }

    if (data && data.length > 0) {
      return { 
        isValid: false, 
        error: 'A category with this slug already exists' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating category slug' };
  }
}

/**
 * Validates if a vendor name is unique
 */
export async function validateVendorName(
  name: string, 
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('vendors')
      .select('id')
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking vendor name' };
    }

    if (data && data.length > 0) {
      return { 
        isValid: false, 
        error: 'A vendor with this name already exists' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating vendor name' };
  }
}

/**
 * Validates if a product name is unique within the same category
 */
export async function validateProductName(
  nameEn: string, 
  nameEs: string, 
  categoryId: string,
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('products')
      .select('id, name')
      .eq('category_id', categoryId);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking product name' };
    }

    // Check for duplicate names in either language within the same category
    const duplicate = data?.find(product => {
      const existingNameEn = product.name?.en?.toLowerCase();
      const existingNameEs = product.name?.es?.toLowerCase();
      
      return existingNameEn === nameEn.toLowerCase() || 
             existingNameEs === nameEs.toLowerCase() ||
             existingNameEn === nameEs.toLowerCase() ||
             existingNameEs === nameEn.toLowerCase();
    });

    if (duplicate) {
      return { 
        isValid: false, 
        error: 'A product with this name already exists in this category' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating product name' };
  }
}
```

# src/lib/validation/contact.ts

```ts
import { z } from 'zod';

// Fallback messages in case translations are not available
const fallbackMessages = {
  requiredField: 'This field is required',
  nameMinLength: 'Name must be at least 2 characters',
  maxLength: 'Must be no more than {max} characters',
  invalidName: 'Name can only contain letters and spaces',
  invalidEmail: 'Please enter a valid email address',
  phoneMinLength: 'Phone number must be at least 10 digits',
  invalidPhone: 'Please enter a valid phone number',
  messageMinLength: 'Message must be at least 10 characters',
};

// Safe translation function that handles missing translations
const safeTranslate = (t: (key: string, values?: Record<string, any>) => string, key: string, values?: Record<string, any>): string => {
  try {
    const translation = t(key, values);
    // Check if the translation is missing (next-intl returns the key when missing)
    if (translation === key || !translation) {
      const fallback = fallbackMessages[key as keyof typeof fallbackMessages] || key;
      // If we have values and the fallback contains placeholders, replace them
      if (values && typeof fallback === 'string') {
        return Object.entries(values).reduce((str, [placeholder, value]) => {
          return str.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
        }, fallback);
      }
      return fallback;
    }
    return translation;
  } catch (error) {
    console.warn(`Translation error for key "${key}":`, error);
    const fallback = fallbackMessages[key as keyof typeof fallbackMessages] || key;
    // If we have values and the fallback contains placeholders, replace them
    if (values && typeof fallback === 'string') {
      return Object.entries(values).reduce((str, [placeholder, value]) => {
        return str.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
      }, fallback);
    }
    return fallback;
  }
};

// Create a function that returns the schema with translated messages
export const createContactFormSchema = (t: (key: string, values?: Record<string, any>) => string) => {
  return z.object({
    fullName: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .min(2, safeTranslate(t, 'nameMinLength'))
      .max(100, safeTranslate(t, 'maxLength', { max: 100 }))
      .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, safeTranslate(t, 'invalidName')),

    email: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .email(safeTranslate(t, 'invalidEmail'))
      .max(255, safeTranslate(t, 'maxLength', { max: 255 })),

    phone: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .min(10, safeTranslate(t, 'phoneMinLength'))
      .max(20, safeTranslate(t, 'maxLength', { max: 20 }))
      .regex(/^[\+]?[0-9\s\-\(\)]+$/, safeTranslate(t, 'invalidPhone')),

    message: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .min(10, safeTranslate(t, 'messageMinLength'))
      .max(1000, safeTranslate(t, 'maxLength', { max: 1000 })),
  });
};

// Base schema type for TypeScript inference
const baseSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
});

export type ContactFormData = z.infer<typeof baseSchema>;
```

# src/styles/scrollbar.css

```css
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Custom scrollbar styles for better UX */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Smooth scrolling for tables */
.table-scroll {
  scroll-behavior: smooth;
}

/* Focus styles for search inputs */
.search-input:focus {
  outline: none;
  ring: 2px;
  ring-color: rgb(59 130 246);
  border-color: transparent;
}

/* Scroll indicator animations */
@keyframes scroll-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.scroll-indicator {
  animation: scroll-bounce 2s infinite;
}

/* Fade in animation for scroll indicator */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-indicator-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

# src/test/setup.ts

```ts
/**
 * Test setup file for Vitest
 * Configures the testing environment for React components and hooks
 */

import { vi, expect } from 'vitest';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Make React available globally
global.React = React;

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock next-intl module
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock environment variables
if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    configurable: true
  });
}
```

# src/types/about.ts

```ts
export interface AboutContent {
  mission: {
    en: string;
    es: string;
  };
  vision: {
    en: string;
    es: string;
  };
  values: Array<{
    title: { en: string; es: string };
    description: { en: string; es: string };
    icon: string;
  }>;
  history: {
    en: string;
    es: string;
  };
  team?: Array<{
    name: string;
    position: { en: string; es: string };
    bio: { en: string; es: string };
    image?: string;
  }>;
}
```

# src/types/admin.ts

```ts
export interface Category {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  slug: string;
  order: number;
  icon: string;
}

export interface Vendor {
  id: string;
  name: string;
  website: string;
  description: { en: string; es: string };
}

export interface Product {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  features: { en: string[]; es: string[] };
  category_id: string;
  vendor_id: string;
  external_image_url?: string;
  external_datasheet_url?: string;
  order: number;
  active: boolean;
}

export interface AdminTab {
  id: string;
  name: string;
  count: number;
}
```

# src/types/blog.ts

```ts
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  publishedDate: string;
  readingTime: number;
  author: string;
  status: 'published' | 'draft';
  sourceUrl?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
}

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
}

```

# src/types/catalog.ts

```ts
export interface Category {
  id: string;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  slug: string;
  order: number;
  icon?: string;
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  rssUrl?: string;
  description: {
    en: string;
    es: string;
  };
}

export interface Product {
  id: string;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  features: {
    en: string[];
    es: string[];
  };
  categoryId: string;
  vendorId: string;
  image?: string;
  datasheet?: string;
  order: number;
  active: boolean;
}
```

# src/types/cms.ts

```ts
export interface CMSContent {
  id: string;
  type: 'hero' | 'about' | 'contact' | 'page';
  title: {
    en: string;
    es: string;
  };
  content: {
    en: string;
    es: string;
  };
  images?: string[];
  lastModified: string;
  version: number;
}

export interface CMSUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  hashedPassword: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: 'admin' | 'editor';
  expiresAt: number;
}
```

# src/types/feed.ts

```ts
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  source: {
    name: string;
    vendorId: string;
    url: string;
  };
  image?: string;
  tags: string[];
}

export interface RSSFeedConfig {
  vendorId: string;
  url: string;
  lastFetched: string;
  active: boolean;
}
```

# src/types/index.ts

```ts
// Catalog types
export type { Category, Vendor, Product } from './catalog';

// CMS types
export type { CMSContent, CMSUser, AuthSession } from './cms';

// Feed types
export type { NewsArticle, RSSFeedConfig } from './feed';

// About types
export type { AboutContent } from './about';
```

# src/utils/blog.ts

```ts
import { BlogPost } from '@/types/blog';
import { marked } from 'marked';

/**
 * Convert Markdown content to HTML
 */
export function markdownToHtml(markdown: string): string {
  try {
    const html = marked(markdown);
    return typeof html === 'string' ? html : markdown;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown;
  }
}

/**
 * Calculate reading time based on content length
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Parse date from various formats (RFC 2822, ISO, etc.)
 */
export function parseDate(dateString: string): Date {
  // Handle RSS date format: "Thu, 7 Aug 2025 19:28:19 +0000"
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(
    locale === 'es' ? 'es-DO' : 'en-US',
    { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
  );
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\`\`\`[\s\S]*?\`\`\`/g, '') // Remove code blocks
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Normalize blog post data from different sources
 */
export function normalizeBlogPost(rawPost: any): BlogPost {
  // Ensure title and excerpt are strings
  const title = typeof rawPost.title === 'string' ? rawPost.title : 
               typeof rawPost.title === 'object' ? rawPost.title.es || rawPost.title.en || 'Sin título' :
               'Sin título';
               
  const excerpt = typeof rawPost.excerpt === 'string' ? rawPost.excerpt :
                  typeof rawPost.excerpt === 'object' ? rawPost.excerpt.es || rawPost.excerpt.en || generateExcerpt(rawPost.content || '') :
                  generateExcerpt(rawPost.content || '');

  return {
    id: rawPost.id,
    title: title,
    excerpt: excerpt,
    content: markdownToHtml(rawPost.content || ''), // Convert Markdown to HTML
    slug: rawPost.slug,
    category: rawPost.category,
    tags: rawPost.tags || [],
    featuredImage: rawPost.featuredImage || rawPost.featured_image,
    publishedDate: rawPost.publishedDate || rawPost.published_date,
    readingTime: rawPost.readingTime || rawPost.reading_time || calculateReadingTime(rawPost.content || ''),
    author: rawPost.author || 'Equipo CECOM',
    status: rawPost.status || 'published',
    sourceUrl: rawPost.sourceUrl,
    seo: rawPost.seo
  };
}

/**
 * Filter blog posts based on criteria
 */
export function filterBlogPosts(
  posts: BlogPost[], 
  filters: {
    category?: string;
    tag?: string;
    search?: string;
    status?: string;
  }
): BlogPost[] {
  return posts.filter(post => {
    // Filter by category
    if (filters.category && post.category !== filters.category) {
      return false;
    }

    // Filter by tag
    if (filters.tag && !post.tags.includes(filters.tag)) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const excerptMatch = post.excerpt.toLowerCase().includes(searchLower);
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !excerptMatch && !contentMatch) {
        return false;
      }
    }

    // Filter by status
    if (filters.status && post.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Sort blog posts by date (newest first)
 */
export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => {
    const dateA = parseDate(a.publishedDate);
    const dateB = parseDate(b.publishedDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Paginate blog posts
 */
export function paginateBlogPosts(
  posts: BlogPost[], 
  page: number, 
  postsPerPage: number = 6
): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return {
    posts: paginatedPosts,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class", ".dark"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

# vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

