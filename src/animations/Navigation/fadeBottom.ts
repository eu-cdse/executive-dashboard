export const fadeBottom = {
  initial: {
    bottom: -80,
    opacity: 0,
  },
  animate: {
    bottom: 0,
    opacity: 1,
  },
  exit: {
    bottom: -80,
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};
