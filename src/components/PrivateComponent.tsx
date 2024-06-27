import { RootPaths } from '@/pages';
import { Navigate } from 'react-router';

export const PrivateComponent = ({ children }: { children: JSX.Element }): JSX.Element => {
  if (localStorage.getItem('userToken')) {
    return children;
  } else {
    return <Navigate to={RootPaths.signin} />;
  }
};

