interface CLItem {
  key: string;
  name: string;
  description?: string;
  mission?: string;
  type?: string;
  provider?: string;
}

export interface MetricRaw {
  [key: string]: CLItem;
}
export interface MetricArray {
  [key: string]: CLItem;
}

export interface CodelistRaw {
  [key: string]: CLItem[];
}

export interface Codelist {
  [key: string]: MetricRaw;
}

export function getCodeList(codelist?): Codelist {
  let nl = {};
  Object.keys(codelist).forEach((cl: keyof typeof codelist) => {
    codelist[cl].forEach((obj) => {
      if (!obj || !obj.key) return;
      if (!nl[cl]) nl[cl] = {};
      let k = obj.key.toString().toLowerCase().replace(' ', '_');
      nl[cl][k] = {
        ...obj,
      };
    });
  });
  return nl;
}

export interface SortedItemValue {
  product: string;
  value: number;
  timestamp: number;
}

export interface SortedCDASResponse {
  [key: string]: {
    values: SortedItemValue[];
    missing_dates: number[];
  };
}

export interface CDASResponse {
  metrics: CDASResponseMetric[];
  status: string;
}

interface CDASResponseMetric {
  metric: string;
  values: SortedItemValue[];
  missing_dates: number[];
  missing_dates_str: string[];
}

export function getSortedData(data?: CDASResponse): SortedCDASResponse {
  let sortedData = {} as SortedCDASResponse;
  data.metrics.forEach((m) => {
    sortedData[m.metric] = {} as CDASResponseMetric;
    sortedData[m.metric].values = m.values;
    sortedData[m.metric].missing_dates = m.missing_dates;
  });
  return sortedData;
}

type TimeInterval = '1h' | '2h' | '12h' | '1d';
export const TIMELINESS_PRODUCT_TO_TIME_INTERVAL: Record<string, TimeInterval> =
  {
    s1_nrt: '1h',
    s1_ntc: '1h',
    s2_ntc: '1h',
    s3_olci_nrt: '1h',
    s3_slstr_nrt: '1h',
    s3_sral_nrt: '1h',
    s5p_l2_nrt: '1h',
    s5p_l1b_ntc: '1h',
    s3_olci_ntc: '1h',
    s3_slstr_ntc: '1h',
    s3_sral_stc: '1h',
    s3_synergy_stc: '2h',
    s3_sral_ntc: '12h',
    s3_synergy_ntc: '1d',
    s5p_l2_ntc: '1d',
  };

export const DESIRED_PRODUCT_ORDER_FOR_MISSIONS = {
  'Sentinel-1': [
    'RAW',
    'GRD',
    'SLC',
    'OCN',
    'OBS',
    'ETA',
    'AUX',
    'CARD',
    'ENG',
  ],
  'Sentinel-2': ['L0', 'L1A', 'L1B', 'L1C', 'L2A', 'AUX', 'ENG'],
  'Sentinel-3': [
    'OLCI',
    'SLSTR',
    'SRAL',
    'SYNERGY',
    'MWR',
    'POD',
    'AUX',
    'Telemetry Data',
    'ENG',
  ],
  'Sentinel-5P': [
    'L2 NPP CLOUD',
    'L2 O3_PR',
    'L2 O3_TCL',
    'L2 HCHO',
    'L2 CLOUD',
    'L1B',
    'L1B RA',
    'L1B IR',
    'L2 AER_LH',
    'L2 NO2',
    'L2 CO',
    'L2 AER_AI',
    'L2 O3',
    'L2 SO2',
    'L2 CH4',
    'L2 AER',
    'L2 FRESCO',
    'AUX',
    'ENG',
  ],
  CCM: ['OPTICAL', 'DEM', 'SAR'],
};
