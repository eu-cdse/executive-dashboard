import { RxDividerHorizontal } from 'react-icons/rx';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import { isFloat } from '@/components/ServicesTable/Accordion';
import { MdReportGmailerrorred } from 'react-icons/md';
import { IconType } from 'react-icons';
import { RiRefreshLine, RiHistoryFill } from 'react-icons/ri';
import { formatSecondsToDuration } from '@/hooks/useTimestamp';

const getTf = (tf: string) => {
  switch (tf) {
    case '1h':
      return '1 hour';
    case '1d':
      return '1 day';
    case '1w':
      return '1 week';
    case '30d':
      return '30 days';
    default:
      return '1 day';
  }
};

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export const getTimeframe = (timeframe: string) => {
  return ' - ' + getTf(timeframe);
};

let by = {
  B: 1,
  KB: 1000,
  MB: 1000 * 1000,
  GB: 1000 * 1000 * 1000,
  TB: 1000 * 1000 * 1000 * 1000,
  PB: 1000 * 1000 * 1000 * 1000 * 1000,
  EB: 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
  ZB: 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
  YB: 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
};

export const formatValue = (
  val: number,
  unit: string,
  bigNumber?: boolean,
  decimals?: number
) => {
  if (!val && unit !== '%') return null;
  if (val < 0) return null;
  if (!unit) return intToString(val, bigNumber, decimals);
  else if (unit === '%') {
    const rounded = val.toFixed(decimals ?? 2);
    return (
      (decimals === 0 && rounded === '0' && val > 0 ? '<1' : rounded) + unit
    );
  } else if (unit === 'time')
    return formatSecondsToDuration(val.toFixed(decimals ?? 2));
  if (Object.keys(by).includes(unit)) return toBytes(val * by[unit], decimals);
  return intToString(val, false, decimals) + unit;
};

export const sortOnly = (json, tooltip?) =>
  json.sort((a, b) => {
    let ar = !tooltip ? a.props : a;
    let br = !tooltip ? b.props : b;

    if (ar.order === undefined && br.order === undefined) {
      return 0;
    } else if (ar.order === undefined) {
      return 1;
    } else if (br.order === undefined) {
      return -1;
    } else {
      return ar.order - br.order;
    }
  });

export function toBytes(x: number | null, decimals?: number) {
  if (x === null) return null;
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let l = 0,
    //@ts-ignore
    n = parseInt(x, 10) || 0;

  while (n >= 1000 && ++l) {
    n = n / 1000;
  }

  return (
    (decimals ? n.toFixed(decimals) : n.toFixed(n < 10 && l > 0 ? 1 : 0)) +
    units[l]
  );
}

export function intToString(
  value: number | null,
  bigNumber?: boolean,
  decimals?: number
): string | null {
  if (value === null) return null;
  if (value < 1000000 || bigNumber) {
    //@ts-ignore
    value = isFloat(value) ? value.toFixed(decimals || 2) : value;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals || 2,
  }).format(value);
}

export const getDate = (d: string, n?: boolean) => {
  let date = new Date(Date.parse(d));
  if (n)
    return (
      date.getDay() +
      '.' +
      (date.getMonth() + 1) +
      '.' +
      date.getFullYear()
    ).toUpperCase();
  return (
    date.toLocaleString('default', { month: 'long' }) +
    ' ' +
    date.getDay() +
    ', ' +
    date.getFullYear()
  ).toUpperCase();
};
export function cap(string: string) {
  if (string) return string.charAt(0).toUpperCase() + string.slice(1);
  return string;
}
export const getAvailabilityStyle = (isUp: any) => {
  const nullVal = {
    color: 'var(--csinactive)',
    text: '',
    Icon: RxDividerHorizontal,
    props: {
      size: 22,
      color: 'var(--csinactive)',
    },
  };
  if (isUp === null) return nullVal;
  isUp = !!isUp;
  switch (isUp) {
    case true:
      return {
        color: 'var(--csswitch)',
        text: 'UP',
        Icon: BsCheckCircleFill,
        props: {},
      };
    case false:
      return {
        color: 'var(--csred)',
        text: 'DOWN',
        Icon: BsXCircleFill,
        props: {},
      };
    default:
      return nullVal;
  }
};

export const changeColorMode = (isDark: boolean) => {
  if (!isDark) {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('isDark', '0');
  } else if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('isDark', '1');
  }
};

export const sortArraysDescending = (numbers, strings) => {
  const arr = numbers.map((val, index) => ({ val, index }));
  arr.sort((a, b) => b.val - a.val);
  const sortedStrings = arr.map(({ index }) => strings[index]);
  const sortedNumbers = arr.map(({ index }) => numbers[index]);
  return [sortedNumbers, sortedStrings];
};

export const getIcon = (icon: string): [IconType, string?] => {
  switch (icon) {
    case 'time':
      return [RiHistoryFill];
    case 'lastUpdated':
      return [RiRefreshLine];
    default:
      return [MdReportGmailerrorred, 'var(--csorange)'];
  }
};

//@ts-ignore
String.prototype.indexOfEnd = function (string) {
  var io = this.indexOf(string);
  return io === -1 ? -1 : io + string.length;
};

export const parseXML = (xml: string) => {
  const values = ['title', 'link', 'description', 'pubDate', 'dc:creator'];
  let split = xml.split('<item>');
  let items = split.slice(1, split.length);

  let news = items.map((i) =>
    Object.assign(
      {},
      ...values.map((v) => ({
        //@ts-ignore
        [v]: i.slice(i.indexOfEnd(`<${v}>`), i.indexOf(`</${v}>`)),
      }))
    )
  );
  return news;
};

export const getLatestNews = (news: any[], count: number) => {
  let latest5 = news.slice(0, count);

  let latestNews = localStorage.getItem('latestNews');
  let latestNewsArr = latestNews ? JSON.parse(latestNews) : [];
  let latestNewsArrCopy = [...latestNewsArr];

  return latest5.map((n) => {
    let found = latestNewsArrCopy.find((ln) => ln.link === n.link);
    if (!found) return { ...n, new: true };
    return n;
  });
};
