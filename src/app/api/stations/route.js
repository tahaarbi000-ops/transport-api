import { NextResponse } from 'next/server';
import data from '../../../../data/transport.json';

/**
 * GET /api/stations
 * Returns all unique stations
 * Query params:
 *   - q : search by station name
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toUpperCase();

    // Get unique stations with lines passing through
    const stationsMap = {};

    for (const record of data) {
      const key = record.Station;
      if (!stationsMap[key]) {
        stationsMap[key] = {
          station: record.Station,
          lignes: []
        };
      }
      if (!stationsMap[key].lignes.includes(record.Ligne)) {
        stationsMap[key].lignes.push(record.Ligne);
      }
    }

    let stations = Object.values(stationsMap).sort((a, b) =>
      a.station.localeCompare(b.station)
    );

    if (q) {
      stations = stations.filter(s => s.station.includes(q));
    }

    return NextResponse.json({
      success: true,
      total: stations.length,
      data: stations
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
