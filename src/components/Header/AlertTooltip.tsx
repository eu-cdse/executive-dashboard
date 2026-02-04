import React from 'react';
import Spinner from '../Spinner/Spinner';
const AlertTooltip = ({ metricStatus }) => {
  return (
    <div className="flex flex-col gap-y-2 p-3 max-h-[300px] overflow-scroll overflow-x-hidden">
      <div className="self-center text-smain font-bold">
        MISSING PROVIDED METRICS
      </div>

      <div className="w-10/12  self-center h-[2px] bg-smain3" />
      {(!metricStatus.length && <Spinner noCenter size={40} />) || (
        <div className=" pt-1">
          {metricStatus.map((status, idx) => (
            <React.Fragment key={'n' + idx}>
              <div
                className="capitalize text-sm font-bold text-smain2"
                key={'ms' + status.group}
              >
                {status.group ? status.group.split('-').join(' ') : 'unknown'}:
              </div>
              <div>
                {status.values.map((value, jdx) => {
                  let k = Object.keys(value)[0];
                  let ob = Object.keys(value[k]);
                  let skipValues = ob.length === 1 && ob[0] === 'value';
                  return (
                    <div className="pl-2" key={'no' + jdx}>
                      <div className="text-sred text-xs font-bold">{k}</div>
                      {(!skipValues && (
                        <div>
                          {Object.keys(value[k]).map((l, ldx) => (
                            <div
                              className="flex pl-2"
                              key={'no' + jdx + '-' + ldx}
                            >
                              <div className="text-smain3 text-xs pr-1">
                                {l}:
                              </div>
                              <div className="text-smain2 text-xs">
                                {value[k][l]}
                              </div>
                            </div>
                          ))}
                        </div>
                      )) ||
                        null}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertTooltip;
