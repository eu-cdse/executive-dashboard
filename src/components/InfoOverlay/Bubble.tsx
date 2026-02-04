import './overlay.scss';
import { useDataStore } from '@/store';
import Spinner from '../Spinner/Spinner';
import { motion } from 'framer-motion';
import useWindowSize from '@/hooks/useWindowSize';
import { formatValue } from '@/functions';
import { memo } from 'react';
import { computedStyle } from '@/common/getChartStyles';
import { useConfiguration } from '@/store/ConfigurationsProvider';

export interface IBubble {
  icon: React.ReactNode;
  size?: number;
  text: string;
  minText: string;
  formatedValue: string;
  i: number;
  isAvailability?: boolean;
  onlyText?: boolean;
}

export const Bubble = memo(
  ({
    icon,
    text,
    minText,
    formatedValue,
    i,
    isAvailability,
    onlyText,
    size = 310,
  }: IBubble) => {
    const { width } = useWindowSize();
    let smaller =
      width < 1600 && width > 1400
        ? 30
        : width <= 1400 && width >= 1100
          ? 70
          : width < 1100
            ? 120
            : 0;
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          transition: {
            duration: 1.5,
            type: 'spring',
            stiffness: 50,
            delay: i * 0.1,
          },
        }}
        exit={{ scale: 0, transition: { duration: 0.8 } }}
        key={text}
        className={`img-overlay img-overlay-${i} bg-sacc flex flex-col z-20 justify-center items-center gap-x-2 ${onlyText ? 'bg-smain2 box-shadow' : ''}`}
        style={{
          width: size - smaller,
          height: size - smaller,
          //justifyContent: isAvailability ? 'flex-start' : 'flex-start',
        }}
      >
        <div>{icon}</div>

        <div className="flex flex-col items-center ">
          {onlyText !== true ? (
            <>
              <div className="font-semibold maintext text-smain2 w-full px-1 text-center">
                {text}
              </div>
              <div
                key={minText}
                className="text-smain2 text-center mintext text-[0.9vw]"
              >
                {minText}
              </div>

              <div
                className="text-smain2 font-medium valtext text-5xl mt-2"
                style={{
                  color: isAvailability
                    ? computedStyle('--cssec')
                    : computedStyle('--csmain2'),
                }}
              >
                {formatedValue}
              </div>
            </>
          ) : (
            <div className="text-sacc onlytext italic w-full text-center px-[2rem]">
              <span className="text-2xl font-semibold onlyquotes text-ssec">
                “
              </span>
              {text}
              <span className="text-2xl font-semibold onlyquotes text-ssec">
                ”
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

const Bubbles = ({ data }) => {
  const { metricsGroups } = useConfiguration();
  const p = useDataStore((state) => state.data);
  if (!p)
    return (
      <div
        className={`img-overlay absolute top-0 left-0 w-full h-full flex flex-row items-center gap-x-2`}
      >
        <Spinner />
      </div>
    );

  let values = data.map(
    ({
      metrics,
      isAvailability,
      availbilityKey,
      text,
      minText,
      icon,
      size,
      specificMetricName,
      onlyText,
    }) => {
      let unit = null;
      let value = metrics.map((metric) => {
        let m = metricsGroups
          .map(({ json }) => {
            let j = json.filter((j) => {
              if (Array.isArray(j.conditions)) {
                return j.conditions.includes(metric);
              }
              return Object.values(j.conditions)?.flat().includes(metric);
            });
            if (j) return j;
            else return null;
          })
          .flat()
          .filter((a) => a !== null)
          .filter((a) =>
            specificMetricName ? a.id === specificMetricName : true
          )[0];

        if (isAvailability) {
          m.codelist_reduce = [availbilityKey];
          let availability = p.listData(m, true);
          if (availability?.values?.length > 0) return availability.values[0];
          return null;
        }
        let val;
        if (m) {
          unit = m.props.unit;
          p.setTimeframe('30d');
          let mf = p.counterData(m, true);
          if (!mf.value) val = null;
          else val = mf.value;
        } else val = null;
        return val;
      });

      let formatedValue;
      if (isAvailability) {
        value[0].availability30d
          ? (formatedValue = formatValue(value[0].availability30d, '%') || '-')
          : (formatedValue = '-');
      } else {
        let newValue = value
          .filter((a) => a !== null && a !== undefined)
          .reduce((a, b) => a + b, null);
        formatedValue = formatValue(newValue, unit) || '-';
      }
      return {
        formatedValue,
        unit,
        isAvailability,
        text,
        minText,
        icon,
        size,
        onlyText,
      };
    }
  );
  return values.map((d, i) => (
    <Bubble key={'image-overlay-' + i + d.text} {...d} i={i} />
  ));
};

export default Bubbles;
