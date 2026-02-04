import { computedStyle } from '@/common/getChartStyles';
import { ShareIcon } from '@/containers/Navigation/icons';
import { IWidgetConfiguration } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface IWidgetLink {
  setTooltip: (state: { id: string | null; show: boolean }) => void;
  setSelected: (state: boolean) => void;
  configuration: {
    activePeriod: string;
    widgetConfiguration: IWidgetConfiguration;
    id: string;
  };
}

const WidgetLink: React.FC<IWidgetLink> = ({
  setTooltip,
  setSelected,
  configuration,
}) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [link, setLink] = useState('');
  const { pathname } = useLocation();
  const linkRef = useRef();

  const onCopy = (e) => {
    e.stopPropagation();
    setCopied(true);
    navigator.clipboard.writeText(link);

    setTimeout(() => {
      setTooltip({
        id: null,
        show: false,
      });
      setSelected(false);
    }, 800);
  };

  // Generate configuration link
  useEffect(() => {
    let stringify = JSON.stringify(configuration);
    let encode = btoa(stringify);
    setLink(
      window.location.protocol +
        '//' +
        window.location.host +
        (window.location.pathname || '/') +
        '#' +
        pathname +
        '?link=' +
        encode
    );

    return () => {
      setCopied(false);
    };
  }, []);

  useEffect(() => {
    if (
      linkRef?.current &&
      !['usersMap', 'data_access_download_map'].includes(configuration.id)
    ) {
      (linkRef.current as HTMLDivElement).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [linkRef]);
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      ref={linkRef}
      className="absolute top-[-52px] w-[280px] pb-2"
      style={{ left: 'calc(50% - 140px)', zIndex: 9999 }}
    >
      <div className="p-1 border-[1px] gap-x-1 border-ssec flex bg-white rounded-md items-center">
        <ShareIcon width={30} height={30} color={computedStyle('--cssec')} />
        <motion.div
          initial={{ pointerEvents: 'none' }}
          animate={{ pointerEvents: 'all', transition: { delay: 0.2 } }}
          className="relative p-2 rounded-lg"
          style={{
            background: !copied ? computedStyle('--csdgrey') : 'white',
            height: 36,
          }}
          onClick={onCopy}
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
        >
          <div
            style={{
              filter: copied ? 'blur(5px)' : 'none',
              color: copied ? 'white' : 'black',
            }}
            className="overflow-x-clip max-w-[230px] whitespace-pre text-clip"
          >
            {link}
          </div>
          <AnimatePresence>
            {!copied && hovered && (
              <motion.div
                key="clicktocopytext"
                initial={{
                  height: 0,
                  scale: 0,
                  fontSize: '0em',
                }}
                animate={{
                  height: 36,
                  scale: 1,
                  fontSize: '1em',
                }}
                exit={{
                  opacity: 0,
                }}
                className="absolute cursor-pointer text-center flex items-center justify-center bottom-[0px] rounded-lg right-0 left-0 bg-ssec font-bold text-white"
              >
                CLICK TO COPY LINK
              </motion.div>
            )}
            {copied && (
              <motion.div
                key="overlaycopy"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: '100%',
                  transition: {
                    duration: 0.2,
                  },
                }}
                className="absolute flex items-center justify-center rounded-lg top-0 left-0 h-full text-lg text-medium"
                style={{
                  background: computedStyle('--cssec') + '99',
                }}
              >
                <motion.div
                  initial={{
                    fontSize: '0em',
                  }}
                  animate={{
                    fontSize: '1em',
                    transition: {
                      delay: 0.2,
                    },
                  }}
                  className="text-white"
                >
                  Copied to clipboard!
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default WidgetLink;
