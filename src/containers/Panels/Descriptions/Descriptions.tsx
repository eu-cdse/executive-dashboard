import { motion } from 'framer-motion';
import DescriptionsServiceHealth from './DescriptionsServiceHealth';
import DescriptionsServiceInsight from './DescriptionsServiceInsight';
import DescriptionsMissionSnapshot from './DescriptionsMissionSnapshot';

const Descriptions = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-y-5"
    >
      <div className="p-5 rounded-xl mx-5 ">
        <p className="text-stext">
          This space is designed for developers seeking to incorporate our Data
          Space Dashboard metrics into their applications.
          <br /> <br /> The list below displays all the dashboard metrics,
          labelled with their corresponding technical names used in our JSON
          files. Keep in mind that our JSON files are continuously updated.
          <br />
          <br /> For the most recent data, refer to{' '}
          <a
            className="underline text-blue-500"
            target="_blank"
            rel="noreferrer"
            href="https://cdse-dashboards.s3.waw3-1.cloudferro.com/current.json"
          >
            this JSON file
          </a>{' '}
          (updated every <b>2 minutes</b>)
          <br />
          For historical data, refer to{' '}
          <a
            className="underline text-blue-500"
            target="_blank"
            rel="noreferrer"
            href="https://cdse-dashboards.s3.waw3-1.cloudferro.com/current_timelines.json"
          >
            this JSON file
          </a>{' '}
          (updated every <b>10 minutes</b>).
        </p>
      </div>
      <DescriptionsServiceInsight />
      <DescriptionsServiceHealth />
      <DescriptionsMissionSnapshot />
    </motion.div>
  );
};

export default Descriptions;
