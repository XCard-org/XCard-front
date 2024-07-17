import { useNavigate } from 'react-router';
import styles from './Generated.module.scss';
import { RootPaths } from '@/pages';
import { GeneratedTable } from '@/containers/GeneratedContainer/GeneratedTable';

export const Generated = (): JSX.Element => {
  const navigate = useNavigate();

  const onGenerate = (): void => {
    navigate(RootPaths.generatetables);
  };

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <div className={styles.title}>Сгенерированные</div>
        <div className={styles.scrape} onClick={onGenerate}>
          Сгенерировать
        </div>
      </div>
      <GeneratedTable />
    </div>
  );
};

