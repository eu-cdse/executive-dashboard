import { useEffect, useState } from 'react';
import { Oval } from 'react-loader-spinner';

const Spinner = ({
  noCenter,
  size,
  color,
  displayError,
}: {
  noCenter?: boolean;
  size?: number;
  color?: string;
  displayError?: boolean;
}) => {
  let [error, setError] = useState(false);

  useEffect(() => {
    if (displayError) {
      setTimeout(() => {
        setError(true);
      }, 1000 * 10);
    }
  }, []);
  const Spin = (
    <Oval
      height={size || 80}
      width={size || 80}
      color={color || 'var(--csmain2)'}
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor="#E6ECF4"
      strokeWidth={2}
      strokeWidthSecondary={2}
    />
  );

  if (!noCenter)
    return (
      <div className="h-full w-full flex items-center justify-center">
        {!error ? (
          Spin
        ) : (
          <div className="text-black">
            <p>
              Something went wrong. Please{' '}
              <button
                className="text-smain2 underline"
                onClick={() => window.location.reload()}
              >
                refresh{' '}
              </button>{' '}
              the page
            </p>
          </div>
        )}
      </div>
    );
  return Spin;
};
export default Spinner;
