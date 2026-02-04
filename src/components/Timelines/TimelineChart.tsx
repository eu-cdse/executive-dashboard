//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-moment';

import { motion } from 'framer-motion';
import { computedStyle } from '@/common/getChartStyles';
import { formatValue } from '@/functions';
import { scale } from '@/animations/common';
import { isFloat } from '@/components/ServicesTable/Accordion';
import { useLocation } from 'react-router-dom';
import useWindowSize from '@/hooks/useWindowSize';
import TimelineTools from './TimelineTools';
import { ExtraLinePlugin } from './plugins';
import { windowsSizes } from '@/common/constants';
import { useAniStore } from '@/store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface ITimelines {
  datasets: {
    label: string;
    data: {
      x: string;
      y: number;
    }[];
    borderColor: string;
    backgroundColor: string;
  }[];
  timestamps: number[];
  unit?: string;
  noani?: boolean;
  m_key?: string;
  justGraph?: boolean;
  smallGraph?: boolean;
  lockTimeline?: boolean;
  bigLabels?: boolean;
}
const TimelineChart: React.FC<ITimelines> = ({
  datasets,
  unit,
  timestamps,
  noani,
  m_key,
  justGraph,
  smallGraph,
  lockTimeline,
  bigLabels,
}) => {
  const theme = useAniStore((state) => state.theme);
  const { pathname } = useLocation();
  const [chartWidth, setCharWidth] = useState(0);
  const { width } = useWindowSize();
  let isSmall = width < windowsSizes.gMini;
  const isMain = pathname === '/' || pathname === '/service-insight';

  const chartRef = useRef(null);

  let labelSize = bigLabels ? 14 : isMain || isSmall ? 9 : 12;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    plugins: {
      legend: {
        display: justGraph ? false : true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: {
            size: bigLabels ? 15 : labelSize,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (this, tooltipItem) {
            let d = datasets
              .filter((d) => d.data.find((d) => d.y !== null))
              .map((d) => ({
                y: d.data[tooltipItem.dataIndex]?.y,
                lbl: d?.label,
              }));
            let data = d.map((a) => {
              if (isFloat(a.y))
                return `${a.lbl}: ${formatValue(a.y, unit) || 0}`;
              else return `${a.lbl}: ${formatValue(a.y, unit) || 0}`;
            });
            return data[tooltipItem.datasetIndex] || 0;
          },
          labelColor: function (context) {
            return {
              backgroundColor: context.dataset.backgroundColor,
              borderColor: context.dataset.borderColor,
              borderWidth: 3,
              borderRadius: 6,
            };
          },
        },
      },
      title: {
        display: false,
        text: 'Timeliness',
      },
      corsair: {
        dash: [3, 3],
        color: computedStyle('var(--csmain2)'),
        width: 1,
      },
      elements: {
        line: {
          tension: 0.5,
        },
      },
      zoom: {
        pan: {
          enabled: false,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: !lockTimeline ? true : false,
            speed: 0.1,
          },
          pinch: {
            enabled: !lockTimeline ? true : false,
          },

          scaleMode: 'x',
          mode: 'x',
          drag: { enabled: !lockTimeline ? true : false, threshold: 30 },
          onZoom: (context) => {
            //@ts-ignore
            let unit = context.chart.options.scales.x.time.unit;
            let zoomLvl = context.chart.getZoomLevel();
            if (unit !== 'minute' && zoomLvl > 6.2) {
              //@ts-ignore
              context.chart.options.scales.x.time.unit = 'hour';
              context.chart.update();
            } else if ((unit = 'hour' && zoomLvl < 6.2)) {
              //@ts-ignore
              context.chart.options.scales.x.time.unit = 'day';
              context.chart.update();
            }
          },
        },
        limits: {
          // y: { min: 0, max: 0 },
          x: { min: timestamps[0], max: timestamps[timestamps.length - 1] },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        type: 'time',
        time: {
          minUnit: 'hour',
          unit: 'day',
          isoWeekday: true,
          //unit: 'day',
          displayFormats: {
            hour: 'h:mm a',
            minute: 'h:mm a',
          },
        },
        ticks: {
          source: 'auto',
          font: {
            size: labelSize,
          },
          color: theme === 'dark' ? '#0dd6b8' : '#333',
        },
        min: timestamps[0],
        max: timestamps[timestamps.length - 1],
      },
      y: {
        ticks: {
          callback: function (label) {
            return formatValue(label as number, unit);
          },
          font: {
            size: labelSize,
          },
          color: theme === 'dark' ? '#0dd6b8' : '#333',
        },
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    setCharWidth(chartRef?.current?.width);
  }, [width]);

  let data = {
    datasets: datasets.filter((d) => d.data.find((d) => d.y !== null)),
  };
  if (pathname === '/service-health')
    data.datasets = data.datasets.map((d) => ({
      ...d,
      borderColor: computedStyle('--cssec'),
      backgroundColor: computedStyle('--cssec'),
    }));

  return (
    <motion.div
      {...(!noani && scale(0.3))}
      {...(noani && {
        initial: { opacity: 0, height: 0 },
        animate: {
          opacity: 1,
          height: 'auto',
          transition: { duration: 0.3, type: 'tween' },
        },
        exit: { opacity: 0, height: 0, transition: { duration: 0.6 } },
      })}
      style={{
        height: (!smallGraph && 'calc(100% - 10px)') || '100%',
        maxHeight: smallGraph ? 385 : '100%',
      }}
      className="flex flex-col w-full h-full  pr-0 relative"
    >
      {!justGraph && !lockTimeline && (
        <TimelineTools chartRef={chartRef} width={chartWidth} />
      )}

      <Line
        onClick={(e) => e.stopPropagation()}
        height={smallGraph ? 90 : '100%'}
        ref={chartRef}
        options={options}
        data={data}
        plugins={[
          ExtraLinePlugin,
          {
            id: 'bfd',
            beforeDraw: function (c) {
              var legends = c.legend.legendItems;
              legends.forEach(function (e) {
                e.fontColor = computedStyle('--csgray');
              });
            },
          },
        ]}
      />
    </motion.div>
  );
};
export default TimelineChart;
