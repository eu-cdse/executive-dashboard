import { useMemo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import * as d3 from 'd3';
import { computedStyle } from '@/common/getChartStyles';
import { useAniStore } from '@/store';
import { formatValue } from '@/functions';

const COLLECTION_ABBR_TO_NAME = {
  Others: 'Others (CCM/CLMS)',
  S1: 'Sentinel-1',
  S2: 'Sentinel-2',
  S3: 'Sentinel-3',
  S5P: 'Sentinel-5P',
};
const DESIRED_ORDER = [
  'Sentinel-1',
  'Sentinel-2',
  'Sentinel-3',
  'Sentinel-5P',
  'Others (CCM/CLMS)',
];

interface Props {
  data: any;
  activeMetric: string;
  dataTypes: any[];
  biggerCircle?: boolean;
  isCanadaMap?: boolean;
}

const CircleMarkers: React.FC<Props> = ({
  data,
  activeMetric,
  dataTypes,
  biggerCircle,
  isCanadaMap,
}) => {
  const theme = useAniStore((s) => s.theme);
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

  const cols =
    theme === 'dark'
      ? { f: '#0dd6b8', s: '#0a6356' }
      : { f: '#85a1c9', s: '#0C4393' };
  const colorScale = d3
    .scaleSequential()
    .domain(totalUsersRange)
    .interpolator(d3.interpolateRgb(cols.f, cols.s));

  let range = biggerCircle ? [25, 47] : [20, 38];

  const sizeScale = d3.scaleLinear().domain(totalUsersRange).range(range); // modify this range as needed

  if (data.features.length === 0 || !data.features[0]) {
    return null;
  }

  return data.features.map((feat, i) => {
    const totalUsers = activeMetric
      ? feat.properties[activeMetric]?.value
      : true;

    // If there's no data, return null and don't create a circle
    if (dataTypes.every((dt) => !feat.properties[dt.name])) {
      return null;
    }

    if (totalUsers === undefined || totalUsers === null) {
      return null;
    }

    let col = computedStyle('--csmain2');

    const markerOptions = {
      color: col,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      zIndex: 1000,
      radius: 20,
      fillColor: col,
    };

    if (activeMetric !== null) {
      const totalUsersTmp = feat.properties[activeMetric]?.value || 0;

      if (totalUsersTmp !== undefined) {
        col = colorScale(totalUsersTmp);
        markerOptions.radius = sizeScale(totalUsersTmp);
        markerOptions.fillColor = col;
        markerOptions.color = col;
      }
    }

    const label = Object.keys(feat.properties).map(
      (k) => feat.properties[k]
    )[0];
    const tooltipInfo = dataTypes
      .map((dt) => {
        if (dt.name === 'Missions accessed') {
          const totalVal =
            feat.properties['Number of active users']?.value || 0;

          if (feat.properties[dt.name]?.value === undefined) {
            return null;
          }

          const tmpDetailedPerCountry = dt.graphs.detailed[label] ?? [];
          const detailedPerCountry = tmpDetailedPerCountry.filter(
            (dpc) =>
              !dpc.product.includes('CCM') && !dpc.product.includes('CLMS')
          );
          const detailedPerCountryOthers = tmpDetailedPerCountry.filter(
            (dpc) => dpc.product.includes('CCM') || dpc.product.includes('CLMS')
          );
          const othersValue = detailedPerCountryOthers.reduce(
            (acc, curr) => acc + curr.value,
            0
          );
          detailedPerCountry.push({
            product: 'Others',
            value: othersValue,
          });

          const tooltips = [
            {
              name: `Missions accessed${dt.selectedPeriod !== null ? ` (last ${dt.selectedPeriod.split('d')[0]} days)*` : ''}`,
              value: 0,
              unit: dt.unit,
              onlyName: false,
            },
          ];

          detailedPerCountry.forEach((dpc) => {
            const percentage = (dpc.value / totalVal) * 100;
            tooltips.push({
              name: `- ${COLLECTION_ABBR_TO_NAME[dpc.product.split(' ').at(-1)]}`,
              value: percentage,
              unit: '%',
              onlyName: false,
            });
          });

          tooltips.sort((a, b) => {
            const aIndex = DESIRED_ORDER.indexOf(a.name.replace('- ', ''));
            const bIndex = DESIRED_ORDER.indexOf(b.name.replace('- ', ''));
            return aIndex - bIndex;
          });

          tooltips.push({ name: '', value: null, unit: '', onlyName: true }); // Spacer
          tooltips.push({
            name: '*Percentage of active users downloading',
            value: null,
            unit: '',
            onlyName: true,
          });
          tooltips.push({
            name: 'data from the specific mission.',
            value: null,
            unit: '',
            onlyName: true,
          });

          return tooltips;
        }

        return {
          name: `${dt.name}${dt.selectedPeriod !== null ? ` (last ${dt.selectedPeriod.split('d')[0]} days)` : ''}`,
          value: feat.properties[dt.name]?.value,
          unit: dt.unit,
          onlyName: false,
        };
      })
      .flatMap((d) => d)
      .filter((d) => d !== null);

    return (
      <CircleMarker
        {...markerOptions}
        center={[
          feat?.geometry?.coordinates[1],
          feat?.geometry?.coordinates[0],
        ]}
        key={i}
      >
        <Tooltip
          direction={isCanadaMap ? 'bottom' : 'top'}
          permanent={false}
          opacity={100}
        >
          <div style={{ zIndex: 9999 }}>
            <div className="text-[20px] text-smain2 font-medium">{label}</div>
            {tooltipInfo.map((d, i) => (
              <div key={i + 'adw'}>
                <span className="text-smain2 mr-1 text-xs">
                  {d.onlyName ? d.name : `${d.name}:`}
                </span>
                {!d.onlyName && (
                  <span className="text-black text-smain2 font-bold">
                    {formatValue(d.value, d.unit, undefined, 0)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Tooltip>
      </CircleMarker>
    );
  });
};

export default CircleMarkers;
