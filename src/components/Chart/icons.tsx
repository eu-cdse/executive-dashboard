export const ExpandIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4"
      />
    </svg>
  );
};
export const ShrinkIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '14'}
      height={height || '14'}
      viewBox="0 0 14 14"
    >
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m.5 13.5l4-4M1 9.5h3.5V13m9 .5l-4-4m3.5 0H9.5V13M.5.5l4 4M1 4.5h3.5V1m9-.5l-4 4m3.5 0H9.5V1"
      />
    </svg>
  );
};
export const TimelineIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
    >
      <path
        fill={color || '#fff'}
        d="M1.4 21.5c-.5-.5-.8-1.2-.8-1.9a2.732 2.732 0 0 1 2.7-2.7h.2l2.9-4.8c-.1-.2-.3-.4-.3-.7 0-.2-.1-.4-.1-.7A2.732 2.732 0 0 1 8.7 8a2.732 2.732 0 0 1 2.7 2.7c0 .3 0 .5-.1.8-.1.2-.2.5-.3.7l2.9 4.8h.4L19 8.6c-.1-.2-.3-.4-.3-.7-.1-.3-.1-.5-.1-.8a2.732 2.732 0 0 1 2.7-2.7A2.732 2.732 0 0 1 24 7.1a2.732 2.732 0 0 1-2.7 2.7h-.2l-4.8 8.3c.1.2.3.4.3.7.1.3.1.5.1.8a2.732 2.732 0 0 1-2.7 2.7 2.732 2.732 0 0 1-2.7-2.7c0-.3 0-.5.1-.8.1-.2.2-.5.3-.7l-2.9-4.8h-.4l-2.9 4.8c.1.2.3.4.3.7.2.3.2.5.2.8a2.732 2.732 0 0 1-2.7 2.7c-.7 0-1.3-.3-1.9-.8z"
      />
    </svg>
  );
};
export const ChartIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
    >
      <path
        fill={color}
        d="M1.9 20h18.6c.3 0 .5.2.5.5V23c0 .3-.2.5-.5.5H1.9c-.3 0-.5-.2-.5-.5v-2.4c-.1-.3.2-.6.5-.6zM2.1 13.1h2.4c.3 0 .5.2.5.5v4.2c0 .3-.2.5-.5.5H2.1c-.3 0-.5-.2-.5-.5v-4.2c0-.3.2-.5.5-.5zM7.3 6.1h2.4c.3 0 .5.2.5.5v11.1c0 .3-.2.5-.5.5H7.3c-.3 0-.5-.2-.5-.5V6.6c0-.3.3-.5.5-.5zM12.6 11.3H15c.3 0 .5.2.5.5v5.9c0 .3-.2.5-.5.5h-2.4c-.3 0-.5-.2-.5-.5v-5.9c-.1-.2.2-.5.5-.5zM17.8.9h2.4c.3 0 .5.2.5.5v16.3c0 .3-.2.5-.5.5h-2.4c-.3 0-.5-.2-.5-.5V1.4c0-.3.2-.5.5-.5z"
      />
    </svg>
  );
};
export const MessageIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
    >
      <path
        fill="transparent"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 9h8m-8 4h6m4-9a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12z"
      />
    </svg>
  );
};
export const NewsIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 24 24"
      width={width || '24'}
      height={height || '24'}
      style={{
        transform: 'rotate(-15deg)',
      }}
    >
      <path
        fill={color}
        d="M24 10.7c0-4.6-1.4-8.4-3-8.5h-1.6c-.2 0-.4.1-.6.2-1 .7-4.8 3.2-10.1 4.4-.4.1-.7.4-.7.8-.1.9-.2 1.9-.2 3s.1 2.1.2 3c0 .4.3.7.8.8 5.3 1.2 9.1 3.7 10.1 4.4.2.1.4.2.6.2H21c1.6.1 3-3.7 3-8.3m-3.7 7.2c-.2 0-.5-.2-.6-.4-.3-.3-.6-.8-.8-1.5-.5-1.4-.8-3.3-.8-5.3s.3-3.9.8-5.3c.2-.6.5-1.1.8-1.5.1-.1.4-.4.6-.4s.5.2.6.4c.3.3.6.8.8 1.5.5 1.4.8 3.3.8 5.3s-.3 3.9-.8 5.3c-.2.6-.5 1.1-.8 1.5-.1.1-.4.4-.6.4M6.1 10.7c0-.8 0-1.5.1-2.3.1-.6-.5-1.1-1.1-1.1-.6.1-1.3.1-2 .1h-.9c-.4.1-.7.3-.9.6L.4 9.5c-.1.1-.1.3-.1.5v1.5c0 .2 0 .3.1.5l.9 1.5c.2.3.5.5.8.5h1c.7 0 1.4 0 2 .1.6 0 1.1-.5 1-1.1v-2.3m2.1 4.8-.8-.2c-.7-.1-1.3.5-1.1 1.2l1.5 5.9c.1.4.5.6.8.4l2.7-1.1c.4-.1.5-.6.3-.9l-2.4-4.6c-.3-.4-.6-.6-1-.7zm12.1-2.1c-.1 0-.2-.1-.2-.1-.1-.1-.2-.3-.3-.6-.2-.5-.3-1.3-.3-2.1s.1-1.5.3-2.1l.3-.6c0-.1.1-.1.2-.1s.2.1.2.1c.1.1.2.3.3.6.2.5.3 1.3.3 2.1s-.1 1.5-.3 2.1l-.3.6c0 .1-.1.1-.2.1"
      />
    </svg>
  );
};
export const ScreenshotIcon = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
    >
      <path
        fill={color}
        d="M7 17h2q.425 0 .713.288T10 18q0 .425-.288.713T9 19H6q-.425 0-.713-.288T5 18v-3q0-.425.288-.713T6 14q.425 0 .713.288T7 15v2ZM7 7v2q0 .425-.288.713T6 10q-.425 0-.713-.288T5 9V6q0-.425.288-.713T6 5h3q.425 0 .713.288T10 6q0 .425-.288.713T9 7H7Zm10 0h-2q-.425 0-.713-.288T14 6q0-.425.288-.713T15 5h3q.425 0 .713.288T19 6v3q0 .425-.288.713T18 10q-.425 0-.713-.288T17 9V7Zm0 12h-2q-.425 0-.713-.288T14 18q0-.425.288-.713T15 17h2v-2q0-.425.288-.713T18 14q.425 0 .713.288T19 15v2h2q.425 0 .713.288T22 18q0 .425-.288.713T21 19h-2v2q0 .425-.288.713T18 22q-.425 0-.713-.288T17 21v-2Z"
      />
    </svg>
  );
};
export const ArrowIcon = ({ width, height, color, rotation }) => {
  let rotate = 'rotate(0deg)';
  switch (rotation) {
    case 'left':
      rotate = 'rotate(180deg)';
      break;
    case 'up':
      rotate = 'rotate(-90deg)';
      break;
    case 'down':
      rotate = 'rotate(90deg)';
      break;
    default:
      rotate = 'rotate(0deg)';
      break;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      style={{
        transform: rotate,
      }}
      viewBox="0 0 1024 1024"
    >
      <path
        fill={color}
        d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0z"
      />
    </svg>
  );
};
