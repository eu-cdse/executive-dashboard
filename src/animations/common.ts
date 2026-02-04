export const opacity = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
  exit: { opacity: 0 },
};

/**
 * @param {string} side - Options: x | y. Select which side does component come from
 * @param {number} d - Delay in seconds, is multiplied by 0.1
 */
export const slideIn = (side: string, d: number) => ({
  initial: {
    [side]: side === 'y' ? 2200 : -2200,
  },
  animate: {
    [side]: 0,
    transition: {
      duration: 0.6,
      delay: d * 0.05,
      type: 'tween',
    },
  },
  /*   exit: {
    ['y']: 1500,
    transition: {
      duration: 0.3,
      delay: 0.1,
      type: 'tween',
    },
  }, */
});

export const showUp = (delay?: number) => ({
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.3,
      delay,
    },
  },
});

export const scale = (delay?: number) => ({
  initial: {
    scaleY: 0,
  },
  animate: {
    scaleY: 1,
    transition: {
      duration: 0.5,
      delay,
    },
  },
  exit: {
    scaleY: 0,
    transition: {
      duration: 0.3,
      delay,
    },
  },
});
