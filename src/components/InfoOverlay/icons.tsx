import { computedStyle } from '@/common/getChartStyles';

export const OverlayIcons = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'user':
      return <UserIcon />;
    case 'totalVolume':
      return <TotalVolumeIcon />;
    case 'downloadedVolume':
      return <DownloadedVolumeIcon />;
    case 'uploadVolume':
      return <UploadVolumeIcon />;
    case 'noOfProducts':
      return <NoOfProductsIcon />;
    case 'service':
      return <ServiceIcon />;
    default:
      return <UserIcon />;
  }
};

export function UserIcon(props) {
  return (
    <svg
      className="imgo"
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      x="0px"
      y="0px"
      xmlSpace="preserve"
      viewBox="18.5 10.2 28.4 35.7"
      fill={computedStyle('--csmain2')}
      {...props}
    >
      <path
        fill={props.color || computedStyle('--csmain2')}
        className="st0"
        d="M40.6 29.3c-.1.1-.2.2-.3.2-.1.1-.2.2-.3.2-.2.2-.4.3-.6.5l-4.5 9.2-.9-5.3 1.3-2.1c-.2 0-.3.1-.5.1-.4.1-.8.1-1.3.2h-.7c-.9 0-1.8-.1-2.7-.3l1.3 2.2-.8 5.4-4.8-9.8c-.2-.2-.4-.4-.7-.6l-.1.1c-6.6 5.7-6.5 15.8-6.5 16.2v.4h28.4v-.4c-.5-11.6-5.1-15.5-6.3-16.2z"
      />
      <path
        fill={props.color || computedStyle('--csmain2')}
        className="st0"
        d="M32.9 10.2c-5.9 0-10.6 4.8-10.6 10.6 0 5.9 4.8 10.6 10.6 10.6 5.9 0 10.6-4.8 10.6-10.6s-4.7-10.6-10.6-10.6z"
      />
    </svg>
  );
}

export function TotalVolumeIcon(props) {
  return (
    <svg
      className="imgo"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      xmlSpace="preserve"
      viewBox="12.3 15.7 55.9 44.8"
      {...props}
      fill={computedStyle('--csmain2')}
    >
      <path
        d="M12.3 44.9h1.4c3.4 1.8 12.5 2.1 23.2 2.1v.2c0 4.2 1.5 8.1 3.9 11.1-1.3 0-2.6.1-3.9.1-13.6 0-24.6-2.6-24.6-5.2v-2.9-5.4zm0-13.5h1.4c3.4 1.8 12.5 3.3 23.2 3.3 1.8 0 3.5 0 5.1-.1-2.4 2.5-4.1 5.6-4.8 9.1h-.3c-13.6 0-24.6-1.4-24.6-4v-2.9-5.4zm44-2.1c-.5 0-1-.1-1.5-.1-2.6 0-5 .6-7.2 1.5-3.2.3-6.8.5-10.7.5-13.6 0-24.6-2.4-24.6-5v-5.1h.1c0-.1-.1-.1-.1-.2 0-2.6 11-5.2 24.6-5.2s24.6 2.6 24.6 5.2c0 0 0 .1-.1.2h.1v5.1c.1 1.2-1.9 2.2-5.2 3.1zM61 40.4l-8.3 8.1-4.1-4-2.8 2.7 4.1 4 2.8 2.7 2.8-2.7 8.3-8.1-2.8-2.7zm-6.2 20.1c-7.4 0-13.4-6-13.4-13.4s6-13.4 13.4-13.4 13.4 6 13.4 13.4c.1 7.4-6 13.4-13.4 13.4z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={computedStyle('--csmain2')}
      />
    </svg>
  );
}

