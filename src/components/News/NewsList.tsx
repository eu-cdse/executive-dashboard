import { AnimatePresence, motion } from 'framer-motion';
import moment from 'moment';
import { ArrowIcon } from '../Chart/icons';
import { useLayoutEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import decode from 'decode-html';

const NewsList = ({ news, newsCount }) => {
  const last5News = news.slice(0, newsCount);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeItems, setActiveItems] = useState([]);
  const [noDelay, setNoDelay] = useState(false);
  const itemWidth = 340; // Width of each news item

  useLayoutEffect(() => {
    if (containerRef.current) {
      const newWidth = containerRef.current.offsetWidth;
      setContainerWidth(newWidth);

      const itemCount = Math.floor(newWidth / itemWidth) || 1;
      setActiveItems(last5News.slice(activeIndex, activeIndex + itemCount));
    }

    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        setContainerWidth(newWidth);

        const itemCount = Math.floor(newWidth / itemWidth) || 1;
        setActiveItems(last5News.slice(activeIndex, activeIndex + itemCount));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef, activeIndex]);

  const prevSlide = () => {
    setActiveIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prevIndex) => {
      const itemCount = Math.floor(containerWidth / itemWidth) || 1;
      const maxIndex = Math.max(0, last5News.length - itemCount);
      const newIndex = Math.min(maxIndex, prevIndex + 1);
      return newIndex;
    });
  };

  const getAndCleanHTML = (text) => {
    let html = decode(text);
    return DOMPurify.sanitize(html);
  };

  let showNext = newsCount - activeItems.length - activeIndex > 0;
  return (
    <div className="w-full flex flex-col">
      <motion.div
        className="flex justify-between items-center gap-x-1 w-full"
        layout
        ref={containerRef}
      >
        <motion.div
          whileTap={{
            scale: 0.9,
          }}
          style={{
            visibility: activeIndex > 0 ? 'visible' : 'hidden',
          }}
          className="duration-300 cursor-pointer h-full flex items-center justify-center hover:bg-ssec w-8 rounded-full"
          onClick={prevSlide}
        >
          <motion.span
            className="h-full flex items-center justify-center"
            whileHover={{
              translateX: [0, -3, 0],
            }}
          >
            <ArrowIcon
              width={24}
              height={24}
              color={'white'}
              rotation={'left'}
            />
          </motion.span>
        </motion.div>
        <span
          className="flex justify-center gap-x-5"
          style={{
            width: 'calc(100% - 100px)',
          }}
        >
          <AnimatePresence mode="popLayout">
            {activeItems.map((n, i, arr) => (
              <motion.div
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3, delay: 0 },
                }}
                onHoverStart={() => setNoDelay(true)}
                onHoverEnd={() => setNoDelay(false)}
                layoutId={'nsbr-sb-' + (arr.length - i - activeIndex)}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: !noDelay ? 0.2 + i * 0.2 - activeIndex * 0.2 : 0,
                    type: 'spring',
                    stiffness: 50,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  transition: { duration: 0.3 },
                }}
                key={'nsbr-sb-' + (arr.length - i - activeIndex)}
                className={`flex relative newsitem-${i} flex-col justify-between mb-3 p-3 w-[340px] h-[300px] rounded-lg border-2 border-ssec`}
                onClick={() => window.open(n.link, '_blank')}
              >
                <div>
                  <div className="text-gray-300 font-bold text-xs mb-2">
                    <span>{n['dc:creator']}</span>
                  </div>
                  <div
                    className={`text-white news-label newsitem-${i}-text font-bold text-xl`}
                  >
                    {n.title}
                  </div>
                  <div
                    className="text-[#ff1f1f1] mt-2 text-[16px] news-description"
                    dangerouslySetInnerHTML={{
                      __html:
                        n.description === n.title
                          ? ''
                          : getAndCleanHTML(n.description),
                    }}
                  />
                </div>
                <div className="text-gray-300 font-bold text-xs">
                  {moment(n.pubDate).format('ddd, DD MMMM YYYY')}
                </div>
                {n.new && (
                  <div className="absolute top-1 right-1 bg-ssec rounded-full">
                    <div className="text-white text-xxs font-bold px-2 py-1 rounded-full">
                      NEW
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </span>

        <motion.div
          whileTap={{
            scale: 0.9,
          }}
          className="duration-300 cursor-pointer h-full flex items-center justify-center hover:bg-ssec w-8 rounded-full"
          onClick={nextSlide}
          style={{
            visibility: showNext ? 'visible' : 'hidden',
          }}
        >
          <motion.span
            className="h-full flex items-center justify-center"
            whileHover={{
              translateX: [0, 3, 0],
            }}
          >
            <ArrowIcon
              width={24}
              height={24}
              color={'white'}
              rotation={'right'}
            />
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NewsList;
