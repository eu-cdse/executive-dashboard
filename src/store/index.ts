import {
  getCodeList,
  Codelist,
  getSortedData,
  parseXML,
  getLatestNews,
} from '@/functions';
import { create } from 'zustand';
import { Processor } from '@/functions/process/processor';
import { BASE_CLOUDFERRO } from '@/common/constants';
import moment from 'moment';

export interface MetricTooltipInfo {
  type?: string;
  label: string;
  text: string;
  order?: number;
  metric?: string;
  color?: string;
  timestamp?: number;
  isObject?: boolean;
}

interface MetricPropsInfo {
  detailedGroup?: string; // Sets detailed group for metric on map on UserEngagement page
  onlyTimeline?: boolean; // Display only timeline widget for metric
  unit?: string; // Set the unit for the metric value (% | B | time)
  order?: number;
  dontgroup?: boolean; // This prevents graphs from grouping products intro groups (S1, S2, S3, S5P etc.)
  group?: string; // This is used for grouping metrics in the same group in Service Health
  decimals?: number; // Set the number of decimals for the value
  isProvided?: boolean; // Set if metric should be provided or not (This was used in AlertTooltip component / not used anymore)
  timelineLabel?: string; // Set the label for the metric that display only timeline
  lockTimeline?: boolean; // Prevents user from changing the timeline
  calcOperation?: string; // Sets calculation operation for metric, instead of only summing values it can also calculate average, min, max, etc. (only avergae is implemented for now)
  isTimelinessHistogram?: boolean;
}

export interface MetricInfo {
  id: string;
  label: string; // Metric label
  conditions: string[] | { [key: string]: string[] }; // Metrics keys
  type: string; // Metric type (array, list, number), this is not really used anymore except for list type
  defaultValue?: string; // Default value for metric (7d or 30d)
  codelist?: string; // Codelist used for metric
  codelist_key?: string; // Codelist key used for metric (some codelists use "type" as key, some use "mission")
  codelist_group?: string; // This is used for grouping values from codelist in the same group (e.g. S1, S2, S3)
  codelist_subgroup?: string; // This is used for filtering values from codelist in the same group
  codelist_reduce?: string[]; // Select groups from codelist that should be included (e.g. [S1, S3])
  codelist_reverse_reduce?: boolean; // If true select group from codelist that should be excluded (e.g. [S1, S3])
  tooltip?: MetricTooltipInfo[]; // Tooltip info for metric
  props?: MetricPropsInfo;
  productKey?: string;
  sumConditionsTimelines?: boolean;
}

export interface MousePos {
  x: number;
  y: number;
}

interface ToolTipStore {
  active: boolean;
  data: React.ReactNode | string | null;
  delay: number;
  timeout: any;
  setData: (data: any) => void;
  setToolTip: (state: boolean) => void;
  setTimeout2: (state: any) => void;
}

export const useTooltipStore = create<ToolTipStore>((set, _) => ({
  active: false,
  data: null,
  delay: 1,
  timeout: null,
  setData: (state) => set({ data: state.data, delay: state.delay }),
  setToolTip: (state) => set({ active: state }),
  setTimeout2: (state) => set({ timeout: state }),
}));

interface FixedToolTipStore {
  active: boolean;
  data: React.ReactNode | string | null;
  elRef: React.MutableRefObject<any>;
  setData: (data: any) => void;
  setToolTip: (state: boolean) => void;
}

export const useFixedTooltipStore = create<FixedToolTipStore>((set, _) => ({
  active: false,
  data: null,
  elRef: null,
  setData: (state) => set({ data: state.data, elRef: state.elRef }),
  setToolTip: (state) => set({ active: state }),
}));

interface PopupStore {
  showPopup: boolean;
  component: React.ReactNode | string | null;
  data: {
    title: string;
    wrapperRef: React.MutableRefObject<any>;
    id: string;
  };
  setData: (data: any) => void;
  setPopupVisibility: (state: boolean) => void;
}

export const usePopupStore = create<PopupStore>((set, _) => ({
  showPopup: false,
  component: null,
  data: null,
  elRef: null,
  setData: (state) => set({ component: state.component, data: state.data }),
  setPopupVisibility: (state) => set({ showPopup: state }),
}));

