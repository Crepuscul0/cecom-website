import { supabase } from './supabase';
import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    name: process.env.SMTP_FROM_NAME || 'CECOM',
    address: process.env.SMTP_FROM_EMAIL || 'info@cecom.do',
  },
};

// Simple email templates (no database needed)
const emailTemplates = {
  contact_confirmation: {
    subject: {
      en: 'Thank you for contacting CECOM',
      es: 'Gracias por contactar a CECOM'
    },
    html: {
      en: (name: string, message: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p>${message}</p>
          </div>
          <p>Best regards,<br>CECOM Team</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            CECOM - Technology Solutions<br>
            Av. Pasteur 11, Santo Domingo, Dominican Republic<br>
            Phone: +1-809-688-4491 | Email: info@cecom.do
          </p>
        </div>
      `,
      es: (name: string, message: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">¡Gracias por contactarnos!</h2>
          <p>Estimado/a ${name},</p>
          <p>Hemos recibido su mensaje y nos pondremos en contacto con usted en un plazo de 24 horas.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Su Mensaje:</h3>
            <p>${message}</p>
          </div>
          <p>Saludos cordiales,<br>Equipo CECOM</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            CECOM - Soluciones Tecnológicas<br>
            Av. Pasteur 11, Santo Domingo, República Dominicana<br>
            Teléfono: +1-809-688-4491 | Email: info@cecom.do
          </p>
        </div>
      `
    }
  },
  newsletter_welcome: {
    subject: {
      en: 'Welcome to CECOM Newsletter',
      es: 'Bienvenido al Newsletter de CECOM'
    },
    html: {
      en: (unsubscribeUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to our Newsletter!</h2>
          <p>Thank you for subscribing to CECOM's newsletter.</p>
          <p>You'll receive the latest technology news, product updates, and expert insights directly in your inbox.</p>
          <div style="background: #2563eb; color: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: white;">Stay Connected</h3>
            <p style="margin: 10px 0 0 0;">Follow us for daily updates and tech tips</p>
          </div>
          <p>Best regards,<br>CECOM Team</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            You can unsubscribe at any time by clicking <a href="${unsubscribeUrl}">here</a>.<br><br>
            CECOM - Technology Solutions<br>
            Av. Pasteur 11, Santo Domingo, Dominican Republic<br>
            Phone: +1-809-688-4491 | Email: info@cecom.do
          </p>
        </div>
      `,
      es: (unsubscribeUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">¡Bienvenido a nuestro Newsletter!</h2>
          <p>Gracias por suscribirse al newsletter de CECOM.</p>
          <p>Recibirá las últimas noticias tecnológicas, actualizaciones de productos y perspectivas de expertos directamente en su bandeja de entrada.</p>
          <div style="background: #2563eb; color: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: white;">Manténgase Conectado</h3>
            <p style="margin: 10px 0 0 0;">Síganos para actualizaciones diarias y consejos tecnológicos</p>
          </div>
          <p>Saludos cordiales,<br>Equipo CECOM</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            Puede darse de baja en cualquier momento haciendo clic <a href="${unsubscribeUrl}">aquí</a>.<br><br>
            CECOM - Soluciones Tecnológicas<br>
            Av. Pasteur 11, Santo Domingo, República Dominicana<br>
            Teléfono: +1-809-688-4491 | Email: info@cecom.do
          </p>
        </div>
      `
    }
  },
  blog_notification: {
    subject: {
      en: (title: string) => `New Blog Post: ${title}`,
      es: (title: string) => `Nuevo Artículo: ${title}`
    },
    html: {
      en: (title: string, excerpt: string, slug: string, featuredImage: string, unsubscribeUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Blog Post from CECOM</h2>
          ${featuredImage ? `<img src="${featuredImage}" alt="${title}" style="width: 100%; max-width: 600px; height: 200px; object-fit: cover; border-radius: 8px; margin: 20px 0;">` : ''}
          <h3 style="color: #1f2937; margin: 20px 0 10px 0;">${title}</h3>
          <p style="color: #6b7280; line-height: 1.6; margin: 15px 0;">${excerpt}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/en/blog/${slug}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Read Full Article
            </a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            You received this email because you subscribed to CECOM's newsletter.<br>
            <a href="${unsubscribeUrl}">Unsubscribe</a> | 
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/en/blog">View All Posts</a><br><br>
            CECOM - Technology Solutions<br>
            Av. Pasteur 11, Santo Domingo, Dominican Republic<br>
            Phone: +1-809-688-4491 | Email: info@cecom.do
          </p>
        </div>
      `,
      es: (title: string, excerpt: string, slug: string, featuredImage: string, unsubscribeUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nuevo Artículo de CECOM</h2>
          ${featuredImage ? `<img src="${featuredImage}" alt="${title}" style="width: 100%; max-width: 600px; height: 200px; object-fit: cover; border-radius: 8px; margin: 20px 0;">` : ''}
          <h3 style="color: #1f2937; margin: 20px 0 10px 0;">${title}</h3>
          <p style="color: #6b7280; line-height: 1.6; margin: 15px 0;">${excerpt}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/es/blog/${slug}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Leer Artículo Completo
            </a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            Recibiste este email porque te suscribiste al newsletter de CECOM.<br>
            <a href="${unsubscribeUrl}">Darse de baja</a> | 
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/es/blog">Ver Todos los Artículos</a><br><br>
            CECOM - Soluciones Tecnológicas<br>
            Av. Pasteur 11, Santo Domingo, República Dominicana<br>
            Teléfono: +1-809-688-4491 | Email: info@cecom.do
          </p>
        </div>
      `
    }
  }
};

// Create nodemailer transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
      // Additional options for better connection handling
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,    // 30 seconds
      socketTimeout: 60000,      // 60 seconds
      // Ignore TLS certificate errors (for development)
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

// Send email function with real SMTP
export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if SMTP is configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('📧 SMTP not configured - Email would be sent:');
      console.log(`To: ${data.to}`);
      console.log(`Subject: ${data.subject}`);
      console.log(`From: ${emailConfig.from.name} <${emailConfig.from.address}>`);
      console.log('---');
      return { success: true, messageId: `dev_${Date.now()}` };
    }

    // Send real email
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      replyTo: data.replyTo || emailConfig.from.address,
    };

    console.log('📧 Sending email via SMTP...');
    console.log(`To: ${data.to}`);
    console.log(`Subject: ${data.subject}`);
    console.log(`From: ${emailConfig.from.name} <${emailConfig.from.address}>`);
    console.log(`SMTP Config: ${emailConfig.host}:${emailConfig.port} (secure: ${emailConfig.secure})`);

    // Test connection first
    try {
      await transporter!.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.warn('⚠️ SMTP verification failed:', verifyError);
      // Continue anyway - sometimes verify fails but sending works
    }

    const info = await transporter!.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

// Newsletter subscription
export async function subscribeToNewsletter(
  email: string,
  locale: 'en' | 'es' = 'es'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email)
      .single();

    if (existing && existing.status === 'active') {
      return { success: false, error: 'Already subscribed' };
    }

    if (existing && existing.status === 'unsubscribed') {
      // Reactivate subscription
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          subscribed_at: new Date().toISOString(),
          locale
        })
        .eq('id', existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          locale,
          status: 'active',
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Send welcome email
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
    const template = emailTemplates.newsletter_welcome;

    await sendEmail({
      to: email,
      subject: template.subject[locale],
      html: template.html[locale](unsubscribeUrl),
    });

    return { success: true };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error: 'Failed to subscribe' };
  }
}

