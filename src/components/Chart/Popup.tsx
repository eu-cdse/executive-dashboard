import { useAniStore, usePopupStore } from '@/store';
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'zustand/shallow';
import { motion } from 'framer-motion';
import useScrollPosition from '@/hooks/useScrollPosition';
import { ShrinkIcon } from './icons';
import { computedStyle } from '@/common/getChartStyles';
import { TlTooltip } from '../Tooltip/Tooltip';
import { useTooltip } from '@/hooks/useTooltip';
import useWindowSize from '@/hooks/useWindowSize';
import { responsiveSizes } from '@/common/constants';

const Popup = () => {
  const [component, data] = usePopupStore(
    (state) => [state.component, state.data],
    shallow
  );

  const [openAni] = useAniStore((s) => [s.openAni], shallow);
  const { scrollValue: scrollTop } = useScrollPosition();
  const { width } = useWindowSize();

  let popupWidthDiff = openAni ? 300 : 70;

  const closePopup = () => {
    usePopupStore.setState({ showPopup: false });
  };

  const calculatePosition = () => {
    let wrapper = data.wrapperRef.current;
    let wrapperRect = wrapper.getBoundingClientRect();
    let { y, x, width, height } = wrapperRect;
    return {
      y: y + scrollTop - 8,
      x: x - popupWidthDiff - 8,
      width: width + 32,
      height: height + 32,
    };
  };

  const initialPosition = calculatePosition();
  let hideSideNav = width < responsiveSizes.tabel;
  return ReactDOM.createPortal(
    <motion.div
      initial={{ ...initialPosition }}
      animate={{
        y: 0,
        x: 0,
        width: `calc(100% - ${hideSideNav ? 0 : popupWidthDiff}px)`,
        height: '100%',
        transition: {
          duration: 0.7,
          type: 'tween',
          delay: 0.1,
        },
      }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.3, delay: 0.1 } }}
      className="w-full h-screen absolute p-2 "
      style={{
        zIndex: 9995,
        top: hideSideNav ? 70 : 0,
        left: hideSideNav ? 0 : popupWidthDiff,
      }}
      layoutId={data.id}
    >
      <div className="flex flex-col bg-white p-3 pl-4 bss w-full h-full rounded-xl">
        <div className="flex justify-between items-center">
          <div className="w-max">
            <motion.div
              className="text-[#333] font-medium text-2xl select-none "
              initial={{ fontSize: '16px' }}
              animate={{
                fontSize: '24px',
                transition: { duration: 0.7, delay: 0.3 },
              }}
              exit={{ fontSize: '16px' }}
            >
              {data.title}
            </motion.div>
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: '100%',
                transition: { duration: 0.7, delay: 0.5 },
              }}
              className="h-[2px] bg-ssec"
            ></motion.div>
          </div>
          <ShrinkButton closePopup={closePopup} />
        </div>
        <div className="w-full h-full p-3">{component}</div>
      </div>
    </motion.div>,
    document.getElementById('routes')
  );
};

export default Popup;

const ShrinkButton = ({ closePopup }) => {
  const [tooltip] = useTooltip();
  const { width } = useWindowSize();

  return (
    <motion.button
      onClick={closePopup}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...(width > 500 && tooltip(<TlTooltip text={'Shrink'} />, 0.5))}
    >
      <ShrinkIcon width={20} height={20} color={computedStyle('--cssec')} />
    </motion.button>
  );
};
