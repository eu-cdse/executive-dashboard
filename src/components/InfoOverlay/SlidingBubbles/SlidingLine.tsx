import { motion, useAnimation } from 'framer-motion';
import { bigBTR, bigBubbleWidth, smallBTR, smallBubbleWidth } from './config';
import { useEffect } from 'react';

interface SlidingLineProps {
  i: number;
  container: HTMLDivElement;
}
const SlidingLine: React.FC<SlidingLineProps> = ({ i, container }) => {
  const controls = useAnimation();

  useEffect(() => {
    async function sequenceAnimations() {
      await controls.start('visible');
    }
    sequenceAnimations();
  }, [controls, container]);

  if (!container) return null; // If container is not there, don't render anything.

  const radiusMainBubble = bigBubbleWidth / 2;
  const radiusSlidingBubble = smallBubbleWidth / 2;

  let cwidth = container.clientWidth; // 100%
  let cheight = container.clientHeight; // 100%

  let x1Pixel = cwidth - cwidth * (bigBTR.right / 100) + radiusMainBubble;
  let x1 = (x1Pixel / cwidth) * 100;
  let y1 = (((cheight * bigBTR.top) / 100 - radiusMainBubble) * 100) / cheight;

  let x2Pixel =
    cwidth - cwidth * (smallBTR[i].right / 100) + radiusSlidingBubble;
  let x2 = (x2Pixel / cwidth) * 100;
  let y2 =
    (((cheight * smallBTR[i].top) / 100 - radiusSlidingBubble) * 100) / cheight;

  const lineVariants = {
    hidden: {
      x1: `${x1}%`,
      y1: `${y1}%`,
      x2: `${x1}%`,
      y2: `${y1}%`,
    },
    visible: {
      x1: `${x1}%`,
      y1: `${y1}%`,
      x2: `${x2}%`,
      y2: `${y2}%`,
      transition: {
        x2: {
          delay: 0.5 + i * 0.2,
          duration: 1.4,
        },
        y2: {
          delay: 0.5 + i * 0.2,
          duration: 1.4,
        },
      },
    },
    float: {
      x2: [`${x2}%`, `${x2 + 2}%`],
      y2: [`${y2}%`, `${y2 + 2}%`],
      transition: {
        y2: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
        x2: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
      },
    },
  };
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      <defs>
        <linearGradient id="greenToOrange" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#77cc09', stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: '#fabc20', stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <motion.line
        variants={lineVariants}
        initial="hidden"
        animate={controls}
        exit={{
          scale: 0,
          transition: {
            duration: 0.6,
          },
        }}
        stroke="url(#greenToOrange)"
        strokeWidth="5"
      />
    </svg>
  );
};

export default SlidingLine;
