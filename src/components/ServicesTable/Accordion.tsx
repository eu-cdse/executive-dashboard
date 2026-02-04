import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAvailabilityStyle } from '@/functions/common';
import { useTimestamp } from '@/hooks/useTimestamp';
import { ISingleBoolList } from '@/functions/process/processor';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import Timelines from '@/components/Timelines/Timelines';
import { useTooltip } from '@/hooks/useTooltip';
import { TooltipContainer } from '@/components/Tooltip/Tooltip';
import { MetricInfo, useConfigurationStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { LinkItem } from '../DeepLink';
import { HourIcon, InfoTriangleIcon } from '@/containers/Navigation/icons';
import { computedStyle } from '@/common/getChartStyles';
import { AVAILABILITY_COUNT_WARNING_THRESHOLD } from '@/common/constants';

interface Props {
  label: string;
  children: React.ReactNode;
}

const ServiceHeader: React.FC<Props> = ({ label, children }) => {
  return (
    <div className="flex flex-col accordion">
      <div className="flex w-11/12 justify-end bg-sdark p-3 pb-0 font-bold rounded-md">
        <div
          className={`flex-1 max-w-2 ml-3 select-none text-smain2 font-normal text-xl`}
        >
          {label.split('_').join(' ')}
        </div>
      </div>
      <div className="w-11/12 border-b-2 border-sgrey mb-3 self-center rounded-xl"></div>

      <div className="flex flex-col w-full">{children}</div>
    </div>
  );
};
export default ServiceHeader;

const ani = () => ({
  initial: { y: 40, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.5,
      type: 'spring',
      stiffness: 200,
    },
  },
});

export const AvailabilityList = ({
  data,
}: {
  data: {
    label: string;
    values: ISingleBoolList[];
    metrics?: string[] | { [key: string]: string[] };
    timelines?: any;
    tmpShouldShowLowPerformingWarning: boolean;
  }[];
}) => {
  const location = useLocation().pathname.split('/')[1];
  return (
    <div className="flex-table mt-4 min-w-[500px]">
      <div className="flex-row header">
        <div className="flex-cell flex-first">Service</div>
        <div className="flex-cell">Status</div>

        <div className="flex-cell">1 Hour Uptime</div>
        <div className="flex-cell">30 Days Uptime</div>

        <div className="flex-cell">Last Updated</div>
        <div className="flex-cell">Availability Timeline</div>
      </div>
      <div className="flex-row header">
        <div className="flex-cell w-full h-[4px] bg-sgrey self-center rounded-xl p-0 "></div>
      </div>
      {data.map((da) =>
        da.values.map((d, i) => (
          <TableItem
            key={'serviceitem' + d.m_key + i}
            metrics={da.metrics}
            location={location}
            i={i}
            item={d}
            timelines={da.timelines}
            tmpShouldShowLowPerformingWarning={
              da.tmpShouldShowLowPerformingWarning
            }
          />
        ))
      )}
    </div>
  );
};

interface TableItemProps {
  item: ISingleBoolList;
  i: number;
  location: string;
  metrics: string[] | { [key: string]: string[] };
  timelines: any;
  tmpShouldShowLowPerformingWarning: boolean;
}

