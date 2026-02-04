import React, { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { shallow } from 'zustand/shallow';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { computedStyle, getChartStyles } from '@/common/getChartStyles';
import { windowsSizes } from '@/common/constants';
import useWindowSize from '@/hooks/useWindowSize';
import { formatValue, TIMELINESS_PRODUCT_TO_TIME_INTERVAL } from '@/functions';

import BarHorizontalTooltip from '../Bar/BarHorizontalTooltip';
import { NoDataPlugin } from '../Bar/BarHorizontal';

import { useFixedTooltipStore } from '@/store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistogramData {
  labels: string[];
  series: number[];
  name: string;
  unit: string;
  productKey: string;
}

interface TimelinessHistogramProps {
  data: HistogramData;
  haveDetailes?: boolean;
  maxw?: number;
  height?: number;
  invert?: boolean;
  detailed?: object;
}

const TimelinessHistogram: React.FC<TimelinessHistogramProps> = ({
  data,
  haveDetailes,
  maxw,
  height,
  invert,
  detailed,
}) => {
  const tooltipRef = useRef(null);
  const [histogramWidth, setHistogramWidth] = useState(0);
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const [setTooltip, setData, active] = useFixedTooltipStore(
    (state) => [state.setToolTip, state.setData, state.active],
    shallow
  );
  const { width } = useWindowSize();

  const isSmall = width < windowsSizes.gMini;

  const { unit, productKey } = data;
  const labels = data.labels.slice(0, -1);
  const series = data.series.slice(0, -1);

  const colors = new Array(labels.length).fill('--csmain2');
  const styl = getChartStyles(labels.length, activeSlice, colors);

  const getDetailedData = (id) => {
    if (!detailed) return null;
    let g = detailed[labels[id]];
    if (!g) return null;
    return {
      labels: g.map((i) => i.product),
      series: g.map((i) => i.value),
      name: data.name,
      unit: unit,
    };
  };

  const setActiveItem = (id) => {
    setActiveSlice(id);
    let histo = getDetailedData(id);
    if (!histo) return;
    setTooltip(!active);
    setData({
      data: (
        <BarHorizontalTooltip
          activeSlice={id}
          name={labels[id]}
          unit={unit}
          histo={histo}
          color={computedStyle('--csmain2')}
        />
      ),
      elRef: tooltipRef,
    });
  };

  const formatTooltipTitle = (product: string, label: string): string => {
    const timeInterval = TIMELINESS_PRODUCT_TO_TIME_INTERVAL[product];
    const unit = timeInterval.charAt(timeInterval.length - 1);
    const y = parseInt(timeInterval.substring(0, timeInterval.length - 1));

    let x = 0;
    if (label.includes('d')) {
      x = parseInt(label.substring(0, label.length - 1));
    } else {
      x = parseInt(label);
    }

    let lowEdge = x - y;
    let highEdge = x;
    let lowEdgeStr = `${lowEdge}${unit}`;
    let highEdgeStr = `${highEdge}${unit}`;

    if (unit === 'h') {
      let numOfDaysLow, numOfHoursLow, numOfDaysHigh, numOfHoursHigh;
      if (lowEdge >= 24) {
        numOfDaysLow = Math.floor(lowEdge / 24);
        numOfHoursLow = lowEdge % 24;
        lowEdgeStr =
          numOfHoursLow > 0
            ? `${numOfDaysLow}d ${numOfHoursLow}${unit}`
            : `${numOfDaysLow}d`;
      }

      if (highEdge >= 24) {
        numOfDaysHigh = Math.floor(highEdge / 24);
        numOfHoursHigh = highEdge % 24;
        highEdgeStr =
          numOfHoursHigh > 0
            ? `${numOfDaysHigh}d ${numOfHoursHigh}${unit}`
            : `${numOfDaysHigh}d`;
      }
    }

    return `${lowEdgeStr} - ${highEdgeStr}`;
  };

  const formatLabel = (label: string): string => {
    const timeInterval = TIMELINESS_PRODUCT_TO_TIME_INTERVAL[productKey];
    const unit = timeInterval.charAt(timeInterval.length - 1);
    const y = parseInt(timeInterval.substring(0, timeInterval.length - 1));

    let x = 0;
    if (label.includes('d')) {
      x = parseInt(label.substring(0, label.length - 1));
    } else {
      x = parseInt(label);
    }

    let lowEdge = x - y;

    if (unit === 'h') {
      if (lowEdge >= 24) {
        const numOfDays = Math.floor(lowEdge / 24);
        const numOfHours = lowEdge % 24;
        return numOfHours > 0
          ? `${numOfDays}d ${numOfHours}${unit}`
          : `${numOfDays}d`;
      }
    }

    return `${lowEdge}${unit}`;
  };

  const options: ChartOptions<'bar'> = {
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 1,
        borderColor(ctx) {
          //@ts-ignore
          setHistogramWidth(ctx.element?.width ?? 0);
          return computedStyle('--csmain3');
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        title: {
          display: true,
          padding: 0,
        },
      },
      datalabels: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return formatTooltipTitle(
              productKey,
              tooltipItems.at(0)?.label ?? ''
            );
          },
          label: function (this, tooltipItem) {
            let t = series.reduce((sun, n) => sun + (n ? n : 0), 0);
            let a = series[tooltipItem.dataIndex];
            var percentage = parseFloat(((a / t) * 100).toFixed(1)) || 0;
            let val = formatValue(a, unit, true) || 0;

            return val + (unit === '%' ? '' : ' (' + percentage + '%)');
          },
          afterBody: function () {
            // If you want additional lines on tooltip, like timestamp.
          },
        },
      },
    },
    onClick(_, element) {
      element[0] && setActiveSlice && setActiveItem(element[0].index);
    },
    onHover: (event, chartElement) => {
      try {
        (event.native.target as HTMLInputElement).style.cursor =
          chartElement[0] && detailed[labels[0]] ? 'pointer' : 'default';
      } catch (e) {
        //console.log(e);
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: computedStyle('--csgray'),
          callback: function (id) {
            return formatLabel(labels[id]);
          },
          labelOffset: -histogramWidth / 2,
          align: 'center',
        },
      },
      y: {
        ticks: {
          callback: function (label) {
            return formatValue(label as number, unit);
          },
          ...(width < windowsSizes.gMini && invert ? { mirror: true } : {}),
          color: computedStyle('--csgray'),
          font: {
            size: isSmall ? 9 : 12,
          },
        },
      },
    },
  };

  const d = {
    labels,
    datasets: [
      {
        label: data.name,
        data: series.map((x) => (x !== 0 ? x : null)),
        minBarLength: 4,
        backgroundColor: styl.bgc,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      },
    ],
  };

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center w-full rounded-md"
      style={{
        width: haveDetailes ? 400 : '99%',
        height: height || (haveDetailes ? 400 : '100%'),
        maxWidth: maxw || '99%',
        maxHeight: maxw || 'none',
      }}
    >
      <Bar
        onClick={(e) => e.stopPropagation()}
        plugins={[NoDataPlugin, ChartDataLabels]}
        options={options}
        data={d}
      />
    </motion.div>
  );
};

export default TimelinessHistogram;
