import { scale } from '@/animations/common';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Spinner from '../Spinner/Spinner';
import TimelineChart from './TimelineChart';

interface TimelinesProps {
  timelines: any[];
  noani?: boolean;
  m_key?: string;
  justGraph?: boolean;
  smallGraph?: boolean;
  lockTimeline?: boolean;
  bigLabels?: boolean;
}

const Timelines: React.FC<TimelinesProps> = ({
  timelines,
  noani,
  m_key,
  justGraph,
  smallGraph,
  lockTimeline,
  bigLabels,
}) => {
  const [activeGroups, setActiveGroups] = useState([]);
  const [activeMetric] = useState(0);
  let groups = Object.keys(
    timelines && timelines[0] ? timelines[0].groups : {}
  );
  useEffect(() => {
    if (!activeGroups.length) {
      setActiveGroups([groups[0]]);
    }
  }, [groups]);
  if (!groups.length)
    return (
      <div className="h-full ">
        <Spinner />
      </div>
    );

  let ds = activeGroups.map((ag) => timelines[activeMetric]?.groups[ag]);
  return (
    <div className="w-full h-full pt-3">
      {(groups.length > 1 && (
        <motion.div
          {...(!noani && scale())}
          className="flex h-full flex-col pl-2"
        >
          <div className="text-lg text-medium text-smain2 py-2">
            Available groups:
          </div>
          <div className="flex gap-x-2 text-stext w-full">
            {groups.map((ke, i) => (
              <div
                key={'groupkey-' + i}
                onClick={() => {
                  if (activeGroups.includes(ke) && activeGroups.length > 1)
                    setActiveGroups(activeGroups.filter((a) => a !== ke));
                  else if (!activeGroups.includes(ke)) setActiveGroups([ke]);
                }}
                className={`p-2 bss rounded-md text-sm cursor-pointer tl-group ${
                  activeGroups.includes(ke)
                    ? 'tl-group-active'
                    : 'tl-group-inactive'
                }`}
              >
                {ke}
              </div>
            ))}
          </div>
        </motion.div>
      )) ||
        null}

      {(activeGroups.length && (
        <TimelineChart
          noani={noani}
          datasets={ds.flat()}
          timestamps={timelines[activeMetric].timestamps}
          unit={timelines[activeMetric].unit}
          m_key={m_key}
          justGraph={justGraph}
          smallGraph={smallGraph}
          lockTimeline={lockTimeline}
          bigLabels={bigLabels}
        />
      )) ||
        null}
    </div>
  );
};
export default Timelines;
