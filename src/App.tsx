import { RouterProvider } from 'react-router-dom';
import styles from './App.module.scss';
import { router } from './pages';

function App() {
  return (
    <div className={styles.app}>
      <div className={styles.pageWrap}>
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;

