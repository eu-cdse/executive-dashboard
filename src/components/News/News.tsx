import { useAniStore, useNewsStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { FiArrowUpRight } from 'react-icons/fi';
import useWindowSize from '@/hooks/useWindowSize';
import { motion } from 'framer-motion';
import { computedStyle } from '@/common/getChartStyles';
import './news.scss';
import { responsiveSizes } from '@/common/constants';
import NewsList from './NewsList';
import { useRef } from 'react';
import useClickOutside from '@/hooks/useClickOutside';

const NewsSidebar = ({
  setIsOpen,
}: {
  setIsOpen: (state: boolean) => void;
}) => {
  const containerRef = useRef(null);
  const [news, error, newsCount] = useNewsStore(
    (state) => [state.news, state.error, state.newsCount],
    shallow
  );
  useClickOutside(containerRef, () => setIsOpen(false));

  const { width } = useWindowSize();
  const openAni = useAniStore((state) => state.openAni);

  let newsPadding = width < responsiveSizes.tabel ? 40 : openAni ? 340 : 110;
  let newsLeft = width < responsiveSizes.tabel ? 20 : 'auto';

  return (
    <motion.div
      ref={containerRef}
      tabIndex={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.5 } }}
      className=" fixed bottom-20 bss flex flex-col px-4 py-4 w-full max-w-[1200px] rounded-lg outline-none"
      style={{
        zIndex: 9992,
        width: `calc(100% - ${newsPadding}px)`,
        right: 20,
        left: newsLeft,
        borderRadius: 25,
        background: computedStyle('--csmain2'),
      }}
    >
      <div className="flex justify-between items-center mb-5">
        <div className=" w-max">
          <motion.div
            initial={{ opacity: 0, fontSize: '0em' }}
            animate={{ opacity: 1, fontSize: '1.4em' }}
            exit={{ opacity: 0, transition: { delay: 0.1, duration: 0.5 } }}
            className="ml-[2%] text-3xl text-white font-medium pr-2"
          >
            News
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%', transition: { delay: 0.3 } }}
            exit={{ width: 0, transition: { delay: 0.1, duration: 0.5 } }}
            className="w-full h-[3px] bg-ssec rounded-full"
          />
        </div>
        <a
          rel="noreferrer"
          href="https://dataspace.copernicus.eu/news"
          target="_blank"
          className="self-center"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                delay: 1,
                duration: 0.5,
                type: 'spring',
                stiffness: 60,
              },
            }}
            exit={{ opacity: 0, scale: 0, transition: { delay: 0.1 } }}
            whileHover={{ scale: [1, 1.1, 1], transition: { duration: 0.7 } }}
            whileTap={{ scale: 0.9 }}
            className="bg-ssec flex items-center px-6 w-max py-3 rounded-3xl"
          >
            <span className="font-medium text-xs">SHOW ALL NEWS</span>
            <FiArrowUpRight className="ml-1" size={14} />{' '}
          </motion.button>
        </a>
      </div>
      {news.length && !error ? (
        <div className="flex justify-center gap-x-5">
          <NewsList news={news} newsCount={newsCount} />
        </div>
      ) : (
        <div className="text-white pb-10">Error fetching news...</div>
      )}
    </motion.div>
  );
};

export default NewsSidebar;
