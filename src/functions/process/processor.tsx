import { chartColors } from '@/common/constants';
import { computedStyle } from '@/common/getChartStyles';
import {
  TooltipAvailability,
  TooltipContainer,
  TooltipIcon,
  TooltipLastUpdated,
  TooltipString,
} from '@/components/Tooltip/Tooltip';
import { MetricInfo, MetricTooltipInfo } from '@/store';
import { hexToRgb, sortOnly } from '../common';
import { formatValue } from '../common';
import {
  Codelist,
  DESIRED_PRODUCT_ORDER_FOR_MISSIONS,
  SortedCDASResponse,
  SortedItemValue,
  TIMELINESS_PRODUCT_TO_TIME_INTERVAL,
} from './processor.utils';
import { GaugeClItem, GaugeItem } from '@/components/Gauge/GaugeWrapper';
import moment from 'moment';

export interface DetailedGraph {
  labels: string[];
  series: number[];
  detailed: { [key: string]: SortedItemValue[] };
  colors: string[];
  timestamp: number | null;
}

export interface ISingleBoolList {
  value: boolean;
  timestamp: number;
  label: string;
  m_key: string;
  availability30d: number;
  availability1d: number;
  availabilityCount: number;
  description?: string;
  link?: string;
}

interface ITimelinesMetric {
  metric: string;
  product_names: string[];
  values: number[][];
  timestamps: number[];
  missing_dates: number[];
}

interface ITimelines {
  metrics: ITimelinesMetric[];
}

export class Processor {
  public data: SortedCDASResponse = null;
  public timelines: ITimelines = null;
  public metricTimeframe = null;
  public selectedPeriod = null;

  private metric: MetricInfo = null;
  private reduce_list = null;
  private singleGroup = null;
  private codelistRaw = null;
  private CL: Codelist = null;

  private isDailyTimeline = false;

  constructor(data, timelines, cls) {
    this.data = data;
    this.timelines = timelines;
    this.codelistRaw = cls.codelistRaw;
    this.CL = cls.codelist;
  }

  private checkCodelistAndFilterData = (
    subGroup?: string
  ): SortedItemValue[] => {
    let { codelist, codelist_key, codelist_subgroup } = this.metric;
    if (!codelist && !codelist_key)
      return this.checkConditionAndMerge() as SortedItemValue[];

    let values = this.checkConditionAndMerge(true);
    let codel = this.codelistRaw[codelist];

    let subgroup = subGroup || codelist_subgroup;
    if (subgroup) codel = codel.filter((c) => c[codelist_key] === subgroup);

    return codel.map(
      (c) => values[c.key] || { product: c.key, value: null, timestamp: null }
    );
  };

  private getValue(isPercenet?: boolean, isBoolean?: boolean) {
    let timestamp = null;
    let values = isBoolean
      ? (this.checkConditionAndMerge() as SortedItemValue[])
      : this.checkCodelistAndFilterData();

    // Reduce values if necessary
    const cl_reduce = this.metric.codelist_reduce;
    if (cl_reduce?.length && this.metric.codelist) {
      let includedKeys = this.codelistRaw[this.metric.codelist]
        .filter((c) =>
          this.metric.codelist_reverse_reduce
            ? !cl_reduce.includes(c[this.metric.codelist_key || 'mission'])
            : cl_reduce.includes(c[this.metric.codelist_key || 'mission'])
        )
        .map((c) => c.key);
      values = values.filter((v) => includedKeys.includes(v.product));
    }

    let val = values.length
      ? values?.reduce((sum, n) => {
          let currTimestamp = n.timestamp;
          if (!timestamp || currTimestamp > timestamp) timestamp = n.timestamp;
          return sum + n.value;
        }, 0)
      : null;

    if (isPercenet)
      val = val && val / values.filter((n) => n.value !== null).length;

    return [val, timestamp];
  }

