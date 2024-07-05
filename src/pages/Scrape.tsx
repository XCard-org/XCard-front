import { Input } from '@/components/ui/input';
import styles from './Scrape.module.scss';
import { useState } from 'react';

export const Scrape = (): JSX.Element => {
  const [link, setLink] = useState('');

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
        <div className={styles.start}>Запустить</div>
      </div>
    </div>
  );
};
