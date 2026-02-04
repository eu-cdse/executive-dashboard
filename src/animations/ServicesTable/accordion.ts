import { AnimationProps } from 'framer-motion';

export const accordion = ({ i }: { i: number }): AnimationProps => ({
  initial: {
    bottom: -10,
    height: 0,
    opacity: 0,
  },
  animate: {
    opacity: 1,
    height: 1,
    bottom: 0,
    transition: { delay: 0.1 * i },
  },
  exit: {
    height: 0,
    opacity: 0,
  },
});
