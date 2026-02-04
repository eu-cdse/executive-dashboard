import { formatValue, getIcon } from '@/functions';
import { useMousePosition } from '@/hooks/useMousePosition';
import { MetricTooltipInfo, useDataStore, useTooltipStore } from '@/store';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'zustand/shallow';
import { useTimestamp } from '@/hooks/useTimestamp';
import { useLocation } from 'react-router-dom';
import { GoAlert } from 'react-icons/go';
import { computedStyle } from '@/common/getChartStyles';

const Tooltip = () => {
  const ref = useRef(null);
  const [data, delay, active] = useTooltipStore(
    (state) => [state.data, state.delay, state.active],
    shallow
  );
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mousePos] = useMousePosition();

  useEffect(() => {
    if (ref.current) {
      const tooltipWidth = ref.current.clientWidth;
      const tooltipHeight = ref.current.clientHeight;

      let left = mousePos.x - tooltipWidth / 2;
      let top = mousePos.y + 20;

      // Check if the tooltip overflows the screen horizontally
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      } else if (left < 0) {
        left = 10;
      }

      // Check if the tooltip overflows the screen vertically
      if (top + tooltipHeight > window.innerHeight) {
        top = mousePos.y - tooltipHeight - 20;
      }

      setPosition({ top, left });
    }
  }, [ref.current, mousePos]);

  if (!active) return <></>;
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        // scale: 1,
        y: 0,
        transition: { stiffness: 82, delay, duration: 0.2, type: 'spring' },
      }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      style={{
        position: 'fixed',
        top: position.top || null,
        left: position.left || null,
        zIndex: 9995,
      }}
    >
      <div
        ref={ref}
        className=" rounded-md bg-sdark bss text-stext p-2 max-w-xs tooltipek"
      >
        {data as React.ReactNode}
      </div>
    </motion.div>,
    document.body
  );
};
export default Tooltip;

interface ITooltipContainer {
  children: React.ReactNode;
  label: string;
}

export const TooltipContainer: React.FC<ITooltipContainer> = ({
  children,
  label,
}) => {
  return (
    <div>
      <div className="flex flex-col">
        <div className="text-smain self-center text-center font-medium text-sm mb-1">
          {label}
        </div>
        <div className="w-8/12 border-b-2 border-sgrey mb-1 self-center rounded-xl"></div>
        {children}
      </div>
    </div>
  );
};

export const TooltipString: React.FC<MetricTooltipInfo> = ({
  label,
  text,
  color,
  metric,
}) => {
  let nl: any = text;
  const p = useDataStore((state) => state.data);
  if (metric) {
    if (p.data[metric]) [nl] = p.getTTNormalValue([metric]);
  }
  if (!nl) return <></>;
  if (typeof nl === 'number') nl = formatValue(nl, null);
  return (
    <div className="text-sm my-1">
      <span className="font-medium text-sm text-smain2">{label}:</span>
      <span style={{ color }}>&nbsp;{nl}</span>
    </div>
  );
};

export const TooltipAvailability: React.FC<MetricTooltipInfo> = ({
  metric,
  label,
  color,
}) => {
  const [p] = useDataStore((state) => [state.data]);
  if (!p.data[metric]) return <></>;
  return (
    <div className="text-stext flex items-center">
      <span className="font-medium text-sm text-smain">{label}:&nbsp;</span>
      <div>
        <span className="font-medium" style={{ color }}>
          {formatValue(p.data[metric][0].value, '%')}&nbsp;
        </span>
      </div>
    </div>
  );
};

export const TooltipIcon: React.FC<MetricTooltipInfo> = ({
  label,
  text,
  isObject,
}) => {
  const location = useLocation().pathname.split('/')[1];

  // Feature disabled for all metrics that have object as conditions
  // Since that mean that there are multiple time periods for that metric

  if (location || isObject) return null;
  const [Icon, col] = getIcon(label);
  let icolor = col ? col : 'var(--csmain2)';

  return (
    <div className="text-stext items-center justify-between flex mt-2">
      <div className="flex items-center">
        {label !== 'time' && (
          <span className="font-medium mr-1 text-sm text-smain">
            <Icon style={{ color: icolor }} size={18} />
          </span>
        )}

        <span className="font-medium text-xxs" style={{ color: icolor }}>
          {label === 'time' && 'Time period: '}
          <span className="text-ssec">{text && cap(text)}</span>
        </span>
      </div>
    </div>
  );
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const TooltipLastUpdated: React.FC<{
  timestamp: number;
}> = ({ timestamp }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [Icon, col] = getIcon('lastUpdated');
  let icolor = col ? col : 'var(--csmain2)';
  const time = useTimestamp(timestamp);
  return (
    <div className={`text-stext flex items-center mt-1`}>
      {/*  <span className="font-medium mr-1 text-sm text-smain">
        <Icon style={{ color: icolor }} size={18} />
      </span> */}

      <span className="font-medium text-xxs" style={{ color: icolor }}>
        Last updated:
        <span className="mx-1 text-ssec">{time}</span>
        {time !== 'now' && time !== 'No data.' && !time.includes('.') && (
          <span className="text-ssec">ago</span>
        )}
      </span>
    </div>
  );
};

export const TlTooltip = ({ text }: { text: string }) => {
  return <div className="text-smain2 text-medium text-sm">{text}</div>;
};

export const TooltipMissingDates: React.FC<{
  dates: { metric: string; dates: string[] }[];
}> = ({ dates }) => {
  return (
    <div className="noScroll px-2 py-2 flex flex-col max-w-[305px] max-h-[400px] overflow-y-scroll">
      <div className="flex flex-col w-max">
        <div className="flex items-center gap-x-1">
          <span className="font-semibold text-md text-smain2">
            Missing dates
          </span>
          <GoAlert size={18} fill={computedStyle('--csmain2')} />
        </div>
        <span className="w-full h-[2px] mb-2 rounded-full bg-smain2"></span>
      </div>
      {dates.map((d, i) => (
        <div key={i} className="text-stext text-sm flex flex-col">
          <div className="flex">
            {/*   <span className="font-medium text-xs text-red-500">
              {d.metric}:
            </span> */}
          </div>
          <span className="font-semibold text-gray-400 gap-x-3 flex flex-wrap">
            {d.dates.map((dt, j) => (
              <span key={j} className="text-xs">
                {dt}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};
