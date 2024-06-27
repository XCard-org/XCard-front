import { RouterProvider } from 'react-router-dom';
import styles from './App.module.scss';
import { router } from './pages';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { useEffect } from 'react';

function App() {
  const checkUser = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/login/test-token`,
        {},
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .catch(() => localStorage.removeItem('userToken'));
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.pageWrap}>
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;

