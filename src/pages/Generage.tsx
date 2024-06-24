import styles from './Categories.module.scss';

export const Generate = (): JSX.Element => {
  return (
    <div className={styles.categories}>
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>Генерация</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

