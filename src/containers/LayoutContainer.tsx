import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import useWindowSize from '@/hooks/useWindowSize';
import { responsiveSizes, windowsSizes } from '@/common/constants';
import {
  useAniStore,
  useConfigurationStore,
  useDataStore,
  useFixedTooltipStore,
  usePopupStore,
} from '@/store';
import { Tooltip } from '@/components/Tooltip';
import Spinner from '@/components/Spinner/Spinner';
import FixedTooltip from '@/components/Tooltip/FixedTooltip';
import { memo, useEffect, useRef, useState } from 'react';
import { useComponentVisible } from '@/hooks/useComponentVisible';
import { shallow } from 'zustand/shallow';
import { computedStyle } from '@/common/getChartStyles';
import NewsButton from '@/components/News/NewsButton';
import Popup from '@/components/Chart/Popup';

const pageTransition = {
  type: 'tween',
  ease: 'linear',
  duration: 0.5,
};
const LayoutContainer = () => {
  // Refs
  const layoutRef = useRef(null);

  // Stores
  const [active, setToolTip] = useFixedTooltipStore(
    (state) => [state.active, state.setToolTip],
    shallow
  );
  const [showPopup] = usePopupStore((s) => [s.showPopup], shallow);
  const [theme, openAni] = useAniStore((s) => [s.theme, s.openAni], shallow);
  const { ref } = useComponentVisible(setToolTip);
  const [loading, setLayoutRef] = useDataStore(
    (state) => [state.loading, state.setLayoutRef],
    shallow
  );

  // Hooks
  const { pathname } = useLocation();
  let path = pathname.split('/').pop() || 'service-insight';
  const title =
    !path.includes('sentinel') || path.includes('sentinel-hub') ? (
      path.split('-').join(' ').toUpperCase()
    ) : (
      <div className="flex items-center">
        {path.split('-')[0].toUpperCase()}{' '}
        <div className="w-3 h-[3px] mx-1 bg-htext rounded-full"></div>
        {path.split('-')[1].toLocaleUpperCase()}
      </div>
    );
  const { width } = useWindowSize();
  const styles = generateClasses(width);

  useEffect(() => {
    if (layoutRef.current) setLayoutRef(layoutRef);
  }, [layoutRef.current?.pageXOffset]);

  let hideSideNav = width < responsiveSizes.tabel;
  let navbarwidth = hideSideNav ? 60 : openAni ? 300 : 120;
  let layoutWidth =
    width - navbarwidth < responsiveSizes.bigscreen
      ? width - navbarwidth
      : responsiveSizes.bigscreen;
  if (width < 500) {
    layoutWidth = width;
  }

  return (
    <>
      <div className={`${styles.main} relative`}>
        <div
          className={'flex flex-row w-full h-full noScroll'}
          ref={layoutRef}
          id="scrolldiv"
        >
          <motion.div
            className={styles.outlet + ' bg-bgcolor'}
            transition={pageTransition}
          >
            {(!loading && (
              <div className="flex flex-row justify-center w-full">
                <div style={{ width: layoutWidth }}>
                  <div className="relative px-4 pt-9 pb-3 flex justify-between">
                    <div className="text-3xl text-htext">{title}</div>
                    <AnimatePresence>
                      {pathname !== '/service-health' &&
                        //pathname !== '/service-insight/data-downloaded' &&
                        pathname !== '/descriptions' && (
                          <PeriodSelector theme={theme} />
                        )}
                    </AnimatePresence>
                  </div>
                  <Outlet />

                  <NewsButton />
                </div>
              </div>
            )) || <Spinner displayError />}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        <Tooltip />
        {(active && <FixedTooltip key="fxtltp" ref={ref} />) || null}
        {(showPopup && <Popup key="popup" />) || null}
      </AnimatePresence>
    </>
  );
};

const PeriodSelector: React.FC<{ theme: string }> = memo(() => {
  const { width } = useWindowSize();
  const [hovered, setHovered] = useState(0);

  const [activePeriod, setActivePeriod] = useConfigurationStore(
    (s) => [s.activePeriod, s.setActivePeriod],
    shallow
  );
  return (
    <motion.div
      key="ket"
      className="fixed flex items-center bss rounded-full"
      style={{
        zIndex: 9994,
        top: width < responsiveSizes.tabel ? null : 30,
        right: width < responsiveSizes.tabel ? null : 30,
        left: width < responsiveSizes.tabel ? 30 : null,
        bottom: width < responsiveSizes.tabel ? 18 : null,
        background: computedStyle('--cssec'),
      }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        onMouseEnter={() => setHovered(-1)}
        onMouseLeave={() => setHovered(0)}
        className="cursor-pointer p-2 z-10 text-ssec w-12 text-center"
        style={{
          color: activePeriod === '7d' ? computedStyle('--cssec') : 'white',
        }}
        onClick={() => setActivePeriod('7d')}
      >
        7d
      </motion.div>
      <div className="h-full w-[2px] bg-ssec bg-opacity-50" />
      <motion.div
        onMouseEnter={() => setHovered(1)}
        onMouseLeave={() => setHovered(0)}
        className="cursor-pointer p-2 z-10  text-ssec w-12 text-cetner"
        onClick={() => setActivePeriod('30d')}
        style={{
          color: activePeriod === '30d' ? computedStyle('--cssec') : 'white',
        }}
      >
        30d
      </motion.div>

      <motion.div
        layoutId="selector"
        className={`absolute top-0.5 w-6/12 h-9 rounded-full ${
          activePeriod === '30d' ? 'right-0.5' : 'left-0.5'
        }`}
        style={{
          background: '#ffffff',
        }}
        animate={{
          right: activePeriod === '30d' ? (hovered === -1 ? 6 : 2) : 'auto',
          left: activePeriod === '7d' ? (hovered === 1 ? 6 : 2) : 'auto',
        }}
      />
    </motion.div>
  );
});

const generateClasses = (width: number) => {
  if (width < windowsSizes.tablet)
    return { main: 'flex flex-col-reverse overflow-hidden', outlet: ' w-full' };
  else
    return {
      main: 'flex justify-center h-full overflow-hidden w-full',
      outlet: 'flex-1 flex flex-col ',
    };
};

export default LayoutContainer;
