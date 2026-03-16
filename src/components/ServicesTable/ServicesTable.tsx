import { MetricInfo, useDataStore } from '@/store';
import { useLocation } from 'react-router-dom';
import { AvailabilityList } from './Accordion';
import './stables.scss';
import useWindowSize from '@/hooks/useWindowSize';
import { windowsSizes } from '@/common/constants';

const ServicesTable = ({ metrics }: { metrics: MetricInfo[] }) => {
  const location = useLocation().pathname.split('/')[1];
  const { width } = useWindowSize();
  const [p] = useDataStore((state) => [state.data]);
  const enableScroll =
    width < windowsSizes.gPhone ? 'overflow-x-scroll nice-scroll' : '';

  let data = metrics.map((m) => ({
    ...p.listData(m, !location, '--cssec'),
    // if the name from the configuration jsons is in the array, show the warning, otherwise hide it
    tmpShouldShowLowPerformingWarning: [
      /*'openeo3', 'openeo4', 'openeo6'*/
    ].some((id) => id === m.id),
  }));
  return (
    <div className="flex flex-col w-full rounded-md">
      <div className={`px-3 py-0 ${enableScroll}`}>
        <AvailabilityList data={data} />
      </div>
    </div>
  );
};
export default ServicesTable;
