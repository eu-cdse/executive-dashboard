import { useDataStore, useFixedTooltipStore } from '@/store';
import { motion } from 'framer-motion';
import {
  DATA_ACCESSED,
  DATA_PUBLISHED,
  SENTINEL_HUB,
  STREAMLINED_DATA,
  USERS_ENGAGEMENT,
} from '@/common/constants';
import { Counter } from '@/components/Counter';
import Chart from '@/components/Chart/Chart';
import { shallow } from 'zustand/shallow';
import SettingsTooltip from '@/components/Header/SettingsTooltip';
import { useRef } from 'react';
import { computedStyle } from '@/common/getChartStyles';
import { PanelWrapper } from '../common';

import { deepClone } from '@/components/InteractiveMap/functions';
import { useConfiguration } from '@/store/ConfigurationsProvider';

export const getMetrics = (
  userEngagement,
  dataPublished,
  streamlinedData,
  dataAccessed
) => [
  [
    {
      data: userEngagement.find(
        ({ id }) => id === 'ue_total_num_registered_users'
      ),
      tag: USERS_ENGAGEMENT,
    },
    {
      data: userEngagement.find(({ id }) => id === 'ue_num_active_users_daily'),
      tag: USERS_ENGAGEMENT,
    },
    {
      data: userEngagement.find(({ id }) => id === 'ue_num_visitors_cdse_br'),
      tag: USERS_ENGAGEMENT,
    },
    {
      data: userEngagement.find(
        ({ id }) => id === 'ue_num_sh_requests_browser'
      ),
      tag: USERS_ENGAGEMENT,
    },
    {
      data: dataPublished.find(({ id }) => id === 'dp_total_num_data_traces'),
      tag: DATA_PUBLISHED,
    },
  ],
  [
    {
      data: streamlinedData.find(({ id }) => id === 'shoe_data_requests'),
      tag: SENTINEL_HUB,
      type: 'bar',
    },
    {
      data: dataPublished.find(({ id }) => id === 'dp_total_num_data_traces'),
      tag: DATA_PUBLISHED,
      type: 'timeline',
    },
    {
      data: {
        ...deepClone(
          dataAccessed.find(({ id }) => id === 'da_download_volume_total')
        ),
        id: 'da_download_volume-sentinels',
        label: 'Total volume of downloaded products - Sentinels',
      },
      tag: DATA_ACCESSED,
      type: 'pie',
    },
    /*     {
      data: {
        ...deepClone(
          dataAccessed.find(({ id }) => id === 'da_download_volume_total')
        ),
        id: 'da_download_volume-complementary',
        label: 'Total volume of downloaded products - Complementary',
        codelist_reverse_reduce: true,
      },
      tag: DATA_ACCESSED,
      type: 'pie',
    }, */
    {
      data: {
        ...deepClone(
          dataPublished.find(({ id }) => id === 'dp_total_num_prod_published')
        ),
        id: 'dp_total_num_prod_published-sentinels',
        label: 'Total number of published products - Sentinels',
        codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
      },
      tag: DATA_PUBLISHED,
      type: 'pie',
    },
    /*   {
      data: {
        ...deepClone(
          dataPublished.find(({ id }) => id === 'dp_total_num_prod_published')
        ),
        id: 'dp_total_num_prod_published-complementary',
        label: 'Total number of published products - Complementary',
        codelist_reverse_reduce: true,
      },
      tag: DATA_PUBLISHED,
      type: 'pie',
    }, */
    {
      data: {
        ...deepClone(dataPublished.find(({ id }) => id === 'dp_iad_volume')),
        id: 'dp_iad_volume-sentinels',
        label: 'Total volume of published products - Sentinels',
        codelist_reduce: ['S1', 'S2', 'S3', 'S5P'],
      },
      tag: DATA_PUBLISHED,
      type: 'pie',
    },
    /*   {
      data: {
        ...deepClone(dataPublished.find(({ id }) => id === 'dp_iad_volume')),
        id: 'dp_iad_volume-complementary',
        label: 'Total volume of published products - Complementary',
        codelist_reverse_reduce: true,
      },
      tag: DATA_PUBLISHED,
      type: 'pie',
    }, */
  ],
];

