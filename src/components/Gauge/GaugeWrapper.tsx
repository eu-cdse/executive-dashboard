import { MetricInfo, useConfigurationStore, useDataStore } from '@/store';
import Gauge from './Gauge';
import { useEffect, useState } from 'react';
import { LinkItem } from '../DeepLink';
import TimePeriodTag from '../TimePeriodTag/TimePeriodTag';

interface Props {
  clItem: GaugeClItem;
  metric: MetricInfo;
  nobss?: boolean;
  middle?: boolean;
  small?: boolean;
}

export interface GaugeClItem {
  name: string;
  mission: string;
  timeliness: string;
  key: string;
  description: string;
}

export interface GaugeItem {
  name: string;
  timeliness: string;
  description: string;
  value: number;
  type: string;
  selectedPeriod: string;
  timestamp: number;
}
const GaugeWrapper: React.FC<Props> = ({
  metric,
  clItem,
  nobss,
  middle,
  small,
}) => {
  const [data, setData] = useState<GaugeItem>(null);
  const p = useDataStore((state) => state.data);
  const activePeriod = useConfigurationStore((s) => s.activePeriod);
  useEffect(() => {
    p.setTimeframe(activePeriod);
    let d = p.gaugeData(metric, clItem);
    setData(d);
  }, [activePeriod]);
  return data ? (
    !nobss ? (
      <LinkItem
        defaultMetric={{ id: data.name + data.timeliness } as MetricInfo}
      >
        <div
          className={`w-full h-full ${
            !nobss ? 'bss' : ''
          } flex justify-center items-center rounded-xl`}
        >
          <Gauge gauge={data} middle={middle} />
        </div>
        <TimePeriodTag
          shouldShow={!!data.selectedPeriod}
          timePeriod={data.selectedPeriod}
        />
      </LinkItem>
    ) : (
      <>
        <Gauge gauge={data} middle={middle} small={small} />
        <TimePeriodTag
          shouldShow={!!data.selectedPeriod}
          timePeriod={data.selectedPeriod}
        />
      </>
    )
  ) : null;
};

export default GaugeWrapper;
