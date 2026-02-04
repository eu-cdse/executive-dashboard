import { PanelWrapper } from './common';
import Chart from '@/components/Chart/Chart';
import ServicesTable from '@/components/ServicesTable/ServicesTable';
import { deepClone } from '@/components/InteractiveMap/functions';
import { LinkItem } from '@/components/DeepLink';
import { MetricInfo } from '@/store';
import InteractiveMapDataDownloaded from '@/components/InteractiveMap/InteractiveMapDataDownloaded';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { MISSION_SNAPSHOT, USERS_ENGAGEMENT } from '@/common/constants';
import { Counter } from '@/components/Counter';

export const getMetrics = (missionSnapshot, userEngagement) => [
  [
    userEngagement.find(({ id }) => id === 'ue_num_visitors_web'),
    userEngagement.find(({ id }) => id === 'ue_num_registered_daily'),
    userEngagement.find(({ id }) => id === 'ue_total_num_active'),
    userEngagement.find(({ id }) => id === 'ue_num_active_users_last_day'),
    userEngagement.find(({ id }) => id === 'ue_num_active_users_last_year'),
    userEngagement.find(
      ({ id }) => id === 'ue_num_active_users_per_sentinel_mission'
    ),
  ],
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
    ),
    codelist_reduce: ['S1'],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
    ),
    codelist_reduce: ['S2'],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
    ),
    codelist_reduce: ['S3'],
  },
  {
    ...deepClone(
      missionSnapshot.find(({ id }) => id === 'product_timeliness_avg_time')
    ),
    codelist_reduce: ['S5P'],
  },
];

const StagePage = () => {
  const { metricsGroups, getGroups } = useConfiguration();
  const metrics = getMetrics.apply(
    null,
    getGroups([MISSION_SNAPSHOT, USERS_ENGAGEMENT])
  );
  let data = metricsGroups
    .map(({ json }) => {
      let data = json.filter((item) => item.type === 'list');
      return data.flat();
    })
    .filter((i) => i.length)
    .flat();

  let orderedData = data.filter((item) => item.props.group === 'onDemand');
  let onDemandServices = {
    label: 'On Demand Production (ODP)',
    items: orderedData,
  };
  return (
    <PanelWrapper>
      <div key="divider1" className="text-2xl text-htext">
        <div className="w-max">
          User Engagement
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'a0'}>
        <Chart metric={metrics[0][0]} type="timeline" />
      </div>
      <div className="grid-item" key={'a1'}>
        <Chart metric={metrics[0][1]} type="timeline" />
      </div>
      <div className="grid-item" key={'a2'}>
        <Counter metric={metrics[0][2]} tag={USERS_ENGAGEMENT} />
      </div>
      <div className="grid-item" key={'a3'}>
        <Counter metric={metrics[0][3]} tag={USERS_ENGAGEMENT} />
      </div>
      <div className="grid-item" key={'a4'}>
        <Counter metric={metrics[0][4]} tag={USERS_ENGAGEMENT} />
      </div>
      <div className="grid-item" key={'a5'}>
        <Chart
          metric={metrics[0][5]}
          tag={USERS_ENGAGEMENT}
          type="bar"
          reduceList
        />
      </div>

      <div key="divider2" className="text-2xl text-htext">
        <div className="w-max">
          Service Health
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'c0'}>
        <div className="mb-5 bss py-5 rounded-lg">
          <div className="text-smain2 text-2xl pl-4">
            {onDemandServices.label}
          </div>
          <ServicesTable metrics={onDemandServices.items} />
        </div>
      </div>
      <div key="divider3" className="text-2xl text-htext">
        <div className="w-max">
          Sentinel-1
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item relative" key={'x0'}>
        <Chart type="timeline" metric={metrics[1]} reduceList />
      </div>
      <div key="divider4" className="text-2xl text-htext">
        <div className="w-max">
          Sentinel-2
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item relative" key={'x1'}>
        <Chart type="timeline" metric={metrics[2]} reduceList />
      </div>
      <div key="divider5" className="text-2xl text-htext">
        <div className="w-max">
          Sentinel-3
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item relative" key={'x2'}>
        <Chart type="timeline" metric={metrics[3]} reduceList />
      </div>
      <div key="divider6" className="text-2xl text-htext">
        <div className="w-max">
          Sentinel-5P
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item relative" key={'x3'}>
        <Chart type="timeline" metric={metrics[4]} reduceList />
      </div>

      <div key="divider7" className="text-2xl text-htext">
        <div className="w-max">
          Data Access
          <div className="w-full h-[2px] bg-ssec" />
        </div>
      </div>
      <div className="grid-item" key={'map'}>
        <LinkItem
          defaultMetric={{ id: 'data_access_download_map' } as MetricInfo}
        >
          <InteractiveMapDataDownloaded />
        </LinkItem>
      </div>
    </PanelWrapper>
  );
};

export default StagePage;