const ServiceInsight = () => {
  const tooltipRef = useRef(null);
  const setShowOverview = useDataStore((state) => state.setShowOverview);
  const [setTooltip, setData, active] = useFixedTooltipStore(
    (state) => [state.setToolTip, state.setData, state.active],
    shallow
  );
  const { getGroups } = useConfiguration();

  const metrics = getMetrics.apply(
    null,
    getGroups([
      USERS_ENGAGEMENT,
      DATA_PUBLISHED,
      STREAMLINED_DATA,
      DATA_ACCESSED,
    ])
  );

  const settingClick = () => {
    setTooltip(!active);
    setData({ data: <SettingsTooltip />, elRef: tooltipRef });
  };

  return (
    <>
      <PanelWrapper>
        {/** FIRST ROW */}
        {metrics[0].map(({ data, tag }, i) => (
          <div className="grid-item relative" key={'a' + i}>
            <Counter metric={data} tag={tag} />
          </div>
        ))}
        {metrics[1].map(({ data, tag, type }, i) => (
          <div className="grid-item" key={'b' + i}>
            <Chart metric={data} type={type} reduceList tag={tag} />
          </div>
        ))}
      </PanelWrapper>
      <motion.div
        style={{
          background: computedStyle('--csmain2'),
          border: '2px solid var(--cssec)',
          zIndex: 9991,
        }}
        className="fixed bottom-4 right-20 w-[110px] h-12 rounded-full bss flex flex-row items-center justify-center gap-x-2 cursor-pointer"
      >
        <motion.svg
          onClick={() => setShowOverview({ show: true, showAgain: false })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M21.6 16.4H5.9c-1.2 0-2.2-1-2.2-2.2V4.7c0-1.2 1-2.2 2.2-2.2h15.7c1.2 0 2.2 1 2.2 2.2v9.5c.2 1.2-.8 2.2-2.2 2.2zM5.9 3.8c-.4 0-.8.3-.8.9v9.5c0 .3.3.8.8.8h15.7c.4 0 .9-.3.9-.9V4.7c0-.4-.3-.9-.9-.9H5.9z"
          />
          <path
            fill="currentColor"
            d="M15.5 22.4H2.4c-1.2 0-2.2-1-2.2-2.2v-7.7c0-1.2 1-2.2 2.2-2.2h.1v1.4h-.1c-.4 0-.9.3-.9.9v7.7c0 .4.3.9.9.9h13.2c.4 0 .9-.3.9-.9v-2.8h1.4v2.8c-.1 1-1.1 2.1-2.4 2.1z"
          />
        </motion.svg>
        <div className="w-[2px] h-10 bg-white/50 rounded-full" />
        <motion.div
          whileHover={{
            transform: 'rotate(180deg)',
            transition: { duration: 0.5 },
          }}
          ref={tooltipRef}
          className="flex items-center justify-center cursor-pointer"
          onClick={settingClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="m20.35 8.923l-.366-.204a2 2 0 0 1-.784-.724c-.017-.027-.033-.056-.065-.112a2.002 2.002 0 0 1-.3-1.157l.006-.425c.012-.68.018-1.022-.078-1.328a1.998 1.998 0 0 0-.417-.736c-.214-.24-.511-.412-1.106-.754l-.494-.285c-.592-.341-.889-.512-1.204-.577a1.999 1.999 0 0 0-.843.007c-.313.07-.606.246-1.191.596l-.003.002l-.354.211c-.056.034-.085.05-.113.066c-.278.155-.588.24-.907.25c-.032.002-.065.002-.13.002l-.13-.001a1.997 1.997 0 0 1-.91-.252c-.028-.015-.055-.032-.111-.066l-.357-.214c-.589-.354-.884-.53-1.199-.601a1.998 1.998 0 0 0-.846-.006c-.316.066-.612.238-1.205.582l-.003.001l-.488.283l-.005.004c-.588.34-.883.512-1.095.751a2 2 0 0 0-.415.734c-.095.307-.09.649-.078 1.333l.007.424c0 .065.003.097.002.128a2.002 2.002 0 0 1-.301 1.027c-.033.056-.048.084-.065.11a2 2 0 0 1-.675.664l-.112.063l-.361.2c-.602.333-.903.5-1.121.738a2 2 0 0 0-.43.73c-.1.307-.1.65-.099 1.338l.002.563c.001.683.003 1.024.104 1.329a2 2 0 0 0 .427.726c.218.236.516.402 1.113.734l.358.199c.061.034.092.05.121.068a2 2 0 0 1 .74.781l.067.12a2 2 0 0 1 .23 1.038l-.007.407c-.012.686-.017 1.03.079 1.337c.085.272.227.523.417.736c.214.24.512.411 1.106.754l.494.285c.593.341.889.512 1.204.577a2 2 0 0 0 .843-.007c.314-.07.607-.246 1.194-.598l.354-.212a1.997 1.997 0 0 1 1.02-.317h.26c.318.01.63.097.91.252l.092.055l.376.226c.59.354.884.53 1.199.6a2 2 0 0 0 .846.008c.315-.066.613-.239 1.206-.583l.495-.287c.588-.342.883-.513 1.095-.752c.19-.213.33-.463.415-.734c.095-.305.09-.644.078-1.318l-.008-.44a2 2 0 0 1 .3-1.155l.065-.11a2 2 0 0 1 .675-.664l.11-.061l.002-.001l.361-.2c.602-.334.903-.5 1.122-.738c.194-.21.34-.46.429-.73c.1-.305.1-.647.098-1.327l-.002-.574c-.001-.683-.002-1.025-.103-1.33a2.002 2.002 0 0 0-.428-.725c-.217-.236-.515-.402-1.111-.733l-.002-.001Z" />
              <path d="M8 12a4 4 0 1 0 8 0a4 4 0 0 0-8 0Z" />
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ServiceInsight;
