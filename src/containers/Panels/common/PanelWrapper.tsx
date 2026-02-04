import useWindowSize from '@/hooks/useWindowSize';
import GridLayout from 'react-grid-layout';
import { motion } from 'framer-motion';
import Spinner from '@/components/Spinner/Spinner';
import { useAniStore, useDataStore } from '@/store';
import { useLocation } from 'react-router-dom';
import { layouts } from '@/containers/Panels/common/layouts';
import { responsiveSizes, windowsSizes } from '@/common/constants';

const calculateWidth = (width: number, openSidebar: boolean) => {
  let hideSideNav = width < responsiveSizes.tabel;
  // If the sidebar is open, the width of the layout is the width of the window minus the width of the sidebar
  // If the sidebar is hidden, the width of the layout is the width of the window - 120px (60px padding each side)
  let navbarwidth = hideSideNav ? 60 : openSidebar ? 300 : 120;
  let layoutWidth =
    width - navbarwidth < responsiveSizes.bigscreen
      ? width - navbarwidth
      : responsiveSizes.bigscreen;

  if (width < 500) {
    layoutWidth = width;
  }
  return layoutWidth;
};

const PanelWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { width } = useWindowSize();
  const loading = useDataStore((state) => state.loading);
  let { pathname } = useLocation();
  const openAni = useAniStore((state) => state.openAni);

  let layoutWidth = calculateWidth(width, openAni);

  // Get the path from the URL
  // If the path is empty, set the path to service-insight
  let path = pathname.split('/').pop() || 'service-insight';

  // Get the layout for the path
  const selectedLayout = layouts[path]?.find((l) => {
    return l.minSize <= layoutWidth && l.maxSize >= layoutWidth;
  });

  // Get the number of columns and the layout
  let { cols, layout: newLayout } = selectedLayout || {
    cols: 5,
    layout: layouts[path] ? layouts[path][0] : [],
  };

  // Change margin on small screens
  const isSmallScreen = width < windowsSizes.gMini;
  const margin = isSmallScreen ? [10, 20] : [20, 30];
  return (
    <>
      {(!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{
            width: layoutWidth,
          }}
          className="relative"
        >
          <GridLayout
            className="layout"
            layout={newLayout}
            cols={cols}
            rowHeight={120}
            width={layoutWidth}
            margin={margin}
            useCSSTransforms={false}
          >
            {children}
          </GridLayout>
        </motion.div>
      )) || (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </>
  );
};
export default PanelWrapper;
