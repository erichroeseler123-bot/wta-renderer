import { MetadataRoute } from 'next';
import { getHelicopterTours } from '@/lib/helicopterTours';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://welcometoalaskatours.com';
  const tours = await getHelicopterTours();

  const tourUrls = tours
    .map((tour) => ({
      url: `${baseUrl}/tours/${tour.company}/${tour.pk}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
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
    ...tourUrls,
  ];
}
