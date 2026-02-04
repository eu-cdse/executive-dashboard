import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import {
  TbZoomReset,
  TbZoomOut,
  TbZoomIn,
  TbArrowBigLeftLineFilled,
  TbArrowBigRightLineFilled,
} from 'react-icons/tb';

interface ITimelineTools {
  width: number;
  chartRef: React.MutableRefObject<any>;
}

const TimelineTools: React.FC<ITimelineTools> = ({ width, chartRef }) => {
  const [openChartBtn, setOpenChartBtn] = useState(false);

  const onResetZoom = (e) => {
    e.stopPropagation();
    chartRef.current.options.scales.x.time.unit = 'day';
    chartRef.current.resetZoom();
    chartRef.current.update();
  };

  const onZoomPluse = (e) => {
    e.stopPropagation();
    chartRef.current.zoom(1.1);
  };

  const onZoomMinus = (e) => {
    e.stopPropagation();
    chartRef.current.zoom(0.9);
  };

  const onPanPluse = (e) => {
    e.stopPropagation();
    chartRef.current.pan({ x: 100 }, undefined, 'default');
  };

  const onPanMinus = (e) => {
    e.stopPropagation();
    chartRef.current.pan({ x: -100 }, undefined, 'default');
  };

  const openTools = (e) => {
    e.stopPropagation();
    setOpenChartBtn((prev) => !prev);
  };

  const buttons = [
    {
      Func: onPanPluse,
      Icon: TbArrowBigLeftLineFilled,
    },
    {
      Func: onPanMinus,
      Icon: TbArrowBigRightLineFilled,
    },
    {
      Func: onZoomPluse,
      Icon: TbZoomIn,
    },
    {
      Func: onZoomMinus,
      Icon: TbZoomOut,
    },
    {
      Func: onResetZoom,
      Icon: TbZoomReset,
    },
  ];

  let vertical = width <= 300;
  return (
    <div
      className="absolute flex top-2.5 items-center right-0 "
      style={{
        flexDirection: vertical ? 'column-reverse' : 'row',
      }}
    >
      <AnimatePresence>
        {openChartBtn && (
          <motion.div
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 'auto', height: 'auto', opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
            exit={{ height: 0 }}
            className="flex gap-x-1 items-center bg-transparent"
            style={{
              flexDirection: vertical ? 'column' : 'row',
            }}
          >
            {buttons.map(({ Func, Icon }, i) => (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: buttons.length * 0.1 - i * 0.1 },
                }}
                exit={{
                  opacity: 0,
                  x: 10,
                  transition: { delay: i * 0.1 },
                }}
                key={'tl-btn-' + i}
                whileHover={{ scale: 0.95 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bss rounded-full cursor-pointer bg-sdark"
                onClick={Func}
                style={{
                  border: '1px solid var(--cssec)',
                }}
              >
                <Icon size={18} color="var(--cssec)" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        /* {...tooltip(<ToolsTooltip />, 0.5)} */
        className="p-1 ml-1 my-[7px] opacity-50 bss rounded-full cursor-pointer"
        style={{
          border: '1px solid var(--csmain2)',
        }}
        onClick={openTools}
        whileHover={{ scale: 1.1, opacity: 1 }}
      >
        <MdOutlineArrowForwardIos
          className="duration-300"
          style={{
            transform:
              !openChartBtn && width <= 300
                ? 'rotate(90deg)'
                : openChartBtn && width <= 300
                  ? 'rotate(270deg)'
                  : !openChartBtn && width > 300
                    ? 'rotate(180deg'
                    : '',
          }}
          size={17}
          color="var(--csmain2)"
        />
      </motion.div>
    </div>
  );
};

export default TimelineTools;
