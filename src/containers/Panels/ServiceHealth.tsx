import ServicesTable from '@/components/ServicesTable/ServicesTable';
import { sortOnly } from '@/functions';
import { useConfiguration } from '@/store/ConfigurationsProvider';
import { motion } from 'framer-motion';

export interface IGroups {
  [key: string]: {
    label: string;
    items: any[];
  };
}

export let groups: IGroups = {
  dataAccessUI: { label: 'Data Access User Interfaces', items: [] },
  dataAccess: { label: 'Data Access Services', items: [] },
  openeo: { label: 'openEO', items: [] },
  sentinelhub: { label: 'Sentinel Hub', items: [] },
  s3Object: { label: 'S3 Object Storage', items: [] },
  odp: { label: 'On Demand Production (ODP)', items: [] },
  // traceability: { label: 'Traceability Service', items: [] },
  // onDemand: { label: 'On Demand Production (ODP)', items: [] },
  // zipper: { label: 'Zipper API', items: [] },
};

const ServiceHealth = () => {
  const { metricsGroups } = useConfiguration();
  let data = metricsGroups
    .map(({ json }) => {
      let data = json.filter((item) => item.type === 'list');
      return data.flat();
    })
    .filter((i) => i.length)
    .flat();

  let orderedData = sortOnly(data);
  Object.keys(groups).forEach((key) => {
    groups[key].items = orderedData.filter((item) => item.props.group === key);
  });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="rounded-md w-full p-5"
    >
      {Object.values(groups).map(({ label, items }, i) =>
        items.length ? (
          <div
            key={'servicehealthitem' + i}
            className="mb-5 bss py-5 rounded-lg"
          >
            <div className="text-smain2 text-2xl pl-4">{label}</div>
            <ServicesTable metrics={items} />
          </div>
        ) : null
      )}
    </motion.div>
  );
};
export default ServiceHealth;
