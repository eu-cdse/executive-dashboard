import React, { useEffect, useState } from 'react';
import { useTooltip } from '@/hooks/useTooltip';
import { MetricInfo, useConfigurationStore, useDataStore } from '@/store';
import { RxDividerHorizontal } from 'react-icons/rx';
import { motion } from 'framer-motion';
import TimePeriodTag from '../TimePeriodTag/TimePeriodTag';
import { AutoLinkHOC } from '../DeepLink';
import MissingDates from '../MissingAlert/MissingDates';
import ComponentTag from '@/containers/Panels/common/ComponentTag';

interface Props {
  metric: MetricInfo;
  nobss?: boolean;
  tag?: string;
}

const Counter: React.FC<Props> = ({ metric, nobss, tag }) => {
  const p = useDataStore((state) => state.data);
  const activePeriod = useConfigurationStore((s) => s.activePeriod);
  const [activeData, setActiveData] = useState({
    value: null,
    label: '',
    tooltipItems: null,
    selectedPeriod: '',
    missing: [],
  });
  let { value, label, tooltipItems, selectedPeriod } = activeData;
  const [tooltip] = useTooltip();

  useEffect(() => {
    p.setTimeframe(activePeriod);
    setActiveData(p.counterData(metric));
  }, [activePeriod, metric, p]);

  return (
    <>
      <div
        style={{
          width: '100%',
        }}
        className={`flex relative justify-between w-full ${
          nobss ? '' : 'bss'
        } rounded-lg h-full self-center`}
      >
        <motion.div
          className=" flex h-full flex-col rounded-md text-stext items-center status w-full"
          {...(tooltipItems && tooltip(tooltipItems, 0.3))}
        >
          <div className="text-md w-full px-4 h-[40px] text-[15px] z-2 py-2 text-center ">
            {label}
          </div>
          <div className=" px-5 pb-1 mt-2 w-full flex justify-center items-center ">
            <div className="text-smain21 text-[2rem]">
              {!value ? (
                <span className="flex justify-centertext-stext self-center">
                  <RxDividerHorizontal size={50} color="var(--csinactive)" />
                </span>
              ) : (
                value
              )}
            </div>
          </div>
        </motion.div>

        {!nobss && (
          <TimePeriodTag
            shouldShow={!!selectedPeriod}
            timePeriod={selectedPeriod}
          />
        )}
        {activeData?.missing && (
          <MissingDates dates={activeData.missing} hasTag={!!tag} />
        )}
      </div>
      {tag && <ComponentTag icon={tag} />}
    </>
  );
};

export default AutoLinkHOC(Counter);
