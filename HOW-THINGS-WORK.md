# How Things Work

An in-depth walkthrough of the Executive Dashboard — a React + Zustand + Vite dashboard for displaying Copernicus Data Access Service metrics and analytics.

---

## Table of Contents

1. [App Bootstrap & Provider Tree](#1-app-bootstrap--provider-tree)
2. [Routing](#2-routing)
3. [Configuration & Metric Definitions](#3-configuration--metric-definitions)
4. [Data Pipeline & the Exporter Service](#4-data-pipeline--the-exporter-service)
5. [Data Fetching & the Processor](#5-data-fetching--the-processor)
6. [State Management — Zustand Stores](#6-state-management--zustand-stores)
7. [The Processor Class](#7-the-processor-class)
8. [The MetricInfo Interface](#8-the-metricinfo-interface)
9. [The Codelist](#9-the-codelist)
10. [Chart Components & Styling](#10-chart-components--styling)
11. [Deep Linking](#11-deep-linking)
12. [News Feed](#12-news-feed)
13. [Authentication](#13-authentication)
14. [Theming (Dark / Light Mode)](#14-theming-dark--light-mode)
15. [Environment Variables & Feature Flags](#15-environment-variables--feature-flags)
16. [Utility Functions](#16-utility-functions)

---

## 1. App Bootstrap & Provider Tree

**Entry point:** `src/main.tsx`

The app is mounted inside a `HashRouter` (React Router). All navigation is hash-based (`/#/service-insight`), which avoids server-side routing requirements when hosted on S3.

```
HashRouter
  └─ App
       └─ AuthProvider            ← optional login gate
            └─ ConfigurationsProvider  ← fetches metric configs + codelist; shows spinner until ready
                 └─ StoreInitializer   ← wires Zustand stores on mount
                      └─ Navigation + Routes + ScrollToTop + InfoOverlay
```

**`AuthProvider`** (`src/auth/AuthProvider.tsx`):
Checks `VITE_INCLUDE_LOGIN`. If it is `'false'` the provider immediately renders children. Otherwise it shows `LoginScreen` until the user logs in (stored in `sessionStorage`).

**`ConfigurationsProvider`** (`src/store/ConfigurationsProvider.tsx`):
A React context provider that runs two fetches on mount:

1. `{VITE_CONFIGURATION_URL}/codelist.json` — satellite product classifications
2. `{VITE_CONFIGURATION_URL}/configurations/{group-id}.json` — one file per metrics group (e.g. `data-published`, `data-accessed`, `user-engagement`, …)

While either resource is missing the entire subtree is replaced with a full-screen `<Spinner displayError />`. Once loaded, it exposes `metricsGroups`, `codelist`, `codelistRaw`, `getGroup(id)`, and `getGroups(ids)` via `useConfiguration()`.

**`StoreInitializer`** (`src/store/StoreInitializer.tsx`):
A side-effect-only component (renders its children immediately). On mount it:

1. Calls `useDataStore.setCodelists(codelistRaw)` — pushes the raw codelist into the data store.
2. Calls `useConfigurationStore.getURLConfiguration()` — parses any deep link from the URL.
3. Calls `useDataStore.initializeData()` — kicks off the main data fetch.

---

## 2. Routing

**Route definitions:** `src/routes/routesConfig.ts`

Routes are declared as a `Panel[]` array. Each `Panel` has:

| Field                | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `route`              | URL segment string (from `routes.enums.ts`)   |
| `Panel`              | React component to render                     |
| `childPanels`        | Nested `Panel[]` for sub-routes               |
| `renderPanel`        | Whether to include in the rendered route tree |
| `showPanelOnSidebar` | Whether to appear in the side navigation      |
| `Icon`               | Icon component for sidebar                    |

Top-level routes (all under `MainRoutes`):

| Route                               | Component                                                 |
| ----------------------------------- | --------------------------------------------------------- |
| `/service-insight`                  | `ServiceInsight` + child panels                           |
| `/service-health`                   | `ServiceHealth`                                           |
| `/mission-snapshot`                 | `MissionSnapshot` + Sentinel sub-panels                   |
| `/copernicus-contributing-missions` | `CCMStatistics`                                           |
| `/descriptions`                     | `Descriptions` (not in sidebar)                           |
| `/stage-page`                       | `StagePage` (only when `VITE_INCLUDE_STAGE_SUBPAGE=true`) |

**Route renderer:** `src/routes/Routes.tsx`

Uses React Router v6. All panels render inside a `LayoutContainer` wrapper. Child panels are rendered as nested `<Route>` elements. `AnimatePresence` (Framer Motion) animates between routes; on exit-complete it resets the scroll flag in `useAniStore`.

The catch-all `path="*"` redirects to `/service-insight`.

The `navigationItems` export (derived from `mainPanels`) drives the sidebar component so the navigation and routes are always in sync.

---

## 3. Configuration & Metric Definitions

All metric definitions live outside the repository — they are fetched at runtime from `VITE_CONFIGURATION_URL`. This means metrics can be changed without redeploying the app.

**Metrics groups** (`initialMetricsGroups` in `src/common/constants.ts`):

```
data-published
data-accessed
on-demand
streamlined-data
openeo
user-engagement
traceability
random
mission-snapshot
```

Each group maps to a JSON file at `{VITE_CONFIGURATION_URL}/configurations/{group-id}.json`. The file contains an array of `MetricInfo` objects (see [Section 7](#7-the-metricinfo-interface)).

Components access these definitions through `useConfiguration().getGroup(id)` or `getGroups([id1, id2])`.

---

## 4. Data Pipeline & the Exporter Service

Before the app fetches anything, data must flow from the underlying infrastructure to the S3 bucket the app reads from. This is handled by an **exporter service** currently maintained by the Core team (+ Blaž Pavlica).

### Data flow overview

```
CloudFerro (CF) (or any other partner collecting metrics such as Vito, Sentinel Hub, T-System/OTC)
    │
    │  pushes metrics
    ▼
InfluxDB
    │
    │  queried periodically
    ▼
Exporter Service  (Core team + Blaž Pavlica, runs in background)
    │
    │  uploads JSON files
    ▼
CloudFerro S3 bucket  ← https://horizon.cloudferro.com/auth/login/?next=/project/containers/container/cdas-staging-dashboard/configurations
    │
    │  fetched every 120 s
    ▼
Executive Dashboard (this repo)
```

### CloudFerro → InfluxDB

CloudFerro (CF) is the infrastructure provider for the Copernicus Data Space Ecosystem. It continuously sends service metrics (user counts, data volumes, product availability, etc.) into an **InfluxDB** time-series database.

### The Exporter Service

The exporter service is a background process currently managed by the Core team (+ Blaž Pavlica). It periodically queries InfluxDB and serialises the results into JSON files that are then uploaded to the S3 bucket. It produces **four files**:

| File                           | Contents                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| `current.json`                 | Latest point-in-time metric values per product                           |
| `current_availability.json`    | Availability metrics per product (merged with `current.json` by the app) |
| `current_timelines.json`       | Historical time-series data for each metric                              |
| `current_timelines_daily.json` | Daily-resolution time-series data (merged with `current_timelines.json`) |

The app fetches all four files on every refresh and merges them before passing the data to the `Processor`:

- `current.json` + `current_availability.json` → combined into a single `data` object (metrics arrays concatenated)
- `current_timelines.json` + `current_timelines_daily.json` → combined into a single `timelines` object (metrics arrays concatenated)

A `_tmp` variant of each file (e.g. `current_tmp.json`, `current_availability_tmp.json`) is also published by the exporter for staging/testing purposes. The app switches to these files when temp-data mode is enabled (see [Section 15](#15-environment-variables--feature-flags)).

### The S3 Bucket

The files are hosted on a CloudFerro S3 bucket:

> **Bucket URL:** https://horizon.cloudferro.com/auth/login/?next=/project/containers/container/cdas-staging-dashboard/configurations
> Credentials are stored in [Keeper](https://keepersecurity.eu/vault/#detail/uda8qlTuZZeHr0nQpuQYrg). Use **Keystone Credentials** as the authentication method when logging in.
>
> Base path used by the app: `https://s3.waw3-1.cloudferro.com/swift/v1/cdse-dashboards`

### Why this matters for the app

The app itself is fully stateless — it has no backend and no database connection. All it does is periodically fetch the four JSON snapshots that the exporter has already prepared, merge them, and render them. The 120-second auto-refresh interval in `useDataStore.initializeData()` is aligned to the exporter's publish cadence so the UI stays current without hammering the bucket.

---

## 5. Data Fetching & the Processor

**`useDataStore.initializeData()`** (`src/store/index.ts`)

This is the main data-fetch routine. It runs on app startup (triggered by `StoreInitializer`) and every 120 seconds thereafter via `setInterval`.

Steps:

1. Sets `localStorage.refresh = '1'` if not already present.
2. Triggers `useNewsStore.fetchNews()` in parallel.
3. Checks `localStorage.overview` to decide whether to show the `InfoOverlay` on first load.
4. Applies the stored dark/light theme to `document.documentElement`.
5. Fetches four JSON files from CloudFerro S3 (`https://s3.waw3-1.cloudferro.com/swift/v1/cdse-dashboards`) and merges them:
   - `current.json` + `current_availability.json` (or `*_tmp` variants) — merged into a single `data` object with all metric values
   - `current_timelines.json` + `current_timelines_daily.json` (or `*_tmp` variants) — merged into a single `timelines` object with all time-series data
6. Calls `getSortedData(data)` to re-index the raw response by metric key for O(1) lookups.
7. Constructs a `Processor` instance from the merged data and stores it as `data`.
8. Records the refresh timestamp (formatted `DD/MM/YYYY HH:mm`).
9. Starts the 120-second interval if not already running.
10. Sets `loading = false`.

**Raw data shape** (`CDASResponse`):

```json
{
  "status": "ok",
  "metrics": [
    {
      "metric": "smmp12__cf__num_active_users_mission_dl_7d",
      "values": [{ "product": "S1", "value": 1234, "timestamp": 1700000000 }],
      "missing_dates": [1699900000],
      "missing_dates_str": ["2023-11-13"]
    }
  ]
}
```

**After `getSortedData()`** (`SortedCDASResponse`):

```json
{
  "smmp12__cf__num_active_users_mission_dl_7d": {
    "values": [{ "product": "S1", "value": 1234, "timestamp": 1700000000 }],
    "missing_dates": [1699900000]
  }
}
```

**Timelines shape** (`ITimelines`):

```json
{
  "metrics": [
    {
      "metric": "smmp12__cf__num_active_users_mission_dl_7d",
      "product_names": ["s1", "s2"],
      "values": [
        [10, 20],
        [11, 22]
      ],
      "timestamps": [1699900000, 1699986400],
      "missing_dates": []
    }
  ]
}
```

`values[i]` is the array of per-product values at `timestamps[i]`.

**Temp data mode:**
The `tempData` flag (persisted in `localStorage.isTemp`) switches the fetched filenames from `current.json` to `current_tmp.json`. Toggled via `useDataStore.setTempData()`, which also re-runs `initializeData()`.

---

## 6. State Management — Zustand Stores

All stores are defined in `src/store/index.ts` and exported from there. Dependency arrays are intentionally managed manually (`react-hooks/exhaustive-deps` is disabled project-wide).

### `useDataStore`

The core store. Holds the `Processor` instance that all chart components read from.

| State          | Type                              | Purpose                               |
| -------------- | --------------------------------- | ------------------------------------- |
| `data`         | `Processor \| null`               | Processor instance used by charts     |
| `cls`          | `{ codelist, codelistRaw }`       | Processed and raw codelists           |
| `loading`      | `boolean`                         | True until first data fetch completes |
| `interval`     | `ReturnType<setInterval> \| null` | The auto-refresh timer                |
| `refreshed`    | `string \| null`                  | Human-readable last-refresh timestamp |
| `showOverview` | `boolean`                         | Controls visibility of InfoOverlay    |
| `metricStatus` | array                             | Per-group metric status values        |
| `tempData`     | `boolean`                         | Whether to load `_tmp` data files     |

Key actions: `initializeData()`, `setCodelists()`, `cancelInterval()`, `startInterval()`, `setTempData()`.

### `useConfigurationStore`

Manages URL-based deep-link state and the active widget configuration.

| State           | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `activePeriod`  | Currently selected time period (`'7d'` or `'30d'`) |
| `activeId`      | ID of the widget currently focused via deep link   |
| `configuration` | Map of widget ID → `IWidgetConfiguration`          |

`getURLConfiguration()` reads `?link=<base64>` from the URL, decodes it, and sets `activePeriod`, `activeId`, and the widget configuration. See [Section 10](#10-deep-linking).

### `useAniStore`

Controls UI animation state and the current theme.

| State                                                   | Purpose                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| `theme`                                                 | `'dark'` or `'light'` (persisted in `localStorage.isDark`)     |
| `currRoute`                                             | Current route string (used to trigger route-change animations) |
| `header` / `scroll` / `serviceHealth` / `aniNewsHeader` | Animation trigger flags per UI region                          |
| `noBtnAni`                                              | Suppresses button animation                                    |
| `openAni`                                               | Open/close animation for panels                                |

### `useNewsStore`

Manages the Copernicus RSS news feed.

| State       | Purpose                        |
| ----------- | ------------------------------ |
| `news`      | Array of `News` items          |
| `newsCount` | Max items to keep (default 5)  |
| `modalOpen` | Whether the news modal is open |
| `error`     | Fetch-error flag               |

`fetchNews()` fetches `https://dataspace.copernicus.eu/rss.xml`, parses the XML via `parseXML()`, and stores the latest N items. Items are compared against `localStorage.latestNews` to mark new ones with `new: true`.

### `useTooltipStore` / `useFixedTooltipStore` / `usePopupStore`

Small stores for tooltip and popup visibility. Components call `setData()` + `setToolTip()` / `setPopupVisibility()` to show/hide them.

---

## 7. The Processor Class

`src/functions/process/processor.tsx`

The `Processor` is a stateful class (not a hook) that encapsulates all data transformation logic. It is instantiated once per data refresh and stored in `useDataStore.data`. Chart components call its public methods — they never transform raw data themselves.

### Constructor

```ts
new Processor(sortedData: SortedCDASResponse, timelines: ITimelines, cls: { codelist, codelistRaw })
```

### Public Methods

| Method                                              | Returns                                                              | Used by                                         |
| --------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `counterData(metric, rawValue?)`                    | `{ value, timestamp, label, tooltipItems, selectedPeriod, missing }` | Counter/number widgets                          |
| `graphsData(metric, iName?, reduce?, singleGroup?)` | `GraphsData`                                                         | Bar charts, pie charts, grouped charts          |
| `listData(metric, reduce?, color?)`                 | `{ label, metrics, timelines, values, selectedPeriod }`              | Service-health list widgets                     |
| `gaugeData(metric, clItem)`                         | `GaugeItem`                                                          | Gauge widgets (timeliness)                      |
| `getConditions(conditions, isTimeline?)`            | `string[]`                                                           | Internal; also used by some components directly |
| `haveCondition(conditions, metric)`                 | `boolean`                                                            | Checking if a metric key exists in conditions   |
| `setTimeframe(timeframe)`                           | `void`                                                               | Setting active time period before querying      |

### End-to-end call flow: `graphsData()`

This is the most commonly called public method. Here is how the internal chain works for a typical bar/pie chart:

```
graphsData(metric, iName?, reduce?, singleGroup?)
│
│  Sets this.metric, this.reduce_list, this.singleGroup
│
├─ getGraphs()                          → DetailedGraph
│   │
│   ├─ getConditions(conditions)        → string[]
│   │    Resolves the MetricInfo.conditions to a flat list of metric
│   │    keys. If conditions is a plain array, returns it as-is.
│   │    If it's a timeframe object ({ '7d': [...], '30d': [...] }),
│   │    selects the right array based on the active period.
│   │
│   └─ (one of four paths based on MetricInfo flags)
│       │
│       ├─ [dontgroup] processData(cl)
│       │   └─ checkConditionAndMerge()
│       │
│       ├─ [isTimelinessHistogram] groupedByKeyTimelinessHistogram(cl)
│       │   └─ checkConditionAndMerge(true)
│       │
│       ├─ [codelist_key set] groupedByKey(cl)
│       │   └─ checkConditionAndMerge(true)
│       │
│       └─ [no codelist_key] checkConditionAndMerge()
│
│       checkConditionAndMerge()
│       │  For each condition key, reads this.data[key].values
│       │  (from SortedCDASResponse). Passes all arrays to:
│       └─ mergeArrays(...arrs)
│              Iterates all product entries across all condition
│              arrays, summing values for matching product keys.
│              Returns both a flat array and a keyed object.
│
├─ getTimelines()                       → Chart.js dataset arrays
│   Resolves conditions (with isTimeline=true, so a 'daily' key
│   triggers daily-resolution mode). For each condition key, finds
│   the matching timeline in this.timelines.metrics, then groups
│   the per-product time-series by codelist key. Missing-date gaps
│   are rendered as dashed line segments via a skipped() segment
│   callback. If sumConditionsTimelines is set, two condition
│   timelines are summed point-by-point into one dataset.
│
├─ createTooltip()                      → JSX.Element
│   Maps MetricInfo.tooltip items to <TooltipString>,
│   <TooltipAvailability>, or <TooltipIcon> components, wrapped
│   in a <TooltipContainer> with a last-updated timestamp.
│
└─ getMissingDates()                    → { metric, dates }[] | null
    Reports any missing_dates from SortedCDASResponse for each
    condition key, formatted as DD.MM.YYYY strings.
```

The call flow for `counterData()` is simpler — it skips `getGraphs()` and `getTimelines()` and goes directly through `getValueAndTimestamp()` → `getValue()` → `checkCodelistAndFilterData()` → `checkConditionAndMerge()` → `mergeArrays()`, then sums or averages the result and formats it via `formatValue()`.

The call flow for `listData()` (Service Health) combines `getTimelines()` for the sparkline and `getSingleBoolListData()` for the boolean availability rows. `getSingleBoolListData()` reads four condition keys per codelist item: current status (`c[0]`), 1d availability (`c[1]`), 30d availability (`c[2]`), and count (`c[3]`).

### Key Internal Methods

**`getConditions()`**: Resolves `MetricInfo.conditions` to a flat `string[]`. If `conditions` is a plain array it is returned as-is. If it is an object keyed by timeframe (e.g. `{ '7d': [...], '30d': [...] }`), the currently active timeframe (`metricTimeframe` or `defaultValue`) selects the right array. For timelines, a `daily` key triggers daily-resolution mode.

**`checkConditionAndMerge()`**: Fetches `values` arrays for each condition key from `sortedData` and merges them by product key, summing values for matching products.

**`checkCodelistAndFilterData()`**: Like `checkConditionAndMerge()` but also filters/orders results by the raw codelist entries, so the output always matches the codelist order.

**`getValue()`**: Sums (or averages if `unit === '%'` or `calcOperation === 'average'`) the merged values. Respects `codelist_reduce` / `codelist_reverse_reduce` to include or exclude specific product groups.

**`getGraphs()`**: Produces a `DetailedGraph`:

```ts
interface DetailedGraph {
  labels: string[]; // x-axis labels (group names or product names)
  series: number[]; // y-axis values (one per label)
  detailed: { [key: string]: SortedItemValue[] }; // per-group breakdown for stacked charts
  colors: string[]; // CSS variable references (--chartcol1, etc.)
  timestamp: number | null;
}
```

Has four code paths depending on `dontgroup`, `isTimelinessHistogram`, `codelist_key` presence, and whether a codelist is set at all.

**`getTimelines()`**: Produces Chart.js dataset arrays for the timeline chart, grouped by codelist key. Handles missing-date gaps using `skipped()` (dashed line segments). Supports `sumConditionsTimelines` to add two condition timelines together.

**`getSingleBoolListData()`**: Produces `ISingleBoolList[]` for the service-health list — one entry per codelist item with `value: boolean`, availability percentages (30d, 1d), and counts. Reads four condition keys per item: `c[0]` current status, `c[1]` 1d availability, `c[2]` 30d availability, `c[3]` count.

**`createTooltip()`**: Builds the tooltip JSX from `MetricInfo.tooltip` definitions. Supports three tooltip item types: `string`, `availability`, and `icon`.

---

## 8. The MetricInfo Interface

Metric definitions are loaded from the configuration server and typed as `MetricInfo`:

```ts
interface MetricInfo {
  id: string;
  label: string;
  conditions: string[] | { [timeframe: string]: string[] };
  type: string; // 'list' has special handling; others are mostly display hints
  defaultValue?: string; // e.g. '7d' or '30d' — default timeframe when conditions is an object
  codelist?: string; // which codelist to apply (e.g. 'cl_sat_product')
  codelist_key?: string; // field on each codelist item to group by (e.g. 'mission')
  codelist_group?: string; // secondary codelist for group label lookup (e.g. 'cl_sat_mission')
  codelist_subgroup?: string; // filter codelist to only items where codelist_key === this value
  codelist_reduce?: string[]; // whitelist (or blacklist) of group values
  codelist_reverse_reduce?: boolean; // if true, codelist_reduce becomes a blacklist
  tooltip?: MetricTooltipInfo[];
  productKey?: string; // used in timeliness histogram to select which product group to display
  sumConditionsTimelines?: boolean; // add multiple condition timelines together
  props?: {
    detailedGroup?: string; // 'per_continent' has special merging logic
    onlyTimeline?: boolean; // widget shows only the timeline chart, no counter
    unit?: string; // 'B' (bytes), '%', 'time'
    order?: number;
    dontgroup?: boolean; // skip grouping; render individual products
    group?: string; // used for grouping metrics in Service Health
    decimals?: number;
    isProvided?: boolean; // legacy; not actively used
    timelineLabel?: string; // override the label shown on the timeline
    lockTimeline?: boolean; // prevent user from toggling the timeline
    calcOperation?: string; // 'average' — only non-sum operation implemented
    isTimelinessHistogram?: boolean; // triggers histogram grouping in getGraphs()
  };
}
```

**`conditions` as a timeframe object:**

```json
{
  "conditions": {
    "7d": ["smmp12__cf__num_active_users_mission_dl_7d"],
    "30d": ["smmp12__cf__num_active_users_mission_dl_30d"]
  },
  "defaultValue": "30d"
}
```

The Processor's `getConditions()` selects the right array based on the active period.

---

## 9. The Codelist

The codelist (`codelist.json`) is a catalogue of satellite products and missions used to label, filter, and group metric data.

**Raw shape** (`CodelistRaw`):

```json
{
  "cl_sat_product": [
    { "key": "s1_slc", "name": "SLC", "mission": "S1", "product/data type": "SLC" },
    ...
  ],
  "cl_sat_mission": [
    { "key": "s1", "name": "Sentinel-1" },
    ...
  ]
}
```

**Processed shape** (`Codelist`, via `getCodeList()`):

```json
{
  "cl_sat_product": {
    "s1_slc": { "key": "s1_slc", "name": "SLC", "mission": "S1", ... }
  }
}
```

The processed form allows O(1) lookup by key and is stored in `useDataStore.cls.codelist`.
The raw array form is kept in `useDataStore.cls.codelistRaw` because it preserves insertion order and supports filtering by field values.

**How the Processor uses it:**

1. `codelist` on a `MetricInfo` selects which codelist array to iterate (e.g. `cl_sat_product`).
2. `codelist_key` specifies which field to group by (e.g. `'mission'` → groups data into `S1`, `S2`, etc.).
3. `codelist_group` is a second codelist whose items provide human-readable names for the groups produced by step 2.
4. `codelist_reduce` / `codelist_reverse_reduce` whitelist or blacklist specific groups.
5. Products in `current.json` are matched to codelist entries by lowercase key comparison.

### Working examples from the User Engagement group

The following examples use real metric definitions from `configurations/user-engagement.json` and the actual codelist from `codelist.json` to show exactly how the fields interact.

---

**Example 1 — Simple grouped bar chart: "Number of active users per Sentinel mission"**

```json
{
  "id": "ue_num_active_users_per_sentinel_mission",
  "conditions": {
    "7d": ["smmp12__cf__num_active_users_mission_dl_7d"],
    "30d": ["smmp12__cf__num_active_users_mission_dl_30d"]
  },
  "codelist": "cl_sat_mission",
  "codelist_key": "name"
}
```

`cl_sat_mission` in the codelist:

```json
[
  { "key": "s1", "name": "Sentinel-1", "type": "Sentinel" },
  { "key": "s2", "name": "Sentinel-2", "type": "Sentinel" },
  { "key": "s3", "name": "Sentinel-3", "type": "Sentinel" },
  { "key": "s5p", "name": "Sentinel-5P", "type": "Sentinel" },
  { "key": "n/a", "name": "Other", "type": "Other" }
]
```

The raw data for `smmp12__cf__num_active_users_mission_dl_7d` arrives as:

```json
{ "values": [{ "product": "S1", "value": 4200 }, { "product": "S2", "value": 8100 }, ...] }
```

What happens in the Processor:

1. `getConditions()` selects the active period's condition key (e.g. `smmp12__cf__num_active_users_mission_dl_7d`).
2. `checkConditionAndMerge(true)` reads `this.data[key].values` and re-indexes by product → `{ "s1": {value: 4200}, "s2": {value: 8100}, ... }` (lowercased).
3. `groupedByKey(cl_sat_mission)` iterates the codelist in order. For each entry, `codelist_key = "name"` means the group label is `c.name` = `"Sentinel-1"`. It looks up `values["s1"]` and pushes it into `groups["Sentinel-1"]`.
4. `getGraphs()` sums each group's values → `series = [4200, 8100, ...]`, `labels = ["Sentinel-1", "Sentinel-2", ...]`.

The codelist order controls the bar order on the chart.

---

**Example 2 — Two-level grouping with `codelist_group`: "Number of data visualisation requests"**

```json
{
  "id": "ue_num_sh_requests_browser",
  "conditions": {
    "1d": ["smmp11__sin__num_sh_requests_browser_daily"],
    "7d": ["smmp11__sin__num_sh_requests_browser_7d"],
    "30d": ["smmp11__sin__num_sh_requests_browser_30d"]
  },
  "codelist": "cl_sin_product",
  "codelist_key": "type",
  "codelist_group": "cl_sat_mission"
}
```

`cl_sin_product` (excerpt):

```json
[
  { "key": "s1_grd", "name": "Sentinel-1 GRD", "type": "S1" },
  { "key": "s2_l1c", "name": "Sentinel-2 L1C", "type": "S2" },
  { "key": "s2_l2a", "name": "Sentinel-2 L2A", "type": "S2" },
  { "key": "s3_olci_l1b", "name": "Sentinel-3 OLCI L1B", "type": "S3" }
]
```

`cl_sat_mission` provides the human-readable names for each `type` value:

```json
[{ "key": "s1", "name": "Sentinel-1" }, { "key": "s2", "name": "Sentinel-2" }, ...]
```

What happens in the Processor:

1. `checkConditionAndMerge(true)` builds `{ "s1_grd": {value: ...}, "s2_l1c": {value: ...}, "s2_l2a": {value: ...}, ... }`.
2. `groupedByKey()` iterates `cl_sin_product`. For each item, `codelist_key = "type"` gives the raw group key (`"S1"`, `"S2"`, …). Because `codelist_group = "cl_sat_mission"` is set, it does a lookup: `CL["cl_sat_mission"]["s1"]?.name` = `"Sentinel-1"`. That becomes the group label.
3. Items with `type: "S2"` (e.g. `s2_l1c` and `s2_l2a`) are both pushed into `groups["Sentinel-2"]`, so the chart shows the breakdown within each mission as a stacked bar.

---

**Example 3 — `dontgroup` for flat per-item bars: "Number of registered users"**

```json
{
  "id": "ue_num_registered_daily",
  "conditions": ["smmp12__cf__num_registered_daily"],
  "codelist": "cl_user_type",
  "codelist_key": "key",
  "props": { "dontgroup": true, "onlyTimeline": true }
}
```

`cl_user_type`:

```json
[
  { "key": "cgu", "name": "Copernicus General Users" },
  { "key": "csu", "name": "Copernicus Service Users" },
  { "key": "ccu", "name": "Copernicus Collaborative Users" },
  { "key": "ciu", "name": "Copernicus International Users" }
]
```

With `dontgroup: true`, `getGraphs()` takes the `processData()` path instead of `groupedByKey()`. It maps each codelist entry to its matching product value directly, producing one bar (or timeline line) per codelist entry (`cgu`, `csu`, `ccu`, `ciu`) rather than grouping them. The chart labels come from `c.name`.

---

**Example 4 — Service Health list with four condition slots: "Copernicus browser"**

```json
{
  "id": "attract1",
  "conditions": [
    "kpi03a__sin__cdse_br_availability",
    "kpi03a__sin__cdse_br_availability_perc",
    "kpi03a__sin__cdse_br_availability_perc_30d",
    "kpi03a__sin__cdse_br_availability_count"
  ],
  "type": "list",
  "codelist": "cl_service_api",
  "codelist_key": "type",
  "codelist_subgroup": "user_interfaces"
}
```

`cl_service_api` (excerpt — `type: "user_interfaces"` items):

```json
[
  { "key": "all", "name": "Copernicus Browser", "type": "user_interfaces", "link": "...", "description": "..." },
  ...
]
```

`codelist_subgroup: "user_interfaces"` pre-filters `cl_service_api` to only entries where `type === "user_interfaces"`. `getSingleBoolListData()` then iterates those entries and for each one reads four values from `this.data` by condition index:

| Condition index | Metric key                                   | Populates             |
| --------------- | -------------------------------------------- | --------------------- |
| `c[0]`          | `kpi03a__sin__cdse_br_availability`          | `value` (boolean)     |
| `c[1]`          | `kpi03a__sin__cdse_br_availability_perc`     | `availability1d` (%)  |
| `c[2]`          | `kpi03a__sin__cdse_br_availability_perc_30d` | `availability30d` (%) |
| `c[3]`          | `kpi03a__sin__cdse_br_availability_count`    | `availabilityCount`   |

The result is an `ISingleBoolList[]` where each row in the Service Health table gets a green/red status indicator, a 1-day percentage, a 30-day percentage, and a count — all sourced from four separate metric keys but presented as a single row.

---

## 10. Chart Components & Styling

### Component Pattern

```
Panel component
  └─ reads: useDataStore((s) => s.data)   → Processor instance
  └─ reads: useConfiguration().getGroup(id) → MetricInfo[]
  └─ calls: processor.graphsData(metricInfo) → GraphsData
  └─ passes GraphsData to <Chart> or <TimelineChart>
```

Components never touch raw data. All transformation is delegated to the Processor.

### `<Chart>` (`src/components/Chart/Chart.tsx`)

The unified Chart.js wrapper. Accepts the data structures returned by Processor methods and renders bar charts, pie charts, etc. Chart.js plugins and options are configured inside this component.

### `<TimelineChart>` (`src/components/Timelines/TimelineChart.tsx`)

Renders the historical line chart from timeline data. Supports:

- Multiple dataset groups (one line per product/group)
- Missing-date gap rendering (dashed line segments via `segment` callbacks)
- Daily vs. rolling-period toggle

### Colors

Chart colors come from CSS custom properties `--chartcol1` through `--chartcol20`. The `chartColors` constant in `src/common/constants.ts` is just the ordered array of these variable names. The actual color values are resolved at render time via `getComputedStyle(document.documentElement).getPropertyValue(name)` (in `src/common/getChartStyles.ts`). This is what makes dark/light mode work — switching the theme swaps the CSS variable values, and the chart colors update automatically.

`getChartStyles(num, activeSlice, colors?)` returns `{ bgc, bc, offs }` — background colors, border colors, and offsets for pie chart slice selection.

### Other Visualisation Components

| Component                           | Purpose                                         |
| ----------------------------------- | ----------------------------------------------- |
| `<Gauge>` / `<GaugeWrapper>`        | Timeliness gauge for Mission Snapshot panels    |
| `<BarHorizontal>` / `<BarVertical>` | Standalone bar charts (outside Chart.js)        |
| `<Piechartjs>`                      | Pie chart                                       |
| `<TimelinessHistogram>`             | Special histogram for timeliness data           |
| `<Counter>`                         | Single large numeric value display              |
| `<InteractiveMap>`                  | Leaflet map for geographic user-engagement data |

---

## 11. Deep Linking

Widget state can be shared via URL. The format is:

```
/#/service-insight?link=<base64-encoded-JSON>
```

The base64 decodes to:

```json
{
  "id": "widget-id",
  "activePeriod": "7d",
  "widgetConfiguration": {
    "showTimelines": true
  }
}
```

**Encoding** (done by widget components when the user interacts):
Widgets call `useConfigurationStore.setActivePeriod()`, `setActiveId()`, and `setConfiguration()`, then encode the current store state as base64 JSON and push it to the URL query string.

**Decoding** (done by `StoreInitializer` on startup):
`useConfigurationStore.getURLConfiguration()` reads `window.location.href`, extracts the `link` param, base64-decodes it, JSON-parses it, and calls the appropriate store setters. This means deep links survive hard reloads.

The `AutoLinkHOC` (`src/components/DeepLink/AutoLinkHOC.tsx`) wraps widgets to automatically generate the shareable URL as the user changes settings.

---

## 12. News Feed

`useNewsStore` fetches the Copernicus news RSS feed (`https://dataspace.copernicus.eu/rss.xml`) on every `initializeData()` call.

**Flow:**

1. `fetchNews()` fetches the XML with `cache: 'no-cache'`.
2. `parseXML(xml)` (`src/functions/common.ts`) converts the XML string to an array of `News` objects.
3. `getLatestNews(parsed, count)` trims to the latest N items and compares against `localStorage.latestNews` to mark new items with `new: true`.
4. The `NewsButton` component shows a badge count of unread items.
5. `setViewedNews()` marks all items as read and persists the current list to `localStorage.latestNews`.

---

## 13. Authentication

`AuthProvider` (`src/auth/AuthProvider.tsx`) is a lightweight gate:

- If `VITE_INCLUDE_LOGIN === 'false'`: children render immediately, no auth required.
- Otherwise: `LoginScreen` is shown. On successful login, `setLoggedIn(true)` is called and the logged-in state is also written to `sessionStorage` so it survives in-tab navigation without requiring re-login.

There is no token management or backend auth integration — it is a simple UI gate.

---

## 14. Theming (Dark / Light Mode)

Theme is toggled by the `DarkModeSwitch` component in the header.

**Storage:** `localStorage.isDark` — `1` for dark, `0` for light.

**Application:**
On toggle, `document.documentElement.setAttribute('data-theme', 'dark')` is set (or removed for light). CSS uses `[data-theme="dark"]` selectors to override the custom property values:

```css
:root {
  --chartcol1: #4c9be8;
  --bgcolor: #ffffff;
  /* ... */
}

[data-theme='dark'] {
  --chartcol1: #6ab4ff;
  --bgcolor: #1a1a2e;
  /* ... */
}
```

Because chart colors are resolved via `getComputedStyle()` at render time (not stored), re-rendering after the theme switch automatically picks up the new values. The current theme is also tracked in `useAniStore.theme` so components can conditionally apply theme-aware styles.

The map tile source (`constants.ts → maps`) also switches between dark and light Carto/GISCO tile URLs depending on the theme.

---

## 15. Environment Variables & Feature Flags

All variables are Vite `VITE_` prefixed and available as `import.meta.env.*` at build time.

| Variable                     | Default      | Purpose                                        |
| ---------------------------- | ------------ | ---------------------------------------------- |
| `VITE_CONFIGURATION_URL`     | — (required) | Base URL for codelist + metric config fetches  |
| `VITE_INCLUDE_LOGIN`         | `'false'`    | Show a login screen before the dashboard       |
| `VITE_OPTION_TEMP_DATA`      | `'false'`    | Show the temp-data toggle UI in the header     |
| `VITE_INCLUDE_STAGE_SUBPAGE` | `'false'`    | Include the Stage Page route and sidebar entry |

Checked at runtime (not build-time): `localStorage.isTemp` switches data source to `*_tmp.json` files.

---

## 16. Utility Functions

All utilities are barrel-exported from `src/functions/index.ts`.

### `src/functions/process/processor.utils.ts`

| Export                                | Purpose                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `getCodeList(raw)`                    | Converts raw codelist arrays to keyed lookup objects                        |
| `getSortedData(response)`             | Re-indexes the `CDASResponse` metrics array by metric key                   |
| `TIMELINESS_PRODUCT_TO_TIME_INTERVAL` | Maps product keys to their timeliness time intervals (e.g. `s1_nrt → '1h'`) |
| `DESIRED_PRODUCT_ORDER_FOR_MISSIONS`  | Canonical ordering of product types per mission (Sentinel-1/2/3/5P/CCM)     |
| Type definitions                      | `SortedCDASResponse`, `SortedItemValue`, `Codelist`, `CDASResponse`, etc.   |

### `src/functions/common.ts`

General helpers including `formatValue()` (formats numbers with units like bytes, %, time), `hexToRgb()`, `sortOnly()` (sorts tooltip items by `order`), `parseXML()`, and `getLatestNews()`.

### `src/functions/api.ts`

API-related utilities.

### `src/common/getChartStyles.ts`

`computedStyle(varName)` — resolves a CSS custom property from `:root`.
`getChartStyles(num, activeSlice, colors?)` — produces Chart.js-ready color arrays with offset for the active (selected) slice.

### Custom Hooks (`src/hooks/`)

| Hook                  | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `useClickOutside`     | Fires a callback when a click occurs outside a ref |
| `useComponentVisible` | Combines visibility state with `useClickOutside`   |
| `useMousePosition`    | Tracks mouse `{x, y}` in the store                 |
| `useScrollPosition`   | Tracks scroll position                             |
| `useTimestamp`        | Formats a Unix timestamp for display               |
| `useTooltip`          | Connects a component to `useTooltipStore`          |
| `useWindowSize`       | Returns current viewport dimensions                |
