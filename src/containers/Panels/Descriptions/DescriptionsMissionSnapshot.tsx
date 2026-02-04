import { SatelliteIcon } from '@/containers/Navigation/icons';
import { computedStyle } from '@/common/getChartStyles';
import { MainRoutes } from '@/routes/routes.enums';
import React from 'react';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { MISSION_SNAPSHOT } from '@/common/constants';

const getMetrics = (missionSnapshot) => [
  {
    name: 'Mission Snapshot',
    key: 'Mission Snapshot',
    Icon: SatelliteIcon,
    pathname: MainRoutes.MISSION_SNAPSHOT,
    data: [
      missionSnapshot.find(
        ({ id }) => id === 'product_timeliness_default_perc'
      ),
      missionSnapshot.find(({ id }) => id === 'product_timeliness_perc'),
    ],
    cl: [],
  },
];

const DescriptionsMissionSnapshot = () => {
  const { getGroup } = useConfiguration();
  const items = getMetrics(getGroup(MISSION_SNAPSHOT));
  return (
    <div className="p-5 bg-white rounded-xl mx-5 scrollable-x">
      <div className="min-w-[1100px]">
        {items.map(({ name, data, cl, Icon }, i) => {
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
              </div>
              <div className="flex-row header">
                <div className="flex-cell w-full h-[4px] bg-sgrey self-center rounded-xl p-0 "></div>
              </div>

              {data.map((d, j) => {
                if (j === 0 && i !== 0) {
                  return cl.map((c, k) => {
                    return (
                      <div
                        key={i + '_desc_' + j + '_' + k}
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
                            <span className="text-black  text-sm  ">
                              {c.name}
                            </span>
                          </div>
                          <div className="flex-cell text-xs">
                            {d.conditions['7d'] || '/'}
                          </div>
                          <div className="flex-cell text-xs">
                            {d.conditions['30d'] || '/'}
                          </div>
                        </React.Fragment>
                      </div>
                    );
                  });
                }
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
                        <span className="text-black  text-sm  ">{d.label}</span>
                      </div>
                      <div className="flex-cell text-xs">
                        {d.conditions['7d'] || '/'}
                      </div>
                      <div className="flex-cell text-xs">
                        {d.conditions['30d'] || '/'}
                      </div>
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

export default DescriptionsMissionSnapshot;
