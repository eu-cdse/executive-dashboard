import React, { createContext, useState, useEffect } from 'react';
import { Codelist, getCodeList } from '@/functions';
import Spinner from '@/components/Spinner/Spinner';
import { MetricsGroups, initialMetricsGroups } from '@/common/constants';
import { MetricInfo } from '.';

interface ConfigurationsContextType {
  metricsGroups: MetricsGroups[];
  codelist: Codelist;
  codelistRaw: any;
  getGroup: (id: string) => MetricInfo[] | null;
  getGroups: (ids: string[]) => MetricInfo[][];
}

const initialState: ConfigurationsContextType = {
  metricsGroups: [],
  codelist: {},
  codelistRaw: {},
  getGroup: () => null,
  getGroups: () => [],
};

export const ConfigurationContext =
  createContext<ConfigurationsContextType>(initialState);

export const useConfiguration = () => {
  return React.useContext(ConfigurationContext);
};

const ConfigurationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [metricsGroups, setMetricsGroups] =
    useState<MetricsGroups[]>(initialMetricsGroups);
  const [codelistRaw, setCodelistRaw] = useState<any>({});
  const [codelist, setCodelist] = useState<Codelist>({});

  const fetchCodelist = async () => {
    try {
      let res = await fetch(
        `${import.meta.env.VITE_CONFIGURATION_URL}/codelist.json`,
        {
          cache: 'no-cache',
        }
      );
      const codelist = await res.json();
      setCodelistRaw(codelist);
      setCodelist(getCodeList(codelist));
    } catch (err) {
      console.log(err);
    }
  };

  const getGroup = (id: string) => {
    return metricsGroups.find((i) => i.id === id)?.json;
  };

  const getGroups = (ids: string[]) => {
    return ids.map((id) => getGroup(id));
  };

  const fetchMetricsConfigurationsGroups = async () => {
    const metricsGroupsCopy = [...initialMetricsGroups];
    for (let i = 0; i < metricsGroupsCopy.length; i++) {
      const metricGroup = metricsGroupsCopy[i];
      try {
        let res = await fetch(
          `${import.meta.env.VITE_CONFIGURATION_URL}/configurations/${metricGroup.id}.json`,
          {
            cache: 'no-cache',
          }
        );
        const metrics = await res.json();
        metricGroup.json = metrics;
      } catch (err) {
        console.log(err);
      }
    }
    setMetricsGroups(metricsGroupsCopy);
  };

  useEffect(() => {
    (async () => {
      await fetchCodelist();
      await fetchMetricsConfigurationsGroups();
    })();
  }, []);

  if (
    Object.keys(codelistRaw).length === 0 ||
    metricsGroups.some((i) => !i.json.length)
  ) {
    return <Spinner displayError />;
  }

  const configurations = {
    metricsGroups,
    codelist,
    codelistRaw,
    getGroup,
    getGroups,
  };

  return (
    <ConfigurationContext.Provider value={configurations}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationsProvider;
