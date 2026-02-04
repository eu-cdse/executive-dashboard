import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { computedStyle } from '@/common/getChartStyles';
import { useAniStore, usePopupStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { navigationItems } from '@/routes/routesConfig';

const SideNavigationItems: React.FC<{ shouldAnimate: boolean }> = ({
  shouldAnimate,
}) => {
  const [currRoute, setCurrRoute, isOpen] = useAniStore(
    (state) => [state.currRoute, state.setCurrRoute, state.openAni],
    shallow
  );
  const [showPopup, setPopupVisibility] = usePopupStore(
    (state) => [state.showPopup, state.setPopupVisibility],
    shallow
  );
  const location = useLocation();
  const navigate = useNavigate();

  const changeRoute = (route) => {
    if (showPopup) setPopupVisibility(false);
    setCurrRoute(route);
    navigate(route);
  };
  return (
    <div
      className="flex flex-col w-full"
      style={{
        padding: isOpen ? '0.5rem' : '0.25rem',
      }}
    >
      {navigationItems.map(({ name, Icon, route, childPanels }, i) => {
        let mainActive =
          route === (currRoute.split('/')[1] || 'service-insight');
        let activeRoute = currRoute.split('/').pop() || 'service-insight';
        let isActive =
          location.pathname === '/descriptions' ? false : route === activeRoute;

        return (
          <div
            key={'sidenavitem' + i}
            className="flex flex-col p-1 w-full justify-center "
          >
            <div
              className="flex cursor-pointer flex-row z-1 p-2 items-center w-full"
              style={{
                marginLeft: isOpen ? '0.5rem' : 0,
                justifyContent: isOpen ? 'flex-start' : 'center',
              }}
              onClick={() => changeRoute(`/${route}`)}
            >
              <Icon
                width={28}
                height={28}
                color={isActive ? computedStyle('--cssec') : '#fff'}
              />
              {isOpen && (
                <div
                  className="text-[14px] uppercase pl-4 font-[600]"
                  style={{
                    color: isActive ? computedStyle('--cssec') : '#fff',
                  }}
                >
                  {name}
                </div>
              )}
            </div>
            {isActive && (
              <motion.div
                className="relative rounded-lg top-[-44px] z-0"
                layoutId={'sidebarmain'}
              >
                <div className="absolute bg-white opacity-25 rounded-full h-[42px] w-full z-0"></div>
              </motion.div>
            )}
            <AnimatePresence>
              {childPanels && mainActive && (
                <motion.div className="flex flex-row">
                  <motion.div
                    initial={{ width: 1, opacity: 0, height: 0 }}
                    animate={{ height: 10, opacity: 0 }}
                    exit={{ height: 0 }}
                  />
                  <div
                    className=" w-[2px] rounded-full  bg-sgrey"
                    style={{
                      marginLeft: isOpen ? '22px' : '4px',
                    }}
                  ></div>
                  <div className="flex pl-2 flex-col w-full">
                    {childPanels.map(
                      (
                        { Icon: ChildIcon, name: childName, route: childRoute },
                        j
                      ) => {
                        let childActive = childRoute === activeRoute;
                        return (
                          <motion.div
                            className="relative"
                            key={'sidenavchild' + j}
                            {...(true && {
                              initial: {
                                opacity: 0,
                                height: 0,
                                scale: 0,
                              },
                              animate: {
                                opacity: 1,
                                transition: {
                                  delay: 0.01 + j * 0.1,
                                  duration: 0.3,
                                },
                                scale: 1,
                                height: 'auto',
                              },
                            })}
                            exit={{
                              height: 0,
                              opacity: 0,
                              scale: 0,
                              transition: {
                                delay: 0.1,
                                duration: 0.2 + j * 0.2,
                              },
                            }}
                          >
                            <div
                              className="flex cursor-pointer z-10 flex-row items-center w-full"
                              style={{
                                padding: isOpen ? 10 : '10px 4px',
                                justifyContent: isOpen
                                  ? 'flex-start'
                                  : 'center',
                              }}
                              onClick={() =>
                                changeRoute(`/${route}/${childRoute}`)
                              }
                            >
                              <ChildIcon
                                width={25}
                                height={25}
                                color={
                                  childActive
                                    ? computedStyle('--cssec')
                                    : '#fff'
                                }
                              />
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    className="text-[0.9em] pl-4 font-[600]"
                                    style={{
                                      color: childActive
                                        ? computedStyle('--cssec')
                                        : '#fff',
                                    }}
                                    {...(shouldAnimate && {
                                      initial: {
                                        opacity: 0,
                                        fontSize: '0em',
                                      },
                                      animate: {
                                        opacity: 1,
                                        fontSize: '0.8em',
                                      },
                                    })}
                                  >
                                    {childName}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {childActive && (
                              <motion.div
                                className="relative top-[-40px] z-0"
                                layoutId={'sidebarmain'}
                              >
                                <div className="absolute bg-white/25 rounded-full h-[35px] w-full z-0"></div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
export default SideNavigationItems;
