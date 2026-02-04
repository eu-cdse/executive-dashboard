import { MetricInfo } from '@/store';

export const DATA_PUBLISHED = 'data-published' as const;
export const DATA_ACCESSED = 'data-accessed' as const;
export const ON_DEMAND = 'on-demand' as const;
export const STREAMLINED_DATA = 'streamlined-data' as const;
export const SUPPORT_SERVICES = 'support-services' as const;
export const SENTINEL_HUB = 'sentinel-hub' as const;
export const OPENEO = 'openeo' as const;
export const USERS_ENGAGEMENT = 'user-engagement' as const;
export const MISSION_SNAPSHOT = 'mission-snapshot' as const;
export const TRACEABILITY = 'traceability' as const;
export const RANDOM = 'random' as const;

export type DataRoutes =
  | typeof DATA_PUBLISHED
  | typeof DATA_ACCESSED
  | typeof ON_DEMAND
  | typeof STREAMLINED_DATA
  | typeof SUPPORT_SERVICES
  | typeof SENTINEL_HUB
  | typeof OPENEO
  | typeof USERS_ENGAGEMENT;

export interface MetricsGroups {
  id: string;
  route?: DataRoutes;
  json: MetricInfo[];
  panel?: React.FC;
  customs?: (() => JSX.Element)[];
}

export const initialMetricsGroups: MetricsGroups[] = [
  {
    id: DATA_PUBLISHED,
    json: [],
  },
  {
    id: DATA_ACCESSED,
    json: [],
  },
  {
    id: ON_DEMAND,
    json: [],
  },
  {
    id: STREAMLINED_DATA,
    json: [],
  },
  {
    id: OPENEO,
    json: [],
  },
  {
    id: USERS_ENGAGEMENT,
    json: [],
  },
  {
    id: TRACEABILITY,
    json: [],
  },
  {
    id: RANDOM,
    json: [],
  },
  {
    id: MISSION_SNAPSHOT,
    json: [],
  },
];

export const responsiveSizes = {
  bigscreen: 1564,
  tabel: 1024,
};

export const windowsSizes = {
  tabelM: 1550,
  tabelS: 1350,
  tablet: 1123,
  phone: 730,
  gPhone: 660,
  gMini: 570,
};

export const chartColors = [
  '--chartcol1',
  '--chartcol2',
  '--chartcol3',
  '--chartcol4',
  '--chartcol5',
  '--chartcol6',
  '--chartcol7',
  '--chartcol8',
  '--chartcol9',
  '--chartcol10',
  '--chartcol11',
  '--chartcol12',
  '--chartcol13',
  '--chartcol14',
  '--chartcol15',
  '--chartcol16',
  '--chartcol17',
  '--chartcol18',
  '--chartcol19',
  '--chartcol20',
];

export const NEWS_URL = 'https://dataspace.copernicus.eu/news-overview.html';
export const BASE_COPERNICUS_URL = 'https://dataspace.copernicus.eu/';

export const BASE_CLOUDFERRO =
  'https://s3.waw3-1.cloudferro.com/swift/v1/cdse-dashboards';

export const LIST_TYPE = 'list';
export const NUMBER_TYPE = 'number';
export const BOOL_TYPE = 'boolean';
export const SERVICE_TYPE = 'service';

export const APP_VERSION = '2.3';

export const maps = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
  light:
    'https://gisco-services.ec.europa.eu/maps/tiles/OSMPositronBackground/EPSG3857/{z}/{x}/{y}.png',
};

export const MAPS_DISCLAIMER = `The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the European Union concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries. Kosovo*: This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence. Palestine*: This designation shall not be construed as recognition of a State of Palestine and is without prejudice to the individual positions of the Member States on this issue.`;

export const AVAILABILITY_COUNT_WARNING_THRESHOLD = 28;
