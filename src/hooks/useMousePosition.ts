import { MousePos } from '@/store';
import { useState, useEffect } from 'react';

export const useMousePosition = () => {
  const [mousePos, setMousePosi] = useState({});

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosi({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return [mousePos as MousePos];
};
