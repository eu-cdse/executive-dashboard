import { motion } from 'framer-motion';
import { useDataStore } from '@/store';
import { UserIcon } from './icons';
import { sortArraysDescending } from '@/functions';
import { computedStyle } from '@/common/getChartStyles';
import useWindowSize from '@/hooks/useWindowSize';
import Spinner from '../Spinner/Spinner';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { USERS_ENGAGEMENT } from '@/common/constants';

export const RegisteredUsersMap = () => {
  const { width, height } = useWindowSize();
  const p = useDataStore((state) => state.data);
  const { getGroup } = useConfiguration();
  const userEngagement = getGroup(USERS_ENGAGEMENT);
  if (!p)
    return (
      <div
        className={`img-overlay absolute top-0 left-0 w-full h-full flex flex-row items-center gap-x-2`}
      >
        <Spinner />
      </div>
    );

  const items = [
    {
      name: 'Europe',
      key: 'europe',
      color: '#0098DB',
      top: -5,
      left: 33,
    },
    {
      name: 'Asia',
      key: 'asia',
      color: '#E37222',
      top: 15,
      left: 58,
    },
    {
      name: 'North America',
      key: 'north_america',
      color: '#008542',
      top: 10,
      left: 3,
    },
    {
      name: 'South America and Antarctica',
      key: 'south_america',
      color: '#D00F3A',
      top: 44,
      left: -8,
    },
    {
      name: 'Africa',
      key: 'africa',
      color: '#FDC82E',
      top: 62,
      left: 17,
    },
    {
      name: 'Oceania',
      key: 'oceania',
      color: '#00338D',
      top: 53,
      left: 48,
    },
  ];

  let data = userEngagement
    .filter((a) => a.props.detailedGroup)
    .map((f) => p.graphsData(f))
    .map((i) => {
      let [numbers, strings] = sortArraysDescending(
        i.graphs.series,
        i.graphs.labels
      );
      i.graphs.series = numbers;
      i.graphs.labels = strings;
      return i;
    })
    .filter((d) => d.graphs?.labels?.length);
  let filteredData = data.filter((d) => d.group.includes('per_continent'));

  let itemsData = items.map((i) => {
    let value =
      filteredData[1].graphs.series[
        filteredData[1].graphs.labels.indexOf(i.key)
      ];
    return {
      ...i,
      value,
    };
  });

  const total_number = p.counterData(
    userEngagement.find((d) => d.id === 'attract15')
  );

  let verySmall = height < 880;
  let scale = width < 1500 || height < 1030 ? (verySmall ? 0.6 : 0.8) : 1;
  return (
    <motion.div
      exit={{ opacity: 0 }}
      className="w-full relative h-full p-10 relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale,
          transition: { duration: 0.4, type: 'spring', stiffness: 100 },
        }}
        className="absolute w-[250px] h-[250px] flex flex-col text-center items-center justify-center bss rounded-full"
        style={{
          top: `${verySmall ? 25 : 35}%`,
          left: '30%',
        }}
      >
        <UserIcon width={60} color={computedStyle('--csmain2')} />
        <div className="text-smain2 text-2xl text-center">
          {total_number.label}
        </div>
        <div className="text-smain2 text-3xl font-bold">
          {total_number.value}
        </div>
      </motion.div>
      <div className="flex flex-wrap items-center justify-center gap-5">
        {itemsData.map((d, i) => (
          <RegisteredUsersWidget data={d} i={i} key={'ruw' + i} />
        ))}
      </div>
    </motion.div>
  );
};

const RegisteredUsersWidget = ({
  data,
  i,
}: {
  data: {
    name: string;
    value: number;
    key: string;
    color: string;
    top: number;
    left: number;
  };
  i: number;
}) => {
  const { width, height } = useWindowSize();

  let verySmall = height < 880;
  let scale = width < 1500 || height < 1030 ? (verySmall ? 0.6 : 0.8) : 1;
  return (
    <motion.div
      style={{
        top: `${data.top - (verySmall ? 10 : 0)}%`,
        left: `${data.left}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale,
        transition: {
          duration: 0.7,
          delay: 0.4 + i * 0.3,
          type: 'spring',
          stiffness: 80,
        },
      }}
      className="flex absolute flex-col gap-y-2 items-center justify-center p-5 w-[293px] h-[293px] bss rounded-full"
    >
      <div
        style={{
          color: data.color,
          textAlign: 'center',
          marginTop: '1rem',
        }}
        className="font-medium text-3xl"
      >
        {data.name}
      </div>
      <img src={data.key + '.png'} width={240} alt="" />
      <div className="flex gap-x-2">
        <UserIcon width={20} color={data.color} />

        <div
          style={{
            color: data.color,
          }}
          className=" text-4xl font-medium"
        >
          {data.value}
        </div>
      </div>
    </motion.div>
  );
};
