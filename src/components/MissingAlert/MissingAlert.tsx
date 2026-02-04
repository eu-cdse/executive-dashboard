import { motion } from 'framer-motion';
import { TbAlertTriangleFilled } from 'react-icons/tb';
import { useRef } from 'react';
import { useDataStore, useFixedTooltipStore } from '@/store';
import { shallow } from 'zustand/shallow';
import AlertTooltip from '../Header/AlertTooltip';

const MissingAlert = () => {
  const alertRef = useRef(null);
  const [setTooltip, setData, active] = useFixedTooltipStore(
    (state) => [state.setToolTip, state.setData, state.active],
    shallow
  );
  const metricStatus = useDataStore((state) => state.metricStatus);

  const alertClick = () => {
    setTooltip(!active);
    setData({
      data: <AlertTooltip metricStatus={metricStatus} />,
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
      className="fixed left-[50%] top-7 cursor-pointer w-min h-min bg-smain2 rounded-full p-1"
    >
      <TbAlertTriangleFilled
        onClick={alertClick}
        color="yellow"
        size={30}
        fill="white"
      />
    </motion.div>
  );
};
export default MissingAlert;
