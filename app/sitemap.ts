import { MetadataRoute } from 'next';
import { getHelicopterTours } from '@/lib/helicopterTours';

const MONEY_PAGES = [
  'juneau/whale-watching',
  'juneau/mendenhall-glacier-tours',
  'juneau/helicopter-tours',
  'juneau/dog-sledding',
  'juneau/fishing',
  'juneau/gold-panning',
  'juneau/glacier-tours',
  'juneau/easy-shore-excursions',
  'juneau/private-tours',
  'ketchikan/bear-tours',
  'ketchikan/misty-fjords',
  'ketchikan/kayaking',
  'ketchikan/adventure-tours',
  'ketchikan/wildlife-tours',
  'ketchikan/easy-shore-excursions',
  'ketchikan/private-tours',
  'skagway/helicopter-tours',
  'skagway/gold-rush-tours',
  'skagway/dog-sledding',
  'skagway/adventure-tours',
  'skagway/easy-shore-excursions',
  'skagway/private-tours',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.welcometoalaskatours.com';

  let tours: any[] = [];
  try {
    tours = await getHelicopterTours();
  } catch (e) {
    console.error('Failed to load tours for sitemap', e);
  }

  const tourUrls = tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.company}/${tour.pk}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const approvedPorts = ['juneau', 'skagway', 'ketchikan'];
  const approvedCategories = ['juneau-helicopter-tours','glacier-tours','dog-sledding','whale-watching','mendenhall-glacier','flightseeing'];
  const approvedGuides = [
    'best-shore-excursions-in-juneau',
    'how-to-get-to-mendenhall-glacier-from-cruise-port',
    'juneau-whale-watching-vs-mendenhall',
    'best-things-to-do-in-skagway-4-6-hours',
    'first-time-in-ketchikan-shore-excursions',
    'how-much-do-alaska-shore-excursions-cost',
    'what-happens-if-my-alaska-tour-runs-late',
    'easy-alaska-shore-excursions',
    'private-premium-alaska-shore-excursions',
    'cruise-ship-vs-independent-alaska-excursions',
    'how-long-does-it-take-to-get-off-the-ship-in-juneau',
    'how-long-does-it-take-to-get-off-the-ship-in-skagway',
    'how-long-does-it-take-to-get-off-the-ship-in-ketchikan',
    'alaska-nature-by-cruise-port',
  ];
  const approvedShips = ['celebrity-edge','royal-princess','discovery-princess','norwegian-bliss','koningsdam'];

  const portUrls = approvedPorts.map((slug) => ({ url: `${baseUrl}/ports/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 }));
  const moneyPageUrls = MONEY_PAGES.map((slug) => ({ url: `${baseUrl}/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 }));
  const categoryUrls = approvedCategories.map((slug) => ({ url: `${baseUrl}/categories/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 }));
  const guideUrls = approvedGuides.map((slug) => ({ url: `${baseUrl}/guides/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }));
  const shipUrls = approvedShips.map((slug) => ({ url: `${baseUrl}/ships/${slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }));

  const corePages = [
    ['', 'weekly', 1],
    ['/tours', 'weekly', 0.8],
    ['/ports', 'weekly', 0.9],
    ['/guides', 'weekly', 0.6],
    ['/ships', 'weekly', 0.6],
    ['/about', 'monthly', 0.5],
    ['/contact-us', 'monthly', 0.5],
    ['/privacy', 'yearly', 0.3],
    ['/terms', 'yearly', 0.3],
  ] as const;

  return [
    ...corePages.map(([path, changeFrequency, priority]) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency, priority })),
    ...portUrls,
    ...moneyPageUrls,
    ...categoryUrls,
    ...guideUrls,
    ...shipUrls,
    ...tourUrls,
  ];
}
