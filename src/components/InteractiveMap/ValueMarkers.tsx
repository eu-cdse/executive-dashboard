import L from 'leaflet';
import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import * as d3 from 'd3';
import { formatValue } from '@/functions';

interface Props {
  data: any;
  activeMetric: string;
  biggerFont?: boolean;
}

const ValueMarkers: React.FC<Props> = ({ data, activeMetric, biggerFont }) => {
  const totalUsersRange = useMemo(() => {
    let minUsers = Infinity;
    let maxUsers = -Infinity;

    if (activeMetric !== null) {
      data.features.forEach((feature) => {
        const totalUsers = feature?.properties[activeMetric]?.value;

        if (totalUsers !== undefined) {
          minUsers = Math.min(minUsers, totalUsers);
          maxUsers = Math.max(maxUsers, totalUsers);
        }
      });
    }

    if (minUsers === Infinity || maxUsers === -Infinity) {
      // Fallback range if activeMetric is null or doesn't match any feature properties
      return [0, 1];
    } else {
      return [minUsers, maxUsers];
    }
  }, [data, activeMetric]);

  const range = biggerFont ? [12, 18] : [8, 16];
  const sizeScale = d3.scaleLinear().domain(totalUsersRange).range(range); // modify this range as needed

  const icon = (value, unit) => {
    let size = sizeScale(value);
    const markerHtmlStyles = `
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    width:60px;
    text-align:center;
    font-weight:bold;
    font-size: ${size}px;
    pointer-events: none;
  `;

    return L.divIcon({
      className: 'my-custom-pin',
      iconAnchor: [30, size - 3],
      popupAnchor: [0, 0],
      html: `<span style="${markerHtmlStyles}">${formatValue(
        value,
        unit || ''
      )}</span>`,
    });
  };

  return (
    <>
      {data?.features.map((feature, i) => {
        const latLng = {
          lat: feature?.geometry?.coordinates[1] || 0,
          lng: feature?.geometry?.coordinates[0] || 0,
        };
        if (!latLng.lat || !latLng.lng) return null;
        let val = feature.properties[activeMetric]?.value || '';
        let unit = feature.properties[activeMetric]?.unit || '';

        return <Marker position={latLng} icon={icon(val, unit)} key={i} />;
      })}
    </>
  );
};
export default ValueMarkers;
