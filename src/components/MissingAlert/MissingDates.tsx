import { motion } from 'framer-motion';
import { GoAlert } from 'react-icons/go';
import { useRef } from 'react';
import { useFixedTooltipStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { TooltipMissingDates } from '../Tooltip/Tooltip';
import { computedStyle } from '@/common/getChartStyles';

interface Props {
  dates: { metric: string; dates: string[] }[];
  hasTag?: boolean;
}

const MissingDates: React.FC<Props> = ({ dates, hasTag }) => {
  const alertRef = useRef(null);
  const [setTooltip, setData, active] = useFixedTooltipStore(
    (state) => [state.setToolTip, state.setData, state.active],
    shallow
  );

  const alertClick = (e) => {
    e.stopPropagation();
    setTooltip(!active);
    setData({
      data: <TooltipMissingDates dates={dates} />,
      elRef: alertRef,
    });
  };
  return (
    <motion.div
      whileHover={{
        transform: [
          'rotate(0deg)',
          'rotate(10deg)',
          'rotate(-10deg)',
          'rotate(0deg)',
        ],
        transition: { duration: 0.5 },
      }}
      ref={alertRef}
      className="absolute cursor-pointer bottom-1 sflex justify-center items-center"
      style={{
        left: hasTag ? 35 : 5,
      }}
    >
      <GoAlert
        onClick={alertClick}
        size={18}
        fill={computedStyle('--csmain2')}
      />
    </motion.div>
  );
};
export default MissingDates;
