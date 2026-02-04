import { computedStyle } from '@/common/getChartStyles';
import { ServiceHealthIcon } from '@/containers/Navigation/icons';
import { IGroups, groups as shGroups } from '../ServiceHealth';
import { deepClone } from '@/components/InteractiveMap/functions';
import { sortOnly } from '@/functions';
import React from 'react';
import { getLink } from './DescriptionsServiceInsight';
import { useDataStore } from '@/store';
import { useConfiguration } from '@/store/ConfigurationsProvider';

let groups: IGroups = deepClone(shGroups);

const DescriptionsServiceHealth = () => {
  const p = useDataStore((state) => state.data);
  const { metricsGroups } = useConfiguration();
  let data = metricsGroups
    .map(({ json }) => {
      let data = json.filter((item) => item.type === 'list');
      return data.flat();
    })
    .filter((i) => i.length)
    .flat();

  let orderedData = sortOnly(data);
  Object.keys(groups).forEach((key) => {
    groups[key].items = orderedData.filter((item) => item.props.group === key);
  });

  return (
    <div className="p-5 bg-white rounded-xl mx-5 scrollable-x">
      <div className="min-w-[1100px]">
        <div className="flex gap-x-2 items-center">
          <ServiceHealthIcon width={30} color={computedStyle('--cssec')} />
          <div className="text-ssec text-3xl font-medium">Service Health</div>
        </div>
        <div className="flex-row header">
          <div className="flex-cell  flex-first" style={{ flex: 1.4 }}>
            Label
          </div>
          <div className="flex-cell">Availability metric [0/1]</div>
          <div className="flex-cell">1h uptime percentage</div>
          <div className="flex-cell">30d uptime percentage</div>
        </div>
        <div className="flex-row header">
          <div className="flex-cell w-full h-[4px] bg-sgrey self-center rounded-xl p-0 "></div>
        </div>
        {Object.values(groups).map(({ label, items }, i) =>
          items.length ? (
            <React.Fragment key={'servicehealthitem' + i}>
              <div className="flex-row mt-3">
                <div className="flex-cell text-smain2 text-left text-2xl pl-4">
                  {label}
                </div>
              </div>
              <div className="flex-row">
                <div className="w-full h-[2px] bg-sgrey self-center rounded-xl p-0 "></div>
              </div>
              {items.map((item, j) => {
                let data = p.listData(item, false, '--cssec');
                return [data.values[0]].map((v, k) => {
                  let link = getLink(v.label, 'service-health');

                  return (
                    <div
                      key={'servicehealthitem' + i + '_' + j + '_' + k}
                      className="flex-row"
                      style={{
                        background: j % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      }}
                    >
                      <div
                        className="flex-cell flex-first "
                        style={{ flex: 1.4 }}
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-black text-sm"
                        >
                          {item.label}
                        </a>
                      </div>
                      <div className="flex-cell text-xs">
                        {item.conditions[0]}
                      </div>
                      <div className="flex-cell text-xs">
                        {item.conditions[1]}
                      </div>
                      <div className="flex-cell text-xs">
                        {item.conditions[2]}
                      </div>
                    </div>
                  );
                });
              })}
            </React.Fragment>
          ) : null
        )}
      </div>
    </div>
  );
};

export default DescriptionsServiceHealth;
