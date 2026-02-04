import { AnimatePresence, motion } from 'framer-motion';
import useWindowSize from '@/hooks/useWindowSize';
import { windowsSizes } from '@/common/constants';
import { useAniStore, useDataStore } from '@/store';
import { shallow } from 'zustand/shallow';
import {
  Copernicus,
  ESA,
  HamburgerIcon,
  Poten,
} from '@/containers/Navigation/icons';
import useScrollPosition from '@/hooks/useScrollPosition';

const an = {
  initial: {
    height: 0,
  },
  animate: {
    height: 64,
    transition: {
      duration: 0.4,
      delay: 0,
      type: 'tween',
    },
  },
  exit: {
    height: 0,
    transition: {
      duration: 0.4,
      type: 'tween',
    },
  },
};

const Header = () => {
  const { width } = useWindowSize();
  const [header, setOpenAni] = useAniStore(
    (state) => [state.header, state.setOpenAni],
    shallow
  );
  const { scrollDirection } = useScrollPosition();

  const [refreshed] = useDataStore((state) => [state.refreshed], shallow);
  //const time = refreshed && getTime(refreshed);
  const styles = generateClasses(width);

  return (
    <div className={`${styles.hd}`}>
      <AnimatePresence>
        {scrollDirection === 'up' && (
          <motion.div
            {...(header && { ...an })}
            key="headermain"
            className={`flex justify-between w-full items-center h-16 bg-snav ${styles.main}`}
          >
            <div className="flex items-center gap-x-3 ml-3">
              <motion.div
                onClick={() => setOpenAni(true)}
                className="cursor-pointer"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <HamburgerIcon width={24} height={24} color={'white'} />
              </motion.div>
              <div className={`h-14 w-[2px]  bg-ssec rounded-xl `}></div>
              <div className=" text-[40px] 2xl:text-[30px] xl:text-[20px] font-bold">
                Data Space Dashboard
              </div>
            </div>
            <div className={`flex items-center ${styles.logo}`}>
              <div className="flex items-center gap-5 px-5">
                {(width > windowsSizes.phone && (
                  <>
                    <a
                      href="https://dataspace.copernicus.eu/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center"
                    >
                      <div className="bg-transparent border border-white h-[28px]">
                        <Poten width={46} height={26} />
                      </div>
                    </a>
                    <a
                      href="https://dataspace.copernicus.eu/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Copernicus width={80} height={40} />
                    </a>
                    <a
                      href="https://dataspace.copernicus.eu/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ESA width={66} height={40} />
                    </a>
                  </>
                )) || (
                  <a
                    href="https://dataspace.copernicus.eu/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Copernicus width={80} height={40} />
                  </a>
                )}
              </div>
            </div>
            {width > windowsSizes.gMini && (
              <div className={`flex items-center mr-4 ${styles.ord3}`}>
                <div
                  className={`h-14 w-[2px] mx-3 bg-ssec rounded-xl ${styles.line}`}
                ></div>
                <div className="flex items-center">
                  <div className="">
                    <div className="text-white text-xxs text-center mb-1  ">
                      Updated at [UTC]
                    </div>
                    <div className="text-white text-xxs font-bold capitalize text-center">
                      {refreshed}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Header;

function generateClasses(width: any) {
  if (width <= windowsSizes.gMini) {
    return {
      logo: 'm-0 order-1 ml-2',
      ord1: 'order-2',
      ord3: 'order-3',
      hd: 'p-0',
      line: 'invisible',
    };
  } else if (width < windowsSizes.phone) {
    return {
      logo: 'm-0 order-1 ml-2',
      ord1: 'order-2',
      ord3: 'order-3',
      hd: 'p-0',
    };
  } else if (width < windowsSizes.tablet) {
    return {
      hd: 'p-0',
      logo: 'm-0 order-2',
      ord1: 'order-1',
      ord3: 'order-3',
    };
  } else {
    return {
      main: 'rounded-md',
      logo: 'ml-6 order-2',
      ord1: 'order-1',
      ord3: 'order-3',
      hd: 'mr-4 mt-4 mb-4',
    };
  }
}
