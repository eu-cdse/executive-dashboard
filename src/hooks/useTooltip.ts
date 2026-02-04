import { useTooltipStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { useCallback } from 'react';

export const useTooltip = () => {
  const [setToolTip, setData, data] = useTooltipStore(
    (state) => [state.setToolTip, state.setData, state.data],
    shallow
  );

  const MouseEnter = useCallback(
    (data: any, delay: number) => {
      setToolTip(true);
      setData({ data, delay });
    },
    [setToolTip, setData]
  );

  const MouseLeave = useCallback(() => {
    setToolTip(false);
  }, [setToolTip]);

  const tooltip = useCallback(
    (
      data: any,
      delay: number = 0
    ): { onMouseOver: () => void; onMouseLeave: () => void } => ({
      onMouseOver: () => MouseEnter(data, delay),
      onMouseLeave: MouseLeave,
    }),
    [MouseEnter, MouseLeave]
  );

  return [tooltip, data] as const;
};
