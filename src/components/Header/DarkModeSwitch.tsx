import { changeColorMode } from '@/functions/common';
import { useAniStore } from '@/store';
import { useState } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

const ColorModeSwitch = () => {
  let l = localStorage.getItem('isDark')
    ? parseInt(localStorage.getItem('isDark'))
    : 0;
  changeColorMode(!!l);
  const setTheme = useAniStore((state) => state.setTheme);
  const [isDarkMode, setDarkMode] = useState(!!l);
  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    setDarkMode(checked);
    changeColorMode(checked);
  };
  return (
    <DarkModeSwitch
      className="min-w-[]"
      checked={isDarkMode}
      onChange={toggleDarkMode}
      size={28}
      sunColor="yellow"
    />
  );
};
export default ColorModeSwitch;