  /* VALUE AND TIMESTAMP */
  private getValueAndTimestamp(
    isbool?: boolean,
    rawValue?: boolean
  ): {
    value: string | number | null;
    timestamp: number;
  } {
    let c = this.metric.conditions;
    c = this.getConditions(c);
    if (!c?.length) return { value: null, timestamp: null };
    let { unit, decimals, calcOperation } = this.metric.props;
    // Get sum and timestamp
    let timestamp = null;
    let val = null;

    if (unit === '%' || (calcOperation && calcOperation === 'average'))
      [val, timestamp] = this.getValue(true);
    else [val, timestamp] = this.getValue(false, isbool);

    // Return raw value
    if (rawValue) return { value: val, timestamp };

    // Format value
    let value = !isbool ? formatValue(val, unit, null, decimals) : val;
    return { value, timestamp };
  }

  private getSingleBoolListData(): ISingleBoolList[] {
    let c = this.metric.conditions;
    c = this.getConditions(c);

    if (!c.length) return null;
    // Define codelist and get values
    let cl = this.metric.codelist || 'cl_sat_prod';
    let cl_key = this.metric.codelist_key || 'mission';
    let cl_group = this.metric.codelist_subgroup;
    let cl_reduce = this.metric.codelist_reduce;
    let cl_reverse_reduce = this.metric.codelist_reverse_reduce;

    let clist = this.codelistRaw[cl];
    if (cl_group) clist = clist.filter((a) => a[cl_key] === cl_group);

    if (this.reduce_list && cl_reduce)
      clist = cl_reverse_reduce
        ? !clist.filter((a) => cl_reduce.includes(a.key))
        : clist.filter((a) => cl_reduce.includes(a.key));

    let values: ISingleBoolList[] = clist.map((cli) => {
      let item = this.data[c[0]]?.values?.find(
        ({ product }) => product.toLocaleLowerCase() === cli.key
      );

      if (!item)
        return {
          value: null,
          timestamp:
            this.data[c[1]]?.values?.find(
              ({ product }) => product.toLocaleLowerCase() === cli.key
            )?.timestamp || null,
          label: cli.name,
          m_key: '',
          availability30d:
            this.data[c[2]]?.values?.find(
              ({ product }) => product.toLocaleLowerCase() === cli.key
            )?.value || null,
          availability1d:
            this.data[c[1]]?.values?.find(
              ({ product }) => product.toLocaleLowerCase() === cli.key
            )?.value || null,
          availabilityCount:
            this.data[c[3]]?.values?.find(
              ({ product }) => product.toLocaleLowerCase() === cli.key
            )?.value || null,
          description: cli.description,
          link: cli.link,
        };
      let { value, timestamp, product } = item;

      return {
        value: !!value,
        timestamp,
        label: cli.name,
        m_key: product.toLocaleLowerCase(),
        availability30d: this.data[c[2]]?.values?.find(
          ({ product }) => product.toLocaleLowerCase() === cli.key
        )?.value,
        availability1d: this.data[c[1]]?.values?.find(
          ({ product }) => product.toLocaleLowerCase() === cli.key
        )?.value,
        availabilityCount: this.data[c[3]]?.values?.find(
          ({ product }) => product.toLocaleLowerCase() === cli.key
        )?.value,
        description: cli.description,
        link: cli.link,
      };
    });
    return values;
  }

  /* TOOLTIP */
  private createTooltip(nowrapper?: boolean): JSX.Element {
    let tooltipData = this.metric.tooltip;
    let isConditionObject = !Array.isArray(this.metric.conditions);
    let filteredTooltipData: MetricTooltipInfo[] = [];
    if (tooltipData?.length) filteredTooltipData = sortOnly(tooltipData, true);

    // Generate components from tooltip type
    let components = filteredTooltipData.map((t, i) => {
      switch (t.type) {
        case 'string':
          return <TooltipString key={'tt' + i} {...t} />;
        case 'availability':
          return <TooltipAvailability key={'tt' + i} {...t} />;
        case 'icon':
          return (
            <TooltipIcon key={'tt' + i} {...t} isObject={isConditionObject} />
          );
        default:
          return <TooltipString key={'tt' + i} {...t} />;
      }
    });

    return nowrapper ? (
      <>{components}</>
    ) : (
      <TooltipContainer label={this.metric.label}>
        {components}
        <TooltipLastUpdated timestamp={this.getValueAndTimestamp().timestamp} />
      </TooltipContainer>
    );
  }

