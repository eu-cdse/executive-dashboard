import { Counter } from '@/components/Counter';
import InteractiveMap from '@/components/InteractiveMap/InteractiveMap';
import Chart from '@/components/Chart/Chart';
import { PanelWrapper } from '../common';
import { LinkItem } from '@/components/DeepLink';
import { MetricInfo } from '@/store';
import { USERS_ENGAGEMENT } from '@/common/constants';
import { useConfiguration } from '@/store/ConfigurationsProvider';

export const getMetrics = (userEngagement) => [
  userEngagement.find(({ id }) => id === 'ue_total_num_registered_users'),
  userEngagement.find(({ id }) => id === 'ue_num_active_users_daily'),
  userEngagement.find(({ id }) => id === 'ue_num_visitors_cdse_br'),
  userEngagement.find(({ id }) => id === 'ue_num_sh_requests_browser'),
  userEngagement.find(({ id }) => id === 'ue_num_total_queries'),
  userEngagement.find(({ id }) => id === 'ue_num_queries'),
  userEngagement.find(({ id }) => id === 'ue_num_requests_obj_storage'),
  userEngagement.find(({ id }) => id === 'attract20'),
];

const UserEngagementPanel = () => {
  const { getGroup } = useConfiguration();
  const metrics = getMetrics(getGroup(USERS_ENGAGEMENT));
  return (
    <PanelWrapper>
      {/** FIRST ROW */}
      {metrics.slice(0, 4).map((json, i) => (
        <div className="grid-item" key={'a' + i}>
          <Counter metric={json} />
        </div>
      ))}

      {/** SECOND ROW */}
      <div className="grid-item" key={'b0'}>
        <LinkItem defaultMetric={{ id: 'usersMap' } as MetricInfo}>
          <InteractiveMap />
        </LinkItem>
      </div>

      {/** THIRD ROW */}
      <div key="divider0" className="text-2xl text-htext">
        <div className="w-max">
          Data downloaded
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'c0'}>
        <Chart metric={metrics[7]} type="pie" />
      </div>
      <div key="divider1" className="text-2xl text-htext">
        <div className="w-max">
          Activity Summary
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'d0'}>
        <Chart type="timeline" metric={metrics[2]} />
      </div>
      <div className="grid-item" key={'d1'}>
        <Chart type="bar" metric={metrics[3]} />
      </div>
      <div key="divider2" className="text-2xl text-htext">
        <div className="w-max">
          Queries to the Product Catalogue
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'e0'}>
        <Counter metric={metrics[4]} />
      </div>
      <div className="grid-item" key={'e1'}>
        <Counter metric={metrics[5]} />
      </div>

      <div key="divider3" className="text-2xl text-htext">
        <div className="w-max">
          Number of data access requests
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'f0'}>
        <Counter metric={metrics[6]} />
      </div>
      <div className="grid-item" key={'f1'}>
        <Chart type="timeline" metric={metrics[6]} />
      </div>
    </PanelWrapper>
  );
};
export default UserEngagementPanel;
