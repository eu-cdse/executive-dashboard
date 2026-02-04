import {
  DATA_ACCESSED,
  DATA_PUBLISHED,
  OPENEO,
  SENTINEL_HUB,
  USERS_ENGAGEMENT,
} from '@/common/constants';
import { computedStyle } from '@/common/getChartStyles';
import {
  DataAccessedIcon,
  DataPublishedIcon,
  OpenEOIcon,
  SentinelHubIcon,
  UserEngagementIcon,
} from '@/containers/Navigation/icons';

let icons = {
  [USERS_ENGAGEMENT]: UserEngagementIcon,
  [DATA_ACCESSED]: DataAccessedIcon,
  [DATA_PUBLISHED]: DataPublishedIcon,
  [OPENEO]: OpenEOIcon,
  [SENTINEL_HUB]: SentinelHubIcon,
};

const ComponentTag = ({ icon }) => {
  let Icon = icons[icon];

  if (!Icon) {
    return null;
  }

  return (
    <div className="absolute bottom-1 left-2" style={{ zIndex: 400 }}>
      <Icon width={20} height={20} color={computedStyle('--csmain2')} />
    </div>
  );
};
export default ComponentTag;
