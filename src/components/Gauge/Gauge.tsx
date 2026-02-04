import { computedStyle } from '@/common/getChartStyles';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartArea,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useEffect, useRef, useState } from 'react';
import { GaugeItem } from './GaugeWrapper';
import { useTooltip } from '@/hooks/useTooltip';
import {
  TooltipContainer,
  TooltipLastUpdated,
  TooltipString,
} from '../Tooltip/Tooltip';

ChartJS.register(ArcElement, Tooltip, Legend);

function createGradient(ctx: CanvasRenderingContext2D, area: ChartArea) {
  const colorStart = computedStyle('--csmain3');
  const colorMid = computedStyle('--cssec') + 90;
  const colorEnd = computedStyle('--cssec') + 50;

  const gradient = ctx.createLinearGradient(30, 200, area.right, -100);

  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(0.5, colorMid);
  gradient.addColorStop(0.7, colorEnd);
  gradient.addColorStop(1, colorEnd);

  return gradient;
}

const Gauge: React.FC<{
  gauge: GaugeItem;
  middle?: boolean;
  small?: boolean;
}> = ({
  gauge: { name, timeliness, value, type, description, timestamp },
  middle,
  small,
}) => {
  const [tooltip] = useTooltip();
  const val = value || value === 0 ? value.toFixed(0) + '%' : '/';
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<ChartData<
    'doughnut',
    number[],
    string
  > | null>({
    datasets: [
      {
        data: [value || 0, 100 - value || 0],
        borderWidth: 0,
        circumference: 180,
        borderRadius: [
          {
            outerStart: 15,
            outerEnd: value > 99.5 ? 15 : 0,
            innerStart: 15,
            innerEnd: value > 99.5 ? 15 : 0,
          },
          {
            outerStart: 0,
            outerEnd: 15,
            innerStart: 0,
            innerEnd: 15,
          },
        ],
      },
    ],
  });

  const options = {
    rotation: -90,
    cutout: '80%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    tooltips: {
      enabled: false,
    },
  };

  const gaugeTooltip = () => {
    return (
      <TooltipContainer label={name}>
        <TooltipString label={'Description'} text={description} />
        <TooltipLastUpdated timestamp={timestamp} />
      </TooltipContainer>
    );
  };

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }
    let gradient = createGradient(chart.ctx, chart.chartArea);
    const data = {
      ...chartData,
      datasets: chartData.datasets.map((dataset) => ({
        ...dataset,
        data: [value || 0, 100 - value || 0],
        backgroundColor: [gradient, value < 99.5 ? '#33333310' : '#fff'],
        borderColor: [gradient, value < 99.5 ? '#33333310' : '#fff'],
      })),
    };

    setChartData(data);
  }, [value]);

  return (
    <div
      className="w-full relative h-full p-4 "
      style={
        middle
          ? {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }
          : {}
      }
    >
      <div
        {...(description && tooltip(gaugeTooltip(), 0.3))}
        className={`text-htext text-xs mb-2 ${
          small ? 'max-w-[170px]' : 'max-w-[100%]'
        } truncate`}
      >
        {name}
      </div>
      <div className="flex justify-center items-center">
        <div className="text-smain2 font-bold">{timeliness}</div>
        <span className="text-stext ml-2">from sensing</span>
      </div>
      {/*  <div className="absolute  bottom-0 right-0 textnpm-ssec flex flex-col justify-center items-center">
        <span className="h-text"></span>
        <span className='text-smain2'>
          {timestamp}
          </span>
      </div> */}
      <div
        style={{ left: 'calc(50% - 50px)' }}
        className={`absolute w-[100px]  ${
          small ? 'bottom-12' : 'bottom-16'
        } text-ssec flex flex-col justify-center items-center`}
      >
        <div
          className={`text-smain2 text-center ${
            small ? 'text-xl' : 'text-3xl'
          } font-bold`}
        >
          {val}
        </div>
        <div className="text-xs text-htext text-center font-medium">
          {name.includes('Default')
            ? 'Default Timeliness'
            : type === 'nrt'
              ? 'Near Real-Time'
              : type === 'ntc'
                ? 'Non-Time Critical'
                : type === 'stc'
                  ? 'Short-Time Critical'
                  : 'Default Timeliness'}
        </div>
      </div>
      <div
        className="w-full pb-4"
        style={{
          height: 'calc(100% - 40px)',
        }}
      >
        <Doughnut
          ref={chartRef}
          width={'100%'}
          height={'100%'}
          data={chartData}
          options={options}
          plugins={[]}
        />
      </div>
    </div>
  );
};

export default Gauge;

/* const labelsPlugin = {
  id: 'labelsPlugin',
  afterDraw: (chart, args, options) => {
    const ctx = chart.ctx;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);
    const outerRadius = meta.data[0].outerRadius;
    const innerRadius = meta.data[0].innerRadius;
    const x = chart.width / 2;
    const y = chart.height / 2;

    ctx.save();
    ctx.fillStyle = 'black'; // or any other color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '12px Arial'; // adjust font and size as needed

    const labels = [0, 20, 40, 60, 80, 100];
    labels.forEach((label, index) => {
      // Adjust angle calculation, incorporating rotation
      const angle =
        -Math.PI / 2 + Math.PI * (index / (labels.length - 1)) - Math.PI / 2;
      const labelRadius = innerRadius - 20; // This positions the label 20 pixels inside the inner radius
      const labelX = x + labelRadius * Math.cos(angle);
      const labelY = y + labelRadius * Math.sin(angle);
      ctx.fillText(label.toString(), labelX, labelY);
    });

    ctx.restore();
  },
}; */