export function DownloadedVolumeIcon(props) {
  return (
    <svg
      className="imgo"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      xmlSpace="preserve"
      viewBox="6.9 8.5 39.1 27.5"
      {...props}
    >
      <path
        d="M25.7 27.3c0 2.7 1 5.3 2.5 7.2H14.4c-4.1 0-7.5-3.3-7.5-7.3 0-2.8 1.5-5.2 3.7-6.6-.1-.5-.2-1-.2-1.5 0-2.9 2.3-5.2 5.2-5.2 1.2 0 2.3.4 3.1 1.1 1.8-3.8 5.7-6.5 10.1-6.5 4.8 0 9 3.1 10.5 7.4-.7-.1-1.3-.2-2-.2-6.4 0-11.6 5.2-11.6 11.6zm13 0V23h-2.9v4.3h-2.9l4.3 5.8 4.3-5.8h-2.8zM37.3 36c-4.8 0-8.7-3.9-8.7-8.7s3.9-8.7 8.7-8.7 8.7 3.9 8.7 8.7c0 4.8-3.9 8.7-8.7 8.7z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={computedStyle('--csmain2')}
      />
    </svg>
  );
}

export function UploadVolumeIcon(props) {
  return (
    <svg
      className="imgo"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      xmlSpace="preserve"
      viewBox="0 0 40 28"
      {...props}
    >
      <path
        d="M18.8 18.8C18.8 21.5 19.8 24.1 21.3 26H7.5C3.4 26 0 22.7 0 18.7C0 15.9 1.5 13.5 3.7 12.1C3.6 11.6 3.5 11.1 3.5 10.6C3.5 7.7 5.8 5.4 8.7 5.4C9.9 5.4 11 5.8 11.8 6.5C13.6 2.7 17.5 0 21.9 0C26.7 0 30.9 3.1 32.4 7.4C31.7 7.3 31.1 7.2 30.4 7.2C24 7.2 18.8 12.4 18.8 18.8Z"
        fill={computedStyle('--csmain2')}
      />
      <path
        d="M29.2994 18.6984L29.2994 22.9984L32.1994 22.9984L32.1994 18.6984L35.0994 18.6984L30.7994 12.8984L26.4994 18.6984L29.2994 18.6984ZM30.6994 9.99844C35.4994 9.99844 39.3994 13.8984 39.3994 18.6984C39.3994 23.4984 35.4994 27.3984 30.6994 27.3984C25.8994 27.3984 21.9994 23.4984 21.9994 18.6984C21.9994 13.8984 25.8994 9.99844 30.6994 9.99844Z"
        fill={computedStyle('--csmain2')}
      />
    </svg>
  );
}

export function NoOfProductsIcon(props) {
  return (
    <svg
      className="imgo"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      xmlSpace="preserve"
      viewBox="9 6.7 36.7 31.6"
      {...props}
    >
      <path
        d="M45.6 34.3l-7.6 4V30l7.6-4.2v8.5zm-8.7 4l-7.7-4v-8.5l7.6 4.2v8.3h.1zm-9-4.6l-8.8 4.6v-9.5l8.8-4.8v9.7zm-10.1 4.6L9 33.7V24l8.8 4.8v9.5zm-6.1-15.5l6.6 3.5 7.1-3.5-7.1-3.5-6.6 3.5zm6.6 4.9l-9.2-4.8 9.2-4.8 9.6 4.8-9.6 4.8zm11-5.8l-6.5-3.5v-7.2l6.5 3.6v7.1zM35 10.3l-5.2-2.6-4.9 2.6 4.9 2.6 5.2-2.6zm-12 0l6.8-3.6 7.1 3.6-7.1 3.6-6.8-3.6zm7.3 11.6v-7.1l6.5-3.6v7.2l-6.5 3.5zm1.3 2.9l5.8 3.1 6.1-3.1-6.1-3.1-5.8 3.1zm5.7 4.3l-8-4.2 8-4.2 8.4 4.2-8.4 4.2z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={computedStyle('--csmain2')}
      />
    </svg>
  );
}

export function ServiceIcon(props) {
  return (
    <svg
      className="imgo"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill={computedStyle('--csmain2')}
        d="M14.121 10.48a1 1 0 0 0-1.414 0l-.707.707a2 2 0 0 1-2.828-2.829l5.63-5.632a6.5 6.5 0 0 1 6.377 10.568l-2.108 2.135l-4.95-4.95ZM3.161 4.47a6.503 6.503 0 0 1 8.009-.938L7.757 6.944a4 4 0 0 0 5.513 5.795l.144-.138l4.243 4.243l-4.243 4.242a2 2 0 0 1-2.828 0L3.16 13.662a6.5 6.5 0 0 1 0-9.193Z"
      />
    </svg>
  );
}
