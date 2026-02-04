import { useEffect, useState } from 'react';

const useScrollPosition = () => {
  const [scrollValue, setScrollValue] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');

  useEffect(() => {
    let el = document.getElementById('scrolldiv');

    const onScroll = (e) => {
      setScrollValue(e.target.scrollTop);

      if (e.target.scrollTop > scrollValue) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
    };

    el.addEventListener('scroll', onScroll);

    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollValue]);
  return { scrollValue, scrollDirection };
};

export default useScrollPosition;
