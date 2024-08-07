import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';
import { ConfigProvider } from 'antd';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: 'rgba(255, 117, 31, 1)',
      },
    }}
  >
    <App />
  </ConfigProvider>,
);

