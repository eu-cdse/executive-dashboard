const TimePeriodTag = ({
  shouldShow,
  timePeriod,
  justGraph,
}: {
  shouldShow: boolean;
  timePeriod: string;
  justGraph?: boolean;
}) => {
  if (!shouldShow || !timePeriod) {
    return null;
  }

  return (
    <div
      className={`absolute ${
        justGraph ? 'bottom-[-10px]' : 'bottom-1'
      } right-1 text-htext items-center text-xxxs flex gap-x-1`}
    >
      TIME PERIOD:
      <span className="flex w-6 text-medium text-xxs text-ssec">
        {timePeriod}
      </span>
    </div>
  );
};

export default TimePeriodTag;
