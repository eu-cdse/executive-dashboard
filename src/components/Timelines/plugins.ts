import { computedStyle } from '@/common/getChartStyles';

export const ExtraLinePlugin = {
  id: 'corsair',
  afterInit: (chart) => {
    chart.corsair = {
      x: 0,
      y: 0,
    };
  },
  afterEvent: (chart, evt) => {
    const {
      chartArea: { top, bottom, left, right },
    } = chart;
    const {
      event: { x, y },
    } = evt;
    if (x < left || x > right || y < top || y > bottom) {
      chart.corsair = {
        x,
        y,
        draw: false,
      };
      chart.draw();
      return;
    }

    chart.corsair = {
      x,
      y,
      draw: true,
    };

    chart.draw();
  },
  afterDatasetsDraw: (chart, _, opts) => {
    const {
      ctx,
      chartArea: { top, bottom },
    } = chart;
    const { x, draw } = chart.corsair;

    if (!draw) {
      return;
    }

    ctx.lineWidth = opts.width || 0;
    ctx.setLineDash(opts.dash || []);
    ctx.strokeStyle = computedStyle('--csmain2');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, top);

    ctx.stroke();
    ctx.restore();
  },
};

export const isDeepEqual = (object1, object2) => {
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if (
      (isObjects && !isDeepEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false;
    }
  }
  return true;
};

const isObject = (object) => {
  return object != null && typeof object === 'object';
};
