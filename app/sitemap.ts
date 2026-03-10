import { MetadataRoute } from 'next';
import { getToursFromFareHarbor, type Tour } from '@/lib/data/tours';
import { guides } from '@/lib/content/guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://welcometoalaskatours.com';

  // Fetch all 125 live tours from 21 operators
  const tours: Tour[] = await getToursFromFareHarbor();

  const tourUrls = tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.fareharbor.company}/${tour.pk}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));
  const guideUrls = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...guideUrls,
    ...tourUrls,
  ];
}
