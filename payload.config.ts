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