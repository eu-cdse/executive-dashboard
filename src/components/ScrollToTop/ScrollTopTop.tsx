import { useConfigurationStore } from '@/store';
import { useLayoutEffect, Fragment, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const path = useLocation().pathname;
  const resetConfiguration = useConfigurationStore((s) => s.resetConfiguration);
  const ref = useRef<any>();
  useLayoutEffect(() => {
    // Reset link configuration
    if (ref.current === undefined) {
      ref.current = 1;
    } else if (ref.current === 1) {
      resetConfiguration();
      ref.current = 2;
    }
    document.getElementById('scrolldiv') &&
      document.getElementById('scrolldiv').scrollTo({
        top: 0,
        behavior: 'smooth',
      });
  }, [path]);

  return <Fragment></Fragment>;
}

export default ScrollToTop;
