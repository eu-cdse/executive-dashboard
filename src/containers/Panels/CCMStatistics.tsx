import React from 'react';
import {
  DATA_ACCESSED,
  DATA_PUBLISHED,
  USERS_ENGAGEMENT,
} from '@/common/constants';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { Counter } from '@/components/Counter';
import { PanelWrapper } from './common';
import Chart from '@/components/Chart/Chart';

export const getMetrics = (userEngagement, dataAccessed, dataPublished) => [
  [
    // userEngagement.find(({ id }) => id === 'ue_total_num_registered_users_ccm'),
    userEngagement.find(({ id }) => id === 'ue_total_num_active_ccm'),
    userEngagement.find(({ id }) => id === 'ue_num_active_users_daily_ccm'),
    // userEngagement.find(({ id }) => id === 'ue_num_queries_ccm'),
    // userEngagement.find(({ id }) => id === 'ue_total_num_queries_ccm'),
  ],
  [
    // dataPublished.find(({ id }) => id === 'dp_num_missions_ccm'),
    dataPublished.find(({ id }) => id === 'dp_total_num_prod_published_ccm'),
    // dataPublished.find(({ id }) => id === 'dp_num_prod_published_ccm'),
    dataPublished.find(({ id }) => id === 'dp_iad_volume_ccm'),
    // dataPublished.find(({ id }) => id === 'dp_vol_prod_published_ccm'),
  ],
  [
    // dataAccessed.find(({ id }) => id === 'da_grand_total_ccm'),
    // dataAccessed.find(({ id }) => id === 'da_grand_total_num_ccm'),
    dataAccessed.find(({ id }) => id === 'da_products_downloaded_total_ccm'),
    dataAccessed.find(({ id }) => id === 'da_products_downloaded_ccm'),
    dataAccessed.find(({ id }) => id === 'da_download_volume_total_ccm'),
    dataAccessed.find(({ id }) => id === 'da_download_volume_ccm'),
  ],
];

const CCMStatistics = () => {
  const { getGroups } = useConfiguration();
  const metrics = getMetrics.apply(
    null,
    getGroups([USERS_ENGAGEMENT, DATA_ACCESSED, DATA_PUBLISHED])
  );

  return (
    <PanelWrapper>
      <div key="divider0" className="text-2xl text-htext">
        <div className="w-max">
          User Engagement
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      {metrics[0].map((json, i) => (
        <div className="grid-item" key={'a' + i}>
          <Counter metric={json} />
        </div>
      ))}
      <div key="divider1" className="text-2xl text-htext">
        <div className="w-max">
          Data Published
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      {/* <div className="grid-item" key={'b0'}>
        <Counter metric={metrics[1][0]} />
      </div> */}
      <div className="grid-item" key={'b1'}>
        <Chart metric={metrics[1][0]} type="bar" reduceList singleGroup />
      </div>
      {/* <div className="grid-item" key={'b2'}>
        <Chart metric={metrics[1][2]} type="bar" reduceList singleGroup />
      </div> */}
      <div className="grid-item" key={'b3'}>
        <Chart metric={metrics[1][1]} type="bar" reduceList singleGroup />
      </div>
      {/* <div className="grid-item" key={'b4'}>
        <Chart metric={metrics[1][4]} type="bar" reduceList singleGroup />
      </div> */}
      <div key="divider2" className="text-2xl text-htext">
        <div className="w-max">
          Data Downloaded
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      {/* <div className="grid-item" key={'c0'}>
        <Counter metric={metrics[2][0]} />
      </div>
      <div className="grid-item" key={'c1'}>
        <Counter metric={metrics[2][1]} />
      </div> */}
      <div className="grid-item" key={'c2'}>
        <Chart metric={metrics[2][0]} type="bar" reduceList singleGroup />
      </div>
      <div className="grid-item" key={'c3'}>
        <Chart metric={metrics[2][1]} type="bar" reduceList singleGroup />
      </div>
      <div className="grid-item" key={'c4'}>
        <Chart metric={metrics[2][2]} type="bar" reduceList singleGroup />
      </div>
      <div className="grid-item" key={'c5'}>
        <Chart metric={metrics[2][3]} type="bar" reduceList singleGroup />
      </div>
    </PanelWrapper>
  );
};

export default CCMStatistics;