const TableItem: React.FC<TableItemProps> = ({
  location,
  item,
  timelines,
  tmpShouldShowLowPerformingWarning,
}) => {
  let {
    value,
    timestamp,
    label,
    availability1d,
    availability30d,
    availabilityCount,
    description,
    link,
  } = item;
  const styl = getAvailabilityStyle(value);
  const time = useTimestamp(timestamp);
  const [tooltip] = useTooltip();
  const [showTimeline, setShowTimeline] = useState(false);
  const [configuration, setConfiguration, activeId] = useConfigurationStore(
    (s) => [s.configuration, s.setConfiguration, s.activeId],
    shallow
  );

  // Lower all triangles when any popup is active
  const triangleZIndex = activeId ? 'z-0' : 'z-20';

  const shouldShowAvailabilityCountWarning =
    availabilityCount < AVAILABILITY_COUNT_WARNING_THRESHOLD;

  timelines =
    (timelines.length &&
      timelines.map((t) => {
        let gKey = Object.keys(t.groups)[0];
        return {
          ...t,
          unit: '%',
          groups: {
            [gKey]: t.groups[gKey].filter((gk) => gk.label === label),
          },
        };
      })) ||
    null;

  const TooltipInfo = () => {
    return (
      <div className="flex text-sm">
        <div className="text-stext text-xs ml-1">{description}</div>
      </div>
    );
  };

  const setTimeLines = () => {
    setShowTimeline((ps) => !ps);
    setConfiguration({ [label]: { showTimelines: !showTimeline } });
  };

  React.useEffect(() => {
    if (label) {
      let config = configuration[label];
      if (!config) return;
      if (Object.keys(config).length) {
        setShowTimeline(config?.showTimelines);
      }
    }
  }, [label]);
  return (
    <>
      <motion.div
        className={'flex-row relative greydout items-center'}
        style={{
          textAlign: 'center',
          verticalAlign: 'middle',
        }}
        {...ani()}
      >
        <a
          href={link || ''}
          target="_blank"
          rel="noreferrer"
          {...(description &&
            tooltip(
              <TooltipContainer label={label} children={<TooltipInfo />} />,
              0.3
            ))}
          className={`${
            link ? 'underline' : 'pointer-events-none'
          } flex-cell z-20 flex-first text-stext text-xs`}
        >
          {label}
        </a>
        <div
          className="flex flex-col flex-cell items-center justify-center"
          {...(tmpShouldShowLowPerformingWarning &&
            tooltip(
              <TooltipContainer
                label={'Technical issue'}
                children={
                  <div className="flex text-sm">
                    <div className="text-stext text-xs ml-1">
                      We are temporarily experiencing a technical issue with our
                      uptime reporting. Please note that the actual service is
                      unaffected and maintaining 99.9%+ availability. We are
                      working to restore accurate reporting as soon as possible
                      and apologize for any confusion.
                    </div>
                  </div>
                }
              />,
              0.3
            ))}
        >
          <div className={`w-6 flex min-h-[44px] items-center justify-center`}>
            <styl.Icon
              fill={styl.color}
              {...styl.props}
              size={15}
              className="min-h-[24px]"
            />
          </div>
          {tmpShouldShowLowPerformingWarning && styl.text === 'DOWN' && (
            <span
              id="info-triangle-icon"
              className={`${triangleZIndex} !pl-[44px]`}
            >
              <InfoTriangleIcon
                color={computedStyle('--csmain2')}
                width={20}
                height={20}
              />
            </span>
          )}
        </div>

        <div
          style={{ color: getClsCol(availability1d) }}
          className="flex-cell font-medium text-xs"
          {...(tmpShouldShowLowPerformingWarning &&
            tooltip(
              <TooltipContainer
                label={'Technical issue'}
                children={
                  <div className="flex text-sm">
                    <div className="text-stext text-xs ml-1">
                      We are temporarily experiencing a technical issue with our
                      uptime reporting. Please note that the actual service is
                      unaffected and maintaining 99.9%+ availability. We are
                      working to restore accurate reporting as soon as possible
                      and apologize for any confusion.
                    </div>
                  </div>
                }
              />,
              0.3
            ))}
          {...(shouldShowAvailabilityCountWarning &&
            tooltip(
              <TooltipContainer
                label={'Missing data'}
                children={
                  <div className="flex text-sm">
                    <div className="text-stext text-xs ml-1">
                      There are some missing samples, which might impact the
                      quality of the information
                    </div>
                  </div>
                }
              />,
              0.3
            ))}
        >
          {`${
            availability1d !== undefined && availability1d !== null
              ? isFloat(availability1d)
                ? availability1d.toFixed(2)
                : availability1d
              : 'No data.'
          } ${(availability1d !== undefined && availability1d !== null && '%') || ''}`}
          {shouldShowAvailabilityCountWarning && (
            <span id="info-triangle-icon" className={triangleZIndex}>
              <InfoTriangleIcon
                color={computedStyle('--csmain2')}
                width={20}
                height={20}
              />
            </span>
          )}
          {tmpShouldShowLowPerformingWarning && (
            <span id="info-triangle-icon" className={triangleZIndex}>
              <InfoTriangleIcon
                color={computedStyle('--csmain2')}
                width={20}
                height={20}
              />
            </span>
          )}
        </div>

        <div
          style={{ color: getClsCol(availability30d) }}
          className="flex-cell font-medium text-xs"
          {...(tmpShouldShowLowPerformingWarning &&
            tooltip(
              <TooltipContainer
                label={'Technical issue'}
                children={
                  <div className="flex text-sm">
                    <div className="text-stext text-xs ml-1">
                      We are temporarily experiencing a technical issue with our
                      uptime reporting. Please note that the actual service is
                      unaffected and maintaining 99.9%+ availability. We are
                      working to restore accurate reporting as soon as possible
                      and apologize for any confusion.
                    </div>
                  </div>
                }
              />,
              0.3
            ))}
        >
          {`${
            availability30d !== undefined && availability30d !== null
              ? isFloat(availability30d)
                ? availability30d.toFixed(2)
                : availability30d
              : 'No data.'
          } ${(availability30d !== undefined && availability30d !== null && '%') || ''}`}
          {tmpShouldShowLowPerformingWarning && (
            <span id="info-triangle-icon" className={triangleZIndex}>
              <InfoTriangleIcon
                color={computedStyle('--csmain2')}
                width={20}
                height={20}
              />
            </span>
          )}
        </div>

        {location && (
          <div
            className="flex-cell text-smain2 text-xxs mt-1 font-medium"
            style={{
              color: timestamp ? 'var(--csmain2)' : 'var(--csinactive)',
            }}
          >
            {time}
          </div>
        )}
        <div className="flex-cell text-center z-20 ">
          <motion.div
            style={{ margin: '0 auto' }}
            whileHover={{ scale: 0.9 }}
            whileTap={{ scale: 1 }}
            className={`clockbutton p-2 bss rounded-md w-[34px] align-middle pr-[28px] ${
              (!timelines && 'clockbutton-disabled') ||
              (showTimeline && 'clockbutton-active') ||
              ''
            }`}
            onClick={setTimeLines}
          >
            <HourIcon
              color={!showTimeline ? computedStyle('--csmain2') : '#fff'}
              width={20}
              height={20}
            />
          </motion.div>
        </div>
        <span className="absolute z-10 top-0 left-0 w-[100%] h-full">
          <LinkItem defaultMetric={{ id: label } as MetricInfo}>
            <></>
          </LinkItem>
        </span>
      </motion.div>
      <motion.div className="flex-row" {...ani()}>
        <div className="w-full flex-cell h-[2px] rounded-full bg-sgrey self-center p-0 "></div>
      </motion.div>
      <AnimatePresence mode="sync">
        {timelines && showTimeline && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: '100%',
              opacity: 1,
              transition: { duration: 0.6, type: 'tween' },
            }}
            exit={{ height: 0, transition: { duration: 0.6 } }}
          >
            <Timelines timelines={timelines} noani smallGraph lockTimeline />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const getClsCol = (n: number) => {
  if (n === undefined || n === null) return 'var(--csinactive)';
  else if (n > 99.49) return 'var(--csswitch)';
  else if (n < 99.49 && n >= 99) return 'var(--csyellow)';
  else if (n < 99 && n >= 95) return 'var(--csorange)';
  else if (n < 95 && n >= 70) return '#F96400';
  else if (n < 70) return 'var(--csred)';
};

export function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}
