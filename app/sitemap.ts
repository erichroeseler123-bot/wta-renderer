import { MetadataRoute } from 'next';
import { getToursFromFareHarbor } from '@/lib/data/tours';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://welcometoalaskatours.com';

  // Fetch all 125 live tours from 21 operators
  const tours: any[] = await getToursFromFareHarbor();

  const tourUrls = tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.fareharbor.company}/${tour.pk}`,
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
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...tourUrls,
  ];
}
