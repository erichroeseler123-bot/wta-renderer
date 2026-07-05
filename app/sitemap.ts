import { MetadataRoute } from 'next';
import { getHelicopterTours } from '@/lib/helicopterTours';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://welcometoalaskatours.com';
  
  let tours: any[] = [];
  try {
    tours = await getHelicopterTours();
  } catch (e) {
    console.error("Failed to load helicopter tours for sitemap", e);
  }

  const tourUrls = tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.company}/${tour.pk}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const approvedPorts = [
    "juneau",
    "skagway",
    "ketchikan",
    "sitka",
    "icy-strait-point",
    "haines",
    "seward",
    "whittier"
  ];

  const approvedCategories = [
    "juneau-helicopter-tours",
    "glacier-tours",
    "dog-sledding",
    "whale-watching",
    "mendenhall-glacier",
    "flightseeing"
  ];

  const categoryUrls = approvedCategories.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const approvedGuides = [
    "how-long-does-it-take-to-get-off-the-ship-in-juneau",
    "how-long-does-it-take-to-get-off-the-ship-in-skagway",
    "how-long-does-it-take-to-get-off-the-ship-in-ketchikan",
    "how-long-does-it-take-to-get-off-the-ship-in-sitka",
    "how-long-does-it-take-to-get-off-the-ship-in-icy-strait-point",
    "how-long-does-it-take-to-get-off-the-ship-in-haines"
  ];

  const guideUrls = approvedGuides.map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const portUrls = approvedPorts.map((slug) => ({
    url: `${baseUrl}/ports/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ports`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...portUrls,
    ...categoryUrls,
    ...guideUrls,
    ...tourUrls,
  ];
}
