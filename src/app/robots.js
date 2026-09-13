export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elevara.ai';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register', '/dashboard/help'],
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
