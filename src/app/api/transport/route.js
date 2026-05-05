import { NextResponse } from 'next/server';
import data from '../../../../data/transport.json';

/**
 * GET /api/transport
 * 
 * Query params:
 *   - ligne       : filter by line number (e.g. ?ligne=100)
 *   - nom         : filter by route name (e.g. ?nom=TUNIS)
 *   - station     : filter by station name (e.g. ?station=SFAX)
 *   - route       : filter by route code (e.g. ?route=GP1)
 *   - jour        : filter by operating day (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)
 *   - prix_min    : filter by minimum price (e.g. ?prix_min=2.0)
 *   - prix_max    : filter by maximum price (e.g. ?prix_max=10.0)
 *   - limit       : max results (default 100, max 500)
 *   - offset      : pagination offset (default 0)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const ligne    = searchParams.get('ligne')?.toUpperCase();
    const nom      = searchParams.get('nom')?.toUpperCase();
    const station  = searchParams.get('station')?.toUpperCase();
    const route    = searchParams.get('route')?.toUpperCase();
    const jour     = searchParams.get('jour')?.toLowerCase();
    const prix_min = searchParams.get('prix_min') ? parseFloat(searchParams.get('prix_min')) : null;
    const prix_max = searchParams.get('prix_max') ? parseFloat(searchParams.get('prix_max')) : null;
    const limit    = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset   = parseInt(searchParams.get('offset') || '0');

    // Day mapping
    const jourMap = {
      lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
      jeudi: 'Jeudi', vendredi: 'vendredi', samedi: 'samedi', dimanche: 'Dimanche'
    };

    let results = data;

    if (ligne)    results = results.filter(r => r.Ligne === ligne);
    if (nom)      results = results.filter(r => r.Nom.toUpperCase().includes(nom));
    if (station)  results = results.filter(r => r.Station.toUpperCase().includes(station));
    if (route)    results = results.filter(r => r.Route.toUpperCase() === route);

    if (jour && jourMap[jour]) {
      results = results.filter(r => r[jourMap[jour]] === '*');
    }

    if (prix_min !== null) results = results.filter(r => (r.prix ?? 0) >= prix_min);
    if (prix_max !== null) results = results.filter(r => (r.prix ?? 0) <= prix_max);

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      total,
      limit,
      offset,
      count: paginated.length,
      data: paginated
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}