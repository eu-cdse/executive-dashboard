import { useEffect, useState } from 'react';

export const useTimestamp = (timestamp: number) => {
  const [counter, setCounter] = useState(Date.now() - timestamp);

  /*   useEffect(() => {
    const timer = setInterval(() => setCounter(counter + 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);
  */

  useEffect(() => {
    if (timestamp) setCounter(Date.now() / 1000 - timestamp);
  }, [timestamp]);

  return getCounter(counter, timestamp);
};

export const getCounter = (num: number, timestamp) => {
  if (num < 59) return 'now';
  else if (num > 59 && num < 3600) return Math.round(num / 60) + ' min';
  else if (num > 3599 && num < 3599 * 24) return Math.round(num / 3600) + ' h';
  else if (num > 3599 * 24 && num < 3599 * 24 * 180) {
    let d = new Date(timestamp * 1000);
    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
  }
  return 'No data.';
};

export const formatSecondsToDuration = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);

  if (days > 0) {
    return `${days}d ${hours}h`; // Days to hours
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`; // Hours to minutes
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`; // Minutes to seconds
  } else {
    return `${remainingSeconds}s`; // Just seconds
  }
};
