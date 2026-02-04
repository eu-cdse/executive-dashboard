import React, { useRef } from 'react';
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
import { computedStyle, getChartStyles } from '@/common/getChartStyles';
import { formatValue } from '@/functions';
import { NoDataPlugin } from './BarHorizontal';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useWindowSize from '@/hooks/useWindowSize';
import { windowsSizes } from '@/common/constants';
import { useAniStore, useFixedTooltipStore } from '@/store';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { shallow } from 'zustand/shallow';
import BarHorizontalTooltip from './BarHorizontalTooltip';
import { formatBarChartTooltipTitle } from './utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistoData {
  labels: string[];
  series: number[];
  name: string;
  unit: string;
}

interface Props {
  data: HistoData;
  unit?: string;
  colors?: string[];
  haveDetailes?: boolean;
  maxw?: number;
  hideLabel?: boolean;
  height?: number;
  invert?: boolean;
  detailed?: object;
}

const BarVertical: React.FC<Props> = ({
  data,
  unit,
  colors,
  haveDetailes,
  maxw,
  hideLabel,
  height,
  invert,
  detailed,
}) => {
  // Stores
  const theme = useAniStore((state) => state.theme);

  const [setTooltip, setData, active] = useFixedTooltipStore(
    (state) => [state.setToolTip, state.setData, state.active],
    shallow
  );

  // Hooks
  const tooltipRef = useRef(null);
  const [activeSlice, setActiveSlice] = React.useState<number | null>(null);
  const { pathname } = useLocation();
  const { width } = useWindowSize();
  let isSmall = width < windowsSizes.gMini;
  const isMain = pathname === '/' || pathname === '/service-insight';

  let nullsIndex = [];
  let filteredSeries = data.series.filter((s, i) => {
    let isNotNull = s !== null;
    if (!isNotNull) nullsIndex.push(i);
    return isNotNull;
  });

  const labels = data.labels.filter((_, i) => !nullsIndex.includes(i));

  const colorss = colors.filter((_, i) => !nullsIndex.includes(i));

  const styl = getChartStyles(labels.length, activeSlice, colorss);

  const getDetailedData = (id) => {
    if (!detailed) return null;
    let g = detailed[labels[id]];
    if (!g) return null;
    return {
      labels: g.map((i) => i.product),
      series: g.map((i) => i.value),
      name: data.name,
      unit,
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
          color={computedStyle(colorss[id])}
        />
      ),
      elRef: tooltipRef,
    });
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
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets[0].data.map((_, i) => ({
              text: `${chart.data.labels[i]}`,
              fillStyle: datasets[0].backgroundColor[i],
              lineWidth: 0,
              index: i,
              fontColor: theme === 'dark' ? '#0dd6b8' : '#333',
            }));
          },
          font: {
            size: isMain || isSmall ? 9 : 12,
          },
          padding: isMain || isSmall ? 5 : 10,
          usePointStyle: true,
        },
        title: {
          display: false,
          padding: 0,
        },
        onClick(_, legendItem) {
          var index = legendItem.index;
          setActiveSlice && setActiveItem(index);
        },
      },
      datalabels: {
        display: true,
        color:
          (colorss && colorss.map((c) => computedStyle(c))) ||
          computedStyle('--csmain2'),
        formatter: (n) => {
          if (filteredSeries.every((s) => !s && s !== 0)) return null;
          return n === 0 ? 0 : formatValue(n, unit);
        },
        anchor: 'end',
        offset: -20,
        align: 'start',
        textStrokeWidth: 0.5,
        font: {
          size: isMain ? 9 : 12,
        },
      },
      title: {
        display: hideLabel ? false : true,
        text: data.name,
        color: computedStyle('--csmain2'),
        padding: {
          bottom: 30,
        },
      },
      tooltip: {
        callbacks: {
          label: function (this, tooltipItem) {
            let t = filteredSeries.reduce((sun, n) => sun + (n ? n : 0), 0);
            let a = filteredSeries[tooltipItem.dataIndex];
            var percentage = parseFloat(((a / t) * 100).toFixed(1)) || 0;
            let val = formatValue(a, unit, true) || 0;

            return val + (unit === '%' ? '' : ' (' + percentage + '%)');
          },
          afterBody: function () {
            // If you want additional lines on tooltip, like timestamp.
          },
          title: function (this, tooltipItem) {
            return formatBarChartTooltipTitle(tooltipItem[0].label);
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

          callback: function (_) {
            return '';
          },
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
            size: isMain || isSmall ? 9 : 12,
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
        data: filteredSeries,
        minBarLength: 4,
        backgroundColor: data.series.every((s) => s === 0)
          ? data.series.map((_) => '#33333320')
          : styl.bgc,
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
export default BarVertical;
