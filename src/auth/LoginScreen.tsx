import { useState } from 'react';

const LoginScreen = ({ setLoggedIn }) => {
  const [pass, setPassword] = useState('');

  const login = () => {
    if (pass === '<password>') {
      window.sessionStorage.setItem('loggedIn', 'true');
      setLoggedIn(true);
    }
  };
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center bg-smain2 p-10 rounded-md">
        <h1>CDSE Dashboard Login</h1>
        <input
          className="rounded-md mt-5 mb-3 bg-white text-black p-2"
          type="password"
          value={pass}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className=" bg-white rounded-md font-medium px-6 py-2 text-smain2"
          onClick={login}
        >
          Login
        </button>
      </div>
    </div>
  );
};
export default LoginScreen;
