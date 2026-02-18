import { NextResponse } from 'next/server';
import { getToursFromFareHarbor } from '@/lib/data/tours';

// This is the "Engine Room" that runs once a day
export async function GET() {
  try {
    const allTours = await getToursFromFareHarbor();
    
    // We'll return the data to be cached by Vercel's Edge Network
    return NextResponse.json({ 
      success: true, 
      lastUpdated: new Date().toISOString(),
      count: allTours.length,
      tours: allTours 
    }, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate' 
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Aggregation Failed" }, { status: 500 });
  }
}
