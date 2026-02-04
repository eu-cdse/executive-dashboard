import { computedStyle } from '@/common/getChartStyles';
import { Counter } from '../Counter';
import {
  Sentinel1Icon,
  Sentinel2Icon,
  Sentinel3Icon,
  Sentinel5PIcon,
} from '@/containers/Navigation/icons';
import { useDataStore } from '@/store';
import { DATA_PUBLISHED, MISSION_SNAPSHOT } from '@/common/constants';
import { motion } from 'framer-motion';
import GaugeWrapper from '@/components/Gauge/GaugeWrapper';
import Spinner from '../Spinner/Spinner';
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

export const MissionSnapShotHighlights = () => {
  const p = useDataStore((state) => state.data);
  const { codelistRaw, metricsGroups, getGroup } = useConfiguration();
  const missionSnaphost = getGroup(MISSION_SNAPSHOT);
  if (!p || !missionSnaphost)
    return (
      <div
        className={`img-overlay absolute top-0 left-0 w-full h-full flex flex-row items-center gap-x-2`}
      >
        <Spinner />
      </div>
    );

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

  data.forEach((d) =>
    missionsData.forEach((m) => {
      let newMetric = { ...d };
      newMetric.codelist_subgroup = m.key;
      m.data.push(newMetric);
    })
  );

  return (
    <div className="flex w-11/12 gap-x-2 h-full items-center">
      {missionsData.map(({ data, Icon, name }, i) => (
        <motion.div
          key={'a' + i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.5,
              type: 'spring',
              stiffness: 50,
              delay: 0.1 + i * 0.1,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0,
            transition: { duration: 0.5, delay: 0.1 + i * 0.1 },
          }}
          className="relative grid-item bss rounded-lg min-w-[200px] max-h-[590px]"
        >
          <div className="flex flex-col items-center py-3 h-full">
            <Icon color={computedStyle('--csmain2')} width={100} height={100} />
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
              <GaugeWrapper metric={mData} clItem={cl[i]} nobss small />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
