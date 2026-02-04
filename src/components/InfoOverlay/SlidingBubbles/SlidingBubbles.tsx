import { DATA_PUBLISHED } from '@/common/constants';
import {
  Sentinel1Icon,
  Sentinel2Icon,
  Sentinel3Icon,
  Sentinel5PIcon,
} from '@/containers/Navigation/icons';
import { useDataStore } from '@/store';
import Spinner from '@/components/Spinner/Spinner';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { OverlayIcons } from '../icons';
import SlidingBubble from './SlidingBubble';
import SlidingLine from './SlidingLine';
import { bigBubbleRight, bigBubbleTop, bigBubbleWidth } from './config';
import { formatValue } from '@/functions';
import { useConfiguration } from '@/store/ConfigurationsProvider';

const SlidingBubbles = () => {
  const [cref, setCref] = useState(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const p = useDataStore((state) => state.data);
  const { getGroup } = useConfiguration();

  useEffect(() => {
    if (containerRef?.current) setCref(containerRef);
  }, [containerRef, p]);

  if (!p) {
    return (
      <div
        className={`img-overlay absolute top-0 left-0 w-full h-full flex flex-row items-center gap-x-2`}
      >
        <Spinner />
      </div>
    );
  }

  let metric = 'smmp1__cf__iad_volume';
  let json = getGroup(DATA_PUBLISHED);
  let data = json.find((j) => p.haveCondition(j.conditions, metric));

  let missionsData = [
    {
      text: 'Sentinel-1',
      minText: 'Total volume since the start of operations',
      Icon: Sentinel1Icon,
      key: 'S1',
      data: {},
    },
    {
      text: 'Sentinel-2',
      minText: 'Total volume since the start of operations',
      Icon: Sentinel2Icon,
      key: 'S2',
      data: {},
    },
    {
      text: 'Sentinel-3',
      minText: 'Total volume since the start of operations',
      Icon: Sentinel3Icon,
      key: 'S3',
      data: {},
    },
    {
      text: 'Sentinel-5P',
      minText: 'Total volume since the start of operations',
      Icon: Sentinel5PIcon,
      key: 'S5P',
      data: {},
    },
  ];

  let missionData = missionsData.map((m) => {
    let newMetric = { ...data };
    newMetric.codelist_subgroup = m.key;
    return {
      ...p.counterData(newMetric),
      Icon: m.Icon,
      text: m.text,
      minText: m.minText,
      rawValue: p.counterData(newMetric, true).value,
    };
  });

  let totalValue = missionData.reduce((sum, n) => {
    let num =
      typeof n.rawValue === 'string'
        ? parseFloat(n.rawValue.split(' ')[0])
        : n.rawValue;
    return (sum += num);
  }, 0);
  let parsedTotalValue = formatValue(totalValue, 'B', false, 2);

  const circleVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: [0, 7, 1, 1, 1],
      transition: {
        duration: 1,
        when: 'beforeChildren',
        staggerChildren: 0.3,
      },
    },
  };
  return (
    <div key={'bibs'} ref={containerRef} className="w-full h-full relative">
      <motion.div
        variants={circleVariants}
        initial="hidden"
        animate={['visible']}
        exit={{
          scale: 0,
          transition: {
            duration: 0.8,
          },
        }}
        className="absolute bg-white z-20 flex flex-col items-center justify-center  rounded-full"
        style={{
          width: bigBubbleWidth,
          height: bigBubbleWidth,
          right: bigBubbleRight,
          top: bigBubbleTop,
        }}
      >
        <div className="w-20 mb-3">
          <OverlayIcons icon="totalVolume" />
        </div>
        <div className="text-xl text-smain2 self-center px-14 text-center font-bold">
          <span>The ecosystem holds a </span>
          <span className="text-ssec">complete archive of Sentinel data</span>
        </div>
        <div className="text-smain2 text-3xl font-bold mt-1">
          {parsedTotalValue}
        </div>
      </motion.div>
      {missionData.map((m, i) => (
        <SlidingBubble
          {...m}
          key={'sliding-bubble' + i}
          i={i}
          container={containerRef?.current || cref?.current}
        />
      ))}
      {missionData.map((_, i) => (
        <SlidingLine
          key={'sliding-line' + i}
          i={i}
          container={containerRef?.current || cref?.current}
        />
      ))}
    </div>
  );
};
export default SlidingBubbles;