// Contact form submission
export async function submitContactForm(formData: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  locale?: 'en' | 'es';
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Saving contact form to database...');
    
    // Save to database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        locale: formData.locale || 'es',
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Contact form saved to database with ID:', data.id);

    // Send confirmation email to user
    const locale = formData.locale || 'es';
    const template = emailTemplates.contact_confirmation;

    await sendEmail({
      to: formData.email,
      subject: template.subject[locale],
      html: template.html[locale](formData.fullName, formData.message),
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cecom.do';
    await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission - ${formData.fullName}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${formData.fullName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
        <p><strong>Submission ID:</strong> ${data.id}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit form' };
  }
}

// Send blog post notification to all subscribers
export async function sendBlogNotification(blogPost: {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
}): Promise<{ success: boolean; sent: number; errors: number }> {
  try {
    console.log('📧 Sending blog notification:', blogPost.title);
    
    // Get all active subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, locale')
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching subscribers:', error);
      return { success: false, sent: 0, errors: 1 };
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('📭 No active subscribers found');
      return { success: true, sent: 0, errors: 0 };
    }

    console.log(`📧 Sending to ${subscribers.length} subscribers`);

    const template = emailTemplates.blog_notification;
    let sent = 0;
    let errors = 0;

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        const locale = (subscriber.locale as 'en' | 'es') || 'es';
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
        
        const result = await sendEmail({
          to: subscriber.email,
          subject: template.subject[locale](blogPost.title),
          html: template.html[locale](
            blogPost.title,
            blogPost.excerpt,
            blogPost.slug,
            blogPost.featuredImage || '',
            unsubscribeUrl
          ),
        });

        if (result.success) {
          sent++;
        } else {
          errors++;
          console.error(`❌ Failed to send to ${subscriber.email}:`, result.error);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error sending to ${subscriber.email}:`, error);
      }
    }

    console.log(`✅ Blog notification complete: ${sent} sent, ${errors} errors`);
    return { success: true, sent, errors };
  } catch (error) {
    console.error('❌ Error in sendBlogNotification:', error);
    return { success: false, sent: 0, errors: 1 };
  }
}