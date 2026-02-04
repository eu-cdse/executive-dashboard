import { AnimatePresence, motion } from 'framer-motion';

const InfoNavigation = ({
  combinedSlides,
  clearSliderInterval,
  setActiveSlide,
  activeSlide,
}) => {
  return (
    <div className="absolute top-[40%] z-20 right-[5%]">
      <AnimatePresence>
        {combinedSlides.map((slide, i) => (
          <div
            key={'slideritem' + i}
            className="relative bss rounded-md"
            style={{ background: 'transparent' }}
          >
            <div key={'slide-' + i} className="flex flex-row gap-x-2 mb-2">
              <button
                onClick={() => {
                  clearSliderInterval();
                  setActiveSlide(combinedSlides[i]);
                }}
                className="w-4 h-4 rounded-full bg-white/50"
              ></button>
            </div>
            <AnimatePresence>
              {slide.id === activeSlide.id && (
                <motion.div
                  key={'ageefabh'}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: 0.1,
                      type: 'tween',
                    },
                  }}
                  exit={{
                    scale: 0.6,
                    opacity: 1,
                    transition: { duration: 0.5 },
                  }}
                  className="relative top-[-23px] z-0"
                >
                  <motion.button
                    layoutId={'sidedot'}
                    className="absolute w-4 h-4 rounded-full bg-white"
                  ></motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InfoNavigation;
