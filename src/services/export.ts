import { RouteInfo } from '../types';

export function exportToGPX(route: RouteInfo, fileName: string = 'route.gpx') {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BikeRoute Navigator" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${fileName}</name>
    <desc>Велосипедный маршрут, созданный в BikeRoute Navigator</desc>
  </metadata>
  <trk>
    <name>${fileName}</name>
    <trkseg>`;

  const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`;

  const trkpts = route.points.map((pt, i) => {
    const elev = route.elevationProfile[i]?.elevation || 0;
    return `      <trkpt lat="${pt[0]}" lon="${pt[1]}">
        <ele>${elev}</ele>
      </trkpt>`;
  }).join('\n');

  const gpxContent = gpxHeader + '\n' + trkpts + gpxFooter;
  
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
