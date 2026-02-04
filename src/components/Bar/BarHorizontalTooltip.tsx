import useWindowSize from '@/hooks/useWindowSize';
import BarHorizontal from './BarHorizontal';
import { windowsSizes } from '@/common/constants';
import { useFixedTooltipStore } from '@/store';
import { IoClose } from 'react-icons/io5';
import { computedStyle } from '@/common/getChartStyles';
import { motion } from 'framer-motion';

const BarHorizontalTooltip = ({ activeSlice, name, unit, histo, color }) => {
  const { width } = useWindowSize();
  const setTooltip = useFixedTooltipStore((state) => state.setToolTip);

  return (
    <div
      className={`h-[400px] p-3`}
      style={{
        width: width < windowsSizes.gMini ? width - 20 : 550,
      }}
    >
      <div className="flex justify-between items-center">
        <div className="w-max mb-1">
          <div className="text-smain2">{name}</div>
          <div className="w-full h-[2px] bg-ssec" />
        </div>
        <motion.span
          className="cursor-pointer"
          onClick={() => setTooltip(null)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <IoClose size={23} color={computedStyle('--cssec')} />
        </motion.span>
      </div>
      <BarHorizontal
        data={{ data: { ...histo }, name, unit }}
        colNum={activeSlice}
        color={color}
        nocursor={true}
        hideLabel={true}
        height={350}
        smallLabels
      />
    </div>
  );
};

export default BarHorizontalTooltip;
