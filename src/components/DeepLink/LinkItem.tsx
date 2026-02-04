import { MetricInfo, useConfigurationStore } from '@/store';
import { AnimatePresence } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import WidgetLink from './WidgetLink';

interface ILinkItem {
  children: React.ReactNode;
  defaultMetric?: MetricInfo;
}

/**
 *  LinkItem
 *  defaultMetric: this prop is used to set the default metric if the child component does not have a metric prop
 * customElement: this prop is used to set the custom element if the child component is not a div
 */

const LinkItem: React.FC<ILinkItem> = ({ children, defaultMetric }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [showTooltip, setShowTooltip] = useState({
    id: null,
    show: false,
  });
  const [activePeriod, configuration, activeId, setActiveId] =
    useConfigurationStore(
      (s) => [s.activePeriod, s.configuration, s.activeId, s.setActiveId],
      shallow
    );
  const tooltipRef = useRef(null);

  const findChildWithMetric = () => {
    let metric = null;
    if (Array.isArray(children)) {
      metric = children.find((c) => c.props.metric);
      if (metric) return metric;
    }
    metric = children;
    return metric;
  };

  let childWithMetric = defaultMetric || findChildWithMetric();

  /* On Widget select */
  const onWidgetSelect = () => {
    let id = defaultMetric?.id || childWithMetric?.props?.metric?.id;
    if (!id) return;
    setActiveId(id); // Set active ID to lower triangle z-index
    setIsSelected((prev) => !prev);
    setShowTooltip({
      id: id,
      show: true,
    });
  };

  useEffect(() => {
    let id = defaultMetric?.id || childWithMetric?.props?.metric?.id;
    if (activeId === id) {
      setTimeout(() => {
        // tooltipRef.current.scrollIntoView({
        //   behavior: 'smooth',
        //   block: 'start',
        // });
        setIsSelected(true);
      }, 400);
    }
  }, [activeId]);

  return (
    <div
      ref={tooltipRef}
      className={`relative w-full h-full relative rounded-lg z-20 ${
        isSelected ? 'glowybox' : ''
      }`}
      tabIndex={0}
      onClick={onWidgetSelect}
      onBlur={() => {
        setIsSelected(false);
        setActiveId(''); // Clear active ID to restore triangle z-index
      }}
    >
      <AnimatePresence>
        {isSelected && showTooltip.show && (
          <WidgetLink
            setTooltip={setShowTooltip}
            setSelected={setIsSelected}
            configuration={{
              id: showTooltip.id,
              activePeriod,
              widgetConfiguration: configuration[showTooltip.id],
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
export default LinkItem;
