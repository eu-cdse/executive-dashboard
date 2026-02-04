import { Counter } from '@/components/Counter';
import Chart from '@/components/Chart/Chart';
import { PanelWrapper } from '../common';
import { deepClone } from '@/components/InteractiveMap/functions';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { DATA_ACCESSED } from '@/common/constants';

export const getMetrics = (dataAccessed) => [
  [
    dataAccessed.find(({ id }) => id === 'da_grand_total'),
    dataAccessed.find(({ id }) => id === 'da_grand_total_num'),
    {
      ...deepClone(
        dataAccessed.find(({ id }) => id === 'da_products_downloaded_total')
      ),
      id: 'da_download_products_total-sentinels',
      label: 'Total number of downloaded products - Sentinels',
      sumConditionsTimelines: true,
    },
    {
      ...deepClone(
        dataAccessed.find(({ id }) => id === 'da_products_downloaded_total')
      ),
      id: 'da_download_products_total-complementary',
      label: 'Total number of downloaded products - Complementary',
      codelist_reverse_reduce: true,
    },
    {
      ...deepClone(
        dataAccessed.find(({ id }) => id === 'da_download_volume_total')
      ),
      id: 'da_download_volume_total-sentinels',
      label: 'Total volume of downloaded products - Sentinels',
      sumConditionsTimelines: true,
    },
    {
      ...deepClone(
        dataAccessed.find(({ id }) => id === 'da_download_volume_total')
      ),
      id: 'da_download_volume_total-complementary',
      label: 'Total volume of downloaded products - Complementary',
      codelist_reverse_reduce: true,
    },
    {
      ...deepClone(
        dataAccessed.find(({ id }) => id === 'da_products_downloaded')
      ),
      id: 'da_download_products-sentinels',
      label: 'Number of downloaded products - Sentinels',
      sumConditionsTimelines: true,
    },
    {
      ...deepClone(
        dataAccessed.find(({ id }) => id === 'da_products_downloaded')
      ),
      id: 'da_download_products-complementary',
      label: 'Number of downloaded products - Complementary',
      codelist_reverse_reduce: true,
    },
    {
      ...deepClone(dataAccessed.find(({ id }) => id === 'da_download_volume')),
      id: 'da_download_volume-sentinels',
      label: 'Volume of downloaded products - Sentinels',
      sumConditionsTimelines: true,
    },
    {
      ...deepClone(dataAccessed.find(({ id }) => id === 'da_download_volume')),
      id: 'da_download_volume-complementary',
      label: 'Volume of downloaded products - Complementary',
      codelist_reverse_reduce: true,
    },
  ],
  [
    dataAccessed.find(({ id }) => id === 'da_num_requests'),
    dataAccessed.find(({ id }) => id === 'da_query_catalog'),
  ],
];

const DataAccessedPanel = () => {
  const { getGroup } = useConfiguration();
  const metrics = getMetrics(getGroup(DATA_ACCESSED));
  return (
    <PanelWrapper>
      {/** FIRST ROW */}
      <div className="grid-item" key={'a0'}>
        <Counter metric={metrics[0][0]} />
      </div>
      <div className="grid-item" key={'a1'}>
        <Counter metric={metrics[0][1]} />
      </div>

      <div className="grid-item" key={'a2'}>
        <Chart metric={metrics[0][2]} type="bar" reduceList />
      </div>
      {/*     <div className="grid-item" key={'a3'}>
        <Chart metric={metrics[0][3]} type="bar" reduceList />
      </div> */}
      <div className="grid-item" key={'a3'}>
        <Chart metric={metrics[0][4]} type="bar" reduceList />
      </div>
      {/*    <div className="grid-item" key={'a5'}>
        <Chart metric={metrics[0][5]} type="bar" reduceList />
      </div> */}
      <div className="grid-item" key={'a4'}>
        <Chart metric={metrics[0][6]} type="bar" reduceList />
      </div>
      {/*   <div className="grid-item" key={'a7'}>
        <Chart metric={metrics[0][7]} type="bar" reduceList />
      </div> */}
      <div className="grid-item" key={'a5'}>
        <Chart metric={metrics[0][8]} type="bar" reduceList />
      </div>
      {/*  <div className="grid-item" key={'map'}>
        <LinkItem
          defaultMetric={{ id: 'data_access_download_map' } as MetricInfo}
        >
          <InteractiveMapDataDownloaded />
        </LinkItem>
      </div> */}
      {/*     <div className="grid-item" key={'a9'}>
        <Chart metric={metrics[0][9]} type="bar" reduceList />
      </div> */}

      {/** FOURTH ROW */}
      {/*   <div key="divider1" className="text-2xl text-htext">
        <div className="w-max">
          Number of data access requests
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'b0'}>
        <Chart metric={metrics[1][0]} type="bar" />
      </div>
   
      <div key="divider2" className="text-2xl text-htext">
        <div className="w-max">
          Queries to the product catalog
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div> 
      <div className="grid-item" key={'b1'}>
        <Counter metric={metrics[1][1]} />
      </div>*/}
    </PanelWrapper>
  );
};
export default DataAccessedPanel;