  private getGraphs(): DetailedGraph {
    let {
      codelist_key,
      codelist,
      codelist_reduce,
      codelist_reverse_reduce,
      productKey,
      props: { dontgroup, unit, isTimelinessHistogram },
    } = this.metric;
    let cl = this.codelistRaw[codelist] && [...this.codelistRaw[codelist]];
    let labels = [],
      series = [],
      colors = [],
      timestamp = null,
      detailed = null;

    // Reduce codelist if necessary
    if (this.reduce_list && codelist_reduce)
      cl = cl.filter((a) =>
        codelist_reverse_reduce
          ? !codelist_reduce.includes(a[codelist_key || 'mission'])
          : codelist_reduce.includes(a[codelist_key || 'mission'])
      );

    if (cl && codelist_key && dontgroup) {
      detailed = this.processData(cl);
      detailed = detailed.filter((d) => d.value !== undefined);

      labels = detailed.map((d) => d.product);
      series = detailed.map((d) => d.value);
      timestamp = detailed[0]?.timestamp;
    } else if (codelist_key && cl && isTimelinessHistogram) {
      detailed = this.groupedByKeyTimelinessHistogram(cl);
      labels = detailed[productKey].map((detail) => detail.product);
      series = detailed[productKey].map((detail) => detail.value);
      detailed = detailed[productKey];
    } else if (codelist_key && cl) {
      detailed = this.groupedByKey(cl);
      labels = Object.keys(detailed);
      timestamp = detailed[0]?.timestamp;
      if (unit === '%')
        series = Object.keys(detailed).map(
          (k) =>
            detailed[k].reduce((sum, n) => sum + n.value || null, 0) /
            detailed[k].filter((d) => d.value !== null).length
        );
      else
        series = Object.keys(detailed).map((k) =>
          detailed[k].reduce((sum, n) => sum + n.value || null, 0)
        );
    } else if (cl) {
      let values = this.checkConditionAndMerge() as SortedItemValue[];
      timestamp = values[0]?.timestamp;
      cl.forEach((c) => {
        labels.push(c.name || c.key);
        series.push(
          values.find((v) => v.product.toLocaleLowerCase() === c.key)?.value
        );
      });
    } else {
      let values = this.checkConditionAndMerge() as SortedItemValue[];
      values.forEach((c) => {
        labels.push(c.product);
        series.push(c.value);
      });
      if (this.metric?.props?.detailedGroup === 'per_continent') {
        const southAmericaIdx = labels.findIndex(
          (label) => label === 'south_america'
        );
        const antarcticaIdx = labels.findIndex(
          (label) => label === 'antarctica'
        );

        if (southAmericaIdx !== -1 && antarcticaIdx !== -1) {
          series[southAmericaIdx] += series[antarcticaIdx];
          series.splice(antarcticaIdx, 1);
          labels.splice(antarcticaIdx, 1);
        }
      }
      timestamp = values[0]?.timestamp;
    }

    // Merge Sentinel 1,2, 3 and 5P products, also merge CCM
    if (
      codelist === 'cl_sat_product' ||
      codelist === 'cl_products_dl' ||
      codelist === 'cl_sin_product'
    ) {
      let prods = [
        'Sentinel-1',
        'Sentinel-2',
        'Sentinel-3',
        'Sentinel-5P',
        'CCM',
      ];
      prods.forEach((pr) => {
        let newSeries = [];
        if (!detailed[pr]) return;
        detailed[pr].forEach((p) => {
          let newItem = `${p.group || 'Other'}`;
          let item = newSeries.find((s) => s.product === newItem);
          if (!item) {
            newSeries.push({
              product: newItem,
              value: p.value,
              timestamp: p.timestamp,
            });
            return;
          }
          item.value += p.value;
        });
        const desired = DESIRED_PRODUCT_ORDER_FOR_MISSIONS[pr] ?? [];
        const desiredOrder = desired.slice(0).reverse();
        detailed[pr] = newSeries.sort((a, b) => {
          const aIndex = -desiredOrder.indexOf(a.product);
          const bIndex = -desiredOrder.indexOf(b.product);
          return aIndex - bIndex;
        });
      });
    }

    if (this.singleGroup) {
      if (!Object.values(detailed)) return;
      const items = Object.values(detailed)[0] as {
        product: string;
        value: number;
      }[];
      labels = items.map((i) => i.product);
      series = items.map((i) => i.value);
      detailed = null;
    }

    /*    // Set colors
    if (codelist) {
      let codeli = this.filterCodelist();
      let cl = codeli && [...codeli];

      // Reduce codelist if necessary
      if (this.reduce_list && codelist_reduce)
        cl = codelist_reverse_reduce
          ? cl.filter(
              (a) => !codelist_reduce.includes(a[codelist_key || 'mission'])
            )
          : cl.filter((a) =>
              codelist_reduce.includes(a[codelist_key || 'mission'])
            );
    } */
    let ch =
      codelist_reduce && codelist_reverse_reduce ? codelist_reduce.length : 0;
    colors = labels.map((_, i) => chartColors[i + ch]);

    return {
      labels,
      series,
      detailed,
      colors,
      timestamp,
    };
  }

