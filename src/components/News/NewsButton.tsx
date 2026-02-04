import { computedStyle } from '@/common/getChartStyles';
import { NewsIcon } from '../Chart/icons';
import { useEffect, useState } from 'react';
import News from './News';
import { AnimatePresence, motion } from 'framer-motion';
import { useNewsStore } from '@/store';

const NewsButton = () => {
  const [skipRender, setSkipRender] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const [news, setViewedNews] = useNewsStore((state) => [
    state.news,
    state.setViewedNews,
  ]);

  let newsCount = news.reduce((acc, curr) => (curr.new ? acc + 1 : acc), 0);

  useEffect(() => {
    if (!skipRender && newsCount && !isOpened) {
      setViewedNews();
    }
  }, [isOpened]);
  return (
    <>
      <motion.div
        key={'newsopen' + isOpened}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (skipRender) {
            setSkipRender(false);
          }
          setIsOpened((prev) => !prev);
        }}
        className="fixed bottom-4 right-5 bg-smain2 p-[10px] rounded-full cursor-pointer"
        style={{
          background: computedStyle('--csmain2'),
          border: '2px solid var(--cssec)',
          zIndex: 9993,
        }}
      >
        <AnimatePresence>
          {(newsCount && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0, transition: { delay: 0.5 } }}
              className="absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full bg-ssec flex items-center justify-center"
              style={{
                fontSize: '0.7em',
              }}
            >
              {newsCount}
            </motion.div>
          )) ||
            null}
        </AnimatePresence>
        <motion.div
          whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
          whileTap={{ rotate: 20, scale: 0.9 }}
          className="w-full h-full"
        >
          <NewsIcon width={26} height={26} color="white" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpened && <News setIsOpen={setIsOpened} />}
      </AnimatePresence>
    </>
  );
};

export default NewsButton;
