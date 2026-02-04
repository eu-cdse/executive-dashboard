import { chartColors } from '@/common/constants';

export const computedStyle = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

export const getChartStyles = (
  num: number,
  activeSlice: number,
  colors?: string[]
) => {
  let ac = !!colors;
  let cols = ac ? colors : chartColors;
  const bgColor = cols.map((c) => {
    return computedStyle(c);
  });
  const styl = { bgc: [], bc: [], offs: [] };
  for (let i = 0; i < num; i++) {
    if (activeSlice === i) {
      styl.bgc.push(bgColor[i]);
      styl.bc.push(bgColor[i]);
      styl.offs.push(20);
      continue;
    }
    styl.bgc.push(bgColor[i]);
    styl.bc.push(bgColor[i] + '99');
    styl.offs.push(0);
  }
  return styl;
};