  private processData(codelist: any[]): SortedItemValue[] {
    let { codelist_key, codelist_subgroup } = this.metric;
    let values = this.checkConditionAndMerge() as SortedItemValue[];

    if (codelist_subgroup && codelist_key)
      codelist = codelist.filter((c) => c[codelist_key] === codelist_subgroup);

    return codelist.map((c) => ({
      value: values?.find((v) => v.product.toLowerCase() === c.key)?.value,
      product: c.name,
      timestamp: values?.find((v) => v.product.toLowerCase() === c.key)
        ?.timestamp,
    }));
  }

  private groupedByKey(codelist: any[]): { [key: string]: SortedItemValue[] } {
    const { codelist_key, codelist_group } = this.metric;
    const values = this.checkConditionAndMerge(true);
    const group = {};
    codelist.forEach((c) => {
      let real_key = codelist_group
        ? this.CL[codelist_group] &&
          this.CL[codelist_group][c[codelist_key].toLocaleLowerCase()]?.name
        : c[codelist_key];
      if (!real_key) real_key = 'Other';

      if (values[c.key] !== undefined) {
        if (!group[real_key]) group[real_key] = [];
        group[real_key].push({
          product: c.name || c.key,
          value: values[c.key]?.value || null,
          timestamp: values[c.key]?.timestamp || null,
          group: c['product/data type'] || c.name.split('_').pop(),
        });
      }
    });
    return group;
  }

  private groupedByKeyTimelinessHistogram(codelist: any[]): {
    [key: string]: SortedItemValue[];
  } {
    const values = this.checkConditionAndMerge(true);
    const group = {};
    codelist.forEach((c) => {
      const realKeyWithoutTimeFrame = c.key;

      const filteredValuesByKey: {
        [key: string]: SortedItemValue;
      } = Object.keys(values)
        .filter((keyWithTimeFrame) =>
          keyWithTimeFrame.includes(realKeyWithoutTimeFrame)
        )
        .filter((keyWithTimeFrame) => {
          const timeInterval =
            TIMELINESS_PRODUCT_TO_TIME_INTERVAL[realKeyWithoutTimeFrame];
          const timeIntervalNum = parseInt(
            timeInterval.substring(0, timeInterval.length - 1)
          );

          const timeFrame = keyWithTimeFrame.split('__').pop() ?? '0001';
          let x = 0;
          if (timeFrame.includes('d')) {
            x = parseInt(timeFrame.substring(0, timeFrame.length - 1));
          } else {
            x = parseInt(timeFrame);
          }

          return (
            x % timeIntervalNum === 0 ||
            timeFrame === '9999' ||
            timeFrame === '999d'
          );
        })
        .reduce((obj, key) => {
          obj[key] = values[key];
          return obj;
        }, {});

      if (!group[realKeyWithoutTimeFrame]) {
        group[realKeyWithoutTimeFrame] = [];
      }

      const sumOfValues = Object.values(filteredValuesByKey).reduce(
        (sum, filteredValue) => sum + filteredValue.value,
        0
      );
      Object.values(filteredValuesByKey).map((filteredValue) => {
        group[realKeyWithoutTimeFrame].push({
          name: c.name || c.key,
          product: filteredValue.product.split('__')[1],
          value: (filteredValue.value / (sumOfValues ?? 1)) * 100,
          timestamp: filteredValue.timestamp,
          key: realKeyWithoutTimeFrame,
        });
      });
    });
    return group;
  }

