import { APP_VERSION } from '@/common/constants';
import { useDataStore } from '@/store';
import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { Switch } from '../Switch';
import { motion } from 'framer-motion';

const SettingsTooltip = () => {
  let a = localStorage.getItem('refresh')
    ? parseInt(localStorage.getItem('refresh'))
    : 0;

  const [
    setShowOverview,
    cancleIntercal,
    startInterval,
    setTempData,
    tempData,
  ] = useDataStore(
    (state) => [
      state.setShowOverview,
      state.cancelInterval,
      state.startInterval,
      state.setTempData,
      state.tempData,
    ],
    shallow
  );

  const [isTempData, setIsTempData] = useState(tempData);
  const [isAutoOn, setIsAutoOn] = useState(!!a);

  let overview = localStorage.getItem('overview');
  const isOnNow = overview ? overview === 'true' : false;
  const [isOn, setIsOn] = useState(isOnNow);

  const changeOverview = () => {
    setIsOn((prevState) => !prevState);
    setShowOverview({ show: false, showAgain: !isOn });
  };

  const changeDataSource = () => {
    setIsTempData((prevState) => !prevState);
    setTempData(!tempData);
  };

  const handleAutoRefresh = () => {
    localStorage.setItem('refresh', isOn ? '0' : '1');
    if (!isAutoOn) startInterval();
    else cancleIntercal();
    setIsAutoOn(!isAutoOn);
  };
  return (
    <div className="bss rounded-xl">
      <div className="flex justify-between items-center rounded-t-xl bg-smain3 p-2">
        <div className="text-md text-stxt font-medium">Settings</div>
        <motion.div
          whileHover={{
            scale: 1.1,
            transition: { duration: 0.2 },
          }}
          whileTap={{
            scale: 0.9,
          }}
        >
          {/* <ColorModeSwitch /> */}
        </motion.div>
      </div>
      <div className="p-2 flex flex-col pb-1">
        <div className=" flex flex-row gap-1 items-center justify-between">
          <div className=" text-sm text-center">Auto refresh </div>
          <Switch
            key="switch1"
            size={2}
            isOn={isAutoOn}
            onClick={handleAutoRefresh}
          />
        </div>
        <div className="flex mt-1 flex-row items-center  justify-between gap-x-2">
          <div className="text-sm ">Show overview on page load</div>
          <Switch key="switch2" size={2} isOn={isOn} onClick={changeOverview} />
        </div>
        {import.meta.env.VITE_OPTION_TEMP_DATA === 'true' && (
          <div className="flex mt-1 flex-row items-center  justify-between gap-x-2">
            <div className="text-sm ">Show temp data</div>
            <Switch
              key="switch2"
              size={2}
              isOn={isTempData}
              onClick={changeDataSource}
            />
          </div>
        )}
        <div className="w-11/12 self-center border-b-2 border-sgrey mt-2 self-center rounded-xl"></div>
        <div className="flex self-center flex-row justify-start mt-1 text-sm gap-x-1">
          <span className="text-smain2 text-xs font-medium">App Version:</span>
          <span className="text-ssec text-xs font-medium">{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};
export default SettingsTooltip;
