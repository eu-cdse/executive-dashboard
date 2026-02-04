import { useFixedTooltipStore } from '@/store';
import { motion } from 'framer-motion';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'zustand/shallow';

const FixedTooltip = (_, ref) => {
  const refContent = useRef(null);
  const [data, elRef] = useFixedTooltipStore(
    (state) => [state.data, state.elRef],
    shallow
  );
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (refContent.current) {
      const tooltipWidth = refContent.current.clientWidth;
      const tooltipHeight = refContent.current.clientHeight;

      let sizes = elRef.current?.getBoundingClientRect();
      if (!sizes) return;
      let { top, y, left, width } = sizes;
      let mEl = refContent.current?.getBoundingClientRect();

      top = top + 40;
      left = left - mEl.width / 2 + width / 2;

      // Check if the tooltip overflows the screen horizontally
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      } else if (left < 0) {
        left = 10;
      }

      // Check if the tooltip overflows the screen vertically
      if (top + tooltipHeight > window.innerHeight) {
        top = y - tooltipHeight - 20;
      }

      setPosition({ top, left });
    }
  }, [refContent.current, elRef, window]);

  return ReactDOM.createPortal(
    <motion.div
      ref={ref}
      key="fixedtooltip"
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { stiffness: 72, duration: 0.3, type: 'spring' },
      }}
      exit={{ opacity: 0, y: 50, transition: { duration: 0.3 } }}
      style={{
        position: 'fixed',
        top: position.top || null,
        left: position.left || null,
        zIndex: 9995,
      }}
      drag
      /*   dragConstraints={{
        top: 0,
        left: 0,
        right:
          window.innerWidth -
          (refContent.current ? refContent.current.clientWidth : 0),
        bottom:
          window.innerHeight -
          (refContent.current ? refContent.current.clientHeight : 0),
      }} 
      onDragEnd={handleDragEnd}*/
    >
      <div
        ref={refContent}
        className=" rounded-xl bg-sdark bss text-stext  tooltipek"
      >
        {data as React.ReactNode}
      </div>
    </motion.div>,
    document.body
  );
};
export default React.forwardRef(FixedTooltip);
