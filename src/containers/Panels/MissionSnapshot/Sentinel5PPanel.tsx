import { PanelWrapper } from '../common';
import GaugeWrapper from '@/components/Gauge/GaugeWrapper';
import { deepClone } from '@/components/InteractiveMap/functions';
import Chart from '@/components/Chart/Chart';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { DATA_PUBLISHED, MISSION_SNAPSHOT } from '@/common/constants';

const product = 'S5P';

const getMetrics = (missionSnapshot, dataPublished) => [
  missionSnapshot.find(({ id }) => id === 'product_timeliness_perc'),
  {
    ...deepClone(
      dataPublished.find(({ id }) => id === 'dp_num_prod_published_daily')
    ),
    label: 'Number of published products - Sentinel-5P',
    codelist_reduce: [product],
  },
  {
    ...deepClone(
      dataPublished.find(({ id }) => id === 'dp_vol_prod_published_daily')
    ),
    label: 'Volume of published products - Sentinel-5P',
    codelist_reduce: [product],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
    ),
    codelist_reduce: [product],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_90_time')
    ),
    codelist_reduce: [product],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_95_time')
    ),
    codelist_reduce: [product],
  },
  [
    {
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_bucket')
      ),
      codelist_reduce: ['S5P'],
      productKey: 's5p_l1b_ntc',
      label: 'Product timeliness - L1B NTC',
    },
    {
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_bucket')
      ),
      codelist_reduce: ['S5P'],
      productKey: 's5p_l2_nrt',
      label: 'Product timeliness - L2 NRT',
    },
    {
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_bucket')
      ),
      codelist_reduce: ['S5P'],
      productKey: 's5p_l2_ntc',
      label: 'Product timeliness - L2 NTC',
    },
  ],
];

const Sentinel5PPanel = () => {
  const { codelistRaw, getGroups } = useConfiguration();

  const items = getMetrics.apply(
    null,
    getGroups([MISSION_SNAPSHOT, DATA_PUBLISHED])
  );

  let cl = codelistRaw[items[0].codelist].filter((c) => c.mission === product);

  return (
    <PanelWrapper>
      <div key="divider0" className="text-2xl text-htext">
        <div className="w-max">
          Publication Timeliness
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      {/* <div className="grid-item relative" key={'x0'}>
        <Chart type="timeline" metric={items[3]} reduceList />
      </div>
        <div className="grid-item relative" key={'x1'}>
        <Chart type="timeline" metric={items[4]} reduceList />
      </div>
      <div className="grid-item relative" key={'x2'}>
        <Chart type="timeline" metric={items[5]} reduceList />
      </div> */}
      {cl.map((c, i) => (
        <div className="grid-item relative" key={'a' + i}>
          <GaugeWrapper metric={items[0]} clItem={c} />
        </div>
      ))}
      {items[6].map((item, i) => (
        <div className="grid-item relative" key={`th${i}`}>
          <Chart type="timeliness-histogram" metric={item} reduceList />
        </div>
      ))}
      <div key="divider1" className="text-2xl text-htext">
        <div className="w-max">
          Data published
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item relative" key={'b0'}>
        <Chart metric={items[1]} type="bar" reduceList singleGroup />
      </div>
      <div className="grid-item relative" key={'b1'}>
        <Chart metric={items[2]} type="bar" reduceList singleGroup />
      </div>
    </PanelWrapper>
  );
};
export default Sentinel5PPanel;
