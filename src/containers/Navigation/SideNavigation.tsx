import { AnimatePresence, motion, useCycle } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import SideNavigationItems from './SideNavigationItem';
import { ArrowLeftIcon, Copernicus, ESA, HeaderIcon, Poten } from './icons';
import { useAniStore, useDataStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { useLocation } from 'react-router-dom';
import Spinner from '@/components/Spinner/Spinner';

const SideNavigation: React.FC<{ hideSideNav: boolean }> = memo(
  ({ hideSideNav }) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [isOpen, toggleOpen] = useCycle(true, false);
    const [openAni, setOpenAni, setCurrRoute] = useAniStore(
      (state) => [state.openAni, state.setOpenAni, state.setCurrRoute],
      shallow
    );
    const { pathname } = useLocation();
    const refreshed = useDataStore((state) => state.refreshed);

    useEffect(() => {
      setShouldAnimate(!openAni);
    }, [openAni]);

    useEffect(() => {
      setCurrRoute(pathname);
    }, []);

    const innerVariants = {
      open: {
        width: '100%',
      },
      closed: {
        width: 60,
      },
    };

    return (
      <>
        <div
          className="duration-300  h-full bg-smain2 flex flex-col  justify-between  items-center"
          style={{
            width: openAni ? '300px' : hideSideNav ? 0 : '70px',
            minWidth: openAni ? '300px' : hideSideNav ? 0 : '70px',
            padding: hideSideNav ? 0 : openAni ? '0.5rem' : '0px 0px 8px 0px',
            position: hideSideNav ? 'fixed' : 'relative',
            visibility: hideSideNav
              ? openAni
                ? 'visible'
                : 'hidden'
              : 'visible',
            zIndex: hideSideNav ? 9999 : 1000,
          }}
        >
          <div className="flex flex-col w-full items-center">
            <AnimatePresence>
              {openAni ? (
                <motion.span
                  exit={{ opacity: 0 }}
                  className="mb-2 mt-2 self-center flex flex-col items-center"
                >
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    exit={{
                      opacity: 0,
                      width: 0,
                      transition: { duration: 0.3 },
                    }}
                    className="py-3 flex flex-col items-center justify-center"
                    layoutId="header-icon"
                  >
                    <HeaderIcon width={168} />
                  </motion.span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, transition: { delay: 0.2 } }}
                    className="text-[16px] truncate text-center mt-2 text-white"
                  >
                    Copernicus Data Space Ecosystem
                  </motion.div>
                  <motion.div
                    key="navdivider"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, transition: { delay: 0.1 } }}
                    exit={{ scale: 0 }}
                    className="duration-300 w-full h-[3px] rounded-full bg-ssec opacity-75 mt-0.5"
                    style={{
                      transition: 'all 0.3s ease-in-out',
                    }}
                  ></motion.div>
                </motion.span>
              ) : (
                <>
                  <motion.a
                    href="https://dataspace.copernicus.eu/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: '100%',
                      opacity: 1,
                      transition: { delay: 0.2 },
                    }}
                    exit={{
                      width: 0,
                      opacity: 0,
                    }}
                    layoutId="header-icon"
                  >
                    <Copernicus width={60} height={30} />
                  </motion.a>
                  <motion.div
                    key="navdivider"
                    variants={innerVariants}
                    animate={isOpen ? 'open' : 'closed'}
                    className="duration-300 w-full h-[3px] rounded-full bg-ssec opacity-75"
                    style={{
                      transition: 'all 0.3s ease-in-out',
                      margin: openAni ? '0.25rem 0px' : '0.5rem 0px',
                    }}
                  ></motion.div>
                </>
              )}
            </AnimatePresence>
            <SideNavigationItems shouldAnimate={shouldAnimate} />
          </div>

          {/* FOOTER */}
          <div className="w-full">
            <div className="flex w-full p-2 pb-0 flex-row justify-between items-end">
              {openAni && (
                <div className="flex flex-col">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-start"
                  >
                    <div className="text-white text-xxs text-center mb-1  ">
                      Updated at (local time):
                    </div>
                    <div className="text-white text-xxs font-bold capitalize text-center">
                      {refreshed || <Spinner size={10} noCenter />}
                    </div>
                    <motion.span className="text-xxs font-medium w-[180px]  mt-2">
                      All timestamps are displayed in your local timezone:
                      <motion.span className="text-xxs ml-1 font-bold">
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </motion.span>
                    </motion.span>{' '}
                  </motion.div>
                  <div
                    key="navicons"
                    className="flex flex-row justify-start w-full"
                  >
                    <motion.div className="flex flex-row gap-x-3 justify-around items-center mt-2 w-full">
                      {openAni && (
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
                      )}
                    </motion.div>
                  </div>
                </div>
              )}
              <motion.span
                className={`
          duration-300 cursor-pointer mb-3 ${
            openAni ? 'hover:mr-2' : 'ml-3 hover:ml-4'
          }
          `}
                style={{
                  transform: openAni ? '' : 'rotate(180deg)',
                }}
                onClick={() => {
                  toggleOpen();
                  setOpenAni(!openAni);
                }}
              >
                <ArrowLeftIcon />
              </motion.span>
            </div>
          </div>
        </div>
        {hideSideNav && openAni && (
          <div
            onClick={() => setOpenAni(false)}
            className="w-full h-full fixed bg-black/50"
            style={{ zIndex: 999 }}
          />
        )}
      </>
    );
  }
);

export default SideNavigation;
