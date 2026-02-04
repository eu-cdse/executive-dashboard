import useWindowSize from '@/hooks/useWindowSize';
import SideNavigation from './SideNavigation';
import Header from '@/components/Header/Header';
import { useEffect } from 'react';
import { useAniStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { responsiveSizes } from '@/common/constants';

const Navigation = () => {
  const { width } = useWindowSize();
  const [openAni, setOpenAni] = useAniStore(
    (state) => [state.openAni, state.setOpenAni],
    shallow
  );

  let hideSideNav = width < responsiveSizes.tabel;
  useEffect(() => {
    if (openAni && hideSideNav) {
      setOpenAni(false);
    }
  }, [width]);
  return (
    <>
      {hideSideNav && <Header />}
      <SideNavigation hideSideNav={hideSideNav} />
    </>
  );
};

export default Navigation;
