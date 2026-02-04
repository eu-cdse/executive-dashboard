import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Piechartjs } from '../Piechart';
import { BarHorizontal, BarVertical } from '../Bar';
import {
  MetricInfo,
  useConfigurationStore,
  useDataStore,
  usePopupStore,
} from '@/store';
import Timelines from '../Timelines/Timelines';
import { useLocation } from 'react-router-dom';
import { useTooltip } from '@/hooks/useTooltip';
import { TlTooltip } from '../Tooltip/Tooltip';
import { computedStyle } from '@/common/getChartStyles';
import { ChartIcon, ExpandIcon, TimelineIcon } from './icons';
import { shallow } from 'zustand/shallow';
import TimePeriodTag from '../TimePeriodTag/TimePeriodTag';
import useWindowSize from '@/hooks/useWindowSize';
import MissingDates from '../MissingAlert/MissingDates';
import { AutoLinkHOC } from '../DeepLink';
import ComponentTag from '@/containers/Panels/common/ComponentTag';
import TimelinessHistogram from '../TimelinessHistogram/TimelinessHistogram';

enum ChartType {
  Pie = 'pie',
  Bar = 'bar',
  BarHorizontal = 'bar-horizontal',
  Timeline = 'timeline',
  TimelinessHistogram = 'timeliness-histogram',
}

