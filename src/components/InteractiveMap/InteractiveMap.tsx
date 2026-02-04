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
import continents from '@/assets/continents_edit_centroids.json';
import euCountries from '@/assets/euCountries_centroids.json';
import CanadaMiniMap from './CanadaMiniMap';
import { EUIcon, WorldIcon } from './icons';
import { computedStyle } from '@/common/getChartStyles';
import { getCounter } from '@/hooks/useTimestamp';
import { GraphsData } from '@/functions/process/processor';
import L from 'leaflet';
import { useConfiguration } from '@/store/ConfigurationsProvider';

export enum GeoType {
  CONTINENTS = 'Continents',
  COUNTRIES = 'Countries',
}

const geoType = {
  [GeoType.CONTINENTS]: {
    name: 'Global',
    Icon: WorldIcon,
    iconSize: 25,
    shortName: 'Global',
    buttonWidth: 55,
  },
  [GeoType.COUNTRIES]: {
    name: 'Copernicus Contributing States',
    shortName: 'Copernicus Contributing States',
    Icon: EUIcon,
    iconSize: 27,
    buttonWidth: 210,
  },
};

const InteractiveMap = ({ highlights }: { highlights?: boolean }) => {
  const onMount = useRef();
  const { getGroup } = useConfiguration();
  const userEngagement = getGroup(USERS_ENGAGEMENT);
  const [activeGeoType, setActiveGeoType] = useState(GeoType.COUNTRIES);
  const [activeMetric, setActiveMetric] = useState('');
  const [canadaPoint, setCanadaPoint] = useState<ICollections>();
  const [geoData, setGeoData] = useState({
    [GeoType.CONTINENTS]: null as ICollections,
    [GeoType.COUNTRIES]: null as ICollections,
  });
  const [allData, setAllData] = useState({
    data: null as GraphsData[],
    filteredData: {
      [GeoType.CONTINENTS]: null as GraphsData[],
      [GeoType.COUNTRIES]: null as GraphsData[],
    },
  });
  const p = useDataStore((state) => state.data);
  const activePeriod = useConfigurationStore((state) => state.activePeriod);
  const [map, setMap] = useState<any>();
  const [dataLoaded, setDataLoaded] = useState(false);
  const theme = useAniStore((state) => state.theme);
  const { width } = useWindowSize();
  const { filteredData, data } = allData;

  useEffect(() => {
    calculateData();
  }, [activePeriod]);

  useEffect(() => {
    if (filteredData[activeGeoType] && filteredData[activeGeoType]) {
      try {
        updateData(continents as ICollections, GeoType.CONTINENTS);
        updateData(euCountries as any as ICollections, GeoType.COUNTRIES);
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
          ? [55.805, -5.09]
          : width < 1020 && width > 600
            ? [56.505, 0.59]
            : [56.505, 7.09];
      if (activeGeoType === GeoType.CONTINENTS) {
        map.setMinZoom(2);
        map.setView([51.505, -0.09], 2);
      } else if (activeGeoType === GeoType.COUNTRIES) {
        let zm = width > 580 ? 3.8 : 3.3;
        map.setMinZoom(zm);
        map.setView(countryCords, zm);
      }
    }
  }, [activeGeoType]);

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
      .filter(
        (a) =>
          a.props.group === 'users' ||
          (a.props.group === 'dataDownloaded' && a.id === 'attract20') ||
          (a.props.group === 'dataAccessed' &&
            a.id === 'ue_accessed_collection_per_country')
      )
      .map((a) => {
        if (
          a.id === 'attract21' ||
          a.id === 'attract22' ||
          a.id === 'ue_accessed_collection_per_country'
        ) {
          return { ...a, conditions: { '30d': a.conditions['30d'] } };
        }

        if (a.id === 'attract20') {
          return { ...a, label: 'Volume of downloads' };
        }

        return a;
      })
      .sort((a, b) => {
        if (a.props.group < b.props.group) {
          return 1;
        }
        if (a.props.group > b.props.group) {
          return -1;
        }
        return 0;
      })
      .map((f) => p.graphsData(f))
      .map((i) => {
        if (i.name === 'Missions accessed') {
          i.graphs.labels = i.graphs.labels.map((l) => l.split(' ').join('_'));
        }

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
      [GeoType.CONTINENTS]: data.filter((d) =>
        d.group.includes('per_continent')
      ),
      [GeoType.COUNTRIES]: data.filter((d) => d.group.includes('per_country')),
    };
    setAllData({ data, filteredData });
  };

  const updateData = (data: ICollections, type: string) => {
    data.features = addDataToFeatures(data.features, filteredData[type]);

    // Separate canada from the rest of the countries
    if (type === GeoType.COUNTRIES) {
      let canada = data.features.find((f) => f.properties.key === 'canada');
      setCanadaPoint({ ...data, features: [canada] });
    }
    let features = data.features.filter((f) => f.properties.key !== 'canada');
    setGeoData((prev) => ({ ...prev, [type]: { ...data, features } }));
  };

  const getNameWithPeriod = (name: string) => {
    let period = data.find((da) => da.name === name)?.selectedPeriod;
    return period ? `${name} (last ${period.split('d')[0]} days)` : name;
  };

  const getTimestamp = () => {
    let ts = filteredData[activeGeoType].find((d) => d.name === activeMetric)
      ?.graphs.timestamp;
    let twoDays = ts && ts * 1000 < Date.now() - 172800000;
    return (
      <div className="text-smain3 text-xs self-end">
        Last updated:{' '}
        <span className={`${twoDays ? 'text-red-400' : 'text-ssec'}`}>
          {getCounter(Date.now() / 1000 - ts, ts)}
        </span>
      </div>
    );
  };

  const handleActiveGetoType = (type: GeoType) => {
    setActiveGeoType(type);
  };

  if (!dataLoaded) {
    return <div>loading</div>;
  }
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
        zoom={3.8}
        zoomSnap={0.1}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        keyboard={false}
        center={[55.805, -5.09]}
      >
        {activeGeoType === GeoType.COUNTRIES && width > 820 && (
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
            let { Icon, name, iconSize, buttonWidth } = geoType[d as GeoType];
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
                buttonWidth={buttonWidth}
              />
            );
          })}
        </div>
        <div
          className="flex absolute top-14 left-2 flex-col"
          style={{ zIndex: 400 }}
        >
          <div className="w-max">
            <AnimatePresence>
              {filteredData[activeGeoType].map((d, i) =>
                (i > 0 && highlights) ||
                d.name === 'Missions accessed' ? null : (
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
          data={geoData[activeGeoType]}
          activeMetric={activeMetric}
        />
        <CircleMarkers
          key={geoData[activeGeoType]?.name + theme}
          data={geoData[activeGeoType]}
          activeMetric={activeMetric}
          dataTypes={filteredData[activeGeoType]}
        />
      </MapContainer>
      {activeGeoType === GeoType.COUNTRIES && width <= 820 && (
        <CanadaMiniMap
          data={canadaPoint}
          activeGeoType={activeGeoType}
          activeMetric={activeMetric}
          filteredData={filteredData}
        />
      )}
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
  buttonWidth,
}) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      key={d}
      className={`${
        isActive ? 'bg-smain2 text-white' : 'bg-sdgrey'
      } flex items-center p-2 cursor-pointer h-min text-smain2 text-xs mr-1 rounded-full`}
      onClick={(e) => {
        e.stopPropagation();
        defaultDataType && setActiveMetric(defaultDataType);
        setActiveGeoType(d as GeoType);
      }}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
    >
      <Icon
        width={iconSize}
        height={iconSize}
        color={isActive ? '#fff' : computedStyle('--csmain2')}
      />

      <AnimatePresence>
        {(isHover || isActive) && (
          <>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 10 }}
              exit={{ width: 0 }}
            />
            <motion.div
              key={'ktest' + name}
              className=" whitespace-nowrap"
              initial={{ width: 0, fontSize: 0 }}
              animate={{ width: buttonWidth, fontSize: '0.9rem' }}
              exit={{ width: 0, fontSize: 0 }}
            >
              {name}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InteractiveMap;
