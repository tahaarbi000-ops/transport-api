import { NextResponse } from 'next/server';
import data from '../../../../data/transport.json';

/**
 * GET /api/horaires
 * Find schedules between two stations
 * Query params:
 *   - depart  : departure station name (required)
 *   - arrivee : arrival station name (required)
 *   - jour    : day filter (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const depart  = searchParams.get('depart')?.toUpperCase();
    const arrivee = searchParams.get('arrivee')?.toUpperCase();
    const jour    = searchParams.get('jour')?.toLowerCase();

    if (!depart || !arrivee) {
      return NextResponse.json({
        success: false,
        error: 'Les paramètres "depart" et "arrivee" sont requis'
      }, { status: 400 });
    }

    const jourMap = {
      lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
      jeudi: 'Jeudi', vendredi: 'vendredi', samedi: 'samedi', dimanche: 'Dimanche'
    };

    // Group records by ligne
    const lignesMap = {};
    for (const record of data) {
      if (!lignesMap[record.Ligne]) lignesMap[record.Ligne] = [];
      lignesMap[record.Ligne].push(record);
    }

    const results = [];

    for (const [ligne, arrets] of Object.entries(lignesMap)) {
      // Sort by arret number
      const sorted = arrets.sort((a, b) => parseInt(a.Arret) - parseInt(b.Arret));

      const departIdx  = sorted.findIndex(a => a.Station.toUpperCase().includes(depart));
      const arriveeIdx = sorted.findIndex(a => a.Station.toUpperCase().includes(arrivee));

      if (departIdx !== -1 && arriveeIdx !== -1) {
        const departRecord  = sorted[departIdx];
        const arriveeRecord = sorted[arriveeIdx];

        // Check day filter
        if (jour && jourMap[jour]) {
          if (departRecord[jourMap[jour]] !== '*') continue;
        }

        const direction = departIdx < arriveeIdx ? 'aller' : 'retour';

        results.push({
          ligne: departRecord.Ligne,
          nom: departRecord.Nom,
          route: departRecord.Route,
          depart: {
            station: departRecord.Station,
            heure: direction === 'aller' ? departRecord.Aller : departRecord.Retour
          },
          arrivee: {
            station: arriveeRecord.Station,
            heure: direction === 'aller' ? arriveeRecord.Aller : arriveeRecord.Retour
          },
          direction,
          jours: {
            lundi:    departRecord.Lundi === '*',
            mardi:    departRecord.Mardi === '*',
            mercredi: departRecord.Mercredi === '*',
            jeudi:    departRecord.Jeudi === '*',
            vendredi: departRecord.vendredi === '*',
            samedi:   departRecord.samedi === '*',
            dimanche: departRecord.Dimanche === '*'
          }
        });
      }
    }

    // Sort by departure time
    results.sort((a, b) => a.depart.heure?.localeCompare(b.depart.heure));

    return NextResponse.json({
      success: true,
      depart,
      arrivee,
      total: results.length,
      data: results
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