  private checkConditionAndMerge(
    getObject?: boolean
  ): { [key: string]: SortedItemValue[] } | SortedItemValue[] {
    let c = this.metric.conditions;
    c = this.getConditions(c);
    if (!c?.length) return null;
    let arrs = c.map((con) => this.data[con]?.values);
    if (!arrs[0]) return [];
    let [list, obj] = this.mergeArrays(...arrs);
    return getObject ? obj : list;
  }

  private mergeArrays(
    ...arrays
  ): [SortedItemValue[], { [key: string]: SortedItemValue[] }] {
    let merged = {};

    arrays.forEach((array) => {
      if (array === undefined || array === null) {
        return;
      }

      array.forEach((obj) => {
        if (obj.product in merged) {
          merged[obj.product.toLowerCase()].value += obj.value;
        } else {
          merged[obj.product.toLowerCase()] = { ...obj };
        }
      });
    });
    return [Object.values(merged), merged];
  }

  /**
   *  TIMELINES
   *
   * @returns Timelines data as array
   */
  private getTimelines(color?: string, iName?: string) {
    const { metrics } = this.timelines || {};
    let {
      codelist_key,
      codelist_group,
      conditions,
      codelist,
      codelist_reduce,
      codelist_reverse_reduce,
      props: { dontgroup, unit, timelineLabel },
      sumConditionsTimelines,
    } = this.metric;
    conditions = this.getConditions(conditions, true);

    // Metric group
    // Codelist group
    // Lines
    if (!conditions || !metrics) {
      return [];
    }
    let ch =
      codelist_reduce && codelist_reverse_reduce
        ? codelist_reduce.length - 1
        : 0;
    const skipped = (ctx, value) =>
      ctx.p0.skip || ctx.p1.skip ? value : undefined;

    const timelines = conditions
      .map((c) => {
        let timeline = metrics.find(
          (m) => m.metric === c || m.metric === c + '_daily'
        );
        if (!timeline?.timestamps) return null;

        let combined = timeline.timestamps.map((timestamp, i) => ({
          timestamp,
          values: timeline.values[i],
        }));

        // sort combined array by timestamp
        combined.sort((a, b) => a.timestamp - b.timestamp);

        // map sorted combined array back to separate arrays
        timeline.timestamps = combined.map((el) => el.timestamp);
        timeline.values = combined.map((el) => el.values);
        let timestamps = timeline.timestamps?.map((ts) => ts * 1000);
        timeline.product_names = timeline.product_names.map((p) =>
          p.toLowerCase()
        );
        // If Metric have codelist and can group
        if (codelist) {
          let codeli = this.filterCodelist();
          let cl = codeli && [...codeli];

          // Reduce codelist if necessary
          if (this.reduce_list && codelist_reduce)
            cl = codelist_reverse_reduce
              ? cl.filter(
                  (a) => !codelist_reduce.includes(a[codelist_key || 'mission'])
                )
              : cl.filter((a) =>
                  codelist_reduce.includes(a[codelist_key || 'mission'])
                );

          let groups = {};
          cl.forEach((cl_item) => {
            // Get index of item
            let tl_indx = timeline.product_names.indexOf(cl_item.key);
            // Sets empty group
            let group_key = 'group1';
            if (!dontgroup) {
              group_key = cl_item[codelist_key || 'mission'] || 'missing-key';
              if (codelist_group) {
                group_key =
                  this.codelistRaw[codelist_group].find(
                    (c) => c.key === group_key.toLowerCase()
                  )?.name || 'missing-key';
              }
            }
            if (!groups[group_key]) groups[group_key] = [];
            // Add item to group
            if (timeline.values.find((v) => v[tl_indx])) {
              let { r, g, b } = hexToRgb(
                computedStyle(color || chartColors[ch] || '--chartcol1')
              );

              groups[group_key].push({
                label:
                  timelineLabel || iName || codelist !== 'cl_sat_product'
                    ? cl_item.name || timeline.product_names[tl_indx]
                    : timeline.product_names[tl_indx],
                data: timeline.values?.map((v, j) => ({
                  y: !v[tl_indx] && v[tl_indx] !== 0 ? null : v[tl_indx],
                  x: new Date(timeline.timestamps[j] * 1000).toISOString(),
                })),
                borderColor: computedStyle(chartColors[ch]),
                backgroundColor: computedStyle(chartColors[ch++]),
                lineTension: 0.3,
                segment: {
                  borderColor: (ctx) =>
                    skipped(ctx, `rgba(${r},${g},${b},0.5)`),
                  borderDash: (ctx) => skipped(ctx, [6, 6]),
                },
                spanGaps: true,
              });
            }
          });
          ch = 0;

          // Single group (Sentinels)
          if (this.singleGroup) {
            let items = Object.values(groups)[0] as {
              label: string;
              data: { y: number; x: string }[];
              backgroundColor: string;
              borderColor: string;
              lineTenstion: number;
              segment: object;
              spanGaps: boolean;
            }[];
            let newItems = [];
            items.forEach(({ label, data }, i) => {
              let itemInfo = this.CL[codelist][label.toLowerCase()];
              if (!itemInfo) return;

              let group =
                itemInfo['product/data type'] || itemInfo.name.split('_').pop();
              let newItem = newItems.find((n) => n.label === `${group}`);

              // If item doesnt exist create one
              if (!newItem) {
                let { r, g, b } = hexToRgb(
                  computedStyle(chartColors[i] || '--chartcol1')
                );
                newItem = {
                  label: `${group}`,
                  data,
                  borderColor: computedStyle(chartColors[ch]),
                  backgroundColor: computedStyle(chartColors[ch++]),
                  lineTension: 0.3,
                  segment: {
                    borderColor: (ctx) =>
                      skipped(ctx, `rgba(${r},${g},${b},0.5)`),
                    borderDash: (ctx) => skipped(ctx, [6, 6]),
                  },
                  spanGaps: true,
                };
                newItems.push(newItem);
                return;
              }

              // If item exists add data to existing item
              newItem.data = newItem.data.map((d, i) => ({
                ...d,
                y: d.y + data[i].y,
              }));
            });
            const key = Object.keys(groups)[0];
            const desired = DESIRED_PRODUCT_ORDER_FOR_MISSIONS[key] ?? [];
            const desiredOrder = desired.slice(0).reverse();
            const finalItems = newItems
              .sort((a, b) => {
                const aIndex = -desiredOrder.indexOf(a.label);
                const bIndex = -desiredOrder.indexOf(b.label);
                return aIndex - bIndex;
              })
              .map((item, i) => {
                let { r, g, b } = hexToRgb(
                  computedStyle(chartColors[i] || '--chartcol1')
                );

                return {
                  ...item,
                  borderColor: computedStyle(chartColors[i]),
                  backgroundColor: computedStyle(chartColors[i]),
                  segment: {
                    borderColor: (ctx) =>
                      skipped(ctx, `rgba(${r},${g},${b},0.5)`),
                    borderDash: (ctx) => skipped(ctx, [6, 6]),
                  },
                };
              });
            return {
              unit,
              timestamps,
              groups: { group1: finalItems },
              missing: this.getMissingTimelinesDates(),
              isDailyTimeline: this.isDailyTimeline,
            };
          }

          ch = 0;
          // Merge cl_sat_product sattelite missions
          if (codelist_group === 'cl_sat_mission') {
            let newGroup = {
              group1: [],
            };
            let cl = this.codelistRaw[codelist];
            let detailed = this.groupedByKey(cl);
            let labels = Object.keys(detailed);
            let a = labels
              .map((l) => {
                if (!groups[l]) return null;
                let { r, g, b } = hexToRgb(
                  computedStyle(color || chartColors[ch] || '--chartcol1')
                );

                let ng = {
                  label: l,
                  data: [],
                  borderColor: computedStyle(chartColors[ch]),
                  backgroundColor: computedStyle(chartColors[ch++]),
                  lineTension: 0.3,
                  segment: {
                    borderColor: (ctx) =>
                      skipped(ctx, `rgba(${r},${g},${b},0.5)`),
                    borderDash: (ctx) => skipped(ctx, [6, 6]),
                  },
                  spanGaps: true,
                };

                let newData = [];
                groups[l]?.forEach((g) => {
                  g.data.forEach((d, i) => {
                    if (!newData[i]) newData[i] = { y: 0, x: '' };
                    newData[i].y += d.y;
                    newData[i].x = d.x;
                  });
                });
                ng.data = newData;
                return ng;
              })
              .filter((a) => a !== null);
            newGroup.group1 = a;
            return {
              unit,
              timestamps,
              groups: newGroup,
              missing: this.getMissingTimelinesDates(),
              isDailyTimeline: this.isDailyTimeline,
            };
          }
          return {
            unit,
            timestamps,
            groups,
            missing: this.getMissingTimelinesDates(),
            isDailyTimeline: this.isDailyTimeline,
          };
        }

        return {
          timestamps,
          unit: unit,
          groups: {
            group1: timeline.product_names?.map((product_name, i) => ({
              label: timelineLabel || iName || product_name,
              data: timeline.values?.map((v, j) => ({
                y: v[i],
                x: new Date(timeline.timestamps[j] * 1000).toISOString(),
              })),
              borderColor: computedStyle(chartColors[i]),
              backgroundColor: computedStyle(chartColors[i]) + '50',
              lineTension: 0.3,
            })),
          },
          missing: this.getMissingTimelinesDates(),
        };
      })
      .filter((a) => a !== null);

    if (sumConditionsTimelines && timelines.length > 1) {
      const [shorterTimelineIdx, longerTimelineIdx] =
        timelines[0].timestamps.length >= timelines[1].timestamps.length
          ? [1, 0]
          : [0, 1];
      const summedTimeline = { ...timelines[longerTimelineIdx] };

      timelines[shorterTimelineIdx].timestamps.forEach((ts, idx) => {
        const _idx = summedTimeline.timestamps.findIndex((_ts) => _ts === ts);

        if (_idx > 0) {
          summedTimeline.groups['group1'].forEach((_, i) => {
            summedTimeline.groups['group1'][i].data[_idx].y =
              summedTimeline.groups['group1'][i].data[_idx].y +
              timelines[shorterTimelineIdx].groups['group1'][i].data[idx].y;
          });
        }
      });
      return [summedTimeline];
    }

    return timelines;
  }

