import { motion } from 'framer-motion';
import './switch.scss';

const Switch = ({ isOn, ...props }) => {
  const className = `switch switch-${props.size} ${isOn ? 'on' : 'off'}`;

  return (
    <motion.div className={className} {...props}>
      <motion.div animate layout />
    </motion.div>
  );
};
export default Switch;
