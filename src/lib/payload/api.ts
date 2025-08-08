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