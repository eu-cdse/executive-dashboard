import Chart from '@/components/Chart/Chart';
import { PanelWrapper } from '../common';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { STREAMLINED_DATA } from '@/common/constants';

export enum GraphTypes {
  BAR = 'bar',
  PIE = 'pie',
}

export const getMetrics = (streamlinedData) => [
  streamlinedData.find(({ id }) => id === 'shoe_data_requests'),
  streamlinedData.find(({ id }) => id === 'shoe_data_ingested'),
];

const StreamLinedDataPanel = () => {
  const { getGroup } = useConfiguration();
  const metrics = getMetrics(getGroup(STREAMLINED_DATA));
  return (
    <PanelWrapper>
      <div className="grid-item" key={'a0'}>
        <Chart metric={metrics[0]} type="bar" />
      </div>
      <div className="grid-item" key={'a1'}>
        <Chart metric={metrics[1]} type="bar" />
      </div>
    </PanelWrapper>
  );
};
export default StreamLinedDataPanel;