  private filterCodelist = () => {
    const { codelist, codelist_key, codelist_subgroup } = this.metric;

    if (codelist_subgroup && codelist_key) {
      return this.codelistRaw[codelist].filter(
        (c) => c[codelist_key] === codelist_subgroup
      );
    }
    return this.codelistRaw[codelist];
  };

  private getGaugeData(clItem: GaugeClItem) {
    let prods = this.checkCodelistAndFilterData(clItem.mission);
    let data = prods.find((c) => c.product === clItem?.key?.toLowerCase());
    return {
      name: clItem.name,
      timeliness: clItem.timeliness,
      description: clItem.description,
      value: data?.value,
      timestamp: data?.timestamp,
      type: data?.product?.split('_').pop(),
    };
  }

  private getDateString(timestamps: number[]) {
    if (!timestamps?.length) return [];

    return timestamps.sort().map((t) => {
      return moment(t * 1000).format('DD.MM.YYYY');
    });
  }

  private getMissingDates(): { metric: string; dates: string[] }[] | null {
    let data = this.data;
    let conditions = this.getConditions(this.metric.conditions);
    let missingDates = conditions
      .map((c) => {
        let missing = this.getDateString(data[c]?.missing_dates);
        if (!missing?.length) return null;
        return {
          metric: c,
          dates: missing,
        };
      })
      .filter((a) => a !== null);

    if (!missingDates.length) return null;
    return missingDates;
  }