interface AnimationStore {
  aniNewsHeader: boolean;
  scroll: boolean;
  header: boolean;
  serviceHealth: boolean;
  currRoute: string;
  noBtnAni: boolean;
  theme: string;
  openAni: boolean;
  setOpenAni: (s: boolean) => void;
  setCurrRoute: (s: string) => void;
  setAniNewsHeader: (s: boolean) => void;
  setScroll: (s: boolean) => void;
  setHeader: (s: boolean) => void;
  setServiceHealth: (s: boolean) => void;
  setNoBtnAni: (s: boolean) => void;
  setTheme: (s: string) => void;
}

export const useAniStore = create<AnimationStore>((set, _) => ({
  aniNewsHeader: true,
  header: true,
  scroll: true,
  serviceHealth: true,
  currRoute: '/' + window.location.href.split('/').pop(),
  noBtnAni: false,
  openAni: true,
  theme: localStorage.getItem('isDark')
    ? parseInt(localStorage.getItem('isDark'))
      ? 'dark'
      : 'light'
    : 'light',
  setOpenAni: (state) => {
    set({ openAni: state });
  },
  setTheme: (state) => {
    set({ theme: state });
  },
  setAniNewsHeader: (state) => {
    set({ aniNewsHeader: state });
  },
  setScroll: (state) => {
    set({ scroll: state });
  },
  setHeader: (state) => {
    set({ header: state });
  },
  setServiceHealth: (state) => {
    set({ serviceHealth: state });
  },
  setCurrRoute: (state) => {
    set({ currRoute: state });
  },
  setNoBtnAni: (state) => {
    set({ noBtnAni: state });
  },
}));

export interface News {
  top?: string;
  title: string;
  pubDate: string;
  description?: string;
  link: string;
  new?: boolean;
}

interface NewsStore {
  modalOpen: boolean;
  newsCount: number;
  news: News[];
  error: boolean;
  fetchNews: () => void;
  setModalOpen: () => void;
  setViewedNews: () => void;
  setOpenedNews: () => void;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  modalOpen: false,
  news: [],
  error: false,
  newsCount: 5,
  fetchNews: async () => {
    let xml = null;
    try {
      let res = await fetch(`https://dataspace.copernicus.eu/rss.xml`, {
        cache: 'no-cache',
      });
      xml = await res.text();
    } catch (err) {
      console.log(err);
    }
    if (!xml) return;
    let parsedNews = parseXML(xml);
    set({ news: getLatestNews(parsedNews, get().newsCount) });
  },
  setViewedNews: () => {
    let viewedNews = get().news.map((n) => ({ ...n, new: false }));
    set({ news: viewedNews });
    get().setOpenedNews();
  },
  setOpenedNews: () => {
    localStorage.setItem('latestNews', JSON.stringify(get().news));
  },
  setModalOpen: () => {
    set({ modalOpen: !get().modalOpen });
  },
}));

export interface DataStore {
  cls: {
    codelist: Codelist;
    codelistRaw: any;
  };
  data: Processor;
  statusChecker: Processor;
  loading: boolean;
  interval: ReturnType<typeof setInterval> | null;
  refreshed: string | null;
  showOverview: boolean;
  firstTimeOverlay: boolean;
  layoutRef: React.MutableRefObject<HTMLDivElement> | null;
  metricStatus: {
    group: string;
    values: { [key: string]: { [key: string]: string } }[];
  }[];
  tempData: boolean;
  setTempData: (state: boolean) => void;
  setLayoutRef: (state: React.MutableRefObject<HTMLDivElement>) => void;
  setCodelists: (codelistRaw?: any) => void;
  initializeData: () => void;
  cancelInterval: () => void;
  startInterval: () => void;
  setShowOverview: (state: { show: boolean; showAgain: boolean }) => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  cls: null,
  data: null,
  loading: true,
  interval: null,
  refreshed: null,
  showOverview: false,
  firstTimeOverlay: true,
  layoutRef: null,
  metricStatus: [],
  statusChecker: null,
  tempData: localStorage.getItem('isTemp') === 'true' ? true : false,

