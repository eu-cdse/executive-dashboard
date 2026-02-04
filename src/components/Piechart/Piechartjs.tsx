import { windowsSizes } from '@/common/constants';
import { computedStyle, getChartStyles } from '@/common/getChartStyles';
import useWindowSize from '@/hooks/useWindowSize';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  Chart,
} from 'chart.js';
import { useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { formatValue } from '@/functions';
import { useLocation } from 'react-router-dom';
import { MetricInfo, useAniStore, useFixedTooltipStore } from '@/store';
import { shallow } from 'zustand/shallow';
import BarHorizontalTooltip from '../Bar/BarHorizontalTooltip';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieData {
  series: number[];
  labels: string[];
  name: string;
  unit?: string;
}

interface Props {
  data: PieData;
  colors?: string[];
  nocursor?: boolean;
  hideLabel?: boolean;
  maxw?: number;
  isMini?: boolean;
  detailed?: object;
  metric?: MetricInfo;
}

const Piechartjs: React.FC<Props> = ({
  data: { series, labels, name, unit },
  colors,
  nocursor,
  hideLabel,
  maxw,
  isMini,
  detailed,
}) => {
  const theme = useAniStore((s) => s.theme);
  const { pathname } = useLocation();
  const [activeSlice, setActiveSlice] = useState(null);
  const isMain = pathname === '/' || pathname === '/service-insight';
  const { width } = useWindowSize();
  const [setTooltip, setData, active] = useFixedTooltipStore(
    (state) => [state.setToolTip, state.setData, state.active],
    shallow
  );
  const tooltipRef = useRef(null);

  let isSmall = width < windowsSizes.gMini;

  let nullsIndex = [];
  let filteredSeries = series.filter((s, i) => {
    let isNotNull = s !== null;
    if (!isNotNull) nullsIndex.push(i);
    return isNotNull;
  });

  const labelss = labels
    .filter((_, i) => !nullsIndex.includes(i))
    .map((label) => {
      if (label === 'south_america') {
        label += '_and_antarctica';
      }

      return label
        .split('_')
        .map((part) =>
          part !== 'and' ? part.charAt(0).toUpperCase() + part.slice(1) : part
        )
        .join(' ');
    });

  const colorss = colors.filter((_, i) => !nullsIndex.includes(i));
  const styl = getChartStyles(labelss.length, activeSlice, colorss);
  const data: ChartData<'doughnut', number[], string> = {
    labels: labelss,
    datasets: [
      {
        label: name,
        data: filteredSeries,
        backgroundColor: styl.bgc,
        borderColor: styl.bc,
        //   offset: styl.offs,
        borderWidth: 2,
        hoverOffset: 2,
      },
    ],
  };

  const getDetailedData = (id) => {
    if (!detailed) return null;
    let g = detailed[labelss[id]];
    if (!g) return null;
    return {
      labels: g.map((i) => i.product),
      series: g.map((i) => i.value),
      name: name,
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
          name={labelss[id]}
          unit={unit}
          histo={histo}
          color={computedStyle(colorss[id])}
        />
      ),
      elRef: tooltipRef,
    });
  };

  const plugins = [
    {
      id: 'doughnut-afterdraw',
      afterDraw(chart: Chart) {
        const { datasets } = chart.data;
        let hasData = 'OK';

        for (let dataset of datasets) {
          if (dataset.data.every((item) => item === 0)) {
            hasData = 'EMPTY';
            break;
          } else if (dataset.data.every((item) => !item && item !== 0)) {
            hasData = 'NODATA';
            break;
          }
        }

        if (hasData !== 'OK') {
          let ctx = chart.ctx;
          let width = chart.width;
          let height = chart.height;

          const centerX = width / 2;
          const centerY = height / 2;
          const radius = 100;
          chart.clear();
          ctx.save();

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#33333310';

          if (hasData === 'EMPTY') {
            ctx.lineWidth = isMini ? 40 : 50;
            ctx.strokeStyle = computedStyle('--csinactive') + '50';
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle =
              theme === 'dark' ? computedStyle('--csinactive') + '50' : '#333';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Total', width / 2, height / 2 - 15);
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('0', width / 2, height / 2);
            ctx.restore();
          } else if (hasData === 'NODATA') {
            ctx.lineWidth = isMini ? 40 : 60;
            ctx.strokeStyle = computedStyle('--csinactive') + '50';
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = '#333';
            ctx.font = '16px Jakarta';
            ctx.fillText('No data to display', width / 2, height / 2 - 15);
            ctx.restore();
          }
        }
      },
    },
    {
      id: 'doughnut-afterdatasetdraw',
      afterDatasetsDraw: function (chart) {
        const {
          ctx,
          data,
          _active,
          chartArea: { width, height },
        } = chart;
        ctx.save();

        let x, y;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseLine = 'middle';
        if (_active.length && false) {
          if (_active[0].datasetIndex === 0) {
            x = _active[0].element.x;
            y = _active[0].element.y;
          }
          const datasetIndexValue = _active[0].datasetIndex;
          const dataIndexValue = _active[0].index;

          let dataPoint =
            data.datasets[datasetIndexValue].data[dataIndexValue] || 0;
          dataPoint = dataPoint < 0.1 ? 0 : dataPoint;
          dataPoint =
            (dataPoint !== 0 && formatValue(dataPoint, unit)) || dataPoint;
          ctx.fillStyle =
            data.datasets[datasetIndexValue].borderColor[dataIndexValue];
          ctx.fillText(dataPoint, x, y + 5);
        } else {
          let dataPoint =
            data.datasets.reduce((sum, n) => {
              let s = n.data.reduce((sum, ne) => {
                ne = !ne ? 0 : ne;
                return sum + ne;
              }, 0);
              return sum + s;
            }, 0) || 0;
          dataPoint = dataPoint < 0.1 ? 0 : dataPoint;

          dataPoint =
            (dataPoint !== 0 && formatValue(dataPoint, unit)) || dataPoint;

          ctx.fillStyle =
            typeof activeSlice === 'number'
              ? data.datasets[0].borderColor[0]
              : computedStyle('--csmain21');
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Total', width / 2, height / 2 - 15);
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(dataPoint, width / 2, height / 2 + 5);
        }
      },
    },
  ];

  return (
    <div
      ref={tooltipRef}
      className={`flex flex-col rounded-md overflow-hidden h-full w-full p-5`}
      style={{
        maxWidth: maxw || '100%',
        padding: width < 500 ? 5 : 15,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {(!hideLabel && (
        <div className="text-smain2 font-medium text-sm">{name}</div>
      )) ||
        null}
      <Doughnut
        id={'emptyChart'}
        data={data}
        width={'100%'}
        height={'100%'}
        plugins={[
          ...(plugins as any),
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
        options={{
          responsive: true,
          maintainAspectRatio: false,
          onClick(evt, element) {
            evt.native.preventDefault();
            element[0] && setActiveSlice && setActiveItem(element[0].index);
          },
          onHover: (event, chartElement) => {
            (event.native.target as HTMLButtonElement).style.cursor =
              chartElement[0] && !nocursor ? 'pointer' : 'default';
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                font: {
                  size: isMain || isSmall ? 10 : 12,
                },
                padding: isSmall ? 5 : 10,
              },
              onClick(_, legendItem) {
                var index = legendItem.index;
                setActiveSlice && setActiveItem(index);
              },
            },
            tooltip: {
              callbacks: {
                label: function (this, tooltipItem) {
                  var dataset = data.datasets[tooltipItem.datasetIndex];
                  let totalChartValue = dataset.data.reduce(
                    (sun, n) => sun + (n ? n : 0),
                    0
                  );
                  if (totalChartValue < 0.01) return '0';
                  let sliceValue = dataset.data[tooltipItem.dataIndex];
                  var percentage = parseFloat(
                    ((sliceValue / totalChartValue) * 100).toFixed(1)
                  );

                  return (
                    (formatValue(sliceValue, unit) || 0) +
                    (unit === '%' ? '' : ' (' + percentage + '%)')
                  );
                },
              },
            },
          },
        }}
      />
    </div>
  );
};
export default Piechartjs;
