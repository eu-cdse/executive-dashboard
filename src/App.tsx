import Routes from './routes/Routes';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './common/constants';
import ConfigurationsProvider from './store/ConfigurationsProvider';
import { StoreInitializer } from './store/StoreInitializer';
import AuthProvider from './auth/AuthProvider';
import Navigation from './containers/Navigation/Navigation';
import ScrollToTop from './components/ScrollToTop/ScrollTopTop';
import { AnimatePresence } from 'framer-motion';
import InfoOverlay from './components/InfoOverlay/InfoOverlay';
import { useDataStore } from './store';

function App() {
  const showOverview = useDataStore((s) => s.showOverview);

  return (
    <AuthProvider>
      <ConfigurationsProvider>
        <StoreInitializer>
          <div
            className="flex flex-row h-full w-full bg-bgcolor lg:flex-col"
            id="routes"
          >
            <Navigation />
            <Routes />
          </div>
          <ScrollToTop />
          <AnimatePresence>{showOverview && <InfoOverlay />}</AnimatePresence>
        </StoreInitializer>
      </ConfigurationsProvider>
    </AuthProvider>
  );
}

export default App;