  private getMissingTimelinesDates():
    | { metric: string; dates: string[] }[]
    | null {
    let data = this.timelines.metrics;
    let conditions = this.getConditions(this.metric.conditions);
    let missingDates = conditions
      .map((c) => {
        let missing = this.getDateString(
          data.find((d) => d.metric === c)?.missing_dates
        );
        if (!missing?.length) return null;
        return {
          metric: c,
          dates: missing,
        };
      })
      .filter((a) => a !== null);

    if (!missingDates.length) return null;
    return missingDates;
  }

  /**
   * PUBLIC FUNCTIONS
   */

  public setDataAndTimelines(data: SortedCDASResponse, timelines: ITimelines) {
    this.data = data;
    this.timelines = timelines;
  }

  public setTimeframe(timeframe: string) {
    this.metricTimeframe = timeframe;
  }

  public getTTNormalValue(conditions: string[]) {
    let timestamp = null;
    return [
      conditions.reduce((sum, n) => {
        if (this.data[n].values && Array.isArray(this.data[n].values)) {
          let currTimestamp = this.data[n].values[0].timestamp;
          if (!timestamp || currTimestamp > timestamp)
            timestamp = this.data[n].values[0].timestamp;
          return sum + this.data[n].values.reduce((s, i) => s + i.value, 0);
        }
        return null;
      }, 0),
      timestamp,
    ];
  }

