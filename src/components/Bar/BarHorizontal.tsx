import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Chart,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { computedStyle } from '@/common/getChartStyles';
import { chartColors, windowsSizes } from '@/common/constants';
import useWindowSize from '@/hooks/useWindowSize';
import { cap, formatValue } from '@/functions';
import 'chartjs-plugin-datalabels';
import { motion } from 'framer-motion';
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
  data: {
    labels: string[];
    series: number[];
  };
  name: string;
  unit?: string;
}

interface Props {
  data: HistoData;
  colNum: number;
  maxw?: number;
  colors?: string[];
  nocursor?: boolean;
  hideLabel?: boolean;
  height?: number;
  smallLabels?: boolean;
  color?: string;
}

const BarHorizontal: React.FC<Props> = ({
  data: { data, name, unit },
  colNum,
  colors,
  nocursor,
  hideLabel,
  height,
  smallLabels,
  color,
}) => {
  let nullsIndex = [];
  let filteredSeries = data?.series?.filter((s, i) => {
    let isNotNull = s !== null;
    if (!isNotNull) nullsIndex.push(i);
    return isNotNull;
  });
  const { width } = useWindowSize();
  let cols = colors ? colors : chartColors;
  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
        align: 'right',
        anchor: 'center',
        font: {
          size: 14,
          style: 'normal',
        },
      },
      legend: {
        display: false,
        position: 'bottom' as const,
      },
      title: {
        display: hideLabel ? false : true,
        text: cap(name),
        color: color || computedStyle(cols[colNum]),
      },
      tooltip: {
        callbacks: {
          label: function (this, tooltipItem) {
            let t = filteredSeries.reduce((sun, n) => sun + n, 0);
            let a = filteredSeries[tooltipItem.dataIndex];
            var percentage = parseFloat(((a / t) * 100).toFixed(1)) || 0;
            let val = formatValue(a, unit, true) || 0;
            return val + (unit === '%' ? '' : ' (' + percentage + '%)');
          },
          title: function (this, tooltipItem) {
            return formatBarChartTooltipTitle(tooltipItem[0].label);
          },
        },
      },
    },
    onHover: (event, chartElement) => {
      (event.native.target as HTMLButtonElement).style.cursor =
        chartElement[0] && !nocursor ? 'pointer' : 'default';
    },
    scales: {
      y: {
        grid: {
          display: false,
        },
        ticks: {
          ...(width < windowsSizes.gMini ? { mirror: false } : {}),
          color: computedStyle('--csgray'),
          font(_) {
            return {
              size: smallLabels ? 8 : 12,
              style: 'normal',
            };
          },
        },
      },
      x: {
        ticks: {
          callback: function (label) {
            return formatValue(label as number, unit);
          },
          color: computedStyle('--csgray'),
          font(_) {
            return {
              size: smallLabels ? 8 : 12,
              style: 'normal',
            };
          },
        },
      },
    },
  };
  let s = width < windowsSizes.gMini ? '60' : '90';

  const labels = data.labels
    .filter((_, i) => !nullsIndex.includes(i))
    .map((s) => cap(s));

  const d = {
    labels,
    datasets: [
      {
        label: name,
        data: filteredSeries,
        minBarLength: 4,
        backgroundColor: color + s || computedStyle(cols[colNum]) + s,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{
        opacity: 1,
        scaleX: 1,
        transition: { duration: 0.6 },
      }}
      exit={{
        opacity: 0,
        scaleY: 0,
        transition: { duration: 0.4 },
        translateX: 0,
      }}
      className="h-full"
      style={{
        height: height || '100%',
        width: '100%',
      }}
    >
      <Bar
        options={options}
        data={d}
        width={'100%'}
        height={height || '100%'}
        plugins={[NoDataPlugin]}
      />
    </motion.div>
  );
};
export default BarHorizontal;

export const NoDataPlugin = {
  id: 'emptyChart',
  afterDraw(chart: Chart) {
    const { datasets } = chart.data;
    let hasData = true;

    for (let dataset of datasets) {
      //set this condition according to your needs

      if (dataset.data.every((item) => !item && item !== 0)) {
        hasData = false;
        break;
      }
    }

    if (!hasData) {
      const {
        chartArea: { left, top, right, bottom },
        ctx,
      } = chart;
      let centerX = null,
        centerY = null;
      if (left && bottom && right && top) {
        centerX = (left + right) / 2;
        centerY = (top + bottom) / 2;
      }

      centerX = centerX || chart.width / 2;
      centerY = centerY || chart.height / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Jakarta';
      ctx.fillStyle = '#333';
      ctx.fillText('No data to display', centerX, centerY);
      ctx.restore();
    }

    //  chart.resize();
  },
};
