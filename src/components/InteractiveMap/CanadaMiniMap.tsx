import { MapContainer, TileLayer } from 'react-leaflet';
import { maps } from '@/common/constants';
import { useAniStore } from '@/store';
import { ICollections } from './functions';
import ValueMarkers from './ValueMarkers';
import CircleMarkers from './CircleMarkers';
import useWindowSize from '@/hooks/useWindowSize';

interface Props {
  data: ICollections;
  activeGeoType: string;
  activeMetric: string;
  filteredData: any;
}
const CanadaMiniMap: React.FC<Props> = ({
  data,
  activeGeoType,
  activeMetric,
  filteredData,
}) => {
  const { width } = useWindowSize();
  const theme = useAniStore((state) => state.theme);

  let bigWidthMapStyle = {
    zIndex: 1000,
    position: 'absolute' as any,
    height: width > 1020 ? 320 : 240,
    width: width > 1020 ? 320 : 240,
    padding: 2,
    bottom: 10,
    left: 10,
  };

  let smallWidthMapStyle = {
    zIndex: 1000,
    position: 'relative' as any,
    height: 300,
    width: '100%',
  };

  let selectedStyle = width > 820 ? bigWidthMapStyle : smallWidthMapStyle;
  return (
    <div className=" rounded-lg bg-smain3 mt-5" style={selectedStyle}>
      <div
        className="absolute top-2 left-2 text-smain2"
        style={{ zIndex: 1001 }}
      >
        CANADA
      </div>
      <MapContainer
        id="canada-map"
        className="w-full h-full mb-10 rounded-md "
        attributionControl={false}
        zoomControl={false}
        zoom={2}
        center={[52, -94.5]}
        doubleClickZoom={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          key={maps[theme]}
          url={maps[theme]}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <ValueMarkers data={data} activeMetric={activeMetric} />
        <CircleMarkers
          key={data.name + theme}
          data={data}
          activeMetric={activeMetric}
          dataTypes={filteredData[activeGeoType]}
          isCanadaMap
        />
      </MapContainer>
    </div>
  );
};
export default CanadaMiniMap;
