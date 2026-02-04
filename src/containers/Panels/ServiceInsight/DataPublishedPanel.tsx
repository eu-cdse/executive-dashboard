import Chart from '@/components/Chart/Chart';
import { PanelWrapper } from '../common';
import { Counter } from '@/components/Counter';
import { deepClone } from '@/components/InteractiveMap/functions';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { DATA_PUBLISHED } from '@/common/constants';

export const getMetrics = (dataPublished) => [
  [
    {
      ...deepClone(dataPublished.find(({ id }) => id === 'dp_iad_volume')),
      id: 'dp_iad_volume-sentinels',
      label: 'Total volume of published products - Sentinels',
      codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_total_num_prod_published')
      ),
      id: 'dp_total_num_prod_published-sentinels',
      label: 'Total number of published products - Sentinels',
      codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
    },
    dataPublished.find(({ id }) => id === 'dp_num_prod_published'),
    dataPublished.find(({ id }) => id === 'dp_vol_prod_published'),
  ],
  [
    {
      ...deepClone(dataPublished.find(({ id }) => id === 'dp_iad_volume')),
      id: 'dp_iad_volume-sentinels',
      label: 'Total volume of published products - Sentinels',
      codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
    },
    {
      ...deepClone(dataPublished.find(({ id }) => id === 'dp_iad_volume')),
      id: 'dp_iad_volume-complementary',
      label: 'Total volume of published products - Complementary',
      codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
      codelist_reverse_reduce: true,
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_total_num_prod_published')
      ),
      id: 'dp_total_num_prod_published-sentinels',
      label: 'Total number of published products - Sentinels',
      codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_total_num_prod_published')
      ),
      id: 'dp_total_num_prod_published-complementary',
      label: 'Total number of published products - Complementary',
      codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
      codelist_reverse_reduce: true,
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_num_prod_published_daily')
      ),
      id: 'dp_num_prod_published_daily-sentinels',
      label: 'Number of published products - Sentinels',
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_num_prod_published')
      ),
      id: 'dp_num_prod_published-complementary',
      label: 'Number of published products - Complementary',
      codelist_reverse_reduce: true,
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_vol_prod_published_daily')
      ),
      id: 'dp_vol_prod_published_daily-sentinels',
      label: 'Volume of published products - Sentinels',
    },
    {
      ...deepClone(
        dataPublished.find(({ id }) => id === 'dp_vol_prod_published')
      ),
      id: 'dp_vol_prod_published-complementary',
      label: 'Volume of published products - Complementary',
      codelist_reverse_reduce: true,
    },
  ],
  [dataPublished.find(({ id }) => id === 'dp_total_num_data_traces')],
];

const DataPublishedPanel = () => {
  const { getGroup } = useConfiguration();
  const metrics = getMetrics(getGroup(DATA_PUBLISHED));
  return (
    <PanelWrapper>
      <div key="divider0" className="text-2xl text-htext">
        <div className="w-max">
          Instant Access
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      {metrics[0].map((json, i) => (
        <div className="grid-item" key={'a' + i}>
          <Counter metric={json} />
        </div>
      ))}
      <div className="grid-item" key={'b0'}>
        <Chart metric={metrics[1][0]} type="bar" reduceList />
      </div>
      {/*    <div className="grid-item" key={'b1'}>
        <Chart metric={metrics[1][1]} type="bar" reduceList />
      </div> */}
      <div className="grid-item" key={'b2'}>
        <Chart metric={metrics[1][2]} type="bar" reduceList />
      </div>
      {/*     <div className="grid-item" key={'b3'}>
        <Chart metric={metrics[1][3]} type="bar" reduceList />
      </div> */}
      <div className="grid-item" key={'b4'}>
        <Chart metric={metrics[1][4]} type="bar" reduceList />
      </div>
      {/*   <div className="grid-item" key={'b5'}>
        <Chart metric={metrics[1][5]} type="bar" reduceList />
      </div> */}
      <div className="grid-item" key={'b6'}>
        <Chart metric={metrics[1][6]} type="bar" reduceList />
      </div>
      {/*    <div className="grid-item" key={'b7'}>
        <Chart metric={metrics[1][7]} type="bar" reduceList />
      </div> */}
      {/*  <div className="grid-item" key={'c3'}>
        <Chart metric={metrics[3][3]} type="bar" reduceList />
      </div> */}
      <div key="divider2" className="text-2xl text-htext">
        <div className="w-max">
          Data Traces
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'d0'}>
        <Counter metric={metrics[2][0]} />
      </div>
      <div className="grid-item" key={'d1'}>
        <Chart metric={metrics[2][0]} type="timeline" />
      </div>
    </PanelWrapper>
  );
};
export default DataPublishedPanel;
