import {
  DataAccessed,
  DataPublished,
  MissionSnapshot,
  Sentinel1,
  Sentinel2,
  Sentinel3,
  Sentinel5P,
  ServiceHealth,
  ServiceInsight,
  StreamlinedData,
  UserEngagement,
  Descriptions,
  CCMStatistics,
} from '@/containers';
import {
  DataAccessedIcon,
  DataPublishedIcon,
  SentinelHubIcon,
  UserEngagementIcon,
  ServiceInsight as ServiceInsightIcon,
  ServiceHealthIcon,
  SatelliteIcon,
  Sentinel1Icon,
  Sentinel2Icon,
  Sentinel3Icon,
  Sentinel5PIcon,
  CCMDataIcon,
} from '@/containers/Navigation/icons';
import StagePage from '@/containers/Panels/StagePage';
import {
  MainRoutes,
  MissionSnapshotRoutes,
  ServiceInsightRoutes,
} from './routes.enums';

interface Panel {
  name?: string;
  route: string;
  Panel: React.FC<any>;
  childPanels?: Panel[];
  renderPanel?: boolean;
  showPanelOnSidebar?: boolean;
  Icon?: React.FC<any>;
}

export const serviceInsightPanels: Panel[] = [
  {
    name: 'User Engagement',
    Icon: UserEngagementIcon,
    route: ServiceInsightRoutes.USER_ENGAGEMENT,
    Panel: UserEngagement,
  },
  {
    name: 'Data Downloaded',
    Icon: DataAccessedIcon,
    route: ServiceInsightRoutes.DATA_ACCESSED,
    Panel: DataAccessed,
  },
  {
    name: 'Streamlined Data',
    Icon: SentinelHubIcon,
    route: ServiceInsightRoutes.STREAMLINED_DATA_ACCESSED,
    Panel: StreamlinedData,
  },
  {
    name: 'Data Published',
    Icon: DataPublishedIcon,
    route: ServiceInsightRoutes.DATA_PUBLISHED,
    Panel: DataPublished,
  },
];

export const missionSnapshotPanels: Panel[] = [
  {
    name: 'Sentinel-1',
    Icon: Sentinel1Icon,
    route: MissionSnapshotRoutes.SENTINEL_1,
    Panel: Sentinel1,
  },
  {
    name: 'Sentinel-2',
    Icon: Sentinel2Icon,
    route: MissionSnapshotRoutes.SENTINEL_2,
    Panel: Sentinel2,
  },
  {
    name: 'Sentinel-3',
    Icon: Sentinel3Icon,
    route: MissionSnapshotRoutes.SENTINEL_3,
    Panel: Sentinel3,
  },
  {
    name: 'Sentinel-5P',
    Icon: Sentinel5PIcon,
    route: MissionSnapshotRoutes.SENTINEL_5P,
    Panel: Sentinel5P,
  },
];

const allPanels: Panel[] = [
  {
    name: 'Service Insight',
    route: MainRoutes.HOME,
    Panel: ServiceInsight,
    childPanels: serviceInsightPanels,
    renderPanel: true,
    showPanelOnSidebar: false,
    Icon: ServiceInsightIcon,
  },
  {
    name: 'Service Insight',
    route: MainRoutes.SERVICE_INSIGHT,
    Panel: ServiceInsight,
    childPanels: serviceInsightPanels,
    renderPanel: true,
    showPanelOnSidebar: true,
    Icon: ServiceInsightIcon,
  },
  {
    name: 'Service Health',
    route: MainRoutes.SERVICE_HEALTH,
    Panel: ServiceHealth,
    childPanels: [],
    renderPanel: true,
    showPanelOnSidebar: true,
    Icon: ServiceHealthIcon,
  },
  {
    name: 'Mission Snapshot',
    route: MainRoutes.MISSION_SNAPSHOT,
    Panel: MissionSnapshot,
    childPanels: missionSnapshotPanels,
    renderPanel: true,
    showPanelOnSidebar: true,
    Icon: SatelliteIcon,
  },
  {
    name: 'CCM Data',
    route: MainRoutes.CCM,
    Panel: CCMStatistics,
    childPanels: [],
    renderPanel: true,
    showPanelOnSidebar: true,
    Icon: CCMDataIcon,
  },
  {
    route: MainRoutes.DESCRIPTIONS,
    Panel: Descriptions,
    childPanels: [],
    renderPanel: false,
  },
  {
    name: 'Stage Page',
    route: MainRoutes.STAGE_PAGE,
    Panel: StagePage,
    childPanels: [],
    renderPanel: import.meta.env.VITE_INCLUDE_STAGE_SUBPAGE === 'true',
    showPanelOnSidebar: import.meta.env.VITE_INCLUDE_STAGE_SUBPAGE === 'true',
    Icon: SatelliteIcon,
  },
];

export const mainPanels = allPanels.filter((panel) => panel.renderPanel);

export interface NavigationItem {
  name: string;
  Icon: React.FC<any>;
  route: string;
  childPanels?: NavigationItem[];
}

const getNavigationItems = (panels): NavigationItem[] => {
  return panels.map((panel) => ({
    name: panel.name,
    Icon: panel.Icon,
    route: panel.route,
    childPanels: panel.childPanels?.length
      ? getNavigationItems(panel.childPanels)
      : null,
  }));
};

export const navigationItems: NavigationItem[] = getNavigationItems(
  mainPanels.filter((panel) => panel.showPanelOnSidebar)
);
