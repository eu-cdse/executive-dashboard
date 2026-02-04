import { DATA_PUBLISHED, MISSION_SNAPSHOT } from '@/common/constants';
import { MetricInfo, useDataStore } from '@/store';
import { PanelWrapper } from '../common';
import { LinkItem } from '@/components/DeepLink';
import { Counter } from '@/components/Counter';
import {
  Sentinel1Icon,
  Sentinel2Icon,
  Sentinel3Icon,
  Sentinel5PIcon,
} from '@/containers/Navigation/icons';
import { computedStyle } from '@/common/getChartStyles';
import Chart from '@/components/Chart/Chart';
import GaugeWrapper from '@/components/Gauge/GaugeWrapper';
import { useConfiguration } from '@/store/ConfigurationsProvider';

const getMetrics = (metricsGroups) => [
  {
    metric: 'smmp1__cf__iad_volume',
    type: 'number',
    json: metricsGroups.find((i) => i.id === DATA_PUBLISHED).json,
  },
  {
    metric: 'smmp1__cf__total_num_prod_published',
    type: 'number',
    json: metricsGroups.find((i) => i.id === DATA_PUBLISHED).json,
  },
];

const MissionSnapshot = () => {
  const { codelistRaw, metricsGroups, getGroup } = useConfiguration();
  const p = useDataStore((state) => state.data);
  const missionSnaphost = getGroup(MISSION_SNAPSHOT);
  let mData = missionSnaphost.find(
    ({ id }) => id === 'product_timeliness_default_perc'
  );
  let cl = codelistRaw[mData.codelist];

  let data = getMetrics(metricsGroups).map((m) =>
    m.json.find((j) => p.haveCondition(j.conditions, m.metric))
  );

  let missionsData = [
    {
      name: 'Sentinel-1',
      Icon: Sentinel1Icon,
      key: 'S1',
      data: [],
    },
    {
      name: 'Sentinel-2',
      Icon: Sentinel2Icon,
      key: 'S2',
      data: [],
    },
    {
      name: 'Sentinel-3',
      Icon: Sentinel3Icon,
      key: 'S3',
      data: [],
    },
    {
      name: 'Sentinel-5P',
      Icon: Sentinel5PIcon,
      key: 'S5P',
      data: [],
    },
  ];
  let graphs = [...data].map((d) => {
    d.codelist_reduce = missionsData.map((m) => m.key);
    return d;
  });

  data.forEach((d) =>
    missionsData.forEach((m) => {
      let newMetric = { ...d };
      newMetric.codelist_subgroup = m.key;
      m.data.push(newMetric);
    })
  );

  return (
    <div>
      <PanelWrapper>
        {missionsData.map(({ data, Icon, name, key }, i) => (
          <div key={'a' + i} className="relative grid-item bss rounded-lg">
            <LinkItem defaultMetric={{ id: key } as MetricInfo}>
              <div className="flex flex-col items-center justify-around py-3 h-full">
                <Icon color={computedStyle('--csmain2')} width={120} />
                <div className="mt-4 mb-2 flex flex-col items-center w-full">
                  <div className="text-ssec text-4xl mb-2">{name}</div>
                  <div className="w-8/12 h-[2px] bg-smain2" />
                </div>
                {data.map((d, j) => (
                  <div key={j + 'nes'}>
                    <Counter metric={d} nobss dontLink />
                  </div>
                ))}
                <div className="h-[40%] w-full">
                  <GaugeWrapper metric={mData} clItem={cl[i]} nobss middle />
                </div>
              </div>
            </LinkItem>
          </div>
        ))}
        <div key="b0" className="relative grid-item">
          <Chart type="bar" metric={graphs[1]} reduceList />
        </div>
        <div key="b1" className="relative grid-item">
          <Chart type="bar" metric={graphs[0]} reduceList />
        </div>
      </PanelWrapper>
    </div>
  );
};
export default MissionSnapshot;
