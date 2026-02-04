import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAniStore, useConfigurationStore, useDataStore } from '@/store';
import { sortArraysDescending } from '@/functions';
import CircleMarkers from './CircleMarkers';
import ValueMarkers from './ValueMarkers';
import { ICollections, addDataToFeatures } from './functions';
import './InteractiveMap.scss';
import { AnimatePresence, motion } from 'framer-motion';
import useWindowSize from '@/hooks/useWindowSize';
import {
  MAPS_DISCLAIMER,
  USERS_ENGAGEMENT,
  maps,
  windowsSizes,
} from '@/common/constants';
import euCountries from '@/assets/euCountries_centroids.json';
import CanadaMiniMap from './CanadaMiniMap';
import { computedStyle } from '@/common/getChartStyles';
import { getCounter } from '@/hooks/useTimestamp';
import { GraphsData } from '@/functions/process/processor';
import L from 'leaflet';
import { useConfiguration } from '@/store/ConfigurationsProvider';

export enum TimeType {
  TOTAL = 'TOTAL',
  TIME_PERIOD = 'TIME_PERIOD',
}

const geoType = {
  [TimeType.TOTAL]: {
    name: 'TOTAL',
    Icon: null,
    iconSize: 25,
    shortName: 'Global',
  },
  [TimeType.TIME_PERIOD]: {
    name: 'TIME PERIOD',
    shortName: 'Time period',
    Icon: null,
    iconSize: 27,
  },
};