export const Chart: React.FC<{
  type: string;
  metric: MetricInfo;
  justGraph?: boolean;
  reduceList?: boolean;
  singleGroup?: boolean;
  tag?: string;
}> = ({ type, metric, justGraph, reduceList, singleGroup, tag }) => {
  const [showTimelines, setTimelines] = useState(false);
  const [activeData, setActiveData] = useState(null);
  const { width } = useWindowSize();
  const { pathname } = useLocation();
  const p = useDataStore((state) => state.data);
  const [activePeriod, configuration, setConfiguration] = useConfigurationStore(
    (s) => [s.activePeriod, s.configuration, s.setConfiguration],
    shallow
  );
  const [setPopupVisibility, setData] = usePopupStore(
    (s) => [s.setPopupVisibility, s.setData],
    shallow
  );
  const wrapperRef = React.useRef(null);
  const [tooltip] = useTooltip();

  // Switch timelines on and off
  const setTimelinesBtn = (e) => {
    e.stopPropagation();
    setTimelines((prev) => !prev);
    setConfiguration({ [metric.id]: { showTimelines: !showTimelines } });
  };

  const openPopup = (e) => {
    e.stopPropagation();
    setData({
      component: (
        <Timelines
          key={'popedup'}
          timelines={activeData?.timelines}
          m_key={metric.label + 'xx'}
          lockTimeline={metric.props.lockTimeline}
          bigLabels
        />
      ),
      data: {
        title: activeData.name,
        id: metric.id,
        wrapperRef,
      },
    });
    setPopupVisibility(true);
  };

  // Check if which graph to show from url config
  useEffect(() => {
    if (metric) {
      let config = configuration[metric.id];
      if (!config) return;
      if (Object.keys(config).length) {
        setTimelines(config?.showTimelines);
      }
    }
  }, [configuration[metric?.id]]);

  useEffect(() => {
    p.setTimeframe(activePeriod);
    let data = p.graphsData(metric, null, reduceList, singleGroup);
    if (showTimelines && data?.timelines?.length === 0) setTimelines(false);
    setActiveData(data);
  }, [metric, activePeriod]);

  // Transform big bar graphs (more than 9 products) to piecharts on small screens
  type =
    pathname !== '/' &&
    width < 600 &&
    type === 'bar' &&
    activeData?.graphs?.labels?.length > 9
      ? 'pie'
      : type;

  return (
    <>
      <motion.div
        className={`w-full h-full flex ${
          justGraph ? 'pt-1' : width < 450 ? 'px-2 bss pt-3' : 'px-7 bss pt-3'
        } flex-col  rounded-lg relative items-center justify-between`}
        layoutId={type !== ChartType.TimelinessHistogram && metric.id}
        ref={wrapperRef}
      >
        {!justGraph && (
          <div className="flex justify-start  items-center w-full">
            <div
              {...(activeData?.tooltipItems &&
                tooltip(activeData?.tooltipItems, 0.3))}
              className="text-stext self-center text-[15px] select-none"
              style={{
                paddingRight:
                  showTimelines || type === 'timeline' ? '52px' : '25px',
              }}
            >
              {activeData?.name}
            </div>
            <div />
            {/* Time period */}
            <TimePeriodTag
              shouldShow={
                !(
                  activeData &&
                  activeData?.selectedPeriod &&
                  showTimelines &&
                  activeData?.timelines[0]?.timestamps?.length > 1 &&
                  activeData?.timelines.at(0)?.isDailyTimeline
                )
              }
              timePeriod={activeData?.selectedPeriod}
              justGraph={justGraph}
            />
          </div>
        )}

        {/* Expand Button */}
        {(showTimelines || type === ChartType.Timeline) && (
          <TimelineExpandButton
            openPopup={openPopup}
            onlyTimeline={type === ChartType.Timeline}
          />
        )}

        {/* Timeline Button */}
        {(activeData?.timelines?.length &&
          type !== ChartType.Timeline &&
          activeData?.timelines[0]?.timestamps?.length > 1 && (
            <div className="absolute top-2 right-2">
              <TimeLineButton
                showTimelines={showTimelines}
                setTimelines={setTimelinesBtn}
              />
            </div>
          )) ||
          null}

        <AnimatePresence mode="wait">
          {(showTimelines &&
            activeData &&
            activeData?.timelines[0]?.timestamps?.length > 1 && (
              <motion.div className="p2 w-full h-full">
                <Timelines
                  key={'timeliness' + activeData?.name}
                  timelines={activeData?.timelines}
                  m_key={metric.label + 'xx'}
                  lockTimeline={metric.props.lockTimeline}
                />
              </motion.div>
            )) ||
            (activeData && (
              <>
                {(type === ChartType.Pie && (
                  <Piechartjs
                    key={'pie' + activeData?.name}
                    data={{
                      labels: activeData?.graphs.labels,
                      series: activeData?.graphs.series,
                      name: activeData?.name,
                      unit: activeData?.unit,
                    }}
                    colors={activeData?.graphs.colors}
                    detailed={activeData?.graphs.detailed}
                    hideLabel={true}
                  />
                )) ||
                  (type === ChartType.TimelinessHistogram && (
                    <TimelinessHistogram
                      key={'timelinesshistogram' + activeData?.name}
                      data={{
                        labels: activeData?.graphs.labels,
                        series: activeData?.graphs.series,
                        name: activeData?.graphs.detailed.at(0)?.name,
                        unit: activeData?.unit,
                        productKey: activeData?.graphs.detailed.at(0)?.key,
                      }}
                      detailed={activeData?.graphs.detailed}
                      haveDetailes={false}
                    />
                  )) ||
                  (type === ChartType.Bar && (
                    <BarVertical
                      key={'barvertical' + activeData?.name}
                      data={{
                        labels: activeData?.graphs.labels,
                        series: activeData?.graphs.series,
                        name: activeData?.name,
                        unit: activeData?.unit,
                      }}
                      detailed={activeData?.graphs.detailed}
                      unit={activeData?.unit}
                      haveDetailes={false}
                      hideLabel={true}
                      colors={activeData?.graphs.colors}
                    />
                  )) ||
                  (type === ChartType.BarHorizontal && (
                    <BarHorizontal
                      key={'barhorizontal' + activeData?.name}
                      data={{
                        data: {
                          labels: activeData?.graphs.labels,
                          series: activeData?.graphs.series,
                        },
                        name: activeData?.name,
                        unit: activeData?.unit,
                      }}
                      hideLabel={true}
                      colNum={activeData?.graphs.labels.length}
                    />
                  )) ||
                  (type === ChartType.Timeline && (
                    <motion.div className="p2 w-full h-full">
                      <Timelines
                        key={'timeliness2' + activeData?.name}
                        timelines={activeData?.timelines}
                        m_key={metric.label + 'xx'}
                        justGraph={justGraph}
                        lockTimeline={metric.props.lockTimeline}
                      />
                    </motion.div>
                  ))}
              </>
            )) ||
            null}
        </AnimatePresence>
        {!showTimelines && activeData?.missing && (
          <MissingDates dates={activeData.missing} hasTag={!!tag} />
        )}

        {(showTimelines || type === ChartType.Timeline) &&
          activeData?.timelines &&
          activeData?.timelines[0]?.missing && (
            <MissingDates
              dates={activeData.timelines[0].missing}
              hasTag={!!tag}
            />
          )}
      </motion.div>
      {tag && <ComponentTag icon={tag} />}
    </>
  );
};
export default AutoLinkHOC(Chart);

const TimeLineButton = ({ showTimelines, setTimelines }) => {
  const [tooltip] = useTooltip();
  const { width } = useWindowSize();

  return (
    <motion.div
      onClick={setTimelines}
      className="cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...(width > 500 &&
        tooltip(
          <TlTooltip
            text={showTimelines ? 'Current data' : 'Historical data'}
          />,
          0.5
        ))}
    >
      {(showTimelines && (
        <ChartIcon width={24} height={24} color={computedStyle('--cssec')} />
      )) || (
        <TimelineIcon width={24} height={24} color={computedStyle('--cssec')} />
      )}
    </motion.div>
  );
};

const TimelineExpandButton = ({ openPopup, onlyTimeline }) => {
  const [tooltip] = useTooltip();
  const { width } = useWindowSize();

  return (
    <motion.div
      className={`cursor-pointer absolute top-2 ${
        onlyTimeline ? 'right-2' : 'right-10'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...(width > 500 && tooltip(<TlTooltip text={'Expand'} />, 0.5))}
      onClick={openPopup}
    >
      <ExpandIcon width={24} height={24} color={computedStyle('--cssec')} />
    </motion.div>
  );
};
