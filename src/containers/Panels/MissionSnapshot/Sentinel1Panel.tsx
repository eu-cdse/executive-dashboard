import { PanelWrapper } from '../common';
import GaugeWrapper from '@/components/Gauge/GaugeWrapper';
import { deepClone } from '@/components/InteractiveMap/functions';
import Chart from '@/components/Chart/Chart';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { DATA_PUBLISHED, MISSION_SNAPSHOT } from '@/common/constants';

const product = 'S1';

const getMetrics = (missionSnapshot, dataPublished) => [
  missionSnapshot.find(({ id }) => id === 'product_timeliness_perc'),
  missionSnapshot.find(({ id }) => id === 'product_timeliness_default_perc'),
  {
    ...deepClone(
      dataPublished.find(({ id }) => id === 'dp_num_prod_published_daily')
    ),
    label: 'Number of published products - Sentinel-1',
    codelist_reduce: [product],
  },
  {
    ...deepClone(
      dataPublished.find(({ id }) => id === 'dp_vol_prod_published_daily')
    ),
    label: 'Volume of published products - Sentinel-1',
    codelist_reduce: [product],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
    ),
    codelist_reduce: [product],
    props: {
      timelineLabel: 'Sentinel-1',
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
      ).props,
    },
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_90_time')
    ),
    codelist_reduce: [product],
    props: {
      timelineLabel: 'Sentinel-1',
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_90_time')
      ).props,
    },
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_95_time')
    ),
    codelist_reduce: [product],
    props: {
      timelineLabel: 'Sentinel-1',
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_95_time')
      ).props,
    },
  },
  [
    {
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_bucket')
      ),
      codelist_reduce: ['S1'],
      productKey: 's1_nrt',
      label: 'Product timeliness - NRT',
    },
    {
      ...deepClone(
        missionSnapshot.find(({ id }) => id === 'product_timeliness_bucket')
      ),
      codelist_reduce: ['S1'],
      productKey: 's1_ntc',
      label: 'Product timeliness - NTC',
    },
  ],
];

const Sentinel1Panel = () => {
  const { codelistRaw, getGroups } = useConfiguration();

  const items = getMetrics.apply(
    null,
    getGroups([MISSION_SNAPSHOT, DATA_PUBLISHED])
  );

  let cl = codelistRaw[items[0].codelist].filter((c) => c.mission === product);
  let cl1 = codelistRaw[items[1].codelist].filter((c) => c.mission === product);

  return (
    <PanelWrapper>
      <div key="divider0" className="text-2xl text-htext">
        <div className="w-max">
          Publication Timeliness
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      {/* <div className="grid-item relative" key={'x0'}>
        <Chart type="timeline" metric={items[4]} reduceList />
      </div>
      <div className="grid-item relative" key={'x1'}>
        <Chart type="timeline" metric={items[5]} reduceList />
      </div>
      <div className="grid-item relative" key={'x2'}>
        <Chart type="timeline" metric={items[6]} reduceList />
      </div> */}
      {cl.map((c, i) => (
        <div className="grid-item relative" key={`a0${i}`}>
          <GaugeWrapper metric={items[0]} clItem={c} />
        </div>
      ))}
      {cl1.map((c) => (
        <div className="grid-item relative" key={'a1'}>
          <GaugeWrapper metric={items[1]} clItem={c} />
        </div>
      ))}
      {items[7].map((item, i) => (
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
        <Chart metric={items[2]} type="bar" reduceList singleGroup />
      </div>
      <div className="grid-item relative" key={'b1'}>
        <Chart metric={items[3]} type="bar" reduceList singleGroup />
      </div>
    </PanelWrapper>
  );
};
export default Sentinel1Panel;