  setLayoutRef: (layoutRef) => set({ layoutRef }),
  setShowOverview: (state: { show: boolean; showAgain: boolean }) => {
    set({ showOverview: state.show });
    localStorage.setItem('overview', state.showAgain.toString());
  },
  setCodelists: async (codelistRaw: any) => {
    set({ cls: { codelist: getCodeList(codelistRaw), codelistRaw } });
  },
  setTempData: (state: boolean) => {
    localStorage.setItem('isTemp', state.toString());
    get().initializeData();
  },
  initializeData: async () => {
    // Set auto refresh
    if (!localStorage.getItem('refresh')) localStorage.setItem('refresh', '1');

    // Fetch news
    useNewsStore.getState().fetchNews();

    // Check if overview should be shown
    let overview = localStorage.getItem('overview');
    if ((!overview || overview === 'true') && get().firstTimeOverlay) {
      set({ firstTimeOverlay: false });
      set({ showOverview: true });
    }

    // Check and set color palette
    let colMode = localStorage.getItem('isDark')
      ? parseInt(localStorage.getItem('isDark'))
      : 0;
    if (colMode) document.documentElement.setAttribute('data-theme', 'dark');

    // Fetch data

    let timelines,
      data,
      datasource = localStorage.getItem('isTemp') === 'true' ? '_tmp' : '';
    try {
      let res = await fetch(`${BASE_CLOUDFERRO}/current${datasource}.json`, {
        cache: 'no-cache',
      });
      data = await res.json();

      // console.log(
      //   data.metrics.find(
      //     (met) => met.metric === 'smmp12__cf__num_active_users_mission_dl_7d'
      //   )
      // );

      res = await fetch(
        `${BASE_CLOUDFERRO}/current_timelines${datasource}.json`,
        {
          cache: 'no-cache',
        }
      );
      timelines = await res.json();

      // console.log(
      //   timelines.metrics.find(
      //     (met) =>
      //       met.metric === 'smmp11__num_streamlined_data_access_requests_7d'
      //   )
      // );
    } catch (err) {
      console.log(err);
    }

    let sortedData = getSortedData(data);

    // Create new Processor or update date on refresh, set codelist
    set({
      data: new Processor(sortedData, timelines, get().cls),
      statusChecker: new Processor(sortedData, timelines, get().cls),
    });

    // Set refresh time and start interval
    set({ refreshed: moment().format('DD/MM/YYYY HH:mm') });
    let i = localStorage.getItem('refresh');
    if (get().interval === null)
      if (!i || parseInt(i))
        set({ interval: setInterval(get().initializeData, 1000 * 120) });
    if (get().loading) set({ loading: false });
  },
  cancelInterval: () => {
    clearInterval(get().interval);
    set({ interval: null });
  },
  startInterval: () => {
    set({ interval: setInterval(get().initializeData, 1000 * 120) });
  },
}));

export interface IWidgetConfiguration {
  showTimelines: boolean;
}

export interface ConfigurationObject {
  [key: string]: IWidgetConfiguration;
}

interface ParsedConfiguration {
  id: string;
  activePeriod: string;
  widgetConfiguration: IWidgetConfiguration;
}

interface ConfigurationStore {
  configuration: ConfigurationObject;
  activePeriod: string;
  activeId: string;
  resetConfiguration: () => void;
  setActiveId: (state: string) => void;
  setActivePeriod: (state: string) => void;
  setConfiguration: (state: ConfigurationObject) => void;
  getURLConfiguration: () => void;
}

export const useConfigurationStore = create<ConfigurationStore>((set, get) => ({
  configuration: {} as ConfigurationObject,
  activePeriod: '30d',
  activeId: '',
  resetConfiguration() {
    set({ configuration: {}, activeId: '' });
  },
  setActiveId(activeId) {
    set({ activeId });
  },
  setActivePeriod: (state: string) => {
    set({ activePeriod: state });
  },
  setConfiguration: (state) => {
    set({
      configuration: {
        ...get().configuration,
        ...state,
      },
    });
  },
  getURLConfiguration: () => {
    // Get query string
    const queryString = window.location.href.split('?')[1];
    if (!queryString) return;

    const urlParams = new URLSearchParams('?' + queryString);
    const base64Link = urlParams.get('link');
    if (!base64Link) return;

    // Decode base64
    let decodedString = '';
    try {
      decodedString = atob(base64Link);
    } catch (e) {
      console.warn('Error while parsing url string.');
      return;
    }
    if (!decodedString) return;

    // Parse object from base64
    let parsedObject = {} as ParsedConfiguration;
    try {
      parsedObject = JSON.parse(decodedString);
    } catch {
      console.warn('Error while parsing url string');
    }
    let { id, activePeriod, widgetConfiguration } = parsedObject;

    if (activePeriod) get().setActivePeriod(activePeriod);
    if (id) get().setActiveId(id);
    if (id && widgetConfiguration)
      get().setConfiguration({ [id]: widgetConfiguration });
  },
}));
