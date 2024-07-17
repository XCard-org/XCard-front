import styles from './Source.module.scss';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import { SourceTable } from '@/containers/SourceContainer/SourceTable';

export type Card = {
  uid: string;
  title: string;
  manufacturer_id: string;
  manufacturer_url: string;
  price: number;
  currency: string;
  internal_pim_id: string;
  source_url: string;
  images: string[];
  brand: string;
  description: string;
};

export const Source = (): JSX.Element => {
  const navigate = useNavigate();

  const onScrape = (): void => {
    navigate(RootPaths.scrape);
  };

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <div className={styles.title}>Исходные</div>
        <div className={styles.scrape} onClick={onScrape}>
          Соскрейпить
        </div>
      </div>
      <SourceTable />
    </div>
  );
};

