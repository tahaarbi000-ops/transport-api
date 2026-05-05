import { NextResponse } from 'next/server';
import data from '../../../../data/transport.json';

/**
 * GET /api/lignes
 * Returns all unique bus lines with their route names and stop count
 */
export async function GET() {
  try {
    const lignesMap = {};

    for (const record of data) {
      const key = record.Ligne;
      if (!lignesMap[key]) {
        lignesMap[key] = {
          ligne: record.Ligne,
          nom: record.Nom,
          route: record.Route,
          nb_arrets: 0,
          premier_arret: record.Station,
          dernier_arret: record.Station,
          jours: []
        };
      }
      lignesMap[key].nb_arrets++;
      lignesMap[key].dernier_arret = record.Station;
    }

    // Add operating days for each line
    for (const record of data) {
      const ligne = lignesMap[record.Ligne];
      const jours = [];
      if (record.Lundi === '*')    jours.push('Lundi');
      if (record.Mardi === '*')    jours.push('Mardi');
      if (record.Mercredi === '*') jours.push('Mercredi');
      if (record.Jeudi === '*')    jours.push('Jeudi');
      if (record.vendredi === '*') jours.push('Vendredi');
      if (record.samedi === '*')   jours.push('Samedi');
      if (record.Dimanche === '*') jours.push('Dimanche');
      if (ligne.jours.length === 0) ligne.jours = jours;
    }

    const lignes = Object.values(lignesMap).sort((a, b) =>
      parseInt(a.ligne) - parseInt(b.ligne)
    );

    return NextResponse.json({
      success: true,
      total: lignes.length,
      data: lignes
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