  public getConditions(conditions, isTimeline = false): string[] {
    if (!Array.isArray(conditions)) {
      if (isTimeline) {
        this.isDailyTimeline = false;
        if (Object.keys(conditions).includes('daily')) {
          this.isDailyTimeline = true;
          return conditions['daily'];
        }
      }

      let df = this.metricTimeframe || this.metric?.defaultValue;
      df = Object.keys(conditions).includes(df) ? df : null;
      if (!df && this.metric?.defaultValue) df = this.metric?.defaultValue;

      this.selectedPeriod = df;
      return df ? conditions[df] : conditions[Object.keys(conditions)[0]];
    }
    this.selectedPeriod = null;
    return conditions;
  }

  public haveCondition(conditions, metric): boolean {
    if (Array.isArray(conditions)) {
      return conditions.includes(metric);
    }
    return Object.values(conditions)?.flat().includes(metric);
  }

  public gaugeData(metric: MetricInfo, clItem: GaugeClItem): GaugeItem {
    this.metric = metric;
    return {
      ...this.getGaugeData(clItem),
      selectedPeriod: this.selectedPeriod,
    };
  }

  public counterData(metric: MetricInfo, rawValue?: boolean) {
    this.metric = metric;
    return {
      ...this.getValueAndTimestamp(false, rawValue),
      label: metric.label,
      tooltipItems: this.createTooltip(),
      selectedPeriod: this.selectedPeriod,
      missing: this.getMissingDates(),
    };
  }

  public listData(metric: MetricInfo, reduce?: boolean, color?: string) {
    this.metric = metric;
    this.reduce_list = reduce;
    return {
      label: metric.label,
      metrics: metric.conditions,
      timelines: this.getTimelines(color),
      values: this.getSingleBoolListData(),
      selectedPeriod: this.selectedPeriod,
    };
  }

  public graphsData(
    metric: MetricInfo,
    iName?: string,
    reduce?: boolean,
    singleGroup?: boolean
  ): GraphsData {
    this.metric = metric;
    this.reduce_list = reduce;
    this.singleGroup = singleGroup;

    return {
      name: metric.label,
      unit: metric.props.unit,
      graphs: this.getGraphs(),
      timelines: this.getTimelines(undefined, iName),
      tooltipItems: this.createTooltip(),
      nameTimeframe: this.selectedPeriod,
      group: this.metric.props.detailedGroup,
      selectedPeriod: this.selectedPeriod,
      missing: this.getMissingDates(),
    };
  }
}

export interface GraphsData {
  name: string;
  unit: string;
  graphs: DetailedGraph;
  timelines: any;
  tooltipItems: JSX.Element;
  nameTimeframe: string;
  group: string;
  selectedPeriod: string;
  missing: { metric: string; dates: string[] }[];
}
