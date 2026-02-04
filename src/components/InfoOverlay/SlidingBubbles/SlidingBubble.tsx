import { motion, useAnimation } from 'framer-motion';
import {
  bigBubbleRight,
  bigBubbleTop,
  smallBTR,
  smallBubbleWidth,
} from './config';
import { useEffect } from 'react';
import { computedStyle } from '@/common/getChartStyles';
import useWindowSize from '@/hooks/useWindowSize';

const locations = smallBTR.map(({ top, right }) => ({
  top: `calc(${top}% - ${smallBubbleWidth}px)`,
  right: `calc(${right}% - ${smallBubbleWidth}px)`,
}));

interface SlidingBubbleProps {
  value: string | number;
  text: string;
  minText: string;
  Icon: any;
  i: number;
  container: HTMLDivElement;
}

const SlidingBubble: React.FC<SlidingBubbleProps> = ({
  value,
  text,
  minText,
  Icon,
  i,
  container,
}) => {
  const { right, top } = locations[i];
  const { width } = useWindowSize();
  const controls = useAnimation();

  useEffect(() => {
    async function sequenceAnimations() {
      await controls.start('visible');
    }

    sequenceAnimations();
  }, [controls, container]);

  if (!container) return null;

  let cwidth = container.clientWidth; // 100%
  let cheight = container.clientHeight; // 100%

  let percentageRight = smallBTR[i].right / 100;
  let pixelRight = percentageRight * cwidth - smallBubbleWidth / 2;
  let x2 = ((pixelRight - smallBubbleWidth / 2) / cwidth) * 100;

  let percentageTop = smallBTR[i].top / 100; // 38% as a decimal
  let pixelTop = percentageTop * cheight - smallBubbleWidth / 2;
  let y2 = ((pixelTop - smallBubbleWidth / 2) / cheight) * 100;

  let smaller =
    width < 1600 && width > 1400
      ? 0.9
      : width <= 1400 && width >= 1100
        ? 0.8
        : width < 1100
          ? 0.7
          : 1;

  const circleVariants = {
    hidden: {
      scale: 0,
      top: bigBubbleTop,
      right: bigBubbleRight,
    },
    visible: {
      scale: smaller,
      top,
      right,
      transition: {
        delay: 0.5 + i * 0.2, // delay before it starts the scale up
        duration: 1.4,
      },
    },
    float: {
      right: [`${x2}%`, `${x2 - 2}%`],
      top: [`${y2}%`, `${y2 + 2}%`],
      transition: {
        top: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
        right: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
  };

  return (
    <motion.div
      variants={circleVariants}
      initial="hidden"
      animate={controls}
      exit={{
        scale: 0,
        transition: {
          duration: 0.6,
        },
      }}
      className="bg-white rounded-full flex flex-col items-center justify-center z-10 absolute"
      style={{ width: smallBubbleWidth, height: smallBubbleWidth }}
    >
      <Icon width={80} color={computedStyle('--csmain2')} />
      <div className="text-smain2 text-2xl mt-2 font-bold">{text}</div>
      <div className="text-smain2 text-md text-center">{minText}</div>
      <div className="text-smain2 text-3xl font-bold">{value}</div>
    </motion.div>
  );
};
export default SlidingBubble;
