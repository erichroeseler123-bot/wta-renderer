import { NextResponse } from 'next/server';

export async function GET() {
  const companies = [
    'beyondak', 'alaska-galore-juneau-whale-watching', 'akhummer', 
    'alaskatales', 'aktraveladventures', 'exclusivealaska', 
    'coastalhelicopters', 'dolphintours', 'moorecharters', 
    'alaskarainforest', 'ketchikanadventurevue', 'akduck', 
    'northstartrekking', 'kayakketchikan', 'skagwayscooters', 
    'snorkelalaska', 'taquanair', 'temsco-summercamp-juneau', 
    'temscoair-juneau', 'temscoair-skagway', 'wingsairways'
  ];

  const appKey = process.env.FAREHARBOR_APP_KEY;
  const userKey = process.env.FAREHARBOR_USER_KEY;

  let allTours: any[] = [];

  for (const shortname of companies) {
    try {
      const response = await fetch(`https://fareharbor.com/api/external/v1/companies/${shortname}/items/`, {
        headers: {
          'X-FareHarbor-API-App': appKey || '',
          'X-FareHarbor-API-Key': userKey || '',
        },
        next: { revalidate: 0 } 
      });
      const data = await response.json();
      if (data.items) {
        const itemsWithPort = data.items.map((item: any) => ({ ...item, company: shortname }));
        allTours = [...allTours, ...itemsWithPort];
      }
    } catch (error) {
      console.error(`Error fetching ${shortname}:`, error);
    }
  }

  return NextResponse.json({ 
    count: allTours.length, 
    items: allTours 
  });
}
