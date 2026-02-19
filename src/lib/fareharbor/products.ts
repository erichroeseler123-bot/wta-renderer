export type FHProduct = {
  slug: string;          // your site slug
  company: string;       // fareharbor company shortname
  itemPk: number;        // fareharbor item pk
  title: string;
};

export const FH_PRODUCTS: FHProduct[] = [
  // TODO: fill these in with REAL item PKs
  // Example:
  // { slug: "whale-watching-juneau", company: "juneauadventuretours", itemPk: 123456, title: "Juneau Whale Watching" },
];
