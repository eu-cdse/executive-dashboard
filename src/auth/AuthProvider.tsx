import { useState } from 'react';
import LoginScreen from './LoginScreen';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  let login = import.meta.env.VITE_INCLUDE_LOGIN === 'false';
  const [loggedIn, setLogged] = useState(login);
  let isLogged = window.sessionStorage.getItem('loggedIn') || loggedIn;

  if (isLogged) {
    return <>{children}</>;
  }
  return <LoginScreen setLoggedIn={setLogged} />;
};

export default AuthProvider;
