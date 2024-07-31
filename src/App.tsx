import { RouterProvider } from 'react-router-dom';
import styles from './App.module.scss';
import { router } from './pages';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { createContext, useCallback, useContext, useEffect } from 'react';
import { Spin, notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

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
    <ActionsProvider>
      <div className={styles.app}>
        <div className={styles.pageWrap}>
          <Toaster />
          <RouterProvider router={router} />
        </div>
      </div>
    </ActionsProvider>
  );
}

export default App;

interface ActionsContextType {
  callScraper: (link: string, value: string) => void;
  callGenerator: (
    type: 'card' | 'marketplacecard',
    id: string,
    selectedMarket: string,
    trendsValue: string[],
  ) => void;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

const ActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const keyScrape = 'scrape';

  const callScraper = useCallback(
    (link: string, value: string): void => {
      api.open({
        key: keyScrape,
        message: 'Скрейпинг в процессе',
        description: 'Это может занять несколько минут',
        icon: <Spin indicator={<LoadingOutlined spin />} />,
        duration: 0,
      });

      axios
        .post(
          `${SERVER_ADDRESS}/api/v1/card/?queue_scraping=true`,
          {
            source_url: link,
          },
          {
            headers: {
              Authorization: TOKEN(),
            },
            params: {
              category_id: value,
            },
          },
        )
        .then(() => {
          api.success({
            key: keyScrape,
            message: 'Успешный скрейпинг',
            description: 'Карточка готова',
            duration: 4.5,
          });
        })
        .catch(() => {
          api.error({
            key: keyScrape,
            message: 'Ошибка скрейпинга',
            description: 'Попробуйте еще раз',
            duration: 4.5,
          });
        });
    },
    [api],
  );

  const keyGenerate = 'generate';

  const callGenerator = (
    type: 'card' | 'marketplacecard',
    id: string,
    selectedMarket: string,
    trendsValue: string[],
  ): void => {
    api.open({
      key: keyGenerate,
      message: 'Генерация в процессе',
      description: 'Это может занять несколько минут',
      icon: <Spin indicator={<LoadingOutlined spin />} />,
      duration: 0,
    });

    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/${type}/${id}/beautify`,
        {
          on_marketplace_id: selectedMarket,
          trend_id: trendsValue,
          mock: false,
          ignore_feedback: false,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then(() => {
        api.success({
          key: keyGenerate,
          message: 'Успешная генерация',
          description: 'Карточка готова',
          duration: 4.5,
        });
      })
      .catch(() => {
        api.error({
          key: keyGenerate,
          message: 'Ошибка генерации',
          description: 'Попробуйте еще раз',
          duration: 4.5,
        });
      });
  };

  return (
    <ActionsContext.Provider value={{ callScraper, callGenerator }}>
      {contextHolder}
      {children}
    </ActionsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useActions = (): ActionsContextType => {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useActions must be used within an ActionsProvider');
  }
  return context;
};