const InteractiveMapDataDownloaded = ({
  highlights,
}: {
  highlights?: boolean;
}) => {
  const onMount = useRef();
  const { getGroup } = useConfiguration();
  const userEngagement = getGroup(USERS_ENGAGEMENT);
  const [activeGeoType, setActiveGeoType] = useState(TimeType.TIME_PERIOD);
  const [activeMetric, setActiveMetric] = useState('');
  const [canadaPoint, setCanadaPoint] = useState<ICollections>();
  const [geoData, setGeoData] = useState({
    [TimeType.TOTAL]: null as ICollections,
    [TimeType.TIME_PERIOD]: null as ICollections,
  });
  const [allData, setAllData] = useState({
    data: null as GraphsData[],
    filteredData: {
      [TimeType.TOTAL]: null as GraphsData[],
      [TimeType.TIME_PERIOD]: null as GraphsData[],
    },
  });
  const p = useDataStore((state) => state.data);
  const activePeriod = useConfigurationStore((state) => state.activePeriod);
  const [map, setMap] = useState<any>();
  const [dataLoaded, setDataLoaded] = useState(false);
  const theme = useAniStore((state) => state.theme);
  const { width } = useWindowSize();
  const { filteredData } = allData;

  useEffect(() => {
    calculateData();
  }, [activePeriod]);

  useEffect(() => {
    if (filteredData[activeGeoType]) {
      try {
        updateData(euCountries as any as ICollections, TimeType.TOTAL);
        updateData(euCountries as any as ICollections, TimeType.TIME_PERIOD);
        setDataLoaded(true);
      } catch (e) {
        console.log(e);
      }

      // Set default metric
      if (
        filteredData[activeGeoType] &&
        filteredData[activeGeoType][0] &&
        !onMount.current
      ) {
        setActiveMetric(filteredData[activeGeoType][0]?.name);
        //@ts-ignore
        onMount.current = true;
      }
    }
  }, [filteredData]);

  useEffect(() => {
    if (map) {
      const countryCords =
        width > windowsSizes.tabelS ||
        (width < windowsSizes.tablet && width > 1020)
          ? [56.505, -5.09]
          : width < 1020 && width > 600
            ? [56.505, 0.59]
            : [56.505, 7.09];
      let zm = width > 580 ? 4.2 : 3.3;
      map.setMinZoom(zm);
      map.setView(countryCords, zm);
    }
  }, [activeGeoType, map]);

  useEffect(() => {
    // This code is to fix the issue with map error when switching between global and EU-ESA
    // Create map instance
    const mapElement = L.DomUtil.get('map');
    if (mapElement != null) {
      //@ts-ignore
      mapElement._leaflet_id = null;
    }

    return () => {
      // Remove map instance
      map?.remove();
      mapElement?.remove();
    };
  }, []);

  const calculateData = () => {
    let data = userEngagement
      .filter((a) => a.props.detailedGroup)
      .filter((a) => a.props.group === 'dataDownloaded')
      .map((f) => p.graphsData(f))
      .map((i) => {
        //console.log(i);
        let [numbers, strings] = sortArraysDescending(
          i.graphs.series,
          i.graphs.labels
        );
        i.graphs.series = numbers;
        i.graphs.labels = strings;
        return i;
      })
      .filter((d) => d.graphs?.labels?.length);
    let filteredData = {
      [TimeType.TOTAL]: data.filter((d) => d.name.includes('Total')),
      [TimeType.TIME_PERIOD]: data.filter((d) => !d.name.includes('Total')),
    };
    setAllData({ data, filteredData });
  };

  const updateData = (data: ICollections, type: string) => {
    data.features = addDataToFeatures(data.features, filteredData[type]);

    // Separate canada from the rest of the countries
    if (type === TimeType.TIME_PERIOD) {
      let canada = data.features.find((f) => f.properties.key === 'canada');
      setCanadaPoint({ ...data, features: [canada] });
    }
    let features = data.features.filter((f) => f.properties.key !== 'canada');
    setGeoData((prev) => ({ ...prev, [type]: { ...data, features } }));
  };

  const getNameWithPeriod = (name: string) => {
    let period = allData.data.find((da) => da.name === name)?.selectedPeriod;
    return period ? `${name} (last ${period.split('d')[0]} days)` : name;
  };

  const getTimestamp = () => {
    let ts = filteredData[activeGeoType].find((d) => d.name === activeMetric)
      ?.graphs.timestamp;
    let twoDays = ts && ts * 1000 < Date.now() - 172800000;
    return (
      <div className="flex flex-col">
        <div
          className={`right-1 text-htext self-end items-center text-xxs flex gap-x-1`}
        >
          Time period:
          <span className="flex w-6 text-medium text-xxs text-ssec w-max">
            {activePeriod}
          </span>
        </div>
        <div className="text-htext text-xxs self-end">
          Last updated:{' '}
          <span className={`${twoDays ? 'text-red-400' : 'text-ssec'}`}>
            {getCounter(Date.now() / 1000 - ts, ts)}
          </span>
        </div>
      </div>
    );
  };

  const handleActiveGetoType = (type: TimeType) => {
    setActiveGeoType(type);
    if (!filteredData[type][activeMetric]) {
      setActiveMetric(filteredData[type][0]?.name);
    }
  };

  if (!dataLoaded) {
    return <div>loading</div>;
  }
  // console.log(geoData);
  return (
    <div
      className="flex bss rounded-lg flex-col relative items-center w-full h-full self-center"
      style={{
        borderRadius: highlights ? 30 : '0.5rem',
        background: highlights ? 'transparent' : 'white',
      }}
    >
      <MapContainer
        id="map"
        className="h-full relative w-full rounded-md"
        style={{
          width: '100%',
          padding: highlights ? 0 : '0.5rem',
          borderRadius: highlights ? 30 : '.375rem',
        }}
        ref={setMap}
        maxBounds={[
          [-50, -180],
          [83, 180],
        ]}
        attributionControl={false}
        zoomControl={false}
        zoom={2}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        center={[51.505, -0.09]}
        keyboard={false}
      >
        {activeGeoType === TimeType.TIME_PERIOD && width > 820 && (
          <CanadaMiniMap
            data={canadaPoint}
            activeGeoType={activeGeoType}
            activeMetric={activeMetric}
            filteredData={filteredData}
          />
        )}
        <TileLayer
          key={maps[theme]}
          url={maps[theme]}
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <div
          className="absolute bottom-0 self-end right-2 flex flex-col gap-x-1"
          style={{ zIndex: 400 }}
        >
          {getTimestamp()}
          <div className="flex justify-end">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://openstreetmap.org/copyright"
              title={MAPS_DISCLAIMER}
            >
              © OpenStreetMap
            </a>
          </div>
        </div>
        <div className="flex absolute top-2 left-2" style={{ zIndex: 400 }}>
          {Object.keys(geoData).map((d) => {
            let { Icon, name, iconSize } = geoType[d as TimeType];
            let isActive = activeGeoType === d;
            return (
              <SelectionButton
                isActive={isActive}
                d={d}
                key={d}
                setActiveGeoType={handleActiveGetoType}
                setActiveMetric={setActiveMetric}
                defaultDataType={filteredData[activeGeoType][0]?.name}
                Icon={Icon}
                name={name}
                iconSize={iconSize}
              />
            );
          })}
        </div>
        <div
          className="flex absolute top-14 left-2 flex-col"
          style={{ zIndex: 400 }}
        >
          <div className="w-max">
            <AnimatePresence mode="wait">
              {filteredData[activeGeoType].map((d, i) =>
                i > 0 && highlights ? null : (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, delay: 0.15 * i },
                    }}
                    exit={{
                      opacity: 0,
                      y: 20,
                      transition: {
                        duration: 0.3,
                        delay: (filteredData[activeGeoType].length - i) * 0.1,
                      },
                    }}
                    className={`${
                      activeMetric === d.name
                        ? 'bg-smain2 text-white'
                        : 'bg-sdark bg-opacity-10'
                    } p-2 rounded-full cursor-pointer h-min text-xs mt-1 text-smain2`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMetric(d.name);
                    }}
                  >
                    {getNameWithPeriod(d.name)}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        <ValueMarkers
          biggerFont
          data={geoData[activeGeoType]}
          activeMetric={activeMetric}
        />
        <CircleMarkers
          biggerCircle
          key={geoData[activeGeoType]?.name + theme}
          data={geoData[activeGeoType]}
          activeMetric={activeMetric}
          dataTypes={filteredData[activeGeoType]}
        />
      </MapContainer>
      <CanadaMiniMap
        data={canadaPoint}
        activeGeoType={activeGeoType}
        activeMetric={activeMetric}
        filteredData={filteredData}
      />
    </div>
  );
};

const SelectionButton = ({
  isActive,
  d,
  setActiveGeoType,
  setActiveMetric,
  defaultDataType,
  Icon,
  name,
  iconSize,
}) => {
  return (
    <motion.div
      key={d}
      className={`${
        isActive ? 'bg-smain2 text-white' : 'bg-sdgrey'
      } flex items-center justify-center p-2 cursor-pointer h-min text-smain2 text-xs mr-1 rounded-full`}
      onClick={(e) => {
        e.stopPropagation();
        defaultDataType && setActiveMetric(defaultDataType);
        setActiveGeoType(d as TimeType);
      }}
    >
      {Icon && (
        <Icon
          width={iconSize}
          height={iconSize}
          color={isActive ? '#fff' : computedStyle('--csmain2')}
        />
      )}

      <AnimatePresence>
        <motion.div />
        <motion.div
          key={'ktest' + name}
          className="text-[0.9rem] whitespace-nowrap"
        >
          {name}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default InteractiveMapDataDownloaded;
