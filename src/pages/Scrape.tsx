import { Input } from '@/components/ui/input';
import styles from './Scrape.module.scss';
import { useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS } from '@/constants';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';

export const Scrape = (): JSX.Element => {
  const [link, setLink] = useState('');
  const navigate = useNavigate();

  const onStart = (): void => {
    axios
      .post(`${SERVER_ADDRESS}/api/v1/card/?queue_scraping=true`, {
        source_url: link,
      })
      .then(() => {
        navigate(RootPaths.source);
      });
  };

  return (
    <div className={styles.scrape}>
      <div className={styles.title}>Скрейпер</div>
      <div>
        {/*<div>
          <div className={styles.name}>Категория</div>
          <div>Выберите категорию</div>
  </div> */}
        <div>
          <div className={styles.name}>Источник данных</div>
          <div className={styles.info}>Ссылка</div>
          <Input
            placeholder="www.figma.com"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <div className={styles.start} onClick={onStart}>
          Запустить
        </div>
      </div>
    </div>
  );
};

