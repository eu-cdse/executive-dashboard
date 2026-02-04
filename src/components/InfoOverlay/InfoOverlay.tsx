import './overlay.scss';
import { useDataStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import useWindowSize from '@/hooks/useWindowSize';
import { Copernicus, ESA, Poten } from '../../containers/Navigation/icons';
import { OverlayIcons } from './icons';
import { useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import arrowup from '@/animations/lottie/arrowup.json';
import { shallow } from 'zustand/shallow';
import { useEffect, useRef, useState } from 'react';
import Bubbles from './Bubble';
import InfoNavigation from './InfoNavigation';
import SlidingBubbles from './SlidingBubbles/SlidingBubbles';
import * as html2Image from 'html-to-image';
import Spinner from '../Spinner/Spinner';
import { ScreenshotIcon } from '../Chart/icons';
import { RegisteredUsersMap } from './RegisteredUsersMap';
import { MissionSnapShotHighlights } from './MissionSnapShotHighlights';
import { useTooltip } from '@/hooks/useTooltip';

const Slide1 = [
  {
    text: 'Total volume of published products',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="totalVolume" />,
    metrics: ['smmp1__cf__iad_volume'],
  },
  {
    text: 'Downloaded volume',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="downloadedVolume" />,
    metrics: ['smmp6__grand_total_volume_dl'],
  },
  {
    text: 'Total number of published products',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="noOfProducts" />,
    metrics: [
      'smmp1__cf__total_num_prod_published',
      'pi01__cf__num_prod_published',
    ],
  },
  {
    text: 'Total number of registered users',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="user" />,
    metrics: ['smmp12__cf__total_num_registered_users'],
  },
];

const Slide4 = [
  {
    text: 'Total number of CCM missions',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="totalVolume" />,
    metrics: ['smmp7__sin__num_ccm_ds'],
  },
  {
    text: 'Total volume of CCM products',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="uploadVolume" />,
    metrics: ['smmp1__cf__iad_volume'],
    specificMetricName: 'dp_iad_volume_ccm',
  },
  {
    text: 'Total number of CCM products',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="noOfProducts" />,
    metrics: ['smmp1__cf__total_num_prod_published'],
    specificMetricName: 'dp_total_num_prod_published_ccm',
  },
  {
    text: 'Total number of CCM users',
    minText: 'since the start of operations',
    icon: <OverlayIcons icon="user" />,
    metrics: ['smmp12__cf__total_num_active_ccm'],
  },
  {
    text: 'A refreshed, cloud-free VHR coverage of Europe every three years, continuously updated and enhanced DEM datasets, and an expanding array of optical and radar collections improving our understanding of the world',
    size: 350,
    metrics: [],
    onlyText: true,
  },
];

const slidingBubblesData = {};

const combinedSlides = [
  {
    id: 0,
    data: slidingBubblesData,
    Component: SlidingBubbles,
    sshot: 'SentinelData',
    delay: 2.2,
  },
  { id: 1, data: Slide1, Component: Bubbles, sshot: 'ServiceInsight' },
  {
    id: 2,
    data: {},
    Component: RegisteredUsersMap,
    sshot: 'RegisteredUsers',
    delay: 2.8,
  },
  {
    id: 3,
    data: {},
    Component: MissionSnapShotHighlights,
    sshot: 'MissionSnapshot',
  },
  { id: 4, data: Slide4, Component: Bubbles, sshot: 'CCMStatistics' },
];

let indexSelected = false;

const InfoOverlay = () => {
  const refHighlight = useRef(null);
  const [activeSlide, setActiveSlide] = useState(combinedSlides[0]);
  const [setShowOverview, refreshed] = useDataStore(
    (state) => [state.setShowOverview, state.refreshed],
    shallow
  );
  const { width, height } = useWindowSize();
  let location = useLocation().pathname.split('/').pop();

  const filter = (node: HTMLElement) => {
    const exclusionClasses = ['remove-ss'];
    return !exclusionClasses.some((classname) =>
      node.classList?.contains(classname)
    );
  };

  const takeScreenshot = () => {
    if (!refHighlight.current || !activeSlide.sshot) return;
    html2Image
      .toPng(refHighlight.current, { filter })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = activeSlide.sshot + '.png';
        link.click();
      })
      .catch((error) => {
        console.error('There was an issue capturing the screenshot:', error);
      });
  };

  const setIndex = (i) => {
    if (i >= combinedSlides.length) i = 0;
    setActiveSlide(combinedSlides[i]);
  };

  const setActiveSlideClick = (i) => {
    indexSelected = true;
    setActiveSlide(i);
  };

  const sliderInterval = useRef(null);
  const clearSliderInterval = () => {
    clearInterval(sliderInterval.current);
  };

  useEffect(() => {
    if (indexSelected) return;
    sliderInterval.current = setInterval(() => {
      setIndex(activeSlide.id + 1);
    }, 9000);
    return () => {
      clearSliderInterval();
    };
  }, [activeSlide.id]);

  location = location === 'service-insight' ? null : location;
  if (width < 1170 || height < 730 || location) return null;

  let { Component, data, id } = activeSlide;
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  let cols = !isDark ? ['#ffffff20', '33333399'] : ['#11111199', '#14141499'];
  return (
    <motion.div
      initial={{ backdropFilter: 'blur(0px)', backgroundColor: cols[0] }}
      animate={{
        backdropFilter: 'blur(4px)',
        backgroundColor: cols[1],
        transition: { duration: 0.3, delay: 0.3 },
      }}
      className="fixed top-0 left-0 w-full h-screen info-overlay"
      style={{
        zIndex: 9995,
      }}
      exit={{
        backdropFilter: 'blur(0px)',
        backgroundColor: cols[0],
        transition: { duration: 0.3, delay: 0.5 },
      }}
    >
      {activeSlide?.sshot && (
        <ScreenShotButton
          key={activeSlide.sshot}
          takeScreenshot={takeScreenshot}
          delay={activeSlide.delay}
        />
      )}
      <motion.div
        ref={refHighlight}
        initial={{ y: -2000 }}
        animate={{
          y: 1,
          transition: {
            duration: 0.5,
            delay: 0.1,
            type: 'spring',
            stiffness: 20,
          },
        }}
        exit={{
          y: -2000,
          transition: {
            duration: 1,
          },
        }}
        className="fixed relative flex top-[-1px] h-[80%] p-5 w-full bg-smain2  z-10"
        style={{
          background: 'var(--csmain2) url("highlightsimg.png")',
          backgroundSize: 'contain ',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-sacc text-5xl font-bold max-w-[25%] leading-[52px] z-10 ">
          Copernicus Data Space Ecosystem Highlights
        </div>

        <div className="z-10 w-full h-full">
          {/** RENDER CUSTOM COMPONENT */}
          <AnimatePresence mode="wait">
            {Component && <Component key={'image-overlay-' + id} data={data} />}
          </AnimatePresence>
          <span className="remove-ss">
            <InfoNavigation
              combinedSlides={combinedSlides}
              clearSliderInterval={clearSliderInterval}
              setActiveSlide={setActiveSlideClick}
              activeSlide={activeSlide}
            />
          </span>
        </div>
        <div className="absolute w-full flex justify-between items-center bottom-0 left-0 p-5 z-10">
          <div className="flex gap-x-3 items-center">
            <div className="bg-transparent border border-white h-[30px]">
              <Poten width={46} height={28} />
            </div>
            <Copernicus />
            <ESA />
          </div>
          <div className="flex">
            <div className="ml-2">
              <div className="text-white text-xxs font-bold">
                Statistics updated at (local time):
              </div>
              <div className="text-white text-xs font-bold capitalize text-center">
                {refreshed || <Spinner size={10} noCenter />}
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-[0%] left-[50%]  z-20 remove-ss"
          onClick={() => setShowOverview({ show: false, showAgain: true })}
        >
          <Lottie
            animationData={arrowup}
            style={{
              width: '70px',
              height: '70px',
              cursor: 'pointer',
            }}
            autoplay={true}
            loop={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </div>
      </motion.div>
      <div
        className="h-full w-full"
        onClick={() => setShowOverview({ show: false, showAgain: true })}
      />
    </motion.div>
  );
};
export default InfoOverlay;

const ScreenShotButton = ({
  takeScreenshot,
  delay,
}: {
  takeScreenshot: () => void;
  delay: number;
}) => {
  const [tooltip] = useTooltip();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1, delay: delay || 2 } }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="absolute top-3 cursor-pointer right-2 z-20"
      onClick={takeScreenshot}
      {...tooltip(
        <div className="text-sm font-medium">Save as image</div>,
        0.5
      )}
    >
      <ScreenshotIcon width={30} height={30} color="white" />
    </motion.div>
  );
};
