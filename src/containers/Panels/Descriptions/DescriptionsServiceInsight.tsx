import { getMetrics as dataPublishedMetrics } from '../ServiceInsight/DataPublishedPanel';
import { getMetrics as userEngagementMetrics } from '../ServiceInsight/UserEngagementPanel';
import { getMetrics as dataAccessedMetrics } from '../ServiceInsight/DataAccessedPanel';
import { getMetrics as streamlinedDataAccessedMetrics } from '../ServiceInsight/StreamlinedDataPanel';
import React from 'react';
import {
  DataAccessedIcon,
  DataPublishedIcon,
  SentinelHubIcon,
} from '../../Navigation/icons';
import { computedStyle } from '@/common/getChartStyles';
import { MainRoutes, ServiceInsightRoutes } from '@/routes/routes.enums';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import {
  DATA_ACCESSED,
  DATA_PUBLISHED,
  STREAMLINED_DATA,
  USERS_ENGAGEMENT,
} from '@/common/constants';

let getMetrics = (
  userEngagement,
  dataPublished,
  dataAccessed,
  streamlinedData
) => [
  {
    name: 'User Engagement',
    pathname:
      MainRoutes.SERVICE_INSIGHT + '/' + ServiceInsightRoutes.USER_ENGAGEMENT,
    Icon: DataAccessedIcon,
    data: userEngagementMetrics(userEngagement).flat(),
  },
  {
    name: 'Data Published',
    pathname:
      MainRoutes.SERVICE_INSIGHT + '/' + ServiceInsightRoutes.DATA_PUBLISHED,
    Icon: DataPublishedIcon,
    data: dataPublishedMetrics(dataPublished).flat(),
  },
  {
    name: 'Data Accessed',
    pathname:
      MainRoutes.SERVICE_INSIGHT + '/' + ServiceInsightRoutes.DATA_ACCESSED,
    Icon: DataAccessedIcon,
    data: dataAccessedMetrics(dataAccessed).flat(),
  },
  {
    name: 'Streamlined Data Accessed',
    pathname:
      MainRoutes.SERVICE_INSIGHT +
      '/' +
      ServiceInsightRoutes.STREAMLINED_DATA_ACCESSED,
    Icon: SentinelHubIcon,
    data: streamlinedDataAccessedMetrics(streamlinedData).flat(),
  },
];
const DescriptionsServiceInsight = () => {
  const { getGroups } = useConfiguration();
  const items = getMetrics.apply(
    null,
    getGroups([
      USERS_ENGAGEMENT,
      DATA_PUBLISHED,
      DATA_ACCESSED,
      STREAMLINED_DATA,
    ])
  );

  const Fields = ({ conditions }: { conditions: any }) => {
    if (Array.isArray(conditions))
      return (
        <>
          <div className="flex-cell text-xs">/</div>
          <div className="flex-cell text-xs">/</div>
          <div className="flex-cell text-xs">{conditions}</div>
        </>
      );
    return (
      <>
        <div className="flex-cell text-xs">{conditions['7d'] || '/'}</div>
        <div className="flex-cell text-xs">{conditions['30d'] || '/'}</div>
        <div className="flex-cell text-xs">/</div>
      </>
    );
  };
  return (
    <div className="p-5 bg-white rounded-xl mx-5 scrollable-x  ">
      <div className="min-w-[1100px]">
        {items.map(({ name, data, Icon, pathname }, i) => {
          return (
            <div key={'a' + i} className="mb-10">
              <div className="flex gap-x-2 items-center">
                <Icon width={30} color={computedStyle('--cssec')} />
                <div className="text-ssec text-3xl font-medium">{name}</div>
              </div>
              <div className="flex-row header">
                <div className="flex-cell  flex-first" style={{ flex: 1.5 }}>
                  Label
                </div>
                <div className="flex-cell">7d metric</div>
                <div className="flex-cell">30d metric</div>
                <div className="flex-cell">Total metric</div>
              </div>
              <div className="flex-row header">
                <div className="flex-cell w-full h-[4px] bg-sgrey self-center rounded-xl p-0 "></div>
              </div>

              {data.map((d, j) => {
                let link = getLink(d.id, pathname);
                return (
                  <div
                    key={i + '_desc_' + j}
                    className="flex-row "
                    style={{
                      background: j % 2 === 0 ? '#ffffff' : '#f9f9f9',
                    }}
                  >
                    <React.Fragment key={'b' + j}>
                      <div
                        className="flex-cell flex-first"
                        style={{ flex: 1.5 }}
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-black underline text-sm  "
                        >
                          {d.label}
                        </a>
                      </div>
                      <Fields conditions={d.conditions} />
                    </React.Fragment>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DescriptionsServiceInsight;

export const getLink = (id: string, pathname: string) => {
  let stringify = JSON.stringify({
    id,
    activePeriod: '30d',
    widgetConfiguration: {},
  });
  let encode = btoa(stringify);
  let link =
    window.location.protocol +
    '//' +
    window.location.host +
    (window.location.pathname || '/') +
    '#/' +
    pathname +
    '?link=' +
    encode;

  return link;
};
