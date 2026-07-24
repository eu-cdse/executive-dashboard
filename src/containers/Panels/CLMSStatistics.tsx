import React from 'react';
import { STREAMLINED_DATA, USERS_ENGAGEMENT } from '@/common/constants';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { Counter } from '@/components/Counter';
import { PanelWrapper } from './common';
import Chart from '@/components/Chart/Chart';

export const getMetrics = (userEngagement, streamlinedData) => [
  [
    userEngagement.find(
      ({ id }) => id === 'ue_total_num_registered_users_clms'
    ),
    // userEngagement.find(({ id }) => id === 'ue_total_num_active_clms'),
    userEngagement.find(({ id }) => id === 'ue_num_active_users_daily_clms'),
  ],
  [
    streamlinedData.find(({ id }) => id === 'clms_req_browser'),
    streamlinedData.find(
      ({ id }) => id === 'clms_num_products_accessed_browser'
    ),
    streamlinedData.find(({ id }) => id === 'clms_api_requests'),
    streamlinedData.find(({ id }) => id === 'clms_pu_con'),
  ],
];

const CLMSStatistics = () => {
  const { getGroups } = useConfiguration();
  const metrics = getMetrics.apply(
    null,
    getGroups([USERS_ENGAGEMENT, STREAMLINED_DATA])
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
          Copernicus Browser access
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'d0'}>
        <Chart metric={metrics[1][0]} type="bar" reduceList />
      </div>

      <div key="divider2" className="text-2xl text-htext">
        <div className="w-max">
          API access
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'e0'}>
        <Chart metric={metrics[1][2]} type="pie" />
      </div>
      <div className="grid-item" key={'e1'}>
        <Chart metric={metrics[1][3]} type="pie" />
      </div>
    </PanelWrapper>
  );
};

export default CLMSStatistics;
