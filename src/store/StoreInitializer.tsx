import { useEffect } from 'react';
import { useConfigurationStore, useDataStore } from '.';
import { useConfiguration } from './ConfigurationsProvider';
import { shallow } from 'zustand/shallow';

export const StoreInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { codelistRaw } = useConfiguration();
  const [initializeData, generateCodeList] = useDataStore(
    (store) => [store.initializeData, store.setCodelists],
    shallow
  );
  const getURLConfiguration = useConfigurationStore(
    (s) => s.getURLConfiguration
  );

  useEffect(() => {
    generateCodeList(codelistRaw);
    getURLConfiguration();
    initializeData();
  }, []);

  return <>{children}</>;
};
